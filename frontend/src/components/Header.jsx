export default function Header() {
  return (
    <header className="border-b border-seam bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-8 sm:px-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-canvas font-display text-lg"
          >
            T
          </span>
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            TailorCV
          </h1>
        </div>
        <p className="ml-12 font-body text-sm text-ink-soft sm:text-base">
          Optimize your resume for any job description.
        </p>
      </div>
      <div className="stitch-line" />
    </header>
  );
}
