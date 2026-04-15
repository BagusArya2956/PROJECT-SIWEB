import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        shipin: {
          ink: "#1B4332",
          deep: "#176A3A",
          mint: "#B7F0C5",
          soft: "#E8F7E9",
          bone: "#FBFAF3",
          mist: "#EEF1EB",
          text: "#5B615D"
        }
      },
      boxShadow: {
        soft: "0 18px 40px rgba(23, 106, 58, 0.14)",
        card: "0 14px 30px rgba(27, 67, 50, 0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(183,240,197,0.5), transparent 36%), radial-gradient(circle at bottom right, rgba(23,106,58,0.12), transparent 34%)"
      }
    }
  },
  plugins: []
};

export default config;
