import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TopicsPage({
    searchParams,
}: {
    searchParams: Promise<{ topicId?: string }>;
}) {
    const supabase = await createClient();
    const { topicId } = await searchParams;
    const topicIdNumber = Number(topicId);

    if (!topicId || Number.isNaN(topicIdNumber)) {
        return (
            <main className="min-h-screen p-8">
                <p>Invalid or missing topic id.</p>
            </main>
        );
    }

    const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id, name, description")
        .eq("id", topicIdNumber)
        .single();

    const { data: templates, error: templatesError } = await supabase
        .from("worksheet_templates")
        .select("id, title, slug, description, difficulty")
        .eq("topic_id", topicIdNumber)
        .eq("is_active", true)
        .order("id", { ascending: true });

    return (
        <main className="min-h-screen p-8">
            <Link href="/" className="underline text-sm">
                ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold mb-2">
                {topic ? topic.name : "Topic"}
            </h1>

            {topic?.description ? (
                <p className="text-gray-600 mb-6">{topic.description}</p>
            ) : null}

            {topicError ? (
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto mb-4">
                    {JSON.stringify(topicError, null, 2)}
                </pre>
            ) : null}

            <h2 className="text-xl font-semibold mb-3">Available Worksheets</h2>

            {templatesError ? (
                <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
                    {JSON.stringify(templatesError, null, 2)}
                </pre>
            ) : templates && templates.length > 0 ? (
                <ul className="space-y-2">
                    {templates.map((template) => (
                        <li key={template.id} className="border rounded p-3">
                            <div className="font-medium">{template.title}</div>
                            <div className="text-sm text-gray-600">
                                Difficulty: {template.difficulty}
                            </div>
                            {template.description ? (
                                <div className="text-sm text-gray-600 mb-3">
                                    {template.description}
                                </div>
                            ) : null}

                            <Link
                                href={`/worksheets/generate/${template.id}`}
                                className="inline-block rounded bg-black text-white px-4 py-2 text-sm"
                            >
                                Generate Worksheet
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No worksheet templates found for this topic.</p>
            )}
        </main>
    );
}