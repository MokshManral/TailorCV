import { useRef } from "react";
import InputBox from "./InputBox";
import FileUpload from "./FileUpload";

export default function InputPanel({
  latexSource,
  setLatexSource,
  resumeMode,
  setResumeMode,
  resumeText,
  setResumeText,
  resumeFile,
  setResumeFile,
  jobDescription,
  setJobDescription,
  onSubmit,
  isLoading,
  fieldErrors,
  dark,
}) {
  const texInputRef = useRef(null);

  function handleTexFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/\.tex$/i.test(file.name)) {
      alert("Please choose a .tex file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("LaTeX file must be smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setLatexSource(String(reader.result || ""));
    reader.readAsText(file);
  }

  return (
    <section
      className={`rounded-2xl border p-6 transition-colors duration-300 sm:p-7 ${
        dark ? "border-neutral-800 bg-[#0e0e0e]" : "border-neutral-200 bg-white"
      }`}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Your materials</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Paste or upload your resume, then paste the job description.
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
        {/* Resume: paste text or upload a file */}
        <div className="flex flex-col gap-3">
          <div
            role="tablist"
            aria-label="Resume input method"
            className={`grid grid-cols-3 gap-1 rounded-lg border p-1 text-sm ${
              dark
                ? "border-neutral-800 bg-neutral-950"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            {[
              { id: "paste", label: "Paste text" },
              { id: "upload", label: "Upload file" },
              { id: "latex", label: "LaTeX" },
            ].map((tab) => {
              const active = resumeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setResumeMode(tab.id)}
                  className={`rounded-md px-3 py-1.5 font-medium transition ${
                    active
                      ? dark
                        ? "bg-neutral-800 text-white"
                        : "bg-white text-neutral-900 shadow-sm"
                      : dark
                        ? "text-neutral-500 hover:text-neutral-300"
                        : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {resumeMode === "latex" ? (
            <div className="flex flex-col gap-2">
              <InputBox
                title="LaTeX source"
                name="latex"
                value={latexSource}
                onChange={(e) => setLatexSource(e.target.value)}
                fieldErrors={fieldErrors}
                dark={dark}
              />

              <input
                ref={texInputRef}
                type="file"
                accept=".tex"
                className="hidden"
                onChange={handleTexFile}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-neutral-500">
                  Your template stays exactly as it is; only the wording is
                  tailored.
                </p>

                <button
                  type="button"
                  onClick={() => texInputRef.current?.click()}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    dark
                      ? "border-neutral-700 hover:bg-neutral-900"
                      : "border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  Load .tex file
                </button>
              </div>
            </div>
          ) : resumeMode === "paste" ? (
            <InputBox
              title="Resume"
              name="resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              fieldErrors={fieldErrors}
              dark={dark}
            />
          ) : (
            <>
              <label className="text-sm font-medium">Upload Resume</label>

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
            </>
          )}
        </div>

        {/* Job Description */}
        <InputBox
          title="Job Description"
          name="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          fieldErrors={fieldErrors}
          dark={dark}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`btn-motion group flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium ${
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

          {isLoading ? "Analyzing resume..." : "Tailor my resume"}

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
