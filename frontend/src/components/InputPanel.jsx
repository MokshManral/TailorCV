
import InputBox from "./InputBox";
import FileUpload from "./FileUpload";

export default function InputPanel({
  resumeFile,
  setResumeFile,
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

        <p className="mt-1 text-sm text-neutral-500">
          Upload your resume and paste the job description.
        </p>
      </div>

      <form
        className="mt-7 flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        {/* Resume Upload */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            Upload Resume
          </label>

          <FileUpload
            file={resumeFile}
            setFile={setResumeFile}
            dark={dark}
          />

          {fieldErrors.resume && (
            <p className="text-sm text-red-500" role="alert">
              {fieldErrors.resume}
            </p>
          )}
        </div>

        {/* Job Description */}
        <InputBox
          title="Job Description"
          name="jobDescription"
          value={jobDescription}
          onChange={(e) =>
            setJobDescription(e.target.value)
          }
          fieldErrors={fieldErrors}
          dark={dark}
        />

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
              className={`h-4 w-4 animate-spin rounded-full border-2 ${
                dark
                  ? "border-black/20 border-t-black"
                  : "border-white/30 border-t-white"
              }`}
            />
          )}

          {isLoading
            ? "Analyzing resume..."
            : "Tailor my resume"}

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
