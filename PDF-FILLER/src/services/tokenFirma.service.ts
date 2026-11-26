import { createHmac, randomUUID } from "crypto";
import prisma from "../prisma/prisma";
import { BadRequestError, NotFoundError } from "../errors";
import { config } from "../config";

export function calcularCodigoVerificacion(token: string): string {
  const hash = createHmac("sha256", config.JWT_SECRET || "firma-otp-secret")
    .update(token)
    .digest("hex");
  const num = parseInt(hash.slice(0, 8), 16) % 1000000;
  return num.toString().padStart(6, "0");
}

interface TokenCreado {
  token: string;
  link: string;
  expira: Date;
  codigoVerificacion: string;
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function crearExpiracion(): Date {
  return new Date(Date.now() + TOKEN_TTL_MS);
}

interface DatosContrato {
  folio: string;
  nombre: string;
  curp: string;
  importeCredito: string;
  importeTotal: string;
  pagoQuincenal: string;
  pdfUrl: string;
}

export async function generarToken(idContrato: number): Promise<TokenCreado> {
  const contrato = await prisma.contratoPrestamo.findUnique({
    where: { id: idContrato },
    include: {
      estado_contrato: true,
      cliente: { select: { curp: true, nombre: true, apellido_paterno: true, apellido_materno: true } },
    },
  });

  if (!contrato) {
    throw new NotFoundError(`Contrato con id ${idContrato} no encontrado`);
  }

  if (contrato.estado_contrato.descripcion !== "POR FIRMAR") {
    throw new BadRequestError(
      `El contrato debe estar en estado "POR FIRMAR". Estado actual: "${contrato.estado_contrato.descripcion}"`
    );
  }

  const token = randomUUID().replace(/-/g, "");
  const expira = crearExpiracion();

  const created = await prisma.tokenFirma.create({
    data: {
      token,
      id_contrato: idContrato,
      expira,
    },
  });

  const link = `${config.FRONTEND_URL}/firmar/${token}`;

  return {
    token,
    link,
    expira: created.expira ?? expira,
    codigoVerificacion: calcularCodigoVerificacion(token),
  };
}

export async function validarToken(token: string): Promise<DatosContrato & { idContrato: number }> {
  const registro = await prisma.tokenFirma.findUnique({
    where: { token },
    include: {
      contrato: {
        include: {
          cliente: true,
        },
      },
    },
  });

  if (!registro) {
    throw new NotFoundError("Token no encontrado");
  }

  if (registro.usado) {
    throw new BadRequestError("Este enlace de firma ya fue utilizado");
  }

  if (!registro.expira || registro.expira < new Date()) {
    throw new BadRequestError("Este enlace de firma ha expirado");
  }

  const c = registro.contrato;
  const cliente = c.cliente;

  return {
    idContrato: c.id,
    folio: c.folio,
    nombre: `${cliente.nombre} ${cliente.segundo_nombre ? cliente.segundo_nombre + " " : ""}${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim(),
    curp: cliente.curp,
    importeCredito: c.importe_credito.toString(),
    importeTotal: c.importe_total_credito.toString(),
    pagoQuincenal: c.importe_pago_quincenal.toString(),
    pdfUrl: `/api/contratos/${c.id}/pdf`,
  };
}

export async function marcarUsado(token: string): Promise<void> {
  await prisma.tokenFirma.update({
    where: { token },
    data: { usado: true },
  });
}

export async function renovarToken(idContrato: number): Promise<TokenCreado> {
  const contrato = await prisma.contratoPrestamo.findUnique({
    where: { id: idContrato },
    include: { estado_contrato: true },
  });

  if (!contrato) {
    throw new NotFoundError(`Contrato con id ${idContrato} no encontrado`);
  }

  if (contrato.estado_contrato.descripcion !== "POR FIRMAR") {
    throw new BadRequestError(
      `El contrato debe estar en estado "POR FIRMAR" para renovar el enlace. Estado actual: "${contrato.estado_contrato.descripcion}"`
    );
  }

  const token = randomUUID().replace(/-/g, "");
  const expira = crearExpiracion();

  const created = await prisma.tokenFirma.create({
    data: {
      token,
      id_contrato: idContrato,
      expira,
    },
  });

  const link = `${config.FRONTEND_URL}/firmar/${token}`;

  return {
    token,
    link,
    expira: created.expira ?? expira,
    codigoVerificacion: calcularCodigoVerificacion(token),
  };
}
