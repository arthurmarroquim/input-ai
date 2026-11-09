import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  COMPETENCIAS_ESPECIFICAS,
  COMPETENCIAS_GERAIS,
  competenciaDa,
  GERAIS_POR_AREA,
  habilidadesDo,
} from "../../data/bncc";
import { AREAS, ASSUNTOS, materiaPorId } from "../../data/conteudos";
import { TopicStatus } from "../../lib/api";
import { NOME_AREA_BNCC } from "../../lib/bnccProgresso";
import { colors, gradient, radius } from "../../lib/theme";
import { useTopics } from "../../lib/topics";

const STATUS: { v: TopicStatus; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { v: 0, label: "A estudar", icon: "ellipse-outline" },
  { v: 1, label: "Estudando", icon: "contrast" },
  { v: 2, label: "Dominado", icon: "checkmark-circle" },
];

export default function AssuntoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, setStatus } = useTopics();
  const a = ASSUNTOS.find((x) => x.id === id);

  if (!a) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>Assunto não encontrado.</Text>
      </View>
    );
  }

  const materia = materiaPorId[a.materia];
  const area = AREAS[materia.area];
  const habs = habilidadesDo(a.id);
  const st = (status[a.id] ?? 0) as TopicStatus;
  const provas = ["ENEM", ...(a.somenteEnem ? [] : [`SSA ${a.serie}`])];
  const gerais = COMPETENCIAS_GERAIS.filter((g) => GERAIS_POR_AREA[materia.area].includes(g.numero));

  function tutor() {
    router.push({
      pathname: "/tutor",
      params: { topico: a!.nome, exame: provas.join(" e "), bncc: habs.map((h) => h.codigo).join(", ") },
    });
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: materia.nome }} />
      <LinearGradient colors={gradient.sky} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroEmoji}>{materia.emoji}</Text>
        <Text style={styles.heroTitle}>{a.nome}</Text>
        <Text style={styles.heroSub}>
          {area.emoji} {area.nome} · {a.serie}ª série
        </Text>
        <View style={styles.tags}>
          {provas.map((p) => (
            <View key={p} style={styles.tag}>
              <Text style={styles.tagText}>{p}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Status */}
        <Text style={styles.section}>Como está esse assunto pra você?</Text>
        <View style={styles.status}>
          {STATUS.map((s) => {
            const ativo = s.v === st;
            return (
              <Pressable
                key={s.v}
                onPress={() => setStatus(a.id, s.v)}
                accessibilityRole="radio"
                accessibilityState={{ checked: ativo }}
                style={[styles.statusBtn, ativo && { backgroundColor: colors.primary }]}
              >
                <Ionicons name={s.icon} size={18} color={ativo ? "#fff" : colors.primary} />
                <Text style={[styles.statusText, ativo && { color: "#fff" }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={tutor} style={[styles.action, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: "#fff" }]}>Estudar com o Tutor</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: "/aulas", params: { q: `${a.nome} ${materia.nome}` } })}
            style={[styles.action, { backgroundColor: colors.primarySoft }]}
          >
            <Ionicons name="play-circle" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Ver aulas</Text>
          </Pressable>
        </View>

        {/* Habilidades */}
        <Text style={styles.section}>Habilidades da BNCC</Text>
        {habs.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Este assunto não aparece de forma explícita na BNCC do Ensino Médio, mas é tradicional em
              vestibulares e em muitos currículos escolares. Vale estudar se cair na sua prova.
            </Text>
          </View>
        )}
        {habs.map((h) => {
          const n = competenciaDa(h.codigo);
          const comp = n ? COMPETENCIAS_ESPECIFICAS.find((c) => c.area === h.area && c.numero === n) : null;
          return (
            <View key={h.codigo} style={styles.hab}>
              <View style={styles.habHead}>
                <View style={[styles.code, { backgroundColor: AREAS[h.area].cor }]}>
                  <Text style={styles.codeText}>{h.codigo}</Text>
                </View>
                <Text style={styles.habArea}>{NOME_AREA_BNCC[h.area]}</Text>
              </View>
              <Text style={styles.habText}>{h.resumo}</Text>
              {comp && (
                <View style={styles.comp}>
                  <Text style={styles.compTitle}>Competência específica {comp.numero}</Text>
                  <Text style={styles.compText}>{comp.resumo}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Competências gerais */}
        <Text style={styles.section}>Competências gerais relacionadas</Text>
        <View style={styles.gerais}>
          {gerais.map((g) => (
            <View key={g.numero} style={styles.geral}>
              <Text style={styles.geralNum}>{g.numero}</Text>
              <Text style={styles.geralName}>{g.nome}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Relação sugerida pelo ENSINA A.I com textos resumidos da BNCC. Texto oficial em
          basenacionalcomum.mec.gov.br.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { margin: 16, marginTop: 4, borderRadius: radius.xl, padding: 20 },
  heroEmoji: { fontSize: 40 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "900", marginTop: 6 },
  heroSub: { color: "rgba(255,255,255,0.95)", fontWeight: "700", marginTop: 4 },
  tags: { flexDirection: "row", gap: 8, marginTop: 12 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tagText: { color: "#fff", fontWeight: "800" },
  body: { paddingHorizontal: 20 },
  section: { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: 18, marginBottom: 10 },
  status: { flexDirection: "row", gap: 8 },
  statusBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  statusText: { color: colors.primaryDark, fontWeight: "800", fontSize: 13 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  actionText: { fontWeight: "800" },
  empty: { backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 14 },
  emptyText: { color: colors.text, lineHeight: 20 },
  hab: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  habHead: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  code: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { color: "#fff", fontWeight: "900", letterSpacing: 0.5 },
  habArea: { color: colors.muted, fontSize: 12, fontWeight: "700", flexShrink: 1 },
  habText: { color: colors.text, marginTop: 8, lineHeight: 21, fontSize: 15 },
  comp: { backgroundColor: colors.primarySoft, borderRadius: radius.sm, padding: 10, marginTop: 10 },
  compTitle: { color: colors.primary, fontWeight: "900", fontSize: 12 },
  compText: { color: colors.text, fontSize: 13, marginTop: 2, lineHeight: 18 },
  gerais: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  geral: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  geralNum: {
    color: "#fff",
    backgroundColor: colors.primaryDark,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "900",
    fontSize: 12,
    overflow: "hidden",
  },
  geralName: { color: colors.primaryDark, fontWeight: "700" },
  note: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 17 },
});
