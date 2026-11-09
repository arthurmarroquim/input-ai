import { StyleSheet } from "react-native";
import { colors, radius } from "../lib/theme";

export const authStyles = StyleSheet.create({
  erro: { backgroundColor: "#FFF0F3", borderRadius: radius.sm, padding: 12, marginBottom: 8 },
  erroText: { color: "#B4234A", fontWeight: "600" },
  ok: { backgroundColor: colors.primarySoft, borderRadius: radius.sm, padding: 12, marginBottom: 8 },
  okText: { color: colors.primaryDark, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 24 },
  link: { color: colors.primary, fontWeight: "800" },
});
