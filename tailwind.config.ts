import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f9eddb",
          200: "#f2d7b0",
          300: "#e9bb7c",
          400: "#df9a48",
          500: "#d47f28",
          600: "#be651e",
          700: "#9e4c1b",
          800: "#803d1d",
          900: "#69331b",
        },
        forest: {
          50: "#f0f7f4",
          100: "#daeee3",
          200: "#b8dcc9",
          300: "#89c3a7",
          400: "#5ba682",
          500: "#3a8a66",
          600: "#2a6f51",
          700: "#235943",
          800: "#1f4737",
          900: "#1b3b2e",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Fraunces"', "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
