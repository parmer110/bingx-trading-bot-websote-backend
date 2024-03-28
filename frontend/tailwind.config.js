/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5C9DFF",
        secondary: "#CFB53B",
        cta: "#0C1524",
        iconDefault: "#CFD1D4",
        bullish: "#059669",
        bearish: "#EF4444",
        neutral: "#6B7280",
        table: "#374151",
        background: {
          1: "#243B55",
          2: "#141E30",
          3: "#131D2D",
        },
      },
      borderRadius: {
        DEFAULT: "25px",
      },
      keyframes: {
        "pulse-once": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
      animation: {
        "pulse-once": "pulse-once 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
};
