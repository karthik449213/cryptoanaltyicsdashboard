import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          900: "#0B0F14",
          800: "#111827",
        },
        panel: "rgba(17, 24, 39, 0.6)",
        neon: {
          cyan: "#22D3EE",
          purple: "#A78BFA",
        },
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0, 0, 0, 0.35)",
        neon: "0 0 0 1px rgba(34, 211, 238, 0.2), 0 0 30px rgba(34, 211, 238, 0.08)",
      },
      backgroundImage: {
        "terminal-gradient": "radial-gradient(circle at top right, rgba(34, 211, 238, 0.14), transparent 45%), radial-gradient(circle at bottom left, rgba(167, 139, 250, 0.12), transparent 40%)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
