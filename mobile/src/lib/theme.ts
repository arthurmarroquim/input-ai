import { useColorScheme } from "react-native";

const light = {
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#1B1E2B",
  muted: "#6B7085",
  border: "#E3E5EE",
  primary: "#5B4BFF",
  primarySoft: "#ECEAFF",
  accent: "#FF7A45",
  success: "#1FA971",
  bubbleUser: "#5B4BFF",
  bubbleUserText: "#FFFFFF",
  bubbleBot: "#FFFFFF",
};

const dark: typeof light = {
  bg: "#0F1117",
  card: "#1A1D27",
  text: "#F1F2F7",
  muted: "#9CA0B4",
  border: "#2A2E3B",
  primary: "#8B7FFF",
  primarySoft: "#26234A",
  accent: "#FF925F",
  success: "#3CCB8E",
  bubbleUser: "#6C5CFF",
  bubbleUserText: "#FFFFFF",
  bubbleBot: "#1A1D27",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
