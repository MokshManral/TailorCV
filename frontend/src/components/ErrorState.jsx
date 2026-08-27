export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-match-weak/40 bg-match-weak/5 p-10 text-center"
    >
      <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-match-weak">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="0.9" fill="currentColor" />
      </svg>
      <p className="max-w-xs font-body text-sm text-ink">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-ink px-5 py-2 font-body text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-canvas"
      >
        Try again
      </button>
    </div>
  );
}
