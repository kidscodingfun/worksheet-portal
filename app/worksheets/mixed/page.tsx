import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionsFromTemplate } from "@/lib/worksheet-generators/generate-from-template";
import PrintButton from "@/components/print-button";

function createSeed() {
    return Math.random().toString(36).slice(2, 10);
}

export default async function MixedWorksheetPage({
    searchParams,
}: {
    searchParams: Promise<{
        gradeId?: string;
        topicIds?: string | string[];
        difficulty?: string;
        seed?: string;
    }>;
}) {
    const supabase = await createClient();
    const { gradeId, topicIds, difficulty, seed } = await searchParams;
    const selectedDifficulty =
        difficulty === "medium" || difficulty === "hard" ? difficulty : "easy";
    const gradeIdNumber = Number(gradeId);

    const topicIdList = Array.isArray(topicIds)
        ? topicIds.map(Number).filter((n) => !Number.isNaN(n))
        : topicIds
            ? [Number(topicIds)].filter((n) => !Number.isNaN(n))
            : [];

    if (!gradeId || Number.isNaN(gradeIdNumber)) {
        return (
            <main className="min-h-screen p-8">
                <p>Invalid or missing grade id.</p>
            </main>
        );
    }

    if (topicIdList.length === 0 || topicIdList.length > 4) {
        return (
            <main className="min-h-screen p-8">
                <p>Please select between 1 and 4 topics.</p>
            </main>
        );
    }

    const actualSeed = seed || createSeed();

    const { data: grade } = await supabase
        .from("grades")
        .select("id, name")
        .eq("id", gradeIdNumber)
        .single();

    const { data: templates, error } = await supabase
        .from("worksheet_templates")
        .select(`
    id,
    title,
    slug,
    difficulty,
    rule_json,
    topics!inner (
      id,
      name,
      grade_id
    )
  `)
        .in("topic_id", topicIdList)
        .eq("grade_id", gradeIdNumber)
        .eq("difficulty", selectedDifficulty)
        .eq("is_active", true)
        .order("id", { ascending: true });

    if (error) {
        return (
            <main className="min-h-screen p-8">
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
                    {JSON.stringify(error, null, 2)}
                </pre>
            </main>
        );
    }

    if (!templates || templates.length === 0) {
        return (
            <main className="min-h-screen p-8">
                <p>No worksheet templates found for the selected topics.</p>
            </main>
        );
    }

    const perTopicCount = Math.floor(20 / templates.length);

    type TemplateRow = {
        id: number;
        title: string;
        rule_json: Parameters<typeof generateQuestionsFromTemplate>[0];
        topics?: { name: string } | Array<{ name: string }> | null;
    };

    const sections = (templates as TemplateRow[]).map((template, index) => {
        const sectionSeed = `${actualSeed}-${template.id}-${index}`;

        const fullQuestions = generateQuestionsFromTemplate(
            template.rule_json
        );

        const topicName = Array.isArray(template.topics)
            ? template.topics[0]?.name
            : template.topics?.name;

        return {
            topicName: topicName ?? template.title,
            questions: fullQuestions.slice(0, perTopicCount),
        };
    });

    return (
        <main className="min-h-screen bg-white p-4 print:p-0">
            <div className="mx-auto max-w-3xl space-y-4">
                <div className="no-print flex gap-3 flex-wrap">
                    <Link
                        href={`/grades/${gradeIdNumber}`}
                        className="inline-block rounded border px-4 py-2 text-sm"
                    >
                        Back to {grade?.name || "Grade"}
                    </Link>

                    <Link
                        href={`/worksheets/mixed?gradeId=${gradeIdNumber}&difficulty=${selectedDifficulty}${topicIdList
                            .map((id) => `&topicIds=${id}`)
                            .join("")}&seed=${createSeed()}`}
                        className="inline-block rounded border px-4 py-2 text-sm"
                    >
                        Regenerate Worksheet
                    </Link>

                    <PrintButton />
                </div>

                <div className="worksheet-sheet border rounded p-4 bg-white">
                    <div className="mb-3 border-b pb-2">
                        <h1 className="text-xl font-bold text-center mb-1">
                            {sections.length === 1
                                ? `${sections[0].topicName} Worksheet`
                                : `${grade?.name || "Grade"} Mixed Worksheet`}
                        </h1>

                        <p className="text-gray-700 text-center mb-2 text-sm">
                            {sections.map((section) => section.topicName).join(" • ")}
                            {" • "}
                            {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>Student Name: ____________________</div>
                            <div className="text-right">Date: ____________________</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {(() => {
                            let runningNumber = 1;

                            return sections.map((section, sectionIndex) => {
                                const sectionBlock = (
                                    <div key={sectionIndex}>
                                        <h2 className="text-base font-semibold mb-2">
                                            {section.topicName}
                                        </h2>

                                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                            {section.questions.map((question, questionIndex) => {
                                                const currentNumber = runningNumber++;
                                                return (
                                                    <div key={questionIndex} className="text-sm leading-6">
                                                        {currentNumber}) {question}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );

                                return sectionBlock;
                            });
                        })()}
                    </div>
                </div>
            </div>
        </main>
    );
}