
export default function PageHeading({ dark }) {
  return (
    <div className="mb-10">
      <div
        className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
          dark
            ? "border-neutral-800 bg-neutral-900 text-neutral-400"
            : "border-neutral-200 bg-white text-neutral-500"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        AI-powered resume tailoring
      </div>

      <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
        Tailor your resume.
      </h1>

      <p
        className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
          dark ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        Match your resume to a job description and highlight
        the experience that matters most.
      </p>
    </div>
  );
}
