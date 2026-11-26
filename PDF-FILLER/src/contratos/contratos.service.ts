import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import fs from "fs";
import path from "path";
import prisma from "../prisma/prisma";
import { ContratoData } from "../types";
import {
  actualizarContrato,
  generarContrato,
  guardarContrato,
  obtenerContrato,
} from "../services";
import { generarToken } from "../services/tokenFirma.service";
import { anonimizarContratoParaDemo } from "../utils";
import { config } from "../config";
import { NotFoundError } from "../errors";
import { normalizeNumericId } from "../common/http/param.utils";
import { StorageService } from "../storage/storage.service";
import { FolioService } from "./folio.service";

type RevisionAction = "aprobar" | "rechazar";

@Injectable()
export class ContratosService {
  constructor(
    private readonly folios: FolioService,
    private readonly storage: StorageService,
  ) {}

  async crear(contrato: ContratoData): Promise<{ folio: string; pdf: Buffer; pdfUrl: string; tokenFirma: string }> {
    const datosContrato = config.DEMO_MODE ? anonimizarContratoParaDemo(contrato) : contrato;
    const folio = await this.folios.siguiente();
    const pdf = await generarContrato(datosContrato, folio);
    try {
      const localDir = path.join(process.cwd(), "pdfs");
      if (!fs.existsSync(localDir)) {
        await fs.promises.mkdir(localDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(localDir, `${folio}.pdf`), pdf);
    } catch {
      // Ignorar error de guardado local
    }
    const pdfUrl = await this.storage.uploadContractPdf(pdf, folio);

    let idContrato = 0;
    try {
      idContrato = await guardarContrato(datosContrato, { folio, pdfUrl });
    } catch (error) {
      await this.storage.removeContractPdf(pdfUrl).catch(() => undefined);
      throw error;
    }

    let tokenFirma = "";
    if (idContrato > 0) {
      try {
        const tokenCreado = await generarToken(idContrato);
        tokenFirma = tokenCreado.token;
      } catch (_) {}
    }

    return { folio, pdf, pdfUrl, tokenFirma };
  }

  async previsualizar(contrato: ContratoData): Promise<Buffer> {
    const datosContrato = config.DEMO_MODE ? anonimizarContratoParaDemo(contrato) : contrato;
    return generarContrato(datosContrato);
  }

  async verificarAcceso(idOrFolio: string, usuarioId: number, role: "asesor" | "mesa" | "admin"): Promise<void> {
    if (role !== "asesor") {
      return;
    }
    const id = await this.resolverContratoId(idOrFolio);
    const contrato = await prisma.contratoPrestamo.findUnique({
      where: { id },
      select: { id_asesor: true },
    });
    if (!contrato || contrato.id_asesor !== usuarioId) {
      throw new ForbiddenException("No tienes acceso a este contrato");
    }
  }

  async revisar(folio: string, usuarioId: number, action: RevisionAction, motivo?: string) {
    if (action === "rechazar" && !motivo?.trim()) {
      throw new BadRequestException("El motivo de rechazo es obligatorio");
    }

    return prisma.$transaction(async (tx) => {
      const contrato = await tx.contratoPrestamo.findUnique({
        where: { folio },
        include: { estado_contrato: true },
      });

      if (!contrato) {
        throw new NotFoundException("Contrato no encontrado");
      }
      if (contrato.estado_contrato.descripcion !== "POR APROBAR") {
        throw new BadRequestException("Solo se pueden revisar contratos en estado POR APROBAR");
      }

      const estado = await tx.estadoContrato.findUnique({
        where: { descripcion: action === "aprobar" ? "APROBADO" : "RECHAZADO" },
      });
      if (!estado) {
        throw new NotFoundException("Estado de revisión no configurado");
      }

      await tx.historialCredito.updateMany({
        where: { id_contrato: contrato.id, fecha_fin: null },
        data: { fecha_fin: new Date() },
      });

      await tx.contratoPrestamo.update({
        where: { id: contrato.id },
        data: { id_estado_contrato: estado.id },
      });

      await tx.historialCredito.create({
        data: {
          id_contrato: contrato.id,
          id_estado_anterior: contrato.id_estado_contrato,
          id_estado_nuevo: estado.id,
          id_usuario: usuarioId,
          fecha_inicio: new Date(),
          observaciones: motivo?.trim() || "Contrato aprobado por Mesa de Control.",
        },
      });

      return {
        folio: contrato.folio,
        estado: estado.descripcion,
        mensaje: action === "aprobar" ? "Contrato aprobado" : "Contrato rechazado",
      };
    });
  }

  obtener(folio: string): ReturnType<typeof obtenerContrato> {
    return obtenerContrato(folio);
  }

  async descargar(idOrFolio: string): Promise<{ folio: string; pdf: Buffer }> {
    const idContrato = await this.resolverContratoId(idOrFolio);
    const contrato = await prisma.contratoPrestamo.findUnique({
      where: { id: idContrato },
      include: { estado_contrato: true },
    });

    if (!contrato) {
      throw new NotFoundError("Contrato no encontrado");
    }

    const firmado =
      contrato.estado_contrato.descripcion !== "POR FIRMAR" &&
      Boolean(contrato.url_pdf_firmado_cloud);
    const cloudUrl = firmado ? contrato.url_pdf_firmado_cloud : contrato.url_pdf_cloud;

    if (cloudUrl) {
      try {
        const pdf = await this.storage.getContractPdfBuffer(contrato.folio, firmado, cloudUrl);
        return { folio: contrato.folio, pdf };
      } catch {
        // Se intenta la copia local antes de responder 404.
      }
    }

    const localPath = path.join(process.cwd(), "pdfs", `${contrato.folio}.pdf`);
    if (fs.existsSync(localPath)) {
      return { folio: contrato.folio, pdf: await fs.promises.readFile(localPath) };
    }

    const detalle = cloudUrl
      ? `Cloudinary falló (${cloudUrl}) y no hay copia local`
      : "El contrato no tiene PDF asociado";
    throw new NotFoundError(`PDF no encontrado para este contrato. ${detalle}`);
  }

  async actualizar(
    folio: string,
    contrato: ContratoData,
  ): Promise<{ folio: string; pdf: Buffer }> {
    const existente = await prisma.contratoPrestamo.findUnique({
      where: { folio },
      select: { id: true },
    });
    if (!existente) {
      throw new NotFoundError(`Contrato con folio "${folio}" no encontrado`);
    }

    const pdf = await generarContrato(contrato, folio);
    try {
      const localDir = path.join(process.cwd(), "pdfs");
      if (!fs.existsSync(localDir)) {
        await fs.promises.mkdir(localDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(localDir, `${folio}.pdf`), pdf);
    } catch {
      // Ignorar error de guardado local
    }
    const pdfUrl = await this.storage.uploadContractPdf(pdf, folio);

    try {
      await actualizarContrato(contrato, { folio, pdfUrl });
    } catch (error) {
      await this.storage.removeContractPdf(pdfUrl).catch(() => undefined);
      throw error;
    }

    return { folio, pdf };
  }

  async resolverContratoId(param: string): Promise<number> {
    const id = normalizeNumericId(param);
    if (id !== null) {
      return id;
    }

    const contrato = await prisma.contratoPrestamo.findUnique({
      where: { folio: param },
      select: { id: true },
    });
    if (!contrato) {
      throw new NotFoundError(`Contrato con folio "${param}" no encontrado`);
    }
    return contrato.id;
  }
}
