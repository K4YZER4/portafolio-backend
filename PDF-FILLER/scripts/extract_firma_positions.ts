import { PDFDocument, PDFName } from "pdf-lib";
import fs from "fs";
import path from "path";

interface FirmaPosition {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

async function extractFirmaPositions() {
  const pdfBytes = fs.readFileSync(path.join(__dirname, "../contrato.pdf"));
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const fields = pdfDoc.getForm().getFields();

  const positions: FirmaPosition[] = [];

  for (const field of fields) {
    const name = field.getName().toLowerCase();
    if (!name.includes("firma") && !name.includes("signature")) continue;

    const acroField = (field as any).acroField;
    const widgets = acroField.getWidgets();

    for (const widget of widgets) {
      const rect = widget.getRectangle();
      const dict = widget.dict;
      const pageRef = dict.get(PDFName.of("P"));

      if (!pageRef) continue;

      const pageRefStr = pageRef.toString();
      const pageIdx = pages.findIndex((p) => p.ref?.toString() === pageRefStr);

      if (pageIdx === -1) continue;

      positions.push({
        pageIndex: pageIdx,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }
  }

  console.log(`\n// Total posiciones encontradas: ${positions.length}\n`);

  if (positions.length === 0) {
    console.log("// No se encontraron campos de firma en el template");
    process.exit(1);
  }

  console.log("const FIRMA_POSITIONS = [");
  positions.forEach((p) => {
    console.log(
      `  { pageIndex: ${p.pageIndex}, x: ${p.x}, y: ${p.y}, width: ${p.width}, height: ${p.height} },`
    );
  });
  console.log("];");
}

extractFirmaPositions().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
