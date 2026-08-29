import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onBack, onLogin, dark, setDark }) {
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

        {/* Theme toggle */}
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

      {/* Main */}
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">

          {/* Back */}
          <button
            onClick={() => navigate("/")}
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

            Back
          </button>

          {/* Heading */}
          <div className="mb-8">
            <p
              className={`mb-3 text-xs font-medium uppercase tracking-[0.16em] ${
                dark ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              TailorCV
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Tailor your resume
            </h1>

            <p
              className={`mt-3 text-sm leading-6 ${
                dark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Sign in to continue and create a resume tailored to the job
              you're applying for.
            </p>
          </div>

          {/* Card */}
          <div
            className={`rounded-2xl border p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-7 ${
              dark
                ? "border-neutral-800 bg-[#0e0e0e]"
                : "border-neutral-200 bg-white"
            }`}
          >
            {/* Google */}
            <button
              onClick={() => onLogin?.("google")}
              className={`flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                dark
                  ? "border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div
                className={`h-px flex-1 ${
                  dark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />

              <span
                className={`text-xs ${
                  dark ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                or continue with email
              </span>

              <div
                className={`h-px flex-1 ${
                  dark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            </div>

            {/* Email */}
            <form
              onSubmit={(event) => {
                event.preventDefault();

                const email = event.currentTarget.email.value;

                onLogin?.("email", email);
              }}
            >
              <label
                htmlFor="email"
                className={`mb-2 block text-sm font-medium ${
                  dark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={`w-full rounded-lg border px-3.5 py-3 text-sm outline-none transition ${
                  dark
                    ? "border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-600"
                    : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400"
                }`}
              />

              <button
                type="submit"
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  dark
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-black text-white hover:bg-neutral-800"
                }`}
              >
                Continue

                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            {/* Terms */}
            <p
              className={`mt-5 text-center text-[11px] leading-5 ${
                dark ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              By continuing, you agree to our{" "}
              <button
                type="button"
                onClick={() => navigate("/terms")}
                className={`underline underline-offset-2 ${
                  dark
                    ? "text-neutral-500 hover:text-white"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Terms
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className={`underline underline-offset-2 ${
                  dark
                    ? "text-neutral-500 hover:text-white"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>

          {/* Sign up */}
          <p
            className={`mt-6 text-center text-sm ${
              dark ? "text-neutral-500" : "text-neutral-500"
            }`}
          >
            Don't have an account?{" "}
            <button
              onClick={() => onLogin?.("signup")}
              className={`font-medium underline underline-offset-4 ${
                dark
                  ? "text-white decoration-neutral-700 hover:decoration-white"
                  : "text-neutral-900 decoration-neutral-300 hover:decoration-neutral-900"
              }`}
            >
              Create one
            </button>
          </p>

          {/* Product statement */}
          <div className="mt-12 text-center">
            <div
              className={`mx-auto mb-3 h-px w-12 ${
                dark ? "bg-neutral-800" : "bg-neutral-300"
              }`}
            />

            <p
              className={`text-xs ${
                dark ? "text-neutral-700" : "text-neutral-400"
              }`}
            >
              Your resume. Your next opportunity.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.7-.06-1.38-.18-2.03H12v3.84h5.23a4.47 4.47 0 01-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.18z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0012 21.6z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.7A5.86 5.86 0 016.23 12c0-.59.11-1.17.31-1.7V7.78H3.3A9.7 9.7 0 002.27 12c0 1.57.38 3.06 1.03 4.22l3.24-2.52z"
      />
      <path
        fill="#EA4335"
        d="M12 6.27c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.37 14.63 2.4 12 2.4a9.74 9.74 0 00-8.7 5.38l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03z"
      />
    </svg>
  );
}
