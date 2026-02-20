export const themeTokens = {
  colors: {
    bgPrimary: "#0B0F14",
    bgSecondary: "#111827",
    neonCyan: "#22D3EE",
    neonPurple: "#A78BFA",
    textPrimary: "#E5E7EB",
    textMuted: "#94A3B8",
  },
  blur: "16px",
  cardBorder: "rgba(148, 163, 184, 0.18)",
} as const;

export type ThemeTokens = typeof themeTokens;
