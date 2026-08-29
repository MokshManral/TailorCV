export default function LoadingState({ dark }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[320px] flex-col items-center justify-center rounded-2xl border p-10 text-center ${
        dark
          ? "border-neutral-800 bg-[#0e0e0e]"
          : "border-neutral-200 bg-white"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-9 w-9 animate-spin rounded-full border-2 ${
          dark
            ? "border-neutral-800 border-t-white"
            : "border-neutral-200 border-t-black"
        }`}
      />

      <p
        className={`mt-4 text-sm ${
          dark ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        Analyzing your resume...
      </p>

      <p
        className={`mt-1 text-xs ${
          dark ? "text-neutral-700" : "text-neutral-400"
        }`}
      >
        This may take a moment.
      </p>
    </div>
  );
}
