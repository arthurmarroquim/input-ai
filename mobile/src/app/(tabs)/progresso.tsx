import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Blobs from "../../components/Blobs";
import ProgressRing from "../../components/ProgressRing";
import {
  AREAS,
  AreaId,
  Assunto,
  assuntosDoExame,
  EXAMES,
  ExamId,
  materiaPorId,
  MATERIAS,
} from "../../data/conteudos";
import { TopicStatus } from "../../lib/api";
import { colors, gradient, radius, shadow } from "../../lib/theme";
import { resumo, useTopics } from "../../lib/topics";

type Filtro = "todos" | 0 | 1 | 2;

const STATUS_INFO: Record<
  TopicStatus,
  { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; cor: string }
> = {
  0: { label: "A estudar", icon: "ellipse-outline", cor: colors.muted },
  1: { label: "Estudando", icon: "contrast", cor: colors.teal },
  2: { label: "Dominado", icon: "checkmark-circle", cor: colors.primary },
};

const proximo = (s: TopicStatus): TopicStatus => ((s + 1) % 3) as TopicStatus;

export default function Progresso() {
  const insets = useSafeAreaInsets();
  const { status, loading, error, setStatus, reload } = useTopics();
  const [exame, setExame] = useState<ExamId>("enem");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [aberta, setAberta] = useState<string | null>(null);

  const exameInfo = EXAMES.find((e) => e.id === exame)!;
  const assuntos = useMemo(() => assuntosDoExame(exame), [exame]);
  const geral = resumo(
    assuntos.map((a) => a.id),
    status,
  );

  // Assuntos agrupados por matéria (na ordem da lista de matérias)
  const porMateria = useMemo(() => {
    const map = new Map<string, Assunto[]>();
    for (const a of assuntos) map.set(a.materia, [...(map.get(a.materia) ?? []), a]);
    return MATERIAS.filter((m) => map.has(m.id)).map((m) => ({ materia: m, assuntos: map.get(m.id)! }));
  }, [assuntos]);

  // ENEM: barras por área do conhecimento. SSA: barras por matéria.
  const barras = useMemo(() => {
    if (exame === "enem") {
      return (Object.keys(AREAS) as AreaId[]).map((area) => {
        const ids = assuntos.filter((a) => materiaPorId[a.materia].area === area).map((a) => a.id);
        return {
          id: area,
          nome: AREAS[area].nome,
          emoji: AREAS[area].emoji,
          cor: AREAS[area].cor,
          ...resumo(ids, status),
        };
      });
    }
    return porMateria.map(({ materia, assuntos: list }) => ({
      id: materia.id,
      nome: materia.nome,
      emoji: materia.emoji,
      cor: AREAS[materia.area].cor,
      ...resumo(
        list.map((a) => a.id),
        status,
      ),
    }));
  }, [exame, assuntos, porMateria, status]);

  // Próximo passo:
  // 1) termine um assunto que já está "estudando";
  // 2) senão, comece pela matéria com mais assuntos ainda não estudados.
  const sugestao = useMemo(() => {
    const emAndamento = assuntos.find((x) => status[x.id] === 1);
    if (emAndamento) return emAndamento;
    const ordem = porMateria
      .map((g) => ({ g, pendentes: g.assuntos.filter((x) => (status[x.id] ?? 0) === 0) }))
      .filter((x) => x.pendentes.length > 0)
      .sort((x, y) => y.pendentes.length - x.pendentes.length);
    return ordem[0]?.pendentes[0] ?? null;
  }, [assuntos, porMateria, status]);

  function estudarComTutor(a: Assunto) {
    router.push({ pathname: "/tutor", params: { topico: a.nome, exame: exameInfo.nome } });
  }
  function verAulas(a: Assunto) {
    router.push({ pathname: "/aulas", params: { q: `${a.nome} ${materiaPorId[a.materia].nome}` } });
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Cabeçalho com seletor de prova e anel de progresso */}
      <LinearGradient
        colors={gradient.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Blobs />
        <Text style={styles.heroTitle}>Meu progresso</Text>
        <Text style={styles.heroSub}>Assuntos que você já estudou para as provas</Text>

        <View style={styles.exams}>
          {EXAMES.map((e) => {
            const ativo = e.id === exame;
            return (
              <Pressable
                key={e.id}
                onPress={() => {
                  setExame(e.id);
                  setAberta(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                style={[styles.exam, ativo && styles.examActive]}
              >
                <Text style={[styles.examText, ativo && { color: colors.primaryDark }]}>{e.nome}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.ringRow}>
          <ProgressRing
            dominado={geral.total ? geral.dominados / geral.total : 0}
            estudando={geral.total ? geral.estudando / geral.total : 0}
            label={`${geral.pct}%`}
            sub={exameInfo.nome}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <Contador cor="#fff" valor={geral.dominados} label="dominados" icon="checkmark-circle" />
            <Contador
              cor="rgba(255,255,255,0.75)"
              valor={geral.estudando}
              label="estudando"
              icon="contrast"
            />
            <Contador
              cor="rgba(255,255,255,0.55)"
              valor={geral.aEstudar}
              label="a estudar"
              icon="ellipse-outline"
            />
            <Text style={styles.examSub}>
              {exameInfo.sub} · {geral.total} assuntos
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />}
        {error && (
          <Pressable onPress={reload} style={styles.erro}>
            <Text style={styles.erroText}>⚠️ {error} Toque para tentar de novo.</Text>
          </Pressable>
        )}

        {/* Próximo passo */}
        {sugestao && (
          <View style={[styles.next, shadow]}>
            <Text style={styles.nextKicker}>🎯 PRÓXIMO PASSO</Text>
            <Text style={styles.nextTitle}>{sugestao.nome}</Text>
            <Text style={styles.nextSub}>
              {materiaPorId[sugestao.materia].emoji} {materiaPorId[sugestao.materia].nome} · {sugestao.serie}ª
              série
            </Text>
            <View style={styles.nextBtns}>
              <Pressable
                onPress={() => estudarComTutor(sugestao)}
                style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={[styles.nextBtnText, { color: "#fff" }]}>Tutor IA</Text>
              </Pressable>
              <Pressable
                onPress={() => verAulas(sugestao)}
                style={[styles.nextBtn, { backgroundColor: colors.primarySoft }]}
              >
                <Ionicons name="play-circle" size={16} color={colors.primary} />
                <Text style={[styles.nextBtnText, { color: colors.primary }]}>Ver aulas</Text>
              </Pressable>
            </View>
          </View>
        )}
        {!sugestao && !loading && (
          <View style={[styles.next, shadow, { alignItems: "center" }]}>
            <Text style={{ fontSize: 40 }}>🏆</Text>
            <Text style={styles.nextTitle}>Tudo dominado no {exameInfo.nome}!</Text>
            <Text style={styles.nextSub}>Agora é revisar com questões de provas anteriores.</Text>
          </View>
        )}

        {/* Barras por área / matéria */}
        <Text style={styles.section}>{exame === "enem" ? "Por área do conhecimento" : "Por matéria"}</Text>
        <View style={styles.bars}>
          {barras.map((b) => (
            <View key={b.id} style={styles.barRow}>
              <Text style={styles.barEmoji}>{b.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.barHead}>
                  <Text style={styles.barName} numberOfLines={1}>
                    {b.nome}
                  </Text>
                  <Text style={[styles.barPct, { color: b.cor }]}>{b.pct}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={{ width: `${(b.dominados / b.total) * 100}%`, backgroundColor: b.cor }} />
                  <View
                    style={{
                      width: `${(b.estudando / b.total) * 100}%`,
                      backgroundColor: b.cor,
                      opacity: 0.35,
                    }}
                  />
                </View>
                <Text style={styles.barMeta}>
                  {b.dominados} de {b.total} dominados{b.estudando ? ` · ${b.estudando} estudando` : ""}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Lista de assuntos */}
        <Text style={styles.section}>Assuntos</Text>
        <Text style={styles.hint}>Toque no círculo para marcar: ○ a estudar → ◐ estudando → ● dominado</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(
            [
              ["todos", "Todos"],
              [0, "A estudar"],
              [1, "Estudando"],
              [2, "Dominados"],
            ] as [Filtro, string][]
          ).map(([f, label]) => (
            <Pressable
              key={String(f)}
              onPress={() => setFiltro(f)}
              style={[styles.filter, filtro === f && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.filterText, filtro === f && { color: "#fff" }]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {porMateria.map(({ materia, assuntos: list }) => {
          const r = resumo(
            list.map((a) => a.id),
            status,
          );
          const visiveis = list.filter((a) => filtro === "todos" || (status[a.id] ?? 0) === filtro);
          if (!visiveis.length) return null;
          const open = aberta === materia.id || filtro !== "todos";
          const cor = AREAS[materia.area].cor;
          return (
            <View key={materia.id} style={styles.group}>
              <Pressable
                onPress={() => setAberta(aberta === materia.id ? null : materia.id)}
                style={styles.groupHead}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <View style={[styles.groupIcon, { backgroundColor: colors.primarySoft }]}>
                  <Text style={{ fontSize: 20 }}>{materia.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{materia.nome}</Text>
                  <View style={[styles.track, { height: 6, marginTop: 6 }]}>
                    <View style={{ width: `${(r.dominados / r.total) * 100}%`, backgroundColor: cor }} />
                    <View
                      style={{
                        width: `${(r.estudando / r.total) * 100}%`,
                        backgroundColor: cor,
                        opacity: 0.35,
                      }}
                    />
                  </View>
                </View>
                <Text style={styles.groupCount}>
                  {r.dominados}/{r.total}
                </Text>
                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
              </Pressable>

              {open &&
                visiveis.map((a) => {
                  const st = (status[a.id] ?? 0) as TopicStatus;
                  const info = STATUS_INFO[st];
                  return (
                    <View key={a.id} style={styles.topic}>
                      <Pressable
                        onPress={() => setStatus(a.id, proximo(st))}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`${a.nome}: ${info.label}. Toque para mudar.`}
                      >
                        <Ionicons name={info.icon} size={26} color={info.cor} />
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.topicName, st === 2 && styles.topicDone]}>{a.nome}</Text>
                        <Text style={[styles.topicMeta, { color: info.cor }]}>
                          {info.label}
                          {exame === "enem" ? ` · ${a.serie}ª série` : ""}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => estudarComTutor(a)}
                        style={styles.topicAction}
                        accessibilityLabel="Estudar com o Tutor IA"
                      >
                        <Ionicons name="sparkles-outline" size={17} color={colors.primary} />
                      </Pressable>
                      <Pressable
                        onPress={() => verAulas(a)}
                        style={styles.topicAction}
                        accessibilityLabel="Ver videoaulas"
                      >
                        <Ionicons name="play-outline" size={17} color={colors.primary} />
                      </Pressable>
                    </View>
                  );
                })}
            </View>
          );
        })}

        <Text style={styles.note}>
          Lista baseada no currículo do ensino médio e nas áreas do ENEM. No SSA (UPE), cada fase cobra os
          conteúdos da sua série. Confira sempre o edital do ano.
        </Text>
      </View>
    </ScrollView>
  );
}

function Contador({
  cor,
  valor,
  label,
  icon,
}: {
  cor: string;
  valor: number;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={styles.count}>
      <Ionicons name={icon} size={18} color={cor} />
      <Text style={[styles.countValue, { color: cor }]}>{valor}</Text>
      <Text style={[styles.countLabel, { color: cor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "900", fontStyle: "italic" },
  heroSub: { color: "rgba(255,255,255,0.85)", marginTop: 2 },
  exams: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.pill,
    padding: 4,
    marginTop: 16,
  },
  exam: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: "center" },
  examActive: { backgroundColor: "#fff" },
  examText: { color: "#fff", fontWeight: "800" },
  ringRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 20 },
  count: { flexDirection: "row", alignItems: "center", gap: 6 },
  countValue: { fontWeight: "900", fontSize: 18 },
  countLabel: { fontWeight: "600" },
  examSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 },
  body: { paddingHorizontal: 20 },
  erro: { backgroundColor: "#FFF0F3", borderRadius: radius.sm, padding: 12, marginTop: 14 },
  erroText: { color: "#B4234A", fontWeight: "600" },
  next: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, marginTop: 18 },
  nextKicker: { color: colors.primary, fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  nextTitle: { color: colors.text, fontWeight: "900", fontSize: 19, marginTop: 6 },
  nextSub: { color: colors.muted, marginTop: 4 },
  nextBtns: { flexDirection: "row", gap: 10, marginTop: 14 },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  nextBtnText: { fontWeight: "800" },
  section: { fontSize: 19, fontWeight: "900", color: colors.text, marginTop: 26, marginBottom: 10 },
  bars: { gap: 14 },
  barRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  barEmoji: { fontSize: 24, width: 32, textAlign: "center" },
  barHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  barName: { color: colors.text, fontWeight: "800", flex: 1 },
  barPct: { fontWeight: "900" },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primarySoft,
    overflow: "hidden",
    flexDirection: "row",
  },
  barMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  hint: { color: colors.muted, fontSize: 13, marginTop: -4, marginBottom: 4 },
  filters: { gap: 8, paddingVertical: 10 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  filterText: { color: colors.primaryDark, fontWeight: "700" },
  group: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: 10,
    overflow: "hidden",
  },
  groupHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  groupIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  groupName: { color: colors.text, fontWeight: "800", fontSize: 16 },
  groupCount: { color: colors.muted, fontWeight: "800" },
  topic: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgSoft,
  },
  topicName: { color: colors.text, fontWeight: "600", fontSize: 15 },
  topicDone: { color: colors.muted },
  topicMeta: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  topicAction: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  note: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 14, textAlign: "center" },
});
