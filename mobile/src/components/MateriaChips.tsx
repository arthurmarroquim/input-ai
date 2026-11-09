import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { MATERIAS, Materia } from "../data/materias";
import { useTheme } from "../lib/theme";

type Props = { selected: string; onSelect: (m: Materia) => void; dark?: boolean };

export default function MateriaChips({ selected, onSelect, dark }: Props) {
  const t = useTheme();
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
              {
                backgroundColor: active ? t.primary : dark ? "rgba(255,255,255,0.15)" : t.card,
                borderColor: active ? t.primary : dark ? "transparent" : t.border,
              },
            ]}
          >
            <Text style={{ color: active || dark ? "#fff" : t.text, fontWeight: "600" }}>
              {m.emoji} {m.nome}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});
