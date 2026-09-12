/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Tricore" palette — used on Dashboard.js and the Signals/blog
        // pages. Rest of the app (Setup Match Grader, Finance Tracker,
        // etc.) intentionally keeps its existing light theme untouched.
        base: "#0F1720",
        panel: "#161F2B",
        panel2: "#1D2733",
        line: "rgba(255,255,255,0.08)",
        ink: "#EDEFF2",
        muted: "#8B98A9",
        long: "#2FBF71",
        short: "#C1502E",
        steel: "#3E5C76",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
    },
  },
  plugins: [],
}
