export default function EmptyState({ dark }) {
  return (
    <div
      className={`flex min-h-[320px] flex-col items-center justify-center rounded-2xl border p-10 text-center transition-colors duration-300 ${
        dark
          ? "border-neutral-800 border-dashed bg-[#0e0e0e]"
          : "border-neutral-200 border-dashed bg-white"
      }`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${
          dark
            ? "border-neutral-800 bg-neutral-900 text-neutral-500"
            : "border-neutral-200 bg-neutral-50 text-neutral-400"
        }`}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M14 4v5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8 13h8M8 17h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-sm font-medium">Your results will appear here</h3>

      <p
        className={`mt-2 max-w-xs text-sm leading-6 ${
          dark ? "text-neutral-600" : "text-neutral-400"
        }`}
      >
        Add your resume and the job description, then tailor your resume.
      </p>
    </div>
  );
}
