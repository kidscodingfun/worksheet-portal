import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionsFromTemplate } from "@/lib/worksheet-generators/generate-from-template";
import PrintButton from "@/components/print-button";

function createSeed() {
    return Math.random().toString(36).slice(2, 10);
}

export default async function GenerateWorksheetPage({
    searchParams,
}: {
    searchParams: Promise<{ templateId?: string; seed?: string }>;
}) {
    const supabase = await createClient();
    const { templateId, seed } = await searchParams;
    const templateIdNumber = Number(templateId);

    if (!templateId || Number.isNaN(templateIdNumber)) {
        return (
            <main className="min-h-screen p-8">
                <p>Invalid or missing template id.</p>
            </main>
        );
    }

    const actualSeed = seed || createSeed();

    const { data: template, error } = await supabase
        .from("worksheet_templates")
        .select("id, title, description, difficulty, rule_json")
        .eq("id", templateIdNumber)
        .single();

    if (error) {
        return (
            <main className="min-h-screen p-8">
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
                    {JSON.stringify(error, null, 2)}
                </pre>
            </main>
        );
    }

    if (!template) {
        return (
            <main className="min-h-screen p-8">
                <p>Template not found.</p>
            </main>
        );
    }

    let questions: string[] = [];

    try {
        questions = generateQuestionsFromTemplate(template.rule_json);
    } catch (error) {
        return (
            <main className="min-h-screen p-8">
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
                    {error instanceof Error ? error.message : "Failed to generate questions"}
                </pre>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white p-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="no-print flex gap-3">
                    <Link
                        href="/"
                        className="inline-block rounded border px-4 py-2 text-sm"
                    >
                        Back to Home
                    </Link>

                    <Link
                        href={`/worksheets/generate/${template.id}?seed=${createSeed()}`}
                        className="inline-block rounded border px-4 py-2 text-sm"
                    >
                        Regenerate Worksheet
                    </Link>

                    <PrintButton />
                </div>

                <div className="worksheet-sheet border rounded p-8 bg-white">
                    <div className="mb-8 border-b pb-6">
                        <h1 className="text-3xl font-bold text-center mb-2">{template.title}</h1>

                        {template.description ? (
                            <p className="text-gray-700 text-center mb-6">{template.description}</p>
                        ) : null}

                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>Student Name: ____________________</div>
                            <div className="text-right">Date: ____________________</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {questions.map((question, index) => (
                            <div key={index} className="text-sm leading-6 flex">
                                <span className="inline-block w-8 shrink-0">{index + 1})</span>
                                <span>{question}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}