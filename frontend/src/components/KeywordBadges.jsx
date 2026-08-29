const VARIANT_STYLES = {
  matched: {
    light: "border-green-200 bg-green-50 text-green-700",
    dark: "border-green-900/50 bg-green-950/30 text-green-400",
  },
  missing: {
    light: "border-red-200 bg-red-50 text-red-600",
    dark: "border-red-900/50 bg-red-950/30 text-red-400",
  },
};

export default function KeywordBadges({
  title,
  keywords = [],
  variant,
  emptyLabel,
  dark,
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.matched;

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors duration-300 sm:p-7 ${
        dark
          ? "border-neutral-800 bg-[#0e0e0e]"
          : "border-neutral-200 bg-white"
      }`}
    >
      {/* Title */}
      <h3
        className={`text-base font-semibold tracking-tight ${
          dark ? "text-white" : "text-neutral-950"
        }`}
      >
        {title}
      </h3>

      {/* Empty state */}
      {keywords.length === 0 ? (
        <p
          className={`mt-3 text-sm leading-6 ${
            dark ? "text-neutral-500" : "text-neutral-500"
          }`}
        >
          {emptyLabel}
        </p>
      ) : (
        /* Keywords */
        <ul className="mt-4 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                dark ? styles.dark : styles.light
              }`}
            >
              {keyword}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
