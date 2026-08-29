import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero({ dark, setDark }) {
  const navigate = useNavigate();

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-[#111]"
      }`}
    >
      {/* Navbar */}
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 py-6 ${
          dark ? "text-white" : "text-neutral-950"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
              dark ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            T
          </div>

          <span className="text-[15px] font-semibold tracking-tight">
            TailorCV
          </span>
        </div>

        {/* Nav links */}
        <div
          className={`hidden items-center gap-8 text-sm md:flex ${
            dark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          <a href="#how-it-works" className="transition hover:text-current">
            How it works
          </a>

          <a href="#features" className="transition hover:text-current">
            Features
          </a>

          <a href="#pricing" className="transition hover:text-current">
            Pricing
          </a>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setDark((value) => !value)}
            aria-label="Toggle dark mode"
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              dark
                ? "border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
                : "border-neutral-200 bg-white hover:bg-neutral-50"
            }`}
          >
            {dark ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-neutral-700"
              >
                <path
                  d="M20.5 15.5A8.5 8.5 0 018.5 3.5a8.5 8.5 0 1012 12z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* CTA */}
          <button
            onClick={() => navigate("/login")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              dark
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div
            className={`mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              dark
                ? "border-neutral-800 bg-neutral-900 text-neutral-400"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            AI-powered resume tailoring
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Your resume.
            <br />
            <span className={dark ? "text-neutral-600" : "text-neutral-400"}>
              Tailored for every job.
            </span>
          </h1>

          {/* Description */}
          <p
            className={`mx-auto mt-7 max-w-2xl text-base leading-7 sm:text-lg ${
              dark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            Stop sending the same resume everywhere. Upload your resume, add the
            job description, and let TailorCV optimize it for the role.
          </p>

          {/* CTA */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/login")}
              className={`group flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition sm:w-auto ${
                dark
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              Tailor my resume
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
            </button>

            <button
              className={`w-full rounded-lg border px-6 py-3 text-sm font-medium transition sm:w-auto ${
                dark
                  ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              See how it works
            </button>
          </div>

          {/* Trust */}
          <div
            className={`mt-7 flex items-center justify-center gap-5 text-xs ${
              dark ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            <span>ATS-friendly</span>

            <span
              className={`h-1 w-1 rounded-full ${
                dark ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            />

            <span>AI-powered</span>

            <span
              className={`h-1 w-1 rounded-full ${
                dark ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            />

            <span>Fast & simple</span>
          </div>

          {/* Keep your Product Preview here */}
          {/* ...your existing Product Preview code... */}
        </div>
      </section>
    </main>
  );
}
