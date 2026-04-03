import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type Question = {
  prompt: string;
  answer: string;
};

type Section = {
  topicName: string;
  questions: Question[];
};

type Payload = {
  title: string;
  gradeName: string;
  difficulty: string;
  sections: Section[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const COLUMN_GAP = 24;
const COLUMN_WIDTH = (CONTENT_WIDTH - COLUMN_GAP) / 2;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const { title, difficulty, sections } = body;

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = PAGE_HEIGHT - MARGIN;

    function drawText(
      text: string,
      x: number,
      yPos: number,
      size = 11,
      bold = false,
      color = rgb(0, 0, 0)
    ) {
      page.drawText(text, {
        x,
        y: yPos,
        size,
        font: bold ? boldFont : font,
        color,
      });
    }

    function textWidth(text: string, size = 11, bold = false) {
      return (bold ? boldFont : font).widthOfTextAtSize(text, size);
    }

    function wrapText(text: string, maxWidth: number, size = 11, bold = false) {
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (textWidth(test, size, bold) <= maxWidth) {
          current = test;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }

      if (current) lines.push(current);
      return lines;
    }

    function drawCenteredText(text: string, yPos: number, size = 11, bold = false) {
      const width = textWidth(text, size, bold);
      const x = (PAGE_WIDTH - width) / 2;
      drawText(text, x, yPos, size, bold);
    }

    function ensureSpace(requiredHeight: number) {
      if (y - requiredHeight < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
    }

    // Header
    drawCenteredText(title, y, 16, true);
    y -= 24;

    const subtitle =
      sections.map((section) => section.topicName).join(" • ") +
      " • " +
      difficulty.charAt(0).toUpperCase() +
      difficulty.slice(1);

    drawCenteredText(subtitle, y, 10, false,);
    y -= 24;

    drawText("Student Name: ____________________", MARGIN, y, 10);
    const dateText = "Date: ____________________";
    drawText(dateText, PAGE_WIDTH - MARGIN - textWidth(dateText, 10), y, 10);
    y -= 24;

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });

    y -= 24;

    let runningNumber = 1;

    for (const section of sections) {
      ensureSpace(28);
      drawText(section.topicName, MARGIN, y, 12, true);
      y -= 22;

      const rows = chunk(section.questions, 2);

      for (const row of rows) {
        const rowBlocks = row.map((question, idx) => {
          const currentNumber = runningNumber + idx;
          const fullText = `${currentNumber}) ${question.prompt}`;
          const lines = wrapText(fullText, COLUMN_WIDTH, 11);
          return lines;
        });

        const rowHeight =
          Math.max(...rowBlocks.map((lines) => lines.length)) * 18 + 8;

        ensureSpace(rowHeight);

        rowBlocks.forEach((lines, colIndex) => {
          const x =
            colIndex === 0
              ? MARGIN
              : MARGIN + COLUMN_WIDTH + COLUMN_GAP;

          let lineY = y;
          for (const line of lines) {
            drawText(line, x, lineY, 11);
            lineY -= 18;
          }
        });

        y -= rowHeight;
        runningNumber += row.length;
      }

      y -= 10;
    }

    // Cut line
    ensureSpace(40);

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      dashArray: [4, 4],
      color: rgb(0.55, 0.55, 0.55),
    });

    y -= 14;
    drawCenteredText("Cut along the dotted line", y, 9);
    y -= 16;

    // Answer key
    drawText("Answer Key", MARGIN, y, 10, true);
    y -= 12;

    const answers: string[] = [];
    let answerNumber = 1;

    for (const section of sections) {
      for (const question of section.questions) {
        answers.push(`${answerNumber}) ${question.answer}`);
        answerNumber++;
      }
    }

    const answerText = answers.join("    ");
    const answerLines = wrapText(answerText, CONTENT_WIDTH, 8);

    for (const line of answerLines) {
      ensureSpace(10);
      drawText(line, MARGIN, y, 8);
      y -= 10;
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}