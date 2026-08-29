function CharCount({ count, dark }) {
  return (
    <span
      className={`font-mono text-xs ${
        dark ? "text-neutral-600" : "text-neutral-400"
      }`}
    >
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
  dark,
}) {
  return (
    <section
      className={`rounded-2xl border p-6 transition-colors duration-300 sm:p-7 ${
        dark
          ? "border-neutral-800 bg-[#0e0e0e]"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Your materials
        </h2>

        <p
          className={`mt-1 text-sm ${
            dark ? "text-neutral-500" : "text-neutral-500"
          }`}
        >
          Paste the two documents you want fitted together.
        </p>
      </div>

      <form
        className="mt-7 flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        {/* Resume */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="resume"
              className={`text-sm font-medium ${
                dark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Resume
            </label>

            <CharCount count={resume.length} dark={dark} />
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
            className={`w-full resize-y rounded-xl border px-4 py-3.5 text-sm leading-6 outline-none transition ${
              fieldErrors.resume
                ? dark
                  ? "border-red-500/60 bg-red-500/5 text-white"
                  : "border-red-300 bg-red-50 text-neutral-900"
                : dark
                  ? "border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-700 focus:border-neutral-600"
                  : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            }`}
          />

          {fieldErrors.resume && (
            <p
              id="resume-error"
              role="alert"
              className={`text-sm ${
                dark ? "text-red-400" : "text-red-600"
              }`}
            >
              {fieldErrors.resume}
            </p>
          )}
        </div>

        {/* Job description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="job-description"
              className={`text-sm font-medium ${
                dark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Job description
            </label>

            <CharCount count={jobDescription.length} dark={dark} />
          </div>

          <textarea
            id="job-description"
            name="job-description"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description here..."
            rows={10}
            aria-invalid={Boolean(fieldErrors.jobDescription)}
            aria-describedby={
              fieldErrors.jobDescription ? "jd-error" : undefined
            }
            className={`w-full resize-y rounded-xl border px-4 py-3.5 text-sm leading-6 outline-none transition ${
              fieldErrors.jobDescription
                ? dark
                  ? "border-red-500/60 bg-red-500/5 text-white"
                  : "border-red-300 bg-red-50 text-neutral-900"
                : dark
                  ? "border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-700 focus:border-neutral-600"
                  : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            }`}
          />

          {fieldErrors.jobDescription && (
            <p
              id="jd-error"
              role="alert"
              className={`text-sm ${
                dark ? "text-red-400" : "text-red-600"
              }`}
            >
              {fieldErrors.jobDescription}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`group flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition ${
            dark
              ? "bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500"
              : "bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400"
          }`}
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className={`h-4 w-4 animate-spin rounded-full border-2 ${
                dark
                  ? "border-black/20 border-t-black"
                  : "border-white/30 border-t-white"
              }`}
            />
          )}

          {isLoading ? "Tailoring..." : "Tailor my resume"}

          {!isLoading && (
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </section>
  );
}
