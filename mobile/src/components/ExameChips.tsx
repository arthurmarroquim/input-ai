import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { EXAMES_FOCO, ExameFoco } from "../lib/exameFoco";
import { colors, radius } from "../lib/theme";

type Props = { value: ExameFoco; onChange: (e: ExameFoco) => void; dark?: boolean };

// Seletor da prova em foco (ENEM / SSA 1 / SSA 2 / SSA 3).
export default function ExameChips({ value, onChange, dark }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Text style={[styles.label, { color: dark ? "rgba(255,255,255,0.85)" : colors.muted }]}>🎯 Foco:</Text>
      {EXAMES_FOCO.map((e) => {
        const ativo = e.id === value;
        return (
          <Pressable
            key={e.id}
            onPress={() => onChange(e.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            style={[
              styles.chip,
              ativo
                ? { backgroundColor: dark ? "#fff" : colors.primaryDark }
                : { borderColor: dark ? "rgba(255,255,255,0.5)" : colors.lilac2 },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: ativo ? (dark ? colors.primaryDark : "#fff") : dark ? "#fff" : colors.primaryDark },
              ]}
            >
              {e.nome}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, paddingHorizontal: 20, paddingBottom: 4, alignItems: "center" },
  label: { fontWeight: "800", fontSize: 13, marginRight: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  text: { fontWeight: "800", fontSize: 13 },
});
