export default function ErrorState({ message, onRetry, dark }) {
  return (
    <div
      role="alert"
      className={`flex min-h-[320px] flex-col items-center justify-center rounded-2xl border p-10 text-center ${
        dark
          ? "border-red-500/20 bg-red-500/[0.03]"
          : "border-red-200 bg-red-50/50"
      }`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${
          dark
            ? "border-red-500/20 bg-red-500/10 text-red-400"
            : "border-red-200 bg-red-50 text-red-500"
        }`}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 8v5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="0.9" fill="currentColor" />
        </svg>
      </div>

      <h3 className="text-sm font-medium">Something went wrong</h3>

      <p
        className={`mt-2 max-w-sm text-sm leading-6 ${
          dark ? "text-neutral-500" : "text-neutral-500"
        }`}
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className={`mt-6 rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
          dark
            ? "border-neutral-700 text-white hover:bg-neutral-900"
            : "border-neutral-300 text-neutral-900 hover:bg-neutral-100"
        }`}
      >
        Try again
      </button>
    </div>
  );
}
