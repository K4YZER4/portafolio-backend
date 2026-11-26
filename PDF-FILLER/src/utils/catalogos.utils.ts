/**
 * Normaliza descripciones de catálogos (estado civil, tipo de vivienda, etc.)
 * para que coincidan con los valores almacenados en la base de datos.
 *
 * Ejemplo: "UNIÓN LIBRE" -> "UNION LIBRE".
 */
export function normalizarDescripcionCatalogo(valor?: string | null): string {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}
