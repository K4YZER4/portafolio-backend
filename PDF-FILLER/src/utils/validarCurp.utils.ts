const CURP_TIMEOUT_MS = 10_000;

async function validarCURP(curp: string) {
  if (!curp || curp.length !== 18)
  {return { valido: false, mensaje: "CURP inválida" };}
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CURP_TIMEOUT_MS);
    const res = await fetch(
      `https://consultas.curp.gob.mx/CurpSP/gobmx/anterior.do?curp=${encodeURIComponent(curp)}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    const body = await res.text();
    const ok = !body.includes("no encontrada") && !body.includes("ERROR") && !body.includes("No se encontraron");
    return {
      valido: ok,
      mensaje: ok ? "CURP verificada ✅" : "CURP no encontrada ❌",
    };
  } catch {
    return { valido: null, mensaje: "Sin conexión al RENAPO" };
  }
}
export { validarCURP };
