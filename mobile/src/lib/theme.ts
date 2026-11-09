// Identidade visual do Estude A.I.: lilás + branco.
export const colors = {
  bg: "#FFFFFF",
  bgSoft: "#FAF7FF",
  card: "#FFFFFF",
  text: "#2B2350",
  muted: "#8C84A8",
  border: "#EEE8FB",
  primary: "#9466F5", // lilás principal
  primaryDark: "#7445E0",
  primaryLight: "#C9B3FF",
  primarySoft: "#F3EDFF",
  lilac2: "#E6DAFF",
  white: "#FFFFFF",
  success: "#7C5CE0",
  bubbleUserText: "#FFFFFF",
};

export const gradient = {
  hero: ["#B69CFF", "#9466F5", "#7445E0"] as const,
  soft: ["#F6F1FF", "#EADFFF"] as const,
  button: ["#A47BFF", "#7F52EC"] as const,
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 };

export const shadow = {
  shadowColor: "#7445E0",
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export type Theme = typeof colors;

export function useTheme(): Theme {
  return colors;
}
