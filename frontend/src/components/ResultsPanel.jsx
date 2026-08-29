import MatchScoreTape from "./MatchScoreTape.jsx";
import KeywordBadges from "./KeywordBadges.jsx";
import Suggestions from "./Suggestions.jsx";
import TailoredResume from "./TailoredResume.jsx";

function Skeleton({ dark, className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md ${
        dark ? "bg-neutral-800" : "bg-neutral-200"
      } ${className}`}
    />
  );
}

function ResultsSkeleton({ dark }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Match score skeleton */}
      <div
        className={`rounded-2xl border p-6 sm:p-7 ${
          dark
            ? "border-neutral-800 bg-[#0e0e0e]"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <Skeleton dark={dark} className="h-3 w-24" />
            <Skeleton dark={dark} className="mt-3 h-12 w-32" />
          </div>

          <Skeleton dark={dark} className="h-7 w-28 rounded-full" />
        </div>

        <Skeleton
          dark={dark}
          className="mt-7 h-3 w-full rounded-full"
        />

        <div className="mt-3 flex justify-between">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton
              key={item}
              dark={dark}
              className="h-2 w-5"
            />
          ))}
        </div>

        <Skeleton dark={dark} className="mt-6 h-4 w-4/5" />
        <Skeleton dark={dark} className="mt-2 h-4 w-3/5" />
      </div>

      {/* Keyword skeletons */}
      <div className="grid gap-6 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className={`rounded-2xl border p-6 sm:p-7 ${
              dark
                ? "border-neutral-800 bg-[#0e0e0e]"
                : "border-neutral-200 bg-white"
            }`}
          >
            <Skeleton dark={dark} className="h-5 w-36" />

            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton dark={dark} className="h-7 w-20 rounded-full" />
              <Skeleton dark={dark} className="h-7 w-28 rounded-full" />
              <Skeleton dark={dark} className="h-7 w-24 rounded-full" />
              <Skeleton dark={dark} className="h-7 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions skeleton */}
      <div
        className={`rounded-2xl border p-6 sm:p-7 ${
          dark
            ? "border-neutral-800 bg-[#0e0e0e]"
            : "border-neutral-200 bg-white"
        }`}
      >
        <Skeleton dark={dark} className="h-5 w-28" />

        <div className="mt-5 space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex gap-3">
              <Skeleton dark={dark} className="h-4 w-5" />

              <div className="flex-1">
                <Skeleton dark={dark} className="h-4 w-full" />
                <Skeleton
                  dark={dark}
                  className="mt-2 h-4 w-4/5"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailored resume skeleton */}
      <div
        className={`rounded-2xl border p-6 sm:p-7 ${
          dark
            ? "border-neutral-800 bg-[#0e0e0e]"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Skeleton dark={dark} className="h-5 w-32" />
          <Skeleton dark={dark} className="h-8 w-16 rounded-lg" />
        </div>

        <Skeleton dark={dark} className="my-5 h-px w-full" />

        <div
          className={`rounded-xl p-5 ${
            dark ? "bg-black" : "bg-[#fafafa]"
          }`}
        >
          <Skeleton dark={dark} className="h-4 w-full" />
          <Skeleton dark={dark} className="mt-3 h-4 w-11/12" />
          <Skeleton dark={dark} className="mt-3 h-4 w-4/5" />

          <Skeleton dark={dark} className="mt-6 h-4 w-full" />
          <Skeleton dark={dark} className="mt-3 h-4 w-10/12" />
          <Skeleton dark={dark} className="mt-3 h-4 w-3/4" />

          <Skeleton dark={dark} className="mt-6 h-4 w-full" />
          <Skeleton dark={dark} className="mt-3 h-4 w-5/6" />
          <Skeleton dark={dark} className="mt-3 h-4 w-2/3" />
        </div>
      </div>
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

  if (!result) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <MatchScoreTape
        score={result.match_score}
        summary={result.summary}
        dark={dark}
      />

      <div className="grid gap-6 sm:grid-cols-2">
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

      <Suggestions
        suggestions={result.suggestions}
        dark={dark}
      />

      <TailoredResume
        resumeText={result.tailored_resume}
        dark={dark}
      />

      <button
        type="button"
        onClick={onStartOver}
        className={`self-start rounded-lg border px-5 py-2 text-sm font-semibold transition ${
          dark
            ? "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
            : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950"
        }`}
      >
        Start over
      </button>
    </div>
  );
}
