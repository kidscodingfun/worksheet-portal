import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: grades, error } = await supabase
    .from("grades")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Worksheet Portal</h1>

      <h2 className="text-xl font-semibold mb-3">Choose a grade</h2>

      {error ? (
        <pre className="bg-red-50 p-4 rounded border text-sm overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      ) : (
        <ul className="space-y-2">
          {grades?.map((grade) => (
            <li key={grade.id} className="border rounded p-3">
              <Link href={`/grades/${grade.id}`} className="underline">
                {grade.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}