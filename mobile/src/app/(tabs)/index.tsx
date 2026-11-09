import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TECNICAS, dicaDoDia } from "../../data/tecnicas";
import { useAuth } from "../../lib/auth";
import { streak, useProgress } from "../../lib/storage";
import { colors, gradient, radius, shadow } from "../../lib/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ATALHOS: {
  label: string;
  sub: string;
  icon: IconName;
  href: "/pomodoro" | "/tutor" | "/shorts" | "/aulas";
}[] = [
  { label: "Modo foco", sub: "Pomodoro 25 min", icon: "timer", href: "/pomodoro" },
  { label: "Foto da dúvida", sub: "Tutor IA", icon: "camera", href: "/tutor" },
  { label: "Shorts", sub: "Aprenda em 1 min", icon: "play", href: "/shorts" },
  { label: "Videoaulas", sub: "Por matéria", icon: "school", href: "/aulas" },
];

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const { user } = useAuth();
  const primeiroNome = user?.name.split(/\s+/)[0] ?? "";
  const dias = streak(progress.studyDays);
  const pctTecnicas = progress.learned.length / TECNICAS.length;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Topo em degradê lilás */}
      <LinearGradient
        colors={gradient.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>
              {saudacao()}
              {primeiroNome ? `, ${primeiroNome}` : ""}! 👋
            </Text>
            <Text style={styles.heroTitle}>Bora estudar{"\n"}do jeito certo?</Text>
          </View>
          <View style={styles.streak}>
            <Text style={styles.streakNum}>🔥 {dias}</Text>
            <Text style={styles.streakLabel}>{dias === 1 ? "dia" : "dias"}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{progress.focusMinutes}</Text>
            <Text style={styles.statLabel}>min de foco</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{progress.sessions}</Text>
            <Text style={styles.statLabel}>pomodoros</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {progress.learned.length}/{TECNICAS.length}
            </Text>
            <Text style={styles.statLabel}>técnicas</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Dica do dia */}
        <View style={[styles.tip, shadow]}>
          <View style={styles.tipIcon}>
            <Text style={{ fontSize: 22 }}>💡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Dica do dia</Text>
            <Text style={styles.tipText}>{dicaDoDia()}</Text>
          </View>
        </View>

        {/* Atalhos */}
        <Text style={styles.section}>O que vamos fazer hoje?</Text>
        <View style={styles.grid}>
          {ATALHOS.map((a, i) => (
            <Pressable
              key={a.href}
              onPress={() => router.push(a.href)}
              style={({ pressed }) => [
                styles.tile,
                i === 1 && styles.tileStrong,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={[styles.tileIcon, i === 1 && { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <Ionicons name={a.icon} size={22} color={i === 1 ? "#fff" : colors.primary} />
              </View>
              <Text style={[styles.tileLabel, i === 1 && { color: "#fff" }]}>{a.label}</Text>
              <Text style={[styles.tileSub, i === 1 && { color: "rgba(255,255,255,0.85)" }]}>{a.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* Técnicas em carrossel */}
        <View style={styles.sectionRow}>
          <Text style={[styles.section, { marginTop: 0, marginBottom: 0 }]}>Aprenda a estudar</Text>
          <Text style={styles.sectionHint}>{Math.round(pctTecnicas * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pctTecnicas * 100}%` }]} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {TECNICAS.map((tec) => {
          const done = progress.learned.includes(tec.id);
          return (
            <Pressable
              key={tec.id}
              onPress={() => router.push({ pathname: "/tecnica/[id]", params: { id: tec.id } })}
              style={({ pressed }) => [styles.tecCard, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <View style={styles.tecEmojiBox}>
                <Text style={styles.tecEmoji}>{tec.emoji}</Text>
                {done && (
                  <View style={styles.doneBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={styles.tecTitle} numberOfLines={1}>
                {tec.nome}
              </Text>
              <Text style={styles.tecSub} numberOfLines={3}>
                {tec.resumo}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroTop: { flexDirection: "row", alignItems: "flex-start" },
  hello: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "600" },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 4, lineHeight: 34 },
  streak: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  streakNum: { color: "#fff", fontWeight: "900", fontSize: 18 },
  streakLabel: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },
  stats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginTop: 22,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: "#fff", fontSize: 20, fontWeight: "900" },
  statLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  divider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", marginVertical: 4 },
  body: { paddingHorizontal: 20 },
  tip: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: -14,
    alignItems: "center",
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: { color: colors.primary, fontWeight: "800", fontSize: 13, marginBottom: 2 },
  tipText: { color: colors.text, lineHeight: 20, fontSize: 14 },
  section: { fontSize: 19, fontWeight: "900", color: colors.text, marginTop: 26, marginBottom: 12 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 26 },
  sectionHint: { color: colors.primary, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "47.8%",
    flexGrow: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 16,
  },
  tileStrong: { backgroundColor: colors.primary },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tileLabel: { color: colors.text, fontWeight: "800", fontSize: 16 },
  tileSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  carousel: { gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  tecCard: {
    width: 170,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
  },
  tecEmojiBox: {
    height: 84,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tecEmoji: { fontSize: 40 },
  doneBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tecTitle: { color: colors.text, fontWeight: "800", fontSize: 15 },
  tecSub: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
});
