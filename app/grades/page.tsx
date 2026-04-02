import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
        <form action="/worksheets/mixed" method="get" className="space-y-6">
          <input type="hidden" name="gradeId" value={gradeIdNumber} />

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              name="difficulty"
              className="border rounded px-3 py-2 text-sm"
              defaultValue="easy"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2">
            {wholeNumberTopics.length > 0 ? (
              <section>
                <h3 className="text-lg font-semibold mb-2">Whole Numbers</h3>
                <div className="space-y-2">
                  {wholeNumberTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-start gap-3 border rounded p-3"
                    >
                      <input
                        type="checkbox"
                        name="topicIds"
                        value={topic.id}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        {topic.description ? (
                          <div className="text-sm text-gray-600">
                            {topic.description}
                          </div>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {decimalTopics.length > 0 ? (
              <section>
                <h3 className="text-lg font-semibold mb-2">Decimals</h3>
                <div className="space-y-2">
                  {decimalTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-start gap-3 border rounded p-3"
                    >
                      <input
                        type="checkbox"
                        name="topicIds"
                        value={topic.id}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        {topic.description ? (
                          <div className="text-sm text-gray-600">
                            {topic.description}
                          </div>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {fractionTopics.length > 0 ? (
              <section>
                <h3 className="text-lg font-semibold mb-2">Fractions</h3>
                <div className="space-y-2">
                  {fractionTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-start gap-3 border rounded p-3"
                    >
                      <input
                        type="checkbox"
                        name="topicIds"
                        value={topic.id}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        {topic.description ? (
                          <div className="text-sm text-gray-600">
                            {topic.description}
                          </div>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <button
            type="submit"
            className="rounded bg-black text-white px-4 py-2 text-sm"
          >
            Generate Worksheet
          </button>
        </form>
      ) : (
        <p>No topics found for this grade.</p>
      )}
    </main>
  );
}