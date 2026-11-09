import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TECNICAS } from "../../data/tecnicas";
import { useProgress } from "../../lib/storage";
import { useTheme } from "../../lib/theme";

export default function TecnicaScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tec = TECNICAS.find((x) => x.id === id);
  const { progress, toggleLearned } = useProgress();

  if (!tec) {
    return (
      <View style={styles.page}>
        <Text style={{ color: t.text }}>Técnica não encontrada.</Text>
      </View>
    );
  }
  const done = progress.learned.includes(tec.id);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: tec.nome }} />
      <Text style={styles.emoji}>{tec.emoji}</Text>
      <Text style={[styles.title, { color: t.text }]}>{tec.nome}</Text>
      <Text style={[styles.lead, { color: t.muted }]}>{tec.resumo}</Text>

      <Box title="Quando usar">
        <Text style={[styles.body, { color: t.text }]}>{tec.quandoUsar}</Text>
      </Box>

      <Box title="Passo a passo">
        {tec.passos.map((p, i) => (
          <View key={i} style={styles.step}>
            <View style={[styles.num, { backgroundColor: t.primary }]}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <Text style={[styles.body, { color: t.text, flex: 1 }]}>{p}</Text>
          </View>
        ))}
      </Box>

      <View style={[styles.tip, { backgroundColor: t.primarySoft }]}>
        <Text style={{ color: t.text, lineHeight: 21 }}>💡 {tec.dica}</Text>
      </View>

      {tec.id === "pomodoro" && (
        <Pressable
          onPress={() => router.push("/pomodoro")}
          style={[styles.btn, { backgroundColor: t.accent }]}
        >
          <Text style={styles.btnText}>🍅 Testar agora</Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => toggleLearned(tec.id)}
        style={[styles.btn, done ? { backgroundColor: t.success } : { backgroundColor: t.primary }]}
      >
        <Text style={styles.btnText}>{done ? "✓ Já uso essa técnica" : "Marcar como aprendida"}</Text>
      </Pressable>
    </ScrollView>
  );

  function Box({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <View style={[styles.box, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.boxTitle, { color: t.primary }]}>{title}</Text>
        {children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40 },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  lead: { fontSize: 16, marginTop: 4, marginBottom: 16, lineHeight: 22 },
  box: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  boxTitle: {
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  body: { fontSize: 15, lineHeight: 22 },
  step: { flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" },
  num: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  numText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  tip: { padding: 14, borderRadius: 14, marginBottom: 16 },
  btn: { padding: 15, borderRadius: 14, alignItems: "center", marginBottom: 10 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
