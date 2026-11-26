import { fechaConLetra } from "../types/fecha.types";
const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];
const fechaMesConLetra = (fecha: string): fechaConLetra => {
  const fechaResultante = {
    dia: "",
    mes: "",
    año: "",
    mesLetra: "",
  };
  if (fecha.includes("-")) {
    // ISO: YYYY-MM-DD
    const partes = fecha.split("-");
    fechaResultante.año = partes[0];
    fechaResultante.mes = partes[1];
    fechaResultante.dia = partes[2];
  }
  // Formato DD/MM/YYYY (alternativo)
  else if (fecha.includes("/")) {
    const partes = fecha.split("/");
    fechaResultante.dia = partes[0];
    fechaResultante.mes = partes[1];
    fechaResultante.año = partes[2];
  }
  const mesNum = parseInt(fechaResultante.mes, 10);
  const diaNum = parseInt(fechaResultante.dia, 10);
  if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
    fechaResultante.mesLetra = fechaResultante.mes.toUpperCase();
    return fechaResultante;
  }
  if (isNaN(diaNum) || diaNum < 1 || diaNum > 31) {
    return fechaResultante;
  }
  fechaResultante.mesLetra = MONTHS[mesNum - 1];
  return fechaResultante;
};
export { fechaMesConLetra };
