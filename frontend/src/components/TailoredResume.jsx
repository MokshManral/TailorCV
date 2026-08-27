import { useState } from "react";

export default function TailoredResume({ resumeText }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-seam bg-white/70 p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-medium text-ink">Tailored resume</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-canvas"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="stitch-line my-4" />
      <div className="max-h-[520px] overflow-y-auto rounded-xl bg-canvas/60 p-5 font-body text-sm leading-relaxed text-ink">
        <pre className="whitespace-pre-wrap break-words font-body">{resumeText}</pre>
      </div>
    </div>
  );
}
