import { useEffect, useMemo, useState } from "react";

function base64ToBlob(base64, type) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Result view for a tailored LaTeX resume: shows the compiled PDF and offers
// the PDF and .tex for download. Everything comes from the /api/tailor/latex
// response, so no extra requests are needed.
export default function LatexResult({ result, dark }) {
  const [copyState, setCopyState] = useState("idle");

  const pdfBlob = useMemo(
    () => base64ToBlob(result.pdf_base64, "application/pdf"),
    [result.pdf_base64],
  );

  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfBlob]);

  useEffect(() => {
    if (copyState === "idle") return undefined;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.tailored_latex);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const muted = dark ? "text-neutral-400" : "text-neutral-500";
  const pagesChanged = result.page_count !== result.original_page_count;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          Tailored Resume (your template)
        </span>

        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            dark
              ? "border-neutral-700 text-white hover:bg-neutral-900"
              : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
          }`}
        >
          {copyState === "copied"
            ? "Copied!"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy LaTeX"}
        </button>
      </div>

      <div
        className={`overflow-hidden rounded-xl border ${
          dark ? "border-neutral-700" : "border-neutral-200"
        }`}
      >
        {pdfUrl && (
          <iframe
            title="Tailored resume PDF preview"
            src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
            className="h-[600px] w-full bg-white"
          />
        )}
      </div>

      {pagesChanged && (
        <p className="pt-3 text-xs text-amber-500" role="status">
          Heads up: the tailored resume is {result.page_count} page
          {result.page_count === 1 ? "" : "s"} long; your original was{" "}
          {result.original_page_count}.
        </p>
      )}

      <div
        className={`mt-6 border-t pt-5 ${
          dark ? "border-neutral-800" : "border-neutral-200"
        }`}
      >
        <p className={`mb-4 text-xs ${muted}`}>
          Download the compiled PDF, or the edited .tex with your original
          preamble.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => saveBlob(pdfBlob, "TailorCV-Tailored-Resume.pdf")}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
              dark
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-neutral-900 text-white hover:bg-neutral-700"
            }`}
          >
            Download Resume (.pdf)
          </button>

          <button
            type="button"
            onClick={() =>
              saveBlob(
                new Blob([result.tailored_latex], {
                  type: "application/x-tex;charset=utf-8",
                }),
                "TailorCV-Tailored-Resume.tex",
              )
            }
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition ${
              dark
                ? "border-neutral-700 text-white hover:bg-neutral-900"
                : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            Download Source (.tex)
          </button>
        </div>
      </div>
    </>
  );
}
