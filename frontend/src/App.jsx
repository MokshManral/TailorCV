import { useState } from "react";
import Header from "./components/Header.jsx";
import InputPanel from "./components/InputPanel.jsx";
import EmptyState from "./components/EmptyState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const GENERIC_ERROR = "Something went wrong while analyzing your resume. Please try again.";

// idle | loading | success | error
export default function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!resume.trim()) errors.resume = "Please paste your resume.";
    if (!jobDescription.trim()) errors.jobDescription = "Please paste a job description.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, job_description: jobDescription }),
      });

      if (!response.ok) {
        let detail = GENERIC_ERROR;
        try {
          const errorBody = await response.json();
          if (typeof errorBody.detail === "string") {
            detail = errorBody.detail;
          }
        } catch {
          // fall back to generic error
        }
        throw new Error(detail);
      }

      const data = await response.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || GENERIC_ERROR);
      setStatus("error");
    }
  }

  function handleStartOver() {
    setResult(null);
    setErrorMessage("");
    setFieldErrors({});
    setStatus("idle");
  }

  function handleRetry() {
    setStatus("idle");
    setErrorMessage("");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <InputPanel
            resume={resume}
            setResume={setResume}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onSubmit={handleSubmit}
            isLoading={status === "loading"}
            fieldErrors={fieldErrors}
          />

          <div>
            {status === "idle" && <EmptyState />}
            {status === "loading" && <LoadingState />}
            {status === "error" && <ErrorState message={errorMessage} onRetry={handleRetry} />}
            {status === "success" && result && (
              <ResultsPanel result={result} onStartOver={handleStartOver} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
