import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsPage({ dark, setDark }) {
  const navigate = useNavigate();

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-[#111]"
      }`}
    >
      {/* Header */}
      <header
        className={`mx-auto flex h-20 max-w-6xl items-center justify-between px-6 ${
          dark ? "text-white" : "text-neutral-950"
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2.5"
          aria-label="Back to TailorCV"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-transform group-hover:scale-95 ${
              dark ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            T
          </div>

          <span className="text-[15px] font-semibold tracking-tight">
            TailorCV
          </span>
        </button>

        {/* Theme */}
        <button
          onClick={() => setDark((value) => !value)}
          aria-label="Toggle theme"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
            dark
              ? "border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
              : "border-neutral-200 bg-white hover:bg-neutral-50"
          }`}
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
      </header>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Back */}
        <button
          onClick={() => navigate("/login")}
          className={`mb-8 flex items-center gap-2 text-sm transition ${
            dark
              ? "text-neutral-500 hover:text-white"
              : "text-neutral-500 hover:text-neutral-950"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to login
        </button>

        {/* Heading */}
        <div className="mb-12">
          <p
            className={`mb-3 text-xs font-medium uppercase tracking-[0.16em] ${
              dark ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            TailorCV
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Terms of Service
          </h1>

          <p
            className={`mt-4 text-sm ${
              dark ? "text-neutral-500" : "text-neutral-500"
            }`}
          >
            Last updated: August 29, 2026
          </p>
        </div>

        {/* Content Card */}
        <div
          className={`rounded-2xl border p-6 sm:p-10 ${
            dark
              ? "border-neutral-800 bg-[#0e0e0e]"
              : "border-neutral-200 bg-white"
          }`}
        >
          <div
            className={`space-y-10 text-sm leading-7 ${
              dark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                1. Acceptance of Terms
              </h2>

              <p>
                By accessing or using TailorCV, you agree to be bound by these
                Terms of Service. If you do not agree with these terms, please
                do not use the service.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                2. Description of Service
              </h2>

              <p>
                TailorCV provides tools that help users analyze resumes and
                tailor resume content to job descriptions. The service may use
                automated and AI-powered systems to provide suggestions and
                recommendations.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                3. User Responsibilities
              </h2>

              <p>
                You are responsible for the information and documents you
                provide to TailorCV. You agree not to upload unlawful,
                misleading, harmful, or unauthorized content.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                4. AI-Generated Suggestions
              </h2>

              <p>
                TailorCV may provide AI-generated suggestions. These suggestions
                are provided for informational purposes and should be reviewed
                by you before being used in an application or professional
                document.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                5. Intellectual Property
              </h2>

              <p>
                TailorCV and its associated software, design, branding, and
                content remain the property of TailorCV or its licensors. You
                retain ownership of the resume and other content you submit,
                subject to the rights necessary to provide the service.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                6. Service Availability
              </h2>

              <p>
                We may modify, suspend, or discontinue parts of the service at
                any time. We do not guarantee that the service will always be
                available, uninterrupted, or error-free.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                7. Limitation of Liability
              </h2>

              <p>
                TailorCV is not responsible for employment decisions, hiring
                outcomes, or losses resulting from the use of resume suggestions
                or other service outputs.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                8. Changes to These Terms
              </h2>

              <p>
                We may update these Terms of Service from time to time.
                Continued use of TailorCV after changes are published means that
                you accept the updated terms.
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-lg font-semibold ${
                  dark ? "text-white" : "text-neutral-950"
                }`}
              >
                9. Contact
              </h2>

              <p>
                If you have questions about these Terms of Service, please
                contact the TailorCV team.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
