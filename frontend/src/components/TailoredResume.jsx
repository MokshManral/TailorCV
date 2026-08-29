import { useState } from "react";

export default function TailoredResume({ resumeText, dark }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors duration-300 sm:p-7 ${
        dark
          ? "border-neutral-800 bg-[#0e0e0e]"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3
          className={`text-base font-medium ${
            dark ? "text-white" : "text-neutral-950"
          }`}
        >
          Tailored resume
        </h3>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
            dark
              ? "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
              : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="my-5 h-px bg-neutral-200 dark:bg-neutral-800" />

      <div
        className={`max-h-[520px] overflow-y-auto rounded-xl p-5 text-sm leading-relaxed ${
          dark
            ? "bg-black text-neutral-300"
            : "bg-[#fafafa] text-neutral-700"
        }`}
      >
        <pre className="whitespace-pre-wrap break-words font-body">
          {resumeText}
        </pre>
      </div>
    </div>
  );
}
