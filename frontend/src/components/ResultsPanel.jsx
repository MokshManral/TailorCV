
import jsPDF from "jspdf";

import MatchScoreTape from "./MatchScoreTape.jsx";
import KeywordBadges from "./KeywordBadges.jsx";
import Suggestions from "./Suggestions.jsx";
import TailoredResume from "./TailoredResume.jsx";

// Download resume as PDF
function downloadResume(text) {
  if (!text || typeof text !== "string") return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;

  let y = 20;

  const lines = text.split("\n");

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      y += 4;
      return;
    }

    // Detect section headings
    const isHeading =
      trimmedLine.length < 65 &&
      !trimmedLine.endsWith(".") &&
      trimmedLine === trimmedLine.toUpperCase();

    if (isHeading) {
      y += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    const wrappedLines = doc.splitTextToSize(
      trimmedLine,
      maxWidth
    );

    wrappedLines.forEach((wrappedLine) => {
      if (y + 7 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.text(wrappedLine, margin, y);
      y += 6;
    });

    if (isHeading) {
      y += 2;
    }
  });

  doc.save("TailorCV-Tailored-Resume.pdf");
}

// Skeleton
function Skeleton({ dark, className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md ${
        dark ? "bg-neutral-800" : "bg-neutral-200"
      } ${className}`}
    />
  );
}

// Loading UI
function ResultsSkeleton({ dark }) {
  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  return (
    <div className="flex flex-col gap-5">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={`rounded-2xl border p-6 ${card}`}
        >
          <Skeleton dark={dark} className="h-5 w-40" />
          <Skeleton dark={dark} className="mt-5 h-4 w-full" />
          <Skeleton dark={dark} className="mt-3 h-4 w-4/5" />
          <Skeleton dark={dark} className="mt-3 h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export default function ResultsPanel({
  result,
  onStartOver,
  dark,
  loading = false,
}) {
  if (loading) {
    return <ResultsSkeleton dark={dark} />;
  }

  if (!result) return null;

  const resumeText = result.tailored_resume;

  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  const muted = dark
    ? "text-neutral-400"
    : "text-neutral-500";

  return (
    <div className="flex flex-col gap-8">

      {/* STEP 01 - TAILORED RESUME */}
      <section>
        <TailoredResume
          resumeText={resumeText}
          dark={dark}
        />

        {/* DOWNLOAD PDF */}
        <div
          className={`mt-6 border-t pt-5 ${
            dark
              ? "border-neutral-800"
              : "border-neutral-200"
          }`}
        >
          <p className={`mb-4 text-xs ${muted}`}>
            Save your generated resume as a PDF.
          </p>

          <button
            type="button"
            onClick={() => downloadResume(resumeText)}
            disabled={
              !resumeText ||
              typeof resumeText !== "string"
            }
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              dark
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
              <path d="M12 15V3" />
            </svg>

            Download Resume (.pdf)
          </button>
        </div>
      </section>

      {/* STEP 02 - MATCH SCORE */}
      <section>
        <MatchScoreTape
          score={result.match_score}
          summary={result.summary}
          dark={dark}
        />
      </section>

      {/* STEP 03 - KEYWORDS */}
      <section>
        <div className="grid gap-5">

          <KeywordBadges
            title="Matching keywords"
            keywords={result.matched_keywords}
            variant="matched"
            emptyLabel="No strong keyword matches found."
            dark={dark}
          />

          <KeywordBadges
            title="Missing keywords"
            keywords={result.missing_keywords}
            variant="missing"
            emptyLabel="No major gaps found."
            dark={dark}
          />

        </div>
      </section>

      {/* STEP 04 - SUGGESTIONS */}
      <section>
        <Suggestions
          suggestions={result.suggestions}
          dark={dark}
        />
      </section>

      {/* BOTTOM MESSAGE */}
      <div className={`rounded-2xl border p-7 text-center ${card}`}>
        <h3 className="text-base font-semibold">
          One step closer to your next opportunity.
        </h3>

        <p className={`mt-2 text-sm leading-6 ${muted}`}>
          Use these insights to make your next application stronger.
        </p>

        <button
          type="button"
          onClick={onStartOver}
          className={`mt-6 rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
            dark
              ? "border-neutral-700 hover:bg-neutral-900"
              : "border-neutral-200 hover:bg-neutral-100"
          }`}
        >
          + Start a new analysis
        </button>
      </div>

    </div>
  );
}
