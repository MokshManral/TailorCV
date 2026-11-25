import MatchScoreTape from "./MatchScoreTape.jsx";
import KeywordBadges from "./KeywordBadges.jsx";
import Suggestions from "./Suggestions.jsx";
import CompanyRecommendations from "./CompanyRecommendations.jsx";
import TailoredResume from "./TailoredResume.jsx";
import LatexResult from "./LatexResult.jsx";
import { useEffect, useState } from "react";
import { formatResumeText } from "./resumeFormatting.js";
import { API_BASE_URL } from "../lib/api.js";

// Ask the backend to render the resume as .tex or compile it to .pdf,
// using the same blocks shown in the preview so the layout matches.
async function downloadResume(text, format) {
  const blocks = formatResumeText(text);
  if (blocks.length === 0) return;

  const response = await fetch(`${API_BASE_URL}/api/resume/${format}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });

  if (!response.ok) {
    let message = `Could not download the ${format.toUpperCase()} file.`;
    try {
      const data = await response.json();
      if (data?.detail && typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Keep the default message.
    }
    throw new Error(message);
  }

  const file = await response.blob();
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `TailorCV-Tailored-Resume.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Skeleton bar with a light sweeping across it
function Skeleton({ dark, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md ${
        dark ? "bg-neutral-800" : "bg-neutral-200"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent ${
          dark ? "via-white/10" : "via-white/70"
        } to-transparent`}
      />
    </div>
  );
}

// Status lines shown in turn while the AI works (it can take a while).
const LOADING_STEPS = [
  "Reading your resume…",
  "Analyzing the job description…",
  "Matching skills and keywords…",
  "Tailoring your summary and bullets…",
  "Finding companies that fit…",
  "Polishing the final layout…",
];

// Loading UI
function ResultsSkeleton({ dark }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () =>
        setStep((current) => Math.min(current + 1, LOADING_STEPS.length - 1)),
      2800,
    );
    return () => clearInterval(timer);
  }, []);

  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div
        className="flex items-center gap-3 px-1"
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span
          key={step}
          className={`animate-fade-in text-sm font-medium ${
            dark ? "text-neutral-300" : "text-neutral-700"
          }`}
        >
          {LOADING_STEPS[step]}
        </span>
      </div>

      {[1, 2, 3, 4].map((item, index) => (
        <div
          key={item}
          style={{ animationDelay: `${index * 90}ms` }}
          className={`animate-fade-up rounded-2xl border p-6 ${card}`}
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
  split = false,
}) {
  const [downloading, setDownloading] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  if (loading) {
    return <ResultsSkeleton dark={dark} />;
  }

  if (!result) return null;

  const resumeText = result.tailored_resume;
  const canDownload =
    Boolean(resumeText) && typeof resumeText === "string" && !downloading;

  const handleDownload = async (format) => {
    setDownloading(format);
    setDownloadError("");
    try {
      await downloadResume(resumeText, format);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setDownloading(null);
    }
  };

  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  const muted = dark ? "text-neutral-400" : "text-neutral-500";

  // split: full-width two-column layout (resume left, insights right).
  // Otherwise everything stacks in one column (used beside the input form).
  return (
    <div
      className={
        split
          ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          : "flex flex-col gap-8"
      }
    >
      {/* STEP 01 - TAILORED RESUME */}
      <section
        style={{ animationDelay: "0ms" }}
        className={`min-w-0 animate-fade-up ${
          split
            ? `rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-6 ${card}`
            : ""
        }`}
      >
        {result.tailored_latex ? (
          <LatexResult result={result} dark={dark} />
        ) : (
          <>
            <TailoredResume resumeText={resumeText} dark={dark} tall={split} />

            {/* DOWNLOAD RESUME */}
            <div
              className={`mt-6 border-t pt-5 ${
                dark ? "border-neutral-800" : "border-neutral-200"
              }`}
            >
              <p className={`mb-4 text-xs ${muted}`}>
                Download your resume as a ready-to-send PDF, or as editable
                LaTeX source.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={!canDownload}
                  className={`btn-motion flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-neutral-900 text-white hover:bg-neutral-700"
                  }`}
                >
                  {downloading === "pdf"
                    ? "Generating PDF..."
                    : "Download Resume (.pdf)"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("tex")}
                  disabled={!canDownload}
                  className={`btn-motion flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark
                      ? "border-neutral-700 text-white hover:bg-neutral-900"
                      : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  {downloading === "tex"
                    ? "Preparing..."
                    : "Download Source (.tex)"}
                </button>
              </div>

              {downloadError && (
                <p className="pt-3 text-xs text-red-500" role="alert">
                  {downloadError}
                </p>
              )}
            </div>
            <p className={`pt-2 text-xs ${muted}`}>
              Open the .tex file in a LaTeX editor, such as Overleaf, to
              customize it.
            </p>
          </>
        )}
      </section>

      <div className={split ? "flex min-w-0 flex-col gap-6" : "contents"}>
        {/* STEP 02 - MATCH SCORE */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: "110ms" }}
        >
          <MatchScoreTape
            score={result.match_score}
            summary={result.summary}
            dark={dark}
          />
        </section>

        {/* STEP 03 - KEYWORDS */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <div className={`grid gap-5 ${split ? "sm:grid-cols-2" : ""}`}>
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
        <section
          className="animate-fade-up"
          style={{ animationDelay: "330ms" }}
        >
          <Suggestions suggestions={result.suggestions} dark={dark} />
        </section>

        {/* STEP 05 - COMPANIES TO CONSIDER */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: "440ms" }}
        >
          <CompanyRecommendations
            companies={result.recommended_companies}
            dark={dark}
          />
        </section>

        {/* BOTTOM MESSAGE */}
        <div
          style={{ animationDelay: "550ms" }}
          className={`animate-fade-up rounded-2xl border p-7 text-center ${card}`}
        >
          <h3 className="text-base font-semibold">
            One step closer to your next opportunity.
          </h3>

          <p className={`mt-2 text-sm leading-6 ${muted}`}>
            Use these insights to make your next application stronger.
          </p>

          <button
            type="button"
            onClick={onStartOver}
            className={`btn-motion mt-6 rounded-lg border px-5 py-2.5 text-sm font-semibold ${
              dark
                ? "border-neutral-700 hover:bg-neutral-900"
                : "border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            + Start a new analysis
          </button>
        </div>
      </div>
    </div>
  );
}
