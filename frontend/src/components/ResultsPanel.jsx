import MatchScoreTape from "./MatchScoreTape.jsx";
import KeywordBadges from "./KeywordBadges.jsx";
import Suggestions from "./Suggestions.jsx";
import TailoredResume from "./TailoredResume.jsx";

export default function ResultsPanel({ result, onStartOver }) {
  return (
    <div className="flex flex-col gap-6">
      <MatchScoreTape score={result.match_score} summary={result.summary} />

      <div className="grid gap-6 sm:grid-cols-2">
        <KeywordBadges
          title="Matching keywords"
          keywords={result.matched_keywords}
          variant="matched"
          emptyLabel="No strong keyword matches found."
        />
        <KeywordBadges
          title="Missing keywords"
          keywords={result.missing_keywords}
          variant="missing"
          emptyLabel="No major gaps found."
        />
      </div>

      <Suggestions suggestions={result.suggestions} />
      <TailoredResume resumeText={result.tailored_resume} />

      <button
        type="button"
        onClick={onStartOver}
        className="self-start rounded-full border border-seam px-5 py-2 font-body text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        Start over
      </button>
    </div>
  );
}
