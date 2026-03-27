import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        cream: "#F2F0E6",
        gold: "#FFCA4B",
        "gold-hover": "#E8B83E",
        plum: "#3E363F",
      },
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
