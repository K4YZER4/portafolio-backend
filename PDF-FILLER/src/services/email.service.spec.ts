import { enviarLinkFirma } from "./email.service";

describe("enviarLinkFirma", () => {
  it("devuelve modo demo sin intentar enviar correo", async () => {
    const resultado = await enviarLinkFirma({
      email: "cliente@example.com",
      nombreCliente: "Cliente Demo",
      link: "http://localhost:5173/firmar/token-demo",
      folio: "C-000001",
    });

    expect(resultado).toEqual({
      enviado: false,
      modo: "demo",
      mensaje: "Correo desactivado en modo demostración. Usa el enlace generado.",
    });
  });
});
