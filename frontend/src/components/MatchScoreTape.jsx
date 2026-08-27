function getBand(score) {
  if (score >= 80) {
    return { label: "Strong Match", color: "text-match-strong", fill: "bg-match-strong" };
  }
  if (score >= 60) {
    return { label: "Moderate Match", color: "text-match-ok", fill: "bg-match-ok" };
  }
  return { label: "Needs Work", color: "text-match-weak", fill: "bg-match-weak" };
}

export default function MatchScoreTape({ score, summary }) {
  const clamped = Math.max(0, Math.min(100, score));
  const band = getBand(clamped);
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className="rounded-2xl border border-seam bg-white/70 p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Match score
          </p>
          <p className="font-display text-5xl font-medium leading-none text-ink">
            {clamped}
            <span className="text-2xl text-ink-soft">/100</span>
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-body text-sm font-semibold ${band.color}`}
          style={{ borderColor: "currentColor" }}
        >
          {band.label}
        </span>
      </div>

      {/* Measuring-tape style score bar */}
      <div className="mt-6" aria-hidden="true">
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-3 h-2 overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-seam">
            <div
              className={`h-full ${band.fill} transition-all duration-700 ease-out`}
              style={{ width: `${clamped}%` }}
            />
          </div>
          {/* pin marker */}
          <div
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center transition-all duration-700 ease-out"
            style={{ left: `${clamped}%` }}
          >
            <span className={`h-2.5 w-2.5 rounded-full border-2 border-white ${band.fill} shadow-sm`} />
            <span className={`h-4 w-px ${band.fill}`} />
          </div>
        </div>
        <div className="mt-1 flex justify-between">
          {ticks.map((tick) => (
            <span key={tick} className="font-mono text-[10px] text-ink-soft/70">
              {tick}
            </span>
          ))}
        </div>
      </div>

      <p role="status" className="mt-5 font-body text-sm leading-relaxed text-ink-soft">
        {summary}
      </p>
    </div>
  );
}
