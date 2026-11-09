import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GradientButton from "../../components/GradientButton";
import { TECNICAS } from "../../data/tecnicas";
import { useProgress } from "../../lib/storage";
import { colors, gradient, radius } from "../../lib/theme";

export default function TecnicaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tec = TECNICAS.find((x) => x.id === id);
  const { progress, toggleLearned } = useProgress();

  if (!tec) {
    return (
      <View style={styles.page}>
        <Text style={{ color: colors.text }}>Técnica não encontrada.</Text>
      </View>
    );
  }
  const done = progress.learned.includes(tec.id);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: "" }} />
      <LinearGradient colors={gradient.soft} style={styles.hero}>
        <Text style={styles.emoji}>{tec.emoji}</Text>
      </LinearGradient>
      <Text style={styles.title}>{tec.nome}</Text>
      <Text style={styles.lead}>{tec.resumo}</Text>

      <View style={styles.when}>
        <Ionicons name="time-outline" size={20} color={colors.primary} />
        <Text style={styles.whenText}>
          <Text style={{ fontWeight: "800" }}>Quando usar: </Text>
          {tec.quandoUsar}
        </Text>
      </View>

      <Text style={styles.section}>Passo a passo</Text>
      {tec.passos.map((p, i) => (
        <View key={i} style={styles.step}>
          <View style={styles.num}>
            <Text style={styles.numText}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{p}</Text>
        </View>
      ))}

      <View style={styles.tip}>
        <Text style={styles.tipText}>💡 {tec.dica}</Text>
      </View>

      {tec.id === "pomodoro" && (
        <GradientButton
          title="🍅 Testar agora"
          onPress={() => router.push("/pomodoro")}
          style={{ marginBottom: 12 }}
        />
      )}

      <Pressable onPress={() => toggleLearned(tec.id)} style={[styles.learn, done && styles.learnDone]}>
        <Ionicons
          name={done ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={done ? "#fff" : colors.primary}
        />
        <Text style={[styles.learnText, done && { color: "#fff" }]}>
          {done ? "Já uso essa técnica!" : "Marcar como aprendida"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingTop: 4, paddingBottom: 40, backgroundColor: colors.bg },
  hero: {
    height: 150,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emoji: { fontSize: 72 },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  lead: { fontSize: 16, marginTop: 6, lineHeight: 23, color: colors.muted },
  when: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginTop: 18,
  },
  whenText: { flex: 1, color: colors.text, lineHeight: 21 },
  section: { fontSize: 19, fontWeight: "900", color: colors.text, marginTop: 24, marginBottom: 12 },
  step: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
  },
  num: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: { color: "#fff", fontWeight: "900" },
  stepText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21 },
  tip: { padding: 16, borderRadius: radius.md, backgroundColor: colors.bgSoft, marginVertical: 16 },
  tipText: { color: colors.text, lineHeight: 21 },
  learn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  learnDone: { backgroundColor: colors.primary },
  learnText: { color: colors.primary, fontWeight: "800", fontSize: 16 },
});
