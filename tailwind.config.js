/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cinder: {
          orange: "#F48120",
          "orange-deep": "#D86612",
          ink: "#171717",
          charcoal: "#242424",
          slate: "#383836",
          paper: "#FAF8F3",
          "paper-soft": "#F3F0E8",
          bone: "#EAE5D9",
          border: "#D9D4CA",
          "border-dark": "#454542",
          muted: "#6B6B67",
          success: "#2E7D32",
          error: "#C62828",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        reading: "720px",
      },
      borderRadius: {
        architectural: "10px",
      },
      boxShadow: {
        hairline: "0 0 0 1px rgba(0, 0, 0, 0.06)",
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};
