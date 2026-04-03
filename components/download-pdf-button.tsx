"use client";

import { useState } from "react";

type Question = {
  prompt: string;
  answer: string;
};

type Section = {
  topicName: string;
  questions: Question[];
};

type Props = {
  title: string;
  gradeName: string;
  difficulty: string;
  sections: Section[];
};

export default function DownloadPdfButton({
  title,
  gradeName,
  difficulty,
  sections,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);

      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          gradeName,
          difficulty,
          sections,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Could not download PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-block rounded border px-4 py-2 text-sm disabled:opacity-50"
    >
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}