export function calcularAniosResidencia(fechaIngreso: string): number {
  if (!fechaIngreso) return 0;

  const fechaIngresoDate = new Date(fechaIngreso);
  if (isNaN(fechaIngresoDate.getTime())) return 0;

  const hoy = new Date();
  let anios = hoy.getFullYear() - fechaIngresoDate.getFullYear();
  const mesDiff = hoy.getMonth() - fechaIngresoDate.getMonth();

  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaIngresoDate.getDate())) {
    anios--;
  }

  return Math.max(0, anios);
}
