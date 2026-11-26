import { PDFDocument, TextAlignment } from "pdf-lib";
import fs from "fs";
import path from "path";
import { InternalServerError } from "../errors";
import { logger } from "../logger/logger";

export async function rellenarCamposPDF(
  datos: Record<string, string>,
): Promise<Buffer> {
  let pdfBytes: Buffer;
  const templateUrl = process.env.PDF_TEMPLATE_URL?.trim();
  const defaultPath = process.env.PDF_TEMPLATE_PATH ?? path.join(process.cwd(), "contrato_demo.pdf");

  try {
    if (templateUrl) {
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      pdfBytes = Buffer.from(await response.arrayBuffer());
    } else {
      pdfBytes = fs.readFileSync(path.resolve(defaultPath));
    }
  } catch {
    throw new InternalServerError(
      `No se encontró o no se pudo descargar la plantilla PDF: ${templateUrl ?? defaultPath}`,
    );
  }
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  for (const [campo, valor] of Object.entries(datos)) {
    try {
      const field = form.getField(campo);
      const tipo = field.constructor.name;
      if (tipo === "PDFCheckBox") {
        const checkbox = form.getCheckBox(campo);
        if (valor === "Yes") {
          checkbox.check();
        } else {
          checkbox.uncheck();
        }
      } else if (tipo === "PDFDropdown") {
        form.getDropdown(campo).select(valor);
      } else {
        const textField = form.getTextField(campo);
        textField.setText(valor.length > 150 ? valor.slice(0, 150) : valor);
        textField.setAlignment(TextAlignment.Center);
        textField.setFontSize(10);
      }
    } catch {
      logger.warn(`Campo PDF no encontrado: "${campo}"`);
    }
  }

  form.updateFieldAppearances();
  form.flatten();
  const pdfFinal = await pdfDoc.save();
  return Buffer.from(pdfFinal);
}
