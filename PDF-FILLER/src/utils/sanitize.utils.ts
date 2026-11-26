/**
 * Lista de campos que contienen datos sensibles
 * Estos serán reemplazados con [REDACTED] en los logs
 */
const SENSITIVE_FIELDS = [
  // De IneData
  "nombre1",
  "nombre2",
  "apellidoPaterno",
  "apellidoMaterno",
  "fechaNac",
  "curp",
  "claveElector",

  // De Domicilio (dentro de IneData)
  "calle",
  "numeroCasa",
  "colonia",
  "codigoPostal",
  "municipio",

  // De EstadoCuentaDatos
  "nombreTitular",
  "rfc",
  "numeroCuenta",
  "clabe",
  "saldoAlCorte",
  "saldoPromedio",
  "totalDepositos",

  // De NominaDatos
  "noEmpleado",
  "percepcionNomina1",
  "percepcionNomina2",
  "ingresoMensual",
  "nombreCompleto",
  // De DatosExtra
  "telefonoCelular",
  "telefonoCasa",
  "mail",
  "referencia1",
  "referencia2",
  "referencia3",
  "telefonoReferencia1",
  "telefonoReferencia2",
  "telefonoReferencia3",
  "entreCalles",

  // De FilaTabla
  "montoNeto",
  "montoPagare",
  "descuentoQuincenal",
  "importeInteres",
];
/**
 * Sanitiza un objeto reemplazando campos sensibles con [REDACTED]
 *
 * @param obj - Objeto a sanitizar
 * @returns Objeto con campos sensibles reemplazados
 *
 * @example
 * sanitizeObject({ ine: "123", name: "Juan" })
 * // Resultado: { ine: "[REDACTED]", name: "Juan" }
 */
export function sanitizeObject(obj: unknown): unknown {
  // Si no es objeto o es null → retorna como está
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Si es un array → sanitiza cada elemento
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  // Si es un objeto → sanitiza cada propiedad
  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = SENSITIVE_FIELDS.some(
        (field) => key.toLowerCase() === field.toLowerCase()
      );

      if (isSensitive) {
        // Reemplaza con [REDACTED]
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        // Si es un objeto anidado → sanitiza recursivamente
        sanitized[key] = sanitizeObject(value);
      } else {
        // Si es un valor primitivo seguro → mantiene igual
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Si es un primitivo (string, number, etc) → retorna igual
  return obj;
}
