// src/utils/tablas_descuento.utils.ts
import ExcelJS from "exceljs";
import path from "path";
import { FilaTabla } from "../types";
// Guardamos todas las tablas en memoria
const tablas: Record<number, FilaTabla[]> = {};

async function cargarTablas() {
  const rutaExcel = path.resolve(
    process.env.TABLAS_XLSX_PATH ?? path.join(process.cwd(), "tablas", "tablas_descuento.xlsx"),
  );
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(rutaExcel);

  for (const worksheet of workbook.worksheets) {
    // Obtener CAT de celda E6 (antes de iterar filas)
    const catRaw = worksheet.getCell("E6").value as number;

    const filas: FilaTabla[] = [];

    // Iterar desde fila 10 en adelante
    for (let rowNum = 10; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const values = row.values as (string | number | null | undefined)[];

      // Columnas: A=1, B=2, C=3, etc.
      const montoNeto = typeof values[1] === "number" ? values[1] : 0;
      const montoPagare = typeof values[2] === "number" ? values[2] : 0;
      const importeDescuento = typeof values[3] === "number" ? values[3] : 0;
      const plazoMeses = typeof values[4] === "number" ? values[4] : 0;
      const plazoQuincenas = typeof values[5] === "number" ? values[5] : 0;
      const tasaMensual = typeof values[6] === "number" ? values[6] : 0;
      const importeInteres = typeof values[7] === "number" ? values[7] : 0;
      const importeIvaInteres = typeof values[8] === "number" ? values[8] : 0;

      // Solo procesar si montoNeto > 0
      if (montoNeto > 0) {
        filas.push({
          montoNeto,
          montoPagare,
          descuentoQuincenal: parseFloat(importeDescuento.toFixed(2)),
          plazoMeses,
          plazoQuincenas,
          tasaMensual: Math.round(tasaMensual * 100 + Number.EPSILON),
          importeInteres,
          importeIvaInteres,
          cat: catRaw * 100,
        });
      }
    }

    // Guardar tabla por quincenas
    const quincenas = filas[0]?.plazoQuincenas;
    if (quincenas) {
      tablas[quincenas] = filas;
    }
  }
}

async function consultarTabla(monto: number, quincenas: number): Promise<FilaTabla | null> {
  const tabla = tablas[quincenas];
  if (!tabla) {
    return null;
  }

  return tabla.find((row) => Math.abs(Number(row.montoNeto) - monto) < 0.01) ?? null;
}
export { cargarTablas, consultarTabla };
