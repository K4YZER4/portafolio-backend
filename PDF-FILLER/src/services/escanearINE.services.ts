import { extraerDatosINE } from "../clients/extraerDatos.clients";
import { validarCURP } from "../utils/validarCurp.utils";
import { IneValida } from "../types";
import { InternalServerError } from "../errors";

async function escanearINE(fuente: Buffer): Promise<IneValida> {
  let datos;
  try {
    datos = await extraerDatosINE(fuente);
  } catch {
    throw new InternalServerError("Error al escanear INE: el servicio de OCR falló");
  }
  if (!datos?.curp) {
    throw new InternalServerError("Error al escanear INE: no se pudo extraer la CURP");
  }
  const curpValidada = await validarCURP(datos.curp);
  return { ...datos, curpValidada };
}
export { escanearINE };
