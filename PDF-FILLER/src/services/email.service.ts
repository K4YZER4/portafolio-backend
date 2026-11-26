import sgMail from "@sendgrid/mail";
import { config } from "../config";
import { logger } from "../logger/logger";

if (config.EMAIL_ENABLED && config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY);
}

export interface EmailResult {
  enviado: boolean;
  modo: "email" | "demo";
  mensaje: string;
}

interface EnviarLinkFirmaParams {
  email: string;
  nombreCliente: string;
  link: string;
  folio: string;
}

export async function enviarLinkFirma(params: EnviarLinkFirmaParams): Promise<EmailResult> {
  const { email, nombreCliente, link, folio } = params;

  if (!config.EMAIL_ENABLED) {
    logger.info({ email, folio, link }, "Modo demo: correo de firma no enviado");
    return {
      enviado: false,
      modo: "demo",
      mensaje: "Correo desactivado en modo demostración. Usa el enlace generado.",
    };
  }

  if (!config.SENDGRID_API_KEY || !config.FROM_EMAIL) {
    logger.warn({ email, folio }, "Correo no enviado: falta configuración de SendGrid");
    return {
      enviado: false,
      modo: "email",
      mensaje: "Correo no enviado: falta configurar SendGrid.",
    };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #1a73e8; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Contrato ${folio}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Hola <strong>${nombreCliente}</strong>,</p>
              <p style="font-size: 16px; color: #333;">Tu contrato <strong>${folio}</strong> está listo para firmar.</p>
              <p style="font-size: 16px; color: #333;">Haz clic en el siguiente botón para revisarlo y firmarlo:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #1a73e8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">Firmar Contrato</a>
              </div>
              <p style="font-size: 14px; color: #777;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="font-size: 14px; color: #1a73e8; word-break: break-all;">${link}</p>
              <p style="font-size: 14px; color: #777; margin-top: 20px;">Este enlace expirará en 12 horas.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999;">
              <p style="margin: 0;">Este es un mensaje automático, por favor no respondas a este correo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await sgMail.send({
      to: email,
      from: config.FROM_EMAIL,
      subject: `Contrato ${folio} listo para firmar`,
      html,
    });
    logger.info({ email, folio }, "Correo de firma enviado exitosamente");
    return {
      enviado: true,
      modo: "email",
      mensaje: "Correo enviado exitosamente.",
    };
  } catch (err) {
    logger.warn({ err, email, folio }, "Error al enviar correo de firma");
    return {
      enviado: false,
      modo: "email",
      mensaje: "No se pudo enviar el correo. Usa el enlace generado.",
    };
  }
}
