import { BadRequestException } from "@nestjs/common";
import { ContratoData } from "../../types";
import { VALID_PERIODS } from "../../config/constants";
import { normalizarDescripcionCatalogo } from "../../utils/catalogos.utils";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const RFC_REGEX = /^[A-Za-z0-9]{12,13}$/;
const CP_REGEX = /^[0-9]{5}$/;
const CURP_REGEX = /^[A-Za-z]{4}[0-9]{6}[HMhm][A-Za-z]{5}[0-9A-Za-z][0-9A-Za-z]$/;
const CLABE_REGEX = /^[0-9]{18}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const ESTADOS_CIVILES = ["SOLTERO", "CASADO", "UNION LIBRE", "DIVORCIADO", "VIUDO", "OTRO"];
const PROPIEDADES = ["PROPIA", "RENTADA", "FAMILIAR"];

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonObject;
}

function requiredString(record: JsonObject, key: string, field: string, errores: string[]): void {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    errores.push(`${field} es requerido`);
  }
}

function requiredNumber(record: JsonObject, key: string, field: string, errores: string[]): void {
  const value = record[key];
  if (value === undefined || value === null || value === "") {
    errores.push(`${field} es requerido`);
    return;
  }
  const num = Number(value);
  if (isNaN(num)) {
    errores.push(`${field} debe ser un número`);
  } else if (num <= 0) {
    errores.push(`${field} debe ser mayor a 0`);
  }
}

function numberGteZero(record: JsonObject, key: string, field: string, errores: string[]): void {
  const value = record[key];
  if (value === undefined || value === null || value === "") {
    errores.push(`${field} es requerido`);
    return;
  }
  const num = Number(value);
  if (isNaN(num)) {
    errores.push(`${field} debe ser un número`);
  } else if (num < 0) {
    errores.push(`${field} no puede ser negativo`);
  }
}

function requiredPhone(record: JsonObject, key: string, field: string, errores: string[]): void {
  requiredString(record, key, field, errores);
  const value = record[key];
  if (typeof value === "string" && value.trim().length > 0 && !PHONE_REGEX.test(value)) {
    errores.push(`${field} debe ser 10 dígitos`);
  }
}

function optionalPhone(record: JsonObject, key: string, field: string, errores: string[]): void {
  const value = record[key];
  if (value !== undefined && value !== null && value !== "") {
    if (typeof value !== "string" || !PHONE_REGEX.test(value)) {
      errores.push(`${field} debe ser 10 dígitos`);
    }
  }
}

function requiredEmail(record: JsonObject, key: string, field: string, errores: string[]): void {
  requiredString(record, key, field, errores);
  const value = record[key];
  if (typeof value === "string" && value.trim().length > 0 && !EMAIL_REGEX.test(value)) {
    errores.push(`${field} no tiene formato válido`);
  }
}

function requiredDate(record: JsonObject, key: string, field: string, errores: string[]): void {
  requiredString(record, key, field, errores);
  const value = record[key];
  if (typeof value === "string" && value.trim().length > 0 && !DATE_REGEX.test(value)) {
    errores.push(`${field} debe tener formato YYYY-MM-DD`);
  }
}

function optionalDate(record: JsonObject, key: string, field: string, errores: string[]): void {
  const value = record[key];
  if (value !== undefined && value !== null && value !== "") {
    if (typeof value !== "string" || !DATE_REGEX.test(value)) {
      errores.push(`${field} debe tener formato YYYY-MM-DD`);
    }
  }
}

/**
 * Convierte el body de `POST /pdfs` y `PUT /contratos/:folio` a `ContratoData`.
 * Acepta JSON puro o multipart/form-data con el campo `data` (JSON string).
 */
export function parseContratoBody(body: JsonObject): ContratoData {
  let parsed: unknown = body;
  if (typeof body.data === "string") {
    try {
      parsed = JSON.parse(body.data);
    } catch {
      throw new BadRequestException("El campo 'data' debe ser un JSON válido");
    }
  }

  const data = asObject(parsed);
  if (!data) {
    throw new BadRequestException("Los datos del contrato son requeridos");
  }

  for (const field of ["ine", "tabla", "extra", "estadoCuenta", "nomina"]) {
    if (!asObject(data[field])) {
      throw new BadRequestException(`${field} es requerido y debe ser un objeto`);
    }
  }

  return data as unknown as ContratoData;
}

/**
 * Validación profunda de los datos del contrato. Mantiene el mismo contrato
 * de errores que Express (`Errores de validación: ...`) pero acepta todos los
 * valores de catálogo soportados por la base de datos.
 */
