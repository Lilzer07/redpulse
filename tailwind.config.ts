import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#08090b",
        graphite: "#141518",
        panel: "#1a1b1f",
        titanium: "#c4c8ce",
        ignition: "#ff5a1f",
        "ignition-dim": "#b23f12",
        led: "#d7e6ff",
        text: "#eceef1",
        "text-dim": "#8d9096",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
