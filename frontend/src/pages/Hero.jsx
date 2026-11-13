import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import screenshotOne from "../../assets/SC1.png";
import screenshotTwo from "../../assets/SC2.png";

export default function Hero({ dark, setDark }) {
  const navigate = useNavigate();

  const muted = dark ? "text-neutral-400" : "text-neutral-500";

  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const steps = [
    {
      number: "01",
      title: "Upload your resume",
      description:
        "Upload your existing resume in PDF format. TailorCV analyzes your skills and experience.",
    },
    {
      number: "02",
      title: "Add job description",
      description:
        "Paste your target job description. AI identifies relevant skills, keywords and requirements.",
    },
    {
      number: "03",
      title: "Get tailored results",
      description:
        "Receive a personalized resume optimized for your target position.",
    },
  ];

  const features = [
    {
      icon: "✦",
      title: "AI Resume Tailoring",
      description:
        "Generate a job-specific version of your resume based on your experience and the target job description.",
    },
    {
      icon: "◎",
      title: "Missing Skills Detection",
      description:
        "Identify important skills, keywords and qualifications missing from your existing resume.",
    },
    {
      icon: "⌕",
      title: "Smart Improvement Suggestions",
      description:
        "Get actionable recommendations to strengthen your resume and improve its relevance.",
    },
    {
      icon: "▤",
      title: "Job Description Analysis",
      description:
        "Analyze job requirements and discover which qualifications matter most for the role.",
    },
    {
      icon: "⇄",
      title: "Resume Comparison",
      description:
        "Understand the differences between your original resume and the tailored version.",
    },
    {
      icon: "✎",
      title: "Detailed Text Results",
      description:
        "View your tailored resume, missing points and improvement suggestions in an easy-to-read format.",
    },
  ];

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-[#111]"
      }`}
    >
      {/* NAVBAR */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Logo dark={dark} />
          <span className="text-[15px] font-semibold tracking-tight">
            TailorCV
          </span>
        </div>

        <div className={`hidden items-center gap-8 text-sm md:flex ${muted}`}>
          <button onClick={() => scrollTo("how-it-works")}>How it works</button>
          <button onClick={() => scrollTo("features")}>Features</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((value) => !value)}
            aria-label="Toggle dark mode"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
              dark
                ? "border-neutral-800 bg-neutral-900"
                : "border-neutral-200 bg-white"
            }`}
          >
            {dark ? "☀" : "☾"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              dark ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-24 sm:pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className={`mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              dark
                ? "border-neutral-800 bg-neutral-900 text-neutral-400"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            AI-powered resume tailoring
          </div>

          <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Your resume.
            <br />
            <span className={dark ? "text-neutral-600" : "text-neutral-400"}>
              Tailored for every job.
            </span>
          </h1>

          <p
            className={`mx-auto mt-7 max-w-2xl text-base leading-7 sm:text-lg ${muted}`}
          >
            Stop sending the same resume everywhere. Upload your resume, add the
            job description, and let TailorCV optimize it for the role.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/login")}
              className={`rounded-lg px-6 py-3 text-sm font-medium ${
                dark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Tailor my resume →
            </button>

            <button
              onClick={() => scrollTo("how-it-works")}
              className={`rounded-lg border px-6 py-3 text-sm font-medium ${
                dark
                  ? "border-neutral-800 bg-neutral-900 text-neutral-300"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              See how it works
            </button>
          </div>

          <div
            className={`mt-7 flex items-center justify-center gap-5 text-xs ${
              dark ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            <span>ATS-friendly</span>
            <span>•</span>
            <span>AI-powered</span>
            <span>•</span>
            <span>Fast & simple</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className={`py-28 sm:py-36 ${
          dark
            ? "border-neutral-800 bg-[#080808]"
            : "border-neutral-200 bg-[#fafafa]"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          {/* HEADING */}
          <div className="mb-20 max-w-3xl">
            <span
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                dark ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              How it works
            </span>

            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              From resume to results.
              <br />
              <span className={dark ? "text-neutral-600" : "text-neutral-400"}>
                In three simple steps.
              </span>
            </h2>

            <p
              className={`mt-7 max-w-2xl text-base leading-8 ${
                dark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              See how TailorCV transforms your existing resume into a
              job-focused application.
            </p>
          </div>

          {/* STEP 01 - INPUT */}
          <div className="mb-24">
            <div className="mb-7 flex items-center gap-4">
              <span
                className={`text-xs font-semibold tracking-widest ${
                  dark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                01 / INPUT
              </span>
              <div
                className={`h-px flex-1 ${
                  dark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Start with your resume.
                </h3>

                <p
                  className={`mt-5 text-sm leading-7 sm:text-base ${
                    dark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  Upload your existing resume and paste the job description
                  you're applying for. TailorCV uses both to understand what the
                  role requires and what you already bring to the table.
                </p>

                <div className="mt-7 space-y-4 text-sm">
                  {[
                    "Upload your resume",
                    "Paste the job description",
                    "Start AI analysis",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs text-black dark:bg-neutral-900 dark:text-white">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* YOUR INPUT SCREENSHOT */}
              <div
                className={`overflow-hidden rounded-2xl border p-2 ${
                  dark
                    ? "border-neutral-800 bg-[#111]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <img
                  src={screenshotOne}
                  alt="TailorCV resume upload and job description input screen"
                  className="h-auto w-full rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* STEP 02 - ANALYSIS */}
          <div className="mb-24">
            <div className="mb-7 flex items-center gap-4">
              <span
                className={`text-xs font-semibold tracking-widest ${
                  dark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                02 / ANALYSIS
              </span>
              <div
                className={`h-px flex-1 ${
                  dark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            </div>

            <div
              className={`rounded-2xl border p-8 sm:p-12 ${
                dark
                  ? "border-neutral-800 bg-[#111]"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div className="mx-auto max-w-xl text-center">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                    dark
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-black"
                  }`}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <path d="M11 8v6M8 11h6" />
                  </svg>
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                  AI connects the dots.
                </h3>

                <p
                  className={`mt-3 text-sm leading-7 ${
                    dark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  Your resume is compared with the job description to identify
                  matching keywords, missing skills, your match score and
                  improvement opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 03 - OUTPUT */}
          <div>
            <div className="mb-7 flex items-center gap-4">
              <span
                className={`text-xs font-semibold tracking-widest ${
                  dark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                03 / OUTPUT
              </span>
              <div
                className={`h-px flex-1 ${
                  dark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* YOUR OUTPUT SCREENSHOT */}
              <div
                className={`order-2 overflow-hidden rounded-2xl border p-2 lg:order-1 ${
                  dark
                    ? "border-neutral-800 bg-[#111]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <img
                  src={screenshotTwo}
                  alt="TailorCV generated resume and analysis results"
                  className="h-auto w-full rounded-xl"
                />
              </div>

              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your improved resume.
                </h3>

                <p
                  className={`mt-5 text-sm leading-7 sm:text-base ${
                    dark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  Get a tailored resume in text, a match score, matching and
                  missing keywords, and actionable AI suggestions. Download an
                  editable LaTeX source file for your tailored resume.
                </p>

                <div className="mt-7 space-y-4 text-sm">
                  {[
                    "Tailored resume",
                    "Resume match score",
                    "Missing keyword insights",
                    "LaTeX source download",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs text-black dark:bg-neutral-900 dark:text-white">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className={`scroll-mt-20 border-t px-6 py-24 ${
          dark ? "border-neutral-900" : "border-neutral-200"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${muted}`}
            >
              Everything you need
            </span>

            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">
              Built to make you stand out.
            </h2>

            <p className={`mt-5 text-sm leading-7 sm:text-base ${muted}`}>
              Powerful AI tools designed to make your job application process
              smarter and simpler.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-2xl border p-7 transition hover:-translate-y-1 ${card}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                    dark
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {feature.icon}
                </div>

                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>

                <p className={`mt-3 text-sm leading-7 ${muted}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className={`border-t px-6 py-24 text-center ${
          dark ? "border-neutral-900" : "border-neutral-200"
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ready for your next opportunity?
          </h2>

          <p className={`mt-5 text-sm leading-7 sm:text-base ${muted}`}>
            Give every job application the attention it deserves. Start
            tailoring your resume today.
          </p>

          <button
            onClick={() => navigate("/login")}
            className={`mt-8 rounded-lg px-7 py-3 text-sm font-medium transition ${
              dark
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            Get started →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`border-t px-6 py-8 ${
          dark
            ? "border-neutral-900 text-neutral-600"
            : "border-neutral-200 text-neutral-400"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo dark={dark} className="h-8 w-8" />

            <span>© 2026 TailorCV. All rights reserved.</span>
          </div>

          <span>Built for smarter job applications.</span>
        </div>
      </footer>
    </main>
  );
}