export default function EmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-seam p-10 text-center">
      <svg
        aria-hidden="true"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        className="text-pin"
      >
        <path
          d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M14 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="max-w-xs font-body text-sm text-ink-soft">
        Paste your resume and a job description to get started.
      </p>
    </div>
  );
}