export function validarContratoData(data: ContratoData): void {
  const raw = data as unknown as JsonObject;
  const errores: string[] = [];

  const ine = asObject(raw.ine);
  if (!ine) {
    errores.push("ine es requerido y debe ser un objeto");
  } else {
    requiredString(ine, "nombre1", "ine.nombre1", errores);
    if (ine.nombre2 !== undefined && ine.nombre2 !== null && ine.nombre2 !== "") {
      if (typeof ine.nombre2 !== "string") {
        errores.push("ine.nombre2 debe ser texto");
      }
    }
    requiredString(ine, "apellidoPaterno", "ine.apellidoPaterno", errores);
    requiredString(ine, "apellidoMaterno", "ine.apellidoMaterno", errores);

    if (typeof ine.sexo !== "string" || !["F", "M"].includes(ine.sexo)) {
      errores.push("ine.sexo debe ser 'F' o 'M'");
    }

    if (typeof ine.curp !== "string" || !CURP_REGEX.test(ine.curp)) {
      errores.push("ine.curp debe tener 18 caracteres con formato CURP válido");
    }

    if (typeof ine.fechaNac !== "string" || !DATE_REGEX.test(ine.fechaNac)) {
      errores.push("ine.fechaNac debe tener formato YYYY-MM-DD");
    } else {
      const fechaNac = new Date(ine.fechaNac);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mesDiff = hoy.getMonth() - fechaNac.getMonth();
      if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      if (edad < 18) {
        errores.push("El cliente debe tener al menos 18 años");
      }
    }

    const domicilio = asObject(ine.domicilio);
    if (!domicilio) {
      errores.push("ine.domicilio es requerido y debe ser un objeto");
    } else {
      requiredString(domicilio, "calle", "ine.domicilio.calle", errores);
      requiredString(domicilio, "numeroCasa", "ine.domicilio.numeroCasa", errores);
      requiredString(domicilio, "colonia", "ine.domicilio.colonia", errores);
      const cp = domicilio.codigoPostal;
      if (typeof cp !== "string" || !CP_REGEX.test(cp)) {
        errores.push("ine.domicilio.codigoPostal debe ser 5 dígitos");
      }
      requiredString(domicilio, "municipio", "ine.domicilio.municipio", errores);
      requiredString(domicilio, "estado", "ine.domicilio.estado", errores);
    }
  }

  const tabla = asObject(raw.tabla);
  if (!tabla) {
    errores.push("tabla es requerido y debe ser un objeto");
  } else {
    requiredNumber(tabla, "montoNeto", "tabla.montoNeto", errores);
    requiredNumber(tabla, "montoPagare", "tabla.montoPagare", errores);

    const montoNeto = Number(tabla.montoNeto);
    const montoPagare = Number(tabla.montoPagare);
    if (Number.isFinite(montoNeto) && Number.isFinite(montoPagare) && montoPagare <= montoNeto) {
      errores.push("tabla.montoPagare debe ser mayor a tabla.montoNeto");
    }

    requiredNumber(tabla, "descuentoQuincenal", "tabla.descuentoQuincenal", errores);
    requiredNumber(tabla, "plazoMeses", "tabla.plazoMeses", errores);
    requiredNumber(tabla, "tasaMensual", "tabla.tasaMensual", errores);
    requiredNumber(tabla, "importeInteres", "tabla.importeInteres", errores);
    requiredNumber(tabla, "cat", "tabla.cat", errores);

    if (tabla.importeIvaInteres !== undefined && tabla.importeIvaInteres !== null && tabla.importeIvaInteres !== "") {
      const iva = Number(tabla.importeIvaInteres);
      if (isNaN(iva) || iva <= 0) {
        errores.push("tabla.importeIvaInteres debe ser mayor a 0");
      }
    }

    if (tabla.plazoQuincenas === undefined || tabla.plazoQuincenas === null || tabla.plazoQuincenas === "") {
      errores.push("tabla.plazoQuincenas es requerido");
    } else {
      const pq = Number(tabla.plazoQuincenas);
      if (isNaN(pq) || pq <= 0) {
        errores.push("tabla.plazoQuincenas debe ser un número mayor a 0");
      } else if (!VALID_PERIODS.includes(pq)) {
        errores.push(`tabla.plazoQuincenas inválido. Válidos: ${VALID_PERIODS.join(", ")}`);
      }
    }
  }

  const extra = asObject(raw.extra);
  if (!extra) {
    errores.push("extra es requerido y debe ser un objeto");
  } else {
    requiredPhone(extra, "telefonoCelular", "extra.telefonoCelular", errores);
    requiredEmail(extra, "mail", "extra.mail", errores);
    optionalPhone(extra, "telefonoCasa", "extra.telefonoCasa", errores);

    numberGteZero(extra, "dependientesEconomicos", "extra.dependientesEconomicos", errores);

    requiredDate(extra, "fechaIngreso", "extra.fechaIngreso", errores);
    requiredDate(extra, "fechaContrato", "extra.fechaContrato", errores);
    optionalDate(extra, "fechaArranque", "extra.fechaArranque", errores);

    const refs = [
      { nombre: extra.referencia1, tel: extra.telefonoReferencia1, idx: 1 },
      { nombre: extra.referencia2, tel: extra.telefonoReferencia2, idx: 2 },
      { nombre: extra.referencia3, tel: extra.telefonoReferencia3, idx: 3 },
    ];
    for (const ref of refs) {
      const hasNombre = ref.nombre !== undefined && ref.nombre !== null && ref.nombre !== "";
      const hasTel = ref.tel !== undefined && ref.tel !== null && ref.tel !== "";
      if (hasNombre && !hasTel) {
        errores.push(`extra.referencia${ref.idx} tiene nombre pero falta teléfono`);
      }
      if (!hasNombre && hasTel) {
        errores.push(`extra.referencia${ref.idx} tiene teléfono pero falta nombre`);
      }
      if (hasTel && typeof ref.tel === "string" && !PHONE_REGEX.test(ref.tel)) {
        errores.push(`extra.telefonoReferencia${ref.idx} debe ser 10 dígitos`);
      }
    }

    if (extra.estadoCivil !== undefined && extra.estadoCivil !== null && extra.estadoCivil !== "") {
      const estado = normalizarDescripcionCatalogo(String(extra.estadoCivil));
      if (!ESTADOS_CIVILES.includes(estado)) {
        errores.push(`extra.estadoCivil debe ser uno de: ${ESTADOS_CIVILES.join(", ")}`);
      }
    }

    if (extra.propiedad !== undefined && extra.propiedad !== null && extra.propiedad !== "") {
      const propiedad = normalizarDescripcionCatalogo(String(extra.propiedad));
      if (!PROPIEDADES.includes(propiedad)) {
        errores.push(`extra.propiedad debe ser uno de: ${PROPIEDADES.join(", ")}`);
      }
    }

    if (extra.entreCalles !== undefined && extra.entreCalles !== null && extra.entreCalles !== "") {
      if (typeof extra.entreCalles !== "string") {
        errores.push("extra.entreCalles debe ser texto");
      }
    }
  }

  const estadoCuenta = asObject(raw.estadoCuenta);
  if (!estadoCuenta) {
    errores.push("estadoCuenta es requerido y debe ser un objeto");
  } else {
    requiredString(estadoCuenta, "nombreTitular", "estadoCuenta.nombreTitular", errores);

    if (typeof estadoCuenta.rfc !== "string" || !RFC_REGEX.test(estadoCuenta.rfc)) {
      errores.push("estadoCuenta.rfc debe tener 12-13 caracteres alfanuméricos");
    }

    if (typeof estadoCuenta.clabe !== "string" || !CLABE_REGEX.test(estadoCuenta.clabe)) {
      errores.push("estadoCuenta.clabe debe ser 18 dígitos");
    }

    requiredString(estadoCuenta, "numeroCuenta", "estadoCuenta.numeroCuenta", errores);
    requiredString(estadoCuenta, "banco", "estadoCuenta.banco", errores);
  }

  const nomina = asObject(raw.nomina);
  if (!nomina) {
    errores.push("nomina es requerido y debe ser un objeto");
  } else {
    requiredString(nomina, "noEmpleado", "nomina.noEmpleado", errores);
    requiredString(nomina, "puesto", "nomina.puesto", errores);
    requiredString(nomina, "departamento", "nomina.departamento", errores);
    requiredString(nomina, "dependencia", "nomina.dependencia", errores);

    if (typeof nomina.rfc !== "string" || !RFC_REGEX.test(nomina.rfc)) {
      errores.push("nomina.rfc debe tener 12-13 caracteres alfanuméricos");
    }

    requiredNumber(nomina, "ingresoMensual", "nomina.ingresoMensual", errores);
    optionalPhone(nomina, "telefonoEmpresarial", "nomina.telefonoEmpresarial", errores);
    requiredEmail(nomina, "emailLaboral", "nomina.emailLaboral", errores);
  }

  if (errores.length > 0) {
    throw new BadRequestException(`Errores de validación: ${errores.join("; ")}`);
  }
}
