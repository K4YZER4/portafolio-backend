import prisma from "../prisma/prisma";

export interface HistorialFiltros {
  asesorId?: number;
  desde?: string;
  hasta?: string;
  buscar?: string;
}

interface HistorialRow {
  id: number;
  folio: string;
  fecha_contrato: Date;
  nombre_cliente: string;
  importe_credito: string;
  plazo_quincenas: number;
  nombre_asesor: string;
  id_asesor: number;
  estado_contrato: string;
}

export async function obtenerHistorial(filtros: HistorialFiltros) {
  const condiciones: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filtros.asesorId) {
    condiciones.push(`v.id_asesor = $${paramIndex++}`);
    params.push(filtros.asesorId);
  }
  if (filtros.desde) {
    condiciones.push(`v.fecha_contrato >= $${paramIndex++}::DATE`);
    params.push(filtros.desde);
  }
  if (filtros.hasta) {
    condiciones.push(`v.fecha_contrato <= $${paramIndex++}::DATE`);
    params.push(filtros.hasta);
  }
  if (filtros.buscar) {
    condiciones.push(`LOWER(v.nombre_cliente) LIKE $${paramIndex++}`);
    params.push(`%${filtros.buscar.toLowerCase()}%`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  const rows = await prisma.$queryRawUnsafe<HistorialRow[]>(
    `SELECT * FROM credito.vista_historial_contratos v ${where} ORDER BY v.fecha_contrato DESC`,
    ...params,
  );

  return rows.map((r) => ({
    id: r.folio,
    clientName: r.nombre_cliente,
    date: r.fecha_contrato instanceof Date
      ? r.fecha_contrato.toISOString().split("T")[0]
      : String(r.fecha_contrato).split("T")[0],
    monto: Number(r.importe_credito),
    plazo: r.plazo_quincenas,
    asesor: r.nombre_asesor,
    status: r.estado_contrato === "POR FIRMAR" ? "borrador" : "completado",
    estado: r.estado_contrato,
  }));
}
