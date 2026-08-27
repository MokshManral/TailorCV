export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-seam bg-white/60 p-10 text-center"
    >
      <span
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-2 border-seam border-t-pin"
      />
      <p className="font-body text-sm text-ink-soft">Analyzing your resume...</p>
    </div>
  );
}
