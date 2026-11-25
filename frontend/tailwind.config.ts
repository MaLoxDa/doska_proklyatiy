import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        panel: "#14121a",
        text: "#eeeaf2",
        muted: "#b9b4c4",
        line: "#302b37",
        accent: "#7858ae",
        "accent-2": "#aa88cf",
        link: "#b79ada",
      },
      fontFamily: {
        display: ["'Alegreya SC'", "'Alegreya Sans SC'", "Georgia", "serif"],
        sans: ["'Alegreya Sans SC'", "'Alegreya SC'", "Georgia", "serif"],
      },
      maxWidth: { content: "1200px" },
      fontSize: {
        h1: ["38px", { lineHeight: "1.18" }],
        h2: ["28px", { lineHeight: "1.25" }],
        h3: ["24px", { lineHeight: "1.3" }],
        h4: ["22px", { lineHeight: "1.35" }],
        lead: ["18px", { lineHeight: "1.6" }],
        base2: ["17px", { lineHeight: "1.6" }],
        ui: ["16px", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [],
};

export default config;
