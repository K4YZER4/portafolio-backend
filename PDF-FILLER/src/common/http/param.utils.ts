/**
 * Convierte un parámetro de ruta numérico en un id válido.
 * Devuelve `null` cuando el valor debe tratarse como folio.
 */
export function normalizeNumericId(param: string): number | null {
  if (!/^\d+$/.test(param)) {
    return null;
  }
  const value = Number(param);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
