import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

    return (
        <main className="min-h-screen p-8">
            <Link href="/" className="underline text-sm">
                ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold mb-6">
                {grade ? grade.name : "Grade"}
            </h1>

            {gradeError ? (
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto mb-4">
                    {JSON.stringify(gradeError, null, 2)}
                </pre>
            ) : null}

            <h2 className="text-xl font-semibold mb-3">Topics</h2>

            {topicsError ? (
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
                    {JSON.stringify(topicsError, null, 2)}
                </pre>
            ) : topics && topics.length > 0 ? (
                <ul className="space-y-2">
                    {topics.map((topic) => (
                        <li key={topic.id} className="border rounded p-3">
                            <Link href={`/topics/${topic.id}`} className="font-medium underline">
                                {topic.name}
                            </Link>
                            {topic.description ? (
                                <div className="text-sm text-gray-600">{topic.description}</div>
                            ) : null}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No topics found for this grade.</p>
            )}
        </main>
    );
}