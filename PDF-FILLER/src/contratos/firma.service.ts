import { Injectable, Logger } from "@nestjs/common";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import prisma from "../prisma/prisma";
import { EmailResult, enviarLinkFirma } from "../services/email.service";
import {
  calcularCodigoVerificacion,
  generarToken,
  renovarToken,
  validarToken,
} from "../services/tokenFirma.service";
import { BadRequestError, NotFoundError } from "../errors";
import { StorageService } from "../storage/storage.service";
import { ContratosService } from "./contratos.service";

const FIRMA_POSITIONS = [
  { pageIndex: 0, x: 83.55964, y: 108.66797, width: 149.99999, height: 30 },
  { pageIndex: 1, x: 122.5, y: 645.0, width: 150.0, height: 30 },
  { pageIndex: 3, x: 232.0, y: 477.0, width: 150.0, height: 30 },
  { pageIndex: 4, x: 241.0, y: 710.0, width: 150.0, height: 30 },
  { pageIndex: 9, x: 59.0, y: 209.0, width: 150.0, height: 30 },
  { pageIndex: 9, x: 57.0, y: 80.0, width: 150.0, height: 30 },
  { pageIndex: 10, x: 85.0, y: 106.0, width: 150.0, height: 30 },
  { pageIndex: 10, x: 88.0, y: 435.0, width: 150.0, height: 30 },
  { pageIndex: 11, x: 288.0, y: 299.0, width: 150.0, height: 30 },
  { pageIndex: 11, x: 235.0, y: 154.0, width: 150.0, height: 30 },
  { pageIndex: 12, x: 220.0, y: 122.0, width: 150.0, height: 30 },
  { pageIndex: 13, x: 219.0, y: 68.0, width: 150.0, height: 30 },
  { pageIndex: 16, x: 220.0, y: 377.0, width: 150.0, height: 30 },
];

const ESTADOS_REABRIBLES = ["POR APROBAR", "POR FIRMAR"];

export interface TokenCreado {
  token: string;
  link: string;
  expira: Date;
  codigoVerificacion: string;
  correoEnviado: boolean;
  modoDemo: boolean;
  mensajeCorreo: string;
}

interface ContratoConCliente {
  id: number;
  id_asesor: number;
  folio: string;
  cliente?: {
    curp: string;
    email_personal: string | null;
    nombre: string;
  } | null;
}

@Injectable()
export class FirmaService {
  private readonly logger = new Logger(FirmaService.name);

  constructor(
    private readonly contratos: ContratosService,
    private readonly storage: StorageService,
  ) {}

  async generarEnlace(idOrFolio: string): Promise<TokenCreado> {
    const idContrato = await this.contratos.resolverContratoId(idOrFolio);
    const result = await generarToken(idContrato);
    const correo = await this.enviarCorreoSeguro(idContrato, result);
    return this.construirRespuestaEnlace(result, correo);
  }

  async obtenerDatos(token: string): Promise<{
    contrato: {
      folio: string;
      nombre: string;
      curp: string;
      importeCredito: string;
      importeTotal: string;
      pagoQuincenal: string;
    };
    pdfUrl: string;
    codigoDemo?: string;
  }> {
    const datos = await validarToken(token);
    const isDemo = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
    return {
      contrato: {
        folio: datos.folio,
        nombre: datos.nombre,
        curp: datos.curp,
        importeCredito: datos.importeCredito,
        importeTotal: datos.importeTotal,
        pagoQuincenal: datos.pagoQuincenal,
      },
      pdfUrl: `/api/enlaces-firma/${token}/pdf`,
      ...(isDemo ? { codigoDemo: calcularCodigoVerificacion(token) } : {}),
    };
  }

  async obtenerPdf(token: string): Promise<{ folio: string; pdf: Buffer }> {
    const datos = await validarToken(token);
    return this.contratos.descargar(String(datos.idContrato));
  }

  async firmar(
    token: string,
    firmaBase64: unknown,
    aceptoTerminos: unknown,
    codigoVerificacion?: unknown,
  ): Promise<{ success: true; message: string }> {
    if (!firmaBase64 || typeof firmaBase64 !== "string") {
      throw new BadRequestError("firmaBase64 es requerido");
    }
    if (aceptoTerminos !== true) {
      throw new BadRequestError("Debes aceptar los términos y condiciones");
    }

    const codigoEsperado = calcularCodigoVerificacion(token);
    if (
      typeof codigoVerificacion !== "string" ||
      codigoVerificacion.trim() !== codigoEsperado
    ) {
      throw new BadRequestError("Código de verificación de 6 dígitos inválido");
    }

    const datos = await validarToken(token);

    const matches = firmaBase64.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestError("Formato de firma inválido. Debe ser data:image/png;base64,...");
    }

    const buffer = Buffer.from(matches[2], "base64");
    const firmaUrl = await this.storage.uploadSignatureImage(buffer, datos.folio);
    const pdfFirmadoUrl = await this.crearPdfFirmado(
      datos.idContrato,
      datos.folio,
      buffer,
      matches[1] === "png",
    );

    await prisma.$transaction(async (tx) => {
      const estadoPorAprobar = await tx.estadoContrato.findFirstOrThrow({
        where: { descripcion: "POR APROBAR" },
      });
      const estadoPorFirmar = await tx.estadoContrato.findFirstOrThrow({
        where: { descripcion: "POR FIRMAR" },
      });

      // Evita que dos peticiones simultáneas consuman el mismo enlace.
      const marcado = await tx.tokenFirma.updateMany({
        where: { token, usado: false },
        data: { usado: true },
      });
      if (marcado.count === 0) {
        throw new BadRequestError("Este enlace de firma ya fue utilizado");
      }

      await tx.contratoPrestamo.update({
        where: { id: datos.idContrato },
        data: {
          id_estado_contrato: estadoPorAprobar.id,
          fecha_firma: new Date(),
          url_firma_cloud: firmaUrl,
          ...(pdfFirmadoUrl ? { url_pdf_firmado_cloud: pdfFirmadoUrl } : {}),
        },
      });

      await tx.cliente.update({
        where: { curp: datos.curp },
        data: { url_firma_svg: firmaUrl },
      });

      // Los enlaces restantes del contrato dejan de ser válidos.
      await tx.tokenFirma.updateMany({
        where: { id_contrato: datos.idContrato, usado: false },
        data: { usado: true },
      });

      const contrato = await tx.contratoPrestamo.findUniqueOrThrow({
        where: { id: datos.idContrato },
        select: { id_asesor: true },
      });

      await tx.historialCredito.create({
        data: {
          id_contrato: datos.idContrato,
          id_estado_anterior: estadoPorFirmar.id,
          id_estado_nuevo: estadoPorAprobar.id,
          id_usuario: contrato.id_asesor,
          fecha_inicio: new Date(),
          observaciones: "Contrato firmado por el cliente",
        },
      });
    });

    return { success: true, message: "Contrato firmado exitosamente" };
  }

  async reabrirPorToken(token: string): Promise<TokenCreado> {
    const registro = await prisma.tokenFirma.findUnique({
      where: { token },
      include: {
        contrato: {
          include: { cliente: true, estado_contrato: true },
        },
      },
    });

    if (!registro) {
      throw new NotFoundError("Token no encontrado");
    }

    const contrato = registro.contrato;
    const estadoActual = contrato.estado_contrato.descripcion;

    if (!ESTADOS_REABRIBLES.includes(estadoActual)) {
      throw new BadRequestError(
        `El contrato no se puede reabrir en estado "${estadoActual}"`,
      );
    }

    if (estadoActual === "POR APROBAR") {
      await this.resetearContrato(
        contrato,
        "Contrato reabierto para re-firma por el cliente",
      );
    } else {
      await prisma.tokenFirma.updateMany({
        where: { id_contrato: contrato.id, usado: false },
        data: { usado: true },
      });
    }

    const result = await renovarToken(contrato.id);
    const correo = await this.enviarCorreoSeguro(contrato.id, result);
    return this.construirRespuestaEnlace(result, correo);
  }

  async reabrirPorFolio(folio: string): Promise<TokenCreado> {
    const contrato = await prisma.contratoPrestamo.findUnique({
      where: { folio },
      include: { cliente: true, estado_contrato: true },
    });

    if (!contrato) {
      throw new NotFoundError(`Contrato con folio "${folio}" no encontrado`);
    }

    const estadoActual = contrato.estado_contrato.descripcion;
    if (!ESTADOS_REABRIBLES.includes(estadoActual)) {
      throw new BadRequestError(
        `El contrato no se puede reabrir en estado "${estadoActual}"`,
      );
    }

    if (estadoActual === "POR APROBAR") {
      await this.resetearContrato(
        contrato,
        "Contrato reabierto para re-firma por el asesor",
      );
    } else {
      await prisma.tokenFirma.updateMany({
        where: { id_contrato: contrato.id, usado: false },
        data: { usado: true },
      });
    }

    const result = await renovarToken(contrato.id);
    const correo = await this.enviarCorreoSeguro(contrato.id, result);
    return this.construirRespuestaEnlace(result, correo);
  }

  async incorporarFirma(
    folio: string,
    urlFirma: unknown,
  ): Promise<{ success: true; message: string }> {
    if (!urlFirma || typeof urlFirma !== "string") {
      throw new BadRequestError("urlFirma es requerido");
    }

    const contrato = await prisma.contratoPrestamo.findUnique({
      where: { folio },
      include: { cliente: { select: { curp: true } } },
    });
    if (!contrato) {
      throw new NotFoundError(`Contrato con folio "${folio}" no encontrado`);
    }

    let firmaBuffer: Buffer;
    try {
      firmaBuffer = await this.storage.getImageBuffer(urlFirma);
    } catch {
      throw new BadRequestError("No se pudo descargar la imagen de la URL proporcionada");
    }

    const pdfFirmadoUrl = await this.crearPdfFirmado(
      contrato.id,
      folio,
      firmaBuffer,
      false,
    );

    await prisma.$transaction(async (tx) => {
      const estadoPorAprobar = await tx.estadoContrato.findFirstOrThrow({
        where: { descripcion: "POR APROBAR" },
      });
      const estadoPorFirmar = await tx.estadoContrato.findFirstOrThrow({
        where: { descripcion: "POR FIRMAR" },
      });

      await tx.contratoPrestamo.update({
        where: { folio },
        data: {
          id_estado_contrato: estadoPorAprobar.id,
          fecha_firma: new Date(),
          url_firma_cloud: urlFirma,
          ...(pdfFirmadoUrl ? { url_pdf_firmado_cloud: pdfFirmadoUrl } : {}),
        },
      });

      if (contrato.cliente?.curp) {
        await tx.cliente.update({
          where: { curp: contrato.cliente.curp },
          data: { url_firma_svg: urlFirma },
        });
      }

      await tx.tokenFirma.updateMany({
        where: { id_contrato: contrato.id, usado: false },
        data: { usado: true },
      });

      await tx.historialCredito.create({
        data: {
          id_contrato: contrato.id,
          id_estado_anterior: estadoPorFirmar.id,
          id_estado_nuevo: estadoPorAprobar.id,
          id_usuario: contrato.id_asesor,
          fecha_inicio: new Date(),
          observaciones: "Contrato firmado por el cliente",
        },
      });
    });

    return { success: true, message: "Firma incorporada al contrato exitosamente" };
  }

  private async resetearContrato(
    contrato: ContratoConCliente,
    observaciones: string,
  ): Promise<void> {
    const estadoPorFirmar = await prisma.estadoContrato.findFirstOrThrow({
      where: { descripcion: "POR FIRMAR" },
    });
    const estadoPorAprobar = await prisma.estadoContrato.findFirstOrThrow({
      where: { descripcion: "POR APROBAR" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.contratoPrestamo.update({
        where: { id: contrato.id },
        data: {
          id_estado_contrato: estadoPorFirmar.id,
          url_firma_cloud: null,
          url_pdf_firmado_cloud: null,
          fecha_firma: null,
        },
      });

      if (contrato.cliente?.curp) {
        await tx.cliente.update({
          where: { curp: contrato.cliente.curp },
          data: { url_firma_svg: null },
        });
      }

      await tx.tokenFirma.updateMany({
        where: { id_contrato: contrato.id, usado: false },
        data: { usado: true },
      });

      await tx.historialCredito.create({
        data: {
          id_contrato: contrato.id,
          id_estado_anterior: estadoPorAprobar.id,
          id_estado_nuevo: estadoPorFirmar.id,
          id_usuario: contrato.id_asesor,
          fecha_inicio: new Date(),
          observaciones,
        },
      });
    });
  }

  private async crearPdfFirmado(
    idContrato: number,
    folio: string,
    firmaBuffer: Buffer,
    esPng: boolean,
  ): Promise<string | null> {
    try {
      const contrato = await prisma.contratoPrestamo.findUnique({
        where: { id: idContrato },
        select: { url_pdf_cloud: true },
      });
      if (!contrato?.url_pdf_cloud) {
        return null;
      }

      const pdfBuffer = await this.storage.getContractPdfBuffer(
        folio,
        false,
        contrato.url_pdf_cloud,
      );
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      const firmaPng = esPng
        ? firmaBuffer
        : Buffer.from(await sharp(firmaBuffer).png().toBuffer());
      const firmaImage = await pdfDoc.embedPng(new Uint8Array(firmaPng));

      for (const pos of FIRMA_POSITIONS) {
        const page = pages[pos.pageIndex];
        if (!page) {
          continue;
        }
        page.drawImage(firmaImage, {
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
        });
      }

      const modifiedPdf = await pdfDoc.save();
      return await this.storage.uploadContractPdf(
        Buffer.from(modifiedPdf),
        `${folio}-firmado`,
      );
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Error al generar PDF firmado (no crítico): ${mensaje}`);
      return null;
    }
  }

  private async enviarCorreoSeguro(
    idContrato: number,
    result: { link: string },
  ): Promise<EmailResult> {
    try {
      const contrato = await prisma.contratoPrestamo.findUnique({
        where: { id: idContrato },
        select: {
          folio: true,
          cliente: { select: { email_personal: true, nombre: true } },
        },
      });

      if (contrato?.cliente.email_personal) {
        return enviarLinkFirma({
          email: contrato.cliente.email_personal,
          nombreCliente: contrato.cliente.nombre,
          link: result.link,
          folio: contrato.folio,
        });
      }

      return {
        enviado: false,
        modo: "demo",
        mensaje: "El cliente no tiene correo registrado. Usa el enlace generado.",
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Error al enviar correo de firma (no crítico): ${mensaje}`);
      return {
        enviado: false,
        modo: "email",
        mensaje: "No se pudo enviar el correo. Usa el enlace generado.",
      };
    }
  }

  private construirRespuestaEnlace(
    result: Omit<TokenCreado, "correoEnviado" | "modoDemo" | "mensajeCorreo">,
    correo: EmailResult,
  ): TokenCreado {
    return {
      ...result,
      correoEnviado: correo.enviado,
      modoDemo: correo.modo === "demo",
      mensajeCorreo: correo.mensaje,
    };
  }
}
