import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopicSelectionForm from "@/components/topic-selection-form";

export default async function GradesPage({
    searchParams,
}: {
    searchParams: Promise<{ gradeId?: string }>;
}) {
    const supabase = await createClient();
    const { gradeId } = await searchParams;
    const gradeIdNumber = Number(gradeId);

    if (!gradeId || Number.isNaN(gradeIdNumber)) {
        return (
            <main className="min-h-screen p-8">
                <p>Invalid or missing grade id.</p>
            </main>
        );
    }

    const { data: grade, error: gradeError } = await supabase
        .from("grades")
        .select("id, name")
        .eq("id", gradeIdNumber)
        .single();

    const { data: topics, error: topicsError } = await supabase
        .from("topics")
        .select("id, name, slug, description")
        .eq("grade_id", gradeIdNumber)
        .eq("is_active", true)
        .order("name", { ascending: true });

    const decimalTopics =
        topics?.filter((topic) => topic.slug.startsWith("decimal-")) ?? [];

    const fractionTopics =
        topics?.filter(
            (topic) =>
                topic.slug.includes("fraction") ||
                topic.slug.includes("fractions") ||
                topic.slug === "improper-to-mixed" ||
                topic.slug === "mixed-to-improper"
        ) ?? [];

    const wholeNumberTopics =
        topics?.filter(
            (topic) =>
                !topic.slug.startsWith("decimal-") &&
                !topic.slug.includes("fraction") &&
                !topic.slug.includes("fractions") &&
                topic.slug !== "improper-to-mixed" &&
                topic.slug !== "mixed-to-improper"
        ) ?? [];

    return (
        <main className="min-h-screen p-8">
            <Link href="/" className="underline text-sm">
                ← Back to Home
            </Link>

            <h1 className="text-2xl font-bold mb-6 mt-4">
                {grade ? grade.name : "Grade"}
            </h1>

            {gradeError ? (
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto mb-4">
                    {JSON.stringify(gradeError, null, 2)}
                </pre>
            ) : null}

            <h2 className="text-xl font-semibold mb-2">Choose up to 4 topics</h2>
            <p className="text-sm text-gray-600 mb-4">
                Select up to 4 topics from any section.
            </p>

            {topicsError ? (
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
                    {JSON.stringify(topicsError, null, 2)}
                </pre>
            ) : topics && topics.length > 0 ? (
                <TopicSelectionForm
                    gradeId={gradeIdNumber}
                    wholeNumberTopics={wholeNumberTopics}
                    decimalTopics={decimalTopics}
                    fractionTopics={fractionTopics}
                />
            ) : (
                <p>No topics found for this grade.</p>
            )}
        </main>
    );
}