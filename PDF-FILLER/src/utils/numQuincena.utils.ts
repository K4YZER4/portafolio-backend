import { fechaConLetra } from "../types/fecha.types";
export const numQuincena = async (
  fechaArranque: fechaConLetra,
): Promise<string> => {
  const dia = parseInt(fechaArranque.dia, 10);
  const mes = parseInt(fechaArranque.mes, 10);
  const año = fechaArranque.año;

  if (dia >= 1 && dia <= 15) {
    return `${mes * 2 - 1}/${año}`;
  } else if (dia >= 16) {
    return `${mes * 2}/${año}`;
  }
  return "0";
};
