import { consultarTabla } from "../utils/tablaCargar.utils";
import { FilaTabla } from "../types";
export const filtrarTablaServices = async (
  monto: number,
  quincenas: number
): Promise<FilaTabla | null> => (await consultarTabla(monto, quincenas)) ?? null;
