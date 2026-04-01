import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type GenerateWorksheetPdfInput = {
  title: string;
  questions: string[];
};

export async function generateWorksheetPdf({
  title,
  questions,
}: GenerateWorksheetPdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginLeft = 50;
  const marginTop = 60;
  const lineGap = 28;

  page.drawText(title, {
    x: marginLeft,
    y: height - marginTop,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  let currentY = height - marginTop - 50;

  questions.forEach((question, index) => {
    page.drawText(`${index + 1}. ${question}`, {
      x: marginLeft,
      y: currentY,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    currentY -= lineGap;
  });

  return await pdfDoc.save();
}