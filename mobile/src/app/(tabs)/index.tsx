import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Blobs from "../../components/Blobs";
import { ASSUNTOS } from "../../data/conteudos";
import { TECNICAS, dicaDoDia } from "../../data/tecnicas";
import { resumo, useTopics } from "../../lib/topics";
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
  const { status: topicos } = useTopics();
  // Progresso da série do aluno (ou de todo o Ensino Médio, para quem já concluiu)
  const serieEM = user?.serie === 1 || user?.serie === 2 || user?.serie === 3 ? user.serie : null;
  const enem = resumo(
    ASSUNTOS.filter((a) => !serieEM || a.serie === serieEM).map((a) => a.id),
    topicos,
  );
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
        <Blobs />
        <View style={styles.heroTop}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            accessibilityLabel="Logo Ensina Aí"
          />
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

        {/* Resumo do painel ENEM / SSA */}
        <Pressable
          onPress={() => router.push("/progresso")}
          style={({ pressed }) => [styles.prog, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={gradient.sky}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progInner}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.progKicker}>
                {serieEM ? `PROGRESSO DO ${serieEM}º ANO · SSA ${serieEM}` : "PROGRESSO ENEM"}
              </Text>
              <Text style={styles.progValue}>{enem.pct}% dos assuntos</Text>
              <View style={styles.progTrack}>
                <View style={[styles.progFill, { width: `${enem.pct}%` }]} />
              </View>
              <Text style={styles.progSub}>
                {enem.dominados} dominados · {enem.estudando} estudando · ver ENEM e SSA →
              </Text>
            </View>
            <Ionicons name="stats-chart" size={34} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </Pressable>

        {!user?.serie && (
          <Pressable
            onPress={() => router.push("/perfil")}
            style={styles.semSerie}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 22 }}>🎒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.semSerieTitle}>Qual série você está cursando?</Text>
              <Text style={styles.semSerieSub}>
                Informe no Perfil para ver os assuntos da BNCC da sua série.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}

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
  semSerie: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginTop: 12,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primarySoft,
  },
  semSerieTitle: { color: colors.text, fontWeight: "900" },
  semSerieSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  prog: { marginTop: 14, borderRadius: radius.lg, ...shadow },
  progInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 18, borderRadius: radius.lg },
  progKicker: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  progValue: { color: "#fff", fontWeight: "900", fontSize: 20, marginTop: 2 },
  progTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginTop: 10,
    overflow: "hidden",
  },
  progFill: { height: 8, borderRadius: 4, backgroundColor: "#fff" },
  progSub: { color: "rgba(255,255,255,0.95)", fontSize: 12, marginTop: 8, fontWeight: "600" },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  logo: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  hello: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "600" },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 32,
  },
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
