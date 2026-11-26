export function formatearCadaTresCaracteres(cadena: string): string {
  if (!cadena) return "";
  const digitos = cadena.replace(/\D/g, "");
  if (digitos.length <= 3) return digitos;
  if (digitos.length === 4) return `${digitos.slice(0, 1)}-${digitos.slice(1)}`;
  const partes: string[] = [];
  let i = 0;
  while (i < digitos.length) {
    partes.push(digitos.substr(i, 3));
    i += 3;
  }
  return partes.join("-");
}
