import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Serie } from "../lib/api";
import { SERIES } from "../lib/serie";
import { colors, radius } from "../lib/theme";

type Props = { value: Serie | null; onChange: (s: Serie) => void };

// Escolha da série em cartões grandes (2 por linha).
export default function SerieSelector({ value, onChange }: Props) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {SERIES.map((s) => {
        const ativo = value === s.id;
        return (
          <Pressable
            key={String(s.id)}
            onPress={() => onChange(s.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo }}
            style={[styles.card, ativo && styles.cardActive]}
          >
            <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
            <Text style={[styles.label, ativo && { color: "#fff" }]}>{s.curto}</Text>
            <Text style={[styles.sub, ativo && { color: "rgba(255,255,255,0.85)" }]}>
              {s.id === "concluido" ? "Foco no ENEM" : "Ensino Médio"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    flexGrow: 1,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.text, fontWeight: "900", fontSize: 16, marginTop: 4 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 1 },
});
