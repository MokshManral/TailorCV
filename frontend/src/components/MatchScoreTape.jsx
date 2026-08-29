function getBand(score) {
  if (score >= 80) {
    return {
      label: "Strong Match",
      text: "text-green-500",
      fill: "bg-green-500",
    };
  }

  if (score >= 60) {
    return {
      label: "Moderate Match",
      text: "text-yellow-500",
      fill: "bg-yellow-500",
    };
  }

  return {
    label: "Needs Work",
    text: "text-red-500",
    fill: "bg-red-500",
  };
}

export default function MatchScoreTape({ score, summary, dark }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const band = getBand(clamped);
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors duration-300 sm:p-7 ${
        dark
          ? "border-neutral-800 bg-[#0e0e0e]"
          : "border-neutral-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${
              dark ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            Match score
          </p>

          <p
            className={`text-5xl font-semibold leading-none tracking-[-0.05em] ${
              dark ? "text-white" : "text-neutral-950"
            }`}
          >
            {clamped}
            <span
              className={`ml-1 text-2xl font-medium ${
                dark ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              /100
            </span>
          </p>
        </div>

        {/* Match badge */}
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            band.text
          } ${
            dark
              ? "border-neutral-800 bg-neutral-900"
              : "border-neutral-200 bg-neutral-50"
          }`}
        >
          {band.label}
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-7" aria-hidden="true">
        <div className="relative h-8">
          {/* Track */}
          <div
            className={`absolute inset-x-0 top-3 h-2 overflow-hidden rounded-full ${
              dark ? "bg-neutral-900" : "bg-neutral-100"
            }`}
          >
            {/* Fill */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${band.fill}`}
              style={{ width: `${clamped}%` }}
            />
          </div>

          {/* Marker */}
          <div
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center transition-all duration-700 ease-out"
            style={{ left: `${clamped}%` }}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full border-2 shadow-sm ${
                dark ? "border-[#0e0e0e]" : "border-white"
              } ${band.fill}`}
            />

            <span className={`h-4 w-px ${band.fill}`} />
          </div>
        </div>

        {/* Ticks */}
        <div className="mt-1 flex justify-between">
          {ticks.map((tick) => (
            <span
              key={tick}
              className={`text-[10px] font-mono ${
                dark ? "text-neutral-700" : "text-neutral-400"
              }`}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <p
          role="status"
          className={`mt-6 text-sm leading-6 ${
            dark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          {summary}
        </p>
      )}
    </div>
  );
}
