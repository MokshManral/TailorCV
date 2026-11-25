import { useState } from "react";

import InputPanel from "../components/InputPanel.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Header from "../components/Header.jsx";
import ErrorState from "../components/ErrorState.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";
import { API_BASE_URL } from "../lib/api.js";

const GENERIC_ERROR =
  "Something went wrong while analyzing your resume. Please try again.";

export default function TailorPage({ dark, setDark, user, setUser }) {
  const [resumeMode, setResumeMode] = useState("paste");
  const [resumeText, setResumeText] = useState("");
  const [latexSource, setLatexSource] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  // After results arrive the form is hidden for a full-width results view;
  // "Edit inputs" brings it back (with the results beside it).
  const [showInputs, setShowInputs] = useState(false);

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const muted = dark ? "text-neutral-400" : "text-neutral-500";

  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  // Validate inputs
  function validate() {
    const errors = {};

    if (resumeMode === "paste" && !resumeText.trim()) {
      errors.resume = "Please paste your resume.";
    }

    if (resumeMode === "latex" && !latexSource.trim()) {
      errors.latex = "Please paste your LaTeX resume or load a .tex file.";
    }

    if (resumeMode === "upload" && !resumeFile) {
      errors.resume = "Please upload your resume.";
    }

    if (!jobDescription.trim()) {
      errors.jobDescription = "Please paste a job description.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  // Submit resume and job description
  async function handleSubmit() {
    if (isLoading || !validate()) return;

    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const formData = new FormData();

      if (resumeMode === "latex") {
        formData.append("latex_source", latexSource);
      } else if (resumeMode === "paste") {
        formData.append("resume_text", resumeText.trim());
      } else {
        formData.append("resume_file", resumeFile);
      }
      formData.append("job_description", jobDescription.trim());

      const response = await fetch(
        `${API_BASE_URL}/api/tailor${resumeMode === "latex" ? "/latex" : ""}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        let detail = GENERIC_ERROR;

        try {
          const errorBody = await response.json();

          if (typeof errorBody.detail === "string") {
            detail = errorBody.detail;
          }
        } catch {
          // Keep generic error.
        }

        throw new Error(detail);
      }

      const data = await response.json();

      setResult(data);
      setStatus("success");
      setShowInputs(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Resume tailoring error:", error);

      setErrorMessage(error.message || GENERIC_ERROR);

      setStatus("error");
    }
  }

  // Reset everything
  function handleStartOver() {
    setResumeText("");
    setLatexSource("");
    setResumeFile(null);
    setJobDescription("");
    setResult(null);
    setErrorMessage("");
    setFieldErrors({});
    setShowInputs(false);
    setStatus("idle");
  }

  // Retry analysis
  function handleRetry() {
    handleSubmit();
  }

  const steps = [
    { number: "01", label: "Add details" },
    { number: "02", label: "AI analysis" },
    { number: "03", label: "Your results" },
  ];

  const activeStep = isSuccess ? 3 : isLoading ? 2 : 1;

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-[#111]"
      }`}
    >
      {/* NAVBAR */}
      <Header dark={dark} setDark={setDark} user={user} setUser={setUser} />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:px-8 sm:pt-16">
        {/* PAGE HEADING */}
        <div className="mb-12 animate-fade-up">
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

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                {isSuccess
                  ? "Your analysis is ready."
                  : "Make every application count."}
              </h1>

              <p
                className={`mt-4 max-w-xl text-sm leading-7 sm:text-base ${muted}`}
              >
                {isSuccess
                  ? "Download your tailored resume, then review your score, keyword gaps and suggestions."
                  : "Paste or upload your resume, add a job description and let AI help you present your experience for the role."}
              </p>
            </div>

            {isSuccess && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowInputs((value) => !value)}
                  aria-expanded={showInputs}
                  className={`btn-motion w-fit rounded-lg border px-4 py-2.5 text-sm font-medium ${
                    dark
                      ? "border-neutral-800 hover:bg-neutral-900"
                      : "border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {showInputs ? "Hide inputs" : "Edit inputs"}
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className={`btn-motion w-fit rounded-lg px-4 py-2.5 text-sm font-medium ${
                    dark
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-neutral-900 text-white hover:bg-neutral-700"
                  }`}
                >
                  + New analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {isSuccess && result && !showInputs ? (
          /* RESULTS: full width */
          <ResultsPanel
            result={result}
            onStartOver={handleStartOver}
            dark={dark}
            split
          />
        ) : (
          /* INPUT AND OUTPUT */
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {/* INPUT (stays in view while results scroll beside it) */}
            <div
              style={{ animationDelay: "120ms" }}
              className="min-w-0 animate-fade-up lg:sticky lg:top-6"
            >
              <InputPanel
                resumeMode={resumeMode}
                setResumeMode={(mode) => {
                  setResumeMode(mode);
                  setFieldErrors((errors) => ({
                    ...errors,
                    resume: undefined,
                    latex: undefined,
                  }));
                }}
                resumeText={resumeText}
                setResumeText={setResumeText}
                latexSource={latexSource}
                setLatexSource={setLatexSource}
                resumeFile={resumeFile}
                setResumeFile={setResumeFile}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                fieldErrors={fieldErrors}
                dark={dark}
              />
            </div>

            {/* OUTPUT */}
            <div
              style={{ animationDelay: "220ms" }}
              className="min-w-0 animate-fade-up"
            >
              <div
                className={`min-h-[300px] rounded-2xl border p-4 sm:p-5 ${card}`}
              >
                {status === "idle" && <EmptyState dark={dark} />}

                {isLoading && <ResultsPanel loading={true} dark={dark} />}

                {status === "error" && (
                  <ErrorState
                    message={errorMessage}
                    onRetry={handleRetry}
                    dark={dark}
                  />
                )}

                {isSuccess && result && (
                  <ResultsPanel
                    result={result}
                    onStartOver={handleStartOver}
                    dark={dark}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div
          className={`mt-12 border-t pt-8 ${
            dark ? "border-neutral-900" : "border-neutral-200"
          }`}
        >
          <div
            className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs ${muted}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              ATS-friendly suggestions
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              AI-powered analysis
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Job-specific improvements
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
