import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TECNICAS, dicaDoDia } from "../../data/tecnicas";
import { streak, useProgress } from "../../lib/storage";
import { useTheme } from "../../lib/theme";

export default function Home() {
  const t = useTheme();
  const { progress } = useProgress();
  const dias = streak(progress.studyDays);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={[styles.hello, { color: t.text }]}>Olá! Bora aprender a estudar? 👋</Text>
      <Text style={{ color: t.muted, marginBottom: 16 }}>
        Técnicas, vídeos e um tutor com IA para tirar suas dúvidas — até por foto.
      </Text>

      <View style={styles.stats}>
        <Stat label="dias seguidos" value={`🔥 ${dias}`} />
        <Stat label="min. de foco" value={`⏱️ ${progress.focusMinutes}`} />
        <Stat label="técnicas" value={`✅ ${progress.learned.length}/${TECNICAS.length}`} />
      </View>

      <View style={[styles.tip, { backgroundColor: t.primarySoft }]}>
        <Text style={[styles.tipTitle, { color: t.primary }]}>💡 Dica do dia</Text>
        <Text style={{ color: t.text, lineHeight: 21 }}>{dicaDoDia()}</Text>
      </View>

      <Pressable onPress={() => router.push("/pomodoro")} style={[styles.cta, { backgroundColor: t.accent }]}>
        <Text style={styles.ctaTitle}>🍅 Começar sessão de foco</Text>
        <Text style={styles.ctaSub}>Pomodoro de 25 minutos</Text>
      </Pressable>

      <View style={styles.row}>
        <Pressable
          onPress={() => router.push("/tutor")}
          style={[styles.half, { backgroundColor: t.primary }]}
        >
          <Text style={styles.ctaTitle}>📷 Foto da dúvida</Text>
          <Text style={styles.ctaSub}>Pergunte ao Tutor IA</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/shorts")}
          style={[styles.half, { backgroundColor: t.success }]}
        >
          <Text style={styles.ctaTitle}>▶️ Shorts</Text>
          <Text style={styles.ctaSub}>Aprenda em 1 minuto</Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: t.text }]}>Aprenda a estudar</Text>
      {TECNICAS.map((tec) => {
        const done = progress.learned.includes(tec.id);
        return (
          <Pressable
            key={tec.id}
            onPress={() => router.push({ pathname: "/tecnica/[id]", params: { id: tec.id } })}
            style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <Text style={styles.emoji}>{tec.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: t.text }]}>{tec.nome}</Text>
              <Text style={{ color: t.muted }} numberOfLines={2}>
                {tec.resumo}
              </Text>
            </View>
            {done && <Text style={{ color: t.success, fontSize: 18 }}>✓</Text>}
          </Pressable>
        );
      })}
    </ScrollView>
  );

  function Stat({ label, value }: { label: string; value: string }) {
    return (
      <View style={[styles.stat, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.statValue, { color: t.text }]}>{value}</Text>
        <Text style={{ color: t.muted, fontSize: 12 }}>{label}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32 },
  hello: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  stats: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stat: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  tip: { padding: 14, borderRadius: 14, marginBottom: 12 },
  tipTitle: { fontWeight: "800", marginBottom: 4 },
  cta: { padding: 16, borderRadius: 16, marginBottom: 10 },
  ctaTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  ctaSub: { color: "rgba(255,255,255,0.9)", marginTop: 2 },
  row: { flexDirection: "row", gap: 10, marginBottom: 8 },
  half: { flex: 1, padding: 16, borderRadius: 16 },
  section: { fontSize: 18, fontWeight: "800", marginTop: 16, marginBottom: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  emoji: { fontSize: 28 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
});
