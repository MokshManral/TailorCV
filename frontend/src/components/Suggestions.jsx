export default function Suggestions({ suggestions = [], dark }) {
  if (suggestions.length === 0) return null;

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
        Suggestions
      </h3>

      {/* Suggestions */}
      <ol className="mt-5 flex flex-col gap-4">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className={`flex gap-3 text-sm leading-6 ${
              dark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {/* Number */}
            <span
              className={`shrink-0 font-mono text-[11px] font-semibold ${
                dark ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Text */}
            <span>{suggestion}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
