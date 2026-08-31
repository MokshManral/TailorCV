import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InputPanel from "../components/InputPanel.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Header from "../components/Header.jsx";
import ErrorState from "../components/ErrorState.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const GENERIC_ERROR =
  "Something went wrong while analyzing your resume. Please try again.";

export default function TailorPage({ dark, setDark, user, setUser }) {
  const navigate = useNavigate();

  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};

    if (!resume.trim()) {
      errors.resume = "Please paste your resume.";
    }

    if (!jobDescription.trim()) {
      errors.jobDescription = "Please paste a job description.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tailor`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        let detail = GENERIC_ERROR;

        try {
          const errorBody = await response.json();

          if (typeof errorBody.detail === "string") {
            detail = errorBody.detail;
          }
        } catch {
          // Fall back to generic error.
        }

        throw new Error(detail);
      }

      const data = await response.json();

      setResult(data);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error.message || GENERIC_ERROR);
      setStatus("error");
    }
  }

  function handleStartOver() {
    setResume("");
    setJobDescription("");
    setResult(null);
    setErrorMessage("");
    setFieldErrors({});
    setStatus("idle");
  }

  function handleRetry() {
    setErrorMessage("");
    setStatus("idle");
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-[#111]"
      }`}
    >
      {/* Header */}
      <Header dark={dark} setDark={setDark} user={user} setUser={setUser} />

      {/* Page */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 sm:px-8 sm:pt-16">
        {/* Heading */}
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
            Match your resume to a job description and highlight the
            experience that matters most.
          </p>
        </div>

        {/* Input + Results */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <InputPanel
            resume={resume}
            setResume={setResume}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onSubmit={handleSubmit}
            isLoading={status === "loading"}
            fieldErrors={fieldErrors}
            dark={dark}
          />

          <div>
            {status === "idle" && <EmptyState dark={dark} />}

            {status === "loading" && (
              <ResultsPanel
                loading={true}
                dark={dark}
              />
            )}

            {status === "error" && (
              <ErrorState
                message={errorMessage}
                onRetry={handleRetry}
                dark={dark}
              />
            )}

            {status === "success" && result && (
              <ResultsPanel
                result={result}
                onStartOver={handleStartOver}
                dark={dark}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
