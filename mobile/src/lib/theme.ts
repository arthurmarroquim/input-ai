// Identidade visual do ENSINA A.I (cores da apresentação):
// ameixa escuro, magenta, roxo da logo, lilás claro e o degradê lilás → azul → turquesa.
export const colors = {
  bg: "#FFFFFF",
  bgSoft: "#FBF5FD",
  card: "#FFFFFF",
  text: "#2C0533",
  muted: "#8A6E93",
  border: "#F0E2F5",
  primary: "#B0179A", // magenta-ameixa (botões, links, destaques)
  primaryDark: "#4A0552", // ameixa escuro dos slides
  primaryLight: "#E79AD6",
  primarySoft: "#F7EAFA", // lilás claro (fundo da logo)
  lilac2: "#EED8F5",
  magenta: "#E6149A",
  logoPurple: "#43059A",
  blue: "#7FA2EA",
  teal: "#45BCD6",
  white: "#FFFFFF",
  bubbleUserText: "#FFFFFF",
};

export const gradient = {
  // Fundo escuro dos slides (ameixa → roxo-magenta)
  hero: ["#2E0137", "#4A0552", "#7A1180"] as const,
  // Fundo claro dos slides (lilás → azul → turquesa)
  sky: ["#C08CFF", "#7FA2EA", "#45BCD6"] as const,
  soft: ["#F7EAFA", "#E4ECFB"] as const,
  // Botões: magenta → roxo
  button: ["#E6149A", "#8A1FB8"] as const,
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 };

export const shadow = {
  shadowColor: "#4A0552",
  shadowOpacity: 0.14,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export type Theme = typeof colors;

export function useTheme(): Theme {
  return colors;
}
