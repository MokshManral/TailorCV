import React from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Header({
  dark,
  setDark,
  user,
  setUser,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
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
            dark
              ? "bg-white text-black"
              : "bg-black text-white"
          }`}
        >
          T
        </div>

        <span className="text-[15px] font-semibold tracking-tight">
          TailorCV
        </span>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Logout */}
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              dark
                ? "border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            Logout
          </button>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setDark((value) => !value)}
          aria-label="Toggle theme"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
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
      </div>
    </header>
  );
}
