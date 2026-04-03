"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-block rounded bg-black text-white px-4 py-2 text-sm"
    >
      Print
    </button>
  );
}