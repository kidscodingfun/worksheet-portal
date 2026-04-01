import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionsFromTemplate } from "@/lib/worksheet-generators/generate-from-template";
import { generateWorksheetPdf } from "@/lib/pdf/generate-worksheet-pdf";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");
  const templateIdNumber = Number(templateId);

  if (!templateId || Number.isNaN(templateIdNumber)) {
    return NextResponse.json(
      { error: "Invalid or missing templateId" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("worksheet_templates")
    .select("id, title, slug, rule_json")
    .eq("id", templateIdNumber)
    .single();

  if (error || !template) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }

let questions: string[] = [];

try {
  questions = generateQuestionsFromTemplate(template.rule_json);
} catch (error) {
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate questions",
    },
    { status: 400 }
  );
}

  const pdfBytes = await generateWorksheetPdf({
    title: template.title,
    questions,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${template.slug}.pdf"`,
    },
  });
}