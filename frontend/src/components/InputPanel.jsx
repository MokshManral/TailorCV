function CharCount({ count }) {
  return (
    <span className="font-mono text-xs text-ink-soft">
      {count.toLocaleString()} characters
    </span>
  );
}

export default function InputPanel({
  resume,
  setResume,
  jobDescription,
  setJobDescription,
  onSubmit,
  isLoading,
  fieldErrors,
}) {
  return (
    <section
      aria-labelledby="input-heading"
      className="rounded-2xl border border-seam bg-white/60 p-6 sm:p-7"
    >
      <h2 id="input-heading" className="font-display text-lg font-medium text-ink">
        Your materials
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Paste the two documents you want fitted together.
      </p>

      <form
        className="mt-6 flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="resume" className="font-body text-sm font-semibold text-ink">
              Resume
            </label>
            <CharCount count={resume.length} />
          </div>
          <textarea
            id="resume"
            name="resume"
            value={resume}
            onChange={(event) => setResume(event.target.value)}
            placeholder="Paste your resume text here..."
            rows={10}
            aria-invalid={Boolean(fieldErrors.resume)}
            aria-describedby={fieldErrors.resume ? "resume-error" : undefined}
            className={`w-full resize-y rounded-xl border bg-canvas/60 p-4 font-body text-sm leading-relaxed text-ink placeholder:text-ink-soft/60 focus:border-pin focus:bg-white focus:outline-none focus:ring-1 focus:ring-pin ${
              fieldErrors.resume ? "border-match-weak" : "border-seam"
            }`}
          />
          {fieldErrors.resume && (
            <p id="resume-error" role="alert" className="text-sm text-match-weak">
              {fieldErrors.resume}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="job-description" className="font-body text-sm font-semibold text-ink">
              Job description
            </label>
            <CharCount count={jobDescription.length} />
          </div>
          <textarea
            id="job-description"
            name="job-description"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description here..."
            rows={10}
            aria-invalid={Boolean(fieldErrors.jobDescription)}
            aria-describedby={fieldErrors.jobDescription ? "jd-error" : undefined}
            className={`w-full resize-y rounded-xl border bg-canvas/60 p-4 font-body text-sm leading-relaxed text-ink placeholder:text-ink-soft/60 focus:border-pin focus:bg-white focus:outline-none focus:ring-1 focus:ring-pin ${
              fieldErrors.jobDescription ? "border-match-weak" : "border-seam"
            }`}
          />
          {fieldErrors.jobDescription && (
            <p id="jd-error" role="alert" className="text-sm text-match-weak">
              {fieldErrors.jobDescription}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-canvas transition-colors hover:bg-pin-dark disabled:cursor-not-allowed disabled:bg-ink-soft"
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas"
            />
          )}
          {isLoading ? "Tailoring..." : "Tailor My Resume"}
        </button>
      </form>
    </section>
  );
}
