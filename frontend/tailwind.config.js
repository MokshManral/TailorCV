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
      backgroundImage: {
        stitch:
          "repeating-linear-gradient(90deg, var(--stitch-color, #D8D1BE) 0, var(--stitch-color, #D8D1BE) 8px, transparent 8px, transparent 16px)",
      },
    },
  },
  plugins: [],
};
