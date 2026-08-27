export default function Suggestions({ suggestions }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-seam bg-white/70 p-6 sm:p-7">
      <h3 className="font-display text-base font-medium text-ink">Suggestions</h3>
      <ol className="mt-3 flex flex-col gap-3">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex gap-3 font-body text-sm leading-relaxed text-ink">
            <span className="font-mono text-xs font-semibold text-pin">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
