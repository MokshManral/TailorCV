/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F3EA",
        ink: "#1F2421",
        "ink-soft": "#4A5350",
        thread: "#C9A227",
        "thread-dark": "#9C7E1C",
        pin: "#2B6E6E",
        "pin-dark": "#1D4E4E",
        seam: "#D8D1BE",
        match: {
          strong: "#3F7D5C",
          ok: "#B98A1E",
          weak: "#B4442E",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "70%": { opacity: "1", transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        // "both" keeps the start state during a stagger delay.
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "pop-in": "pop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      backgroundImage: {
        stitch:
          "repeating-linear-gradient(90deg, var(--stitch-color, #D8D1BE) 0, var(--stitch-color, #D8D1BE) 8px, transparent 8px, transparent 16px)",
      },
    },
  },
  plugins: [],
};
