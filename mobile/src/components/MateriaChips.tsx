import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { MATERIAS, Materia } from "../data/materias";
import { colors, radius } from "../lib/theme";

type Props = { selected: string; onSelect: (m: Materia) => void; dark?: boolean };

export default function MateriaChips({ selected, onSelect, dark }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {MATERIAS.map((m) => {
        const active = m.id === selected;
        return (
          <Pressable
            key={m.id}
            onPress={() => onSelect(m)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.primary }
                : { backgroundColor: dark ? "rgba(255,255,255,0.18)" : colors.primarySoft },
            ]}
          >
            <Text style={[styles.text, { color: active || dark ? "#fff" : colors.primaryDark }]}>
              {m.emoji} {m.nome}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  text: { fontWeight: "700", fontSize: 14 },
});
