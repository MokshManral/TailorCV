import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const API_BASE_URL =
  import.meta.env.API_URL;

export default function LoginPage({ onBack, onLogin, dark, setDark }) {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-[#111]"
      }`}
    >
      {/* Header */}
      <Header dark={dark} setDark={setDark} />

      {/* Main */}
      <section className="relative isolate flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 py-12">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
            dark ? "bg-white/[0.035]" : "bg-neutral-200/70"
          }`}
        />

        <div className="relative w-full max-w-[440px] -translate-y-8 sm:-translate-y-12">

          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className={`mb-8 flex items-center gap-2 rounded-lg py-1 text-sm transition ${
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
            <div
              className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] ${
                dark
                  ? "border-neutral-800 bg-neutral-900/70 text-neutral-400"
                  : "border-neutral-200 bg-white/80 text-neutral-500"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure sign-in
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-[2.75rem]">
              Tailor your resume
            </h1>

            <p
              className={`mt-3 text-sm leading-6 ${
                dark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Sign in to continue and create a resume tailored to the job you're
              applying for.
            </p>
          </div>

          {/* Card */}
          <div
            className={`rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)] sm:p-8 ${
              dark
                ? "border-neutral-800/90 bg-[#101010]/95 shadow-black/30"
                : "border-neutral-200/90 bg-white/90 shadow-neutral-300/40 backdrop-blur-xl"
            }`}
          >
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className={`group flex h-12 w-full items-center justify-center gap-3 rounded-xl border px-4 text-sm font-medium transition duration-200 hover:-translate-y-0.5 focus-visible:outline-offset-4 ${
                dark
                  ? "border-neutral-700 bg-white text-neutral-950 hover:border-neutral-600 hover:bg-neutral-100"
                  : "border-neutral-200 bg-white text-neutral-900 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-md"
              }`}
            >
              <GoogleIcon />
              Continue with Google
              <span className="ml-auto text-neutral-400 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>

            {/* Terms */}
            <p
              className={`mt-6 text-center text-xs leading-5 ${
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
          {/* <p
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
          </p> */}

          {/* Product statement */}
          <div className="mt-8 flex items-center justify-center gap-2 text-center">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className={dark ? "text-neutral-600" : "text-neutral-400"}
            >
              <path
                d="M7 10V7a5 5 0 0110 0v3m-11 0h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
