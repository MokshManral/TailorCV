const VARIANT_STYLES = {
  matched: "border-pin/30 bg-pin/10 text-pin-dark",
  missing: "border-match-weak/30 bg-match-weak/10 text-match-weak",
};

export default function KeywordBadges({ title, keywords, variant, emptyLabel }) {
  return (
    <div className="rounded-2xl border border-seam bg-white/70 p-6 sm:p-7">
      <h3 className="font-display text-base font-medium text-ink">{title}</h3>
      {keywords.length === 0 ? (
        <p className="mt-3 font-body text-sm text-ink-soft">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className={`rounded-full border px-3 py-1 font-mono text-xs ${VARIANT_STYLES[variant]}`}
            >
              {keyword}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
