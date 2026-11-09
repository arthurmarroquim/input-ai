import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AreaBncc } from "../data/bncc";
import { AREAS, AreaId, ASSUNTOS, materiaPorId, Serie as SerieEM } from "../data/conteudos";
import { TopicStatus } from "../lib/api";
import { useAuth } from "../lib/auth";
import { NOME_AREA_BNCC, progressoBncc } from "../lib/bnccProgresso";
import { nomeSerie } from "../lib/serie";
import { colors, gradient, radius } from "../lib/theme";
import { resumo, useTopics } from "../lib/topics";

type Visao = SerieEM | "todas";
type Aba = "assuntos" | "habilidades" | "competencias";

const ICONE: Record<TopicStatus, { icon: React.ComponentProps<typeof Ionicons>["name"]; cor: string }> = {
  0: { icon: "ellipse-outline", cor: colors.muted },
  1: { icon: "contrast", cor: colors.teal },
  2: { icon: "checkmark-circle", cor: colors.primary },
};

function Barra({ r, cor = colors.primary }: { r: ReturnType<typeof resumo>; cor?: string }) {
  return (
    <View style={styles.track}>
      <View style={{ width: `${r.total ? (r.dominados / r.total) * 100 : 0}%`, backgroundColor: cor }} />
      <View
        style={{
          width: `${r.total ? (r.estudando / r.total) * 100 : 0}%`,
          backgroundColor: cor,
          opacity: 0.35,
        }}
      />
    </View>
  );
}

export default function MinhaSerieBncc() {
  const { user } = useAuth();
  const { status, setStatus } = useTopics();
  const inicial: Visao = user?.serie === 1 || user?.serie === 2 || user?.serie === 3 ? user.serie : "todas";
  const [visao, setVisao] = useState<Visao>(inicial);
  const [aba, setAba] = useState<Aba>("assuntos");

  const assuntos = useMemo(
    () => (visao === "todas" ? ASSUNTOS : ASSUNTOS.filter((a) => a.serie === visao)),
    [visao],
  );
  const geral = resumo(
    assuntos.map((a) => a.id),
    status,
  );
  const { habilidades, especificas, gerais } = useMemo(
    () => progressoBncc(assuntos, status),
    [assuntos, status],
  );

  const areasOrdem: AreaId[] = ["linguagens", "matematica", "natureza", "humanas", "redacao"];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={gradient.sky} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.kicker}>📋 BNCC · ENSINO MÉDIO</Text>
        <Text style={styles.heroTitle}>
          {visao === "todas" ? "Todo o Ensino Médio" : `${visao}º ano do Ensino Médio`}
        </Text>
        <Text style={styles.heroSub}>
          {user?.serie ? `Sua série: ${nomeSerie(user.serie, true)}` : "Informe sua série no Perfil"}
        </Text>

        <View style={styles.series}>
          {([1, 2, 3, "todas"] as Visao[]).map((v) => (
            <Pressable
              key={String(v)}
              onPress={() => setVisao(v)}
              style={[styles.serie, visao === v && styles.serieActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: visao === v }}
            >
              <Text style={[styles.serieText, visao === v && { color: colors.primaryDark }]}>
                {v === "todas" ? "Todas" : `${v}º ano`}
                {v === user?.serie ? " ★" : ""}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.stats}>
          <Stat valor={`${geral.pct}%`} label="concluído" />
          <Stat valor={String(assuntos.length)} label="assuntos" />
          <Stat valor={String(habilidades.length)} label="habilidades" />
          <Stat valor={String(especificas.length)} label="competências" />
        </View>
      </LinearGradient>

      <View style={styles.tabs}>
        {(
          [
            ["assuntos", "Assuntos"],
            ["habilidades", "Habilidades"],
            ["competencias", "Competências"],
          ] as [Aba, string][]
        ).map(([k, label]) => (
          <Pressable key={k} onPress={() => setAba(k)} style={[styles.tab, aba === k && styles.tabActive]}>
            <Text style={[styles.tabText, aba === k && { color: "#fff" }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.body}>
        {aba === "assuntos" &&
          areasOrdem.map((area) => {
            const list = assuntos.filter((a) => materiaPorId[a.materia].area === area);
            if (!list.length) return null;
            const r = resumo(
              list.map((a) => a.id),
              status,
            );
            return (
              <View key={area} style={{ marginBottom: 18 }}>
                <View style={styles.areaHead}>
                  <Text style={styles.areaTitle}>
                    {AREAS[area].emoji} {AREAS[area].nome}
                  </Text>
                  <Text style={[styles.areaPct, { color: AREAS[area].cor }]}>{r.pct}%</Text>
                </View>
                <Barra r={r} cor={AREAS[area].cor} />
                {list.map((a) => {
                  const st = (status[a.id] ?? 0) as TopicStatus;
                  const codigos = habilidades
                    .filter((h) => h.assuntos.some((x) => x.id === a.id))
                    .map((h) => h.codigo);
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => router.push({ pathname: "/assunto/[id]", params: { id: a.id } })}
                      style={styles.row}
                    >
                      <Pressable
                        onPress={() => setStatus(a.id, ((st + 1) % 3) as TopicStatus)}
                        hitSlop={8}
                        accessibilityLabel={`Mudar status de ${a.nome}`}
                      >
                        <Ionicons name={ICONE[st].icon} size={24} color={ICONE[st].cor} />
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{a.nome}</Text>
                        <Text style={styles.rowSub}>
                          {materiaPorId[a.materia].nome}
                          {visao === "todas" ? ` · ${a.serie}ª série` : ""}
                        </Text>
                        <View style={styles.codes}>
                          {codigos.length ? (
                            codigos.map((c) => (
                              <Text key={c} style={styles.codeChip}>
                                {c}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.noCode}>Complementar (fora da BNCC)</Text>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </Pressable>
                  );
                })}
              </View>
            );
          })}

        {aba === "habilidades" &&
          (["linguagens", "matematica", "natureza", "humanas"] as AreaBncc[]).map((area) => {
            const list = habilidades.filter((h) => h.area === area);
            if (!list.length) return null;
            return (
              <View key={area} style={{ marginBottom: 18 }}>
                <Text style={styles.areaTitle}>
                  {AREAS[area].emoji} {NOME_AREA_BNCC[area]}
                </Text>
                {list.map((h) => (
                  <View key={h.codigo} style={styles.card}>
                    <View style={styles.cardHead}>
                      <Text style={[styles.code, { backgroundColor: AREAS[area].cor }]}>{h.codigo}</Text>
                      {h.competencia && <Text style={styles.compTag}>Competência {h.competencia}</Text>}
                      <Text style={styles.cardPct}>{h.r.pct}%</Text>
                    </View>
                    <Text style={styles.cardText}>{h.resumo}</Text>
                    <Barra r={h.r} cor={AREAS[area].cor} />
                    <Text style={styles.cardMeta}>
                      {h.r.dominados} de {h.r.total} assunto{h.r.total > 1 ? "s" : ""} dominado
                      {h.r.total > 1 ? "s" : ""}: {h.assuntos.map((a) => a.nome).join(" · ")}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}

        {aba === "competencias" && (
          <>
            <Text style={styles.areaTitle}>⭐ Competências gerais</Text>
            <Text style={styles.help}>As 10 competências da BNCC para toda a Educação Básica.</Text>
            {gerais.map((g) => (
              <View key={g.numero} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.num}>{g.numero}</Text>
                  <Text style={[styles.rowTitle, { flex: 1 }]}>{g.nome}</Text>
                  <Text style={styles.cardPct}>{g.r.pct}%</Text>
                </View>
                <Text style={styles.cardText}>{g.resumo}</Text>
                <Barra r={g.r} />
              </View>
            ))}

            {(["linguagens", "matematica", "natureza", "humanas"] as AreaBncc[]).map((area) => {
              const list = especificas.filter((c) => c.area === area);
              if (!list.length) return null;
              return (
                <View key={area} style={{ marginTop: 18 }}>
                  <Text style={styles.areaTitle}>
                    {AREAS[area].emoji} Competências específicas: {NOME_AREA_BNCC[area]}
                  </Text>
                  {list.map((c) => (
                    <View key={c.numero} style={styles.card}>
                      <View style={styles.cardHead}>
                        <Text style={[styles.num, { backgroundColor: AREAS[area].cor }]}>{c.numero}</Text>
                        <Text style={[styles.cardMeta, { flex: 1, marginTop: 0 }]}>
                          {c.habilidades.length} habilidade{c.habilidades.length > 1 ? "s" : ""}
                        </Text>
                        <Text style={styles.cardPct}>{c.r.pct}%</Text>
                      </View>
                      <Text style={styles.cardText}>{c.resumo}</Text>
                      <Barra r={c.r} cor={AREAS[area].cor} />
                      <Text style={styles.cardMeta}>{c.habilidades.join(" · ")}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}

        <Text style={styles.note}>
          Na BNCC do Ensino Médio, as habilidades (códigos EM13…) valem para a 1ª à 3ª série. A divisão por
          série segue o currículo usual das escolas, e a relação entre assuntos e habilidades é uma sugestão
          do ENSINA A.I. Os textos estão resumidos; o texto oficial está em basenacionalcomum.mec.gov.br.
        </Text>
      </View>
    </ScrollView>
  );
}

function Stat({ valor, label }: { valor: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { margin: 16, marginTop: 4, borderRadius: radius.xl, padding: 18 },
  kicker: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.95)", fontWeight: "600", marginTop: 2 },
  series: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.pill,
    padding: 4,
    marginTop: 14,
  },
  serie: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: "center" },
  serieActive: { backgroundColor: "#fff" },
  serieText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  stats: { flexDirection: "row", marginTop: 14 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: "#fff", fontWeight: "900", fontSize: 20 },
  statLabel: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: "center" },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.primaryDark, fontWeight: "800" },
  body: { paddingHorizontal: 16, paddingTop: 18 },
  areaHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaTitle: { color: colors.text, fontWeight: "900", fontSize: 17, marginBottom: 8 },
  areaPct: { fontWeight: "900", marginBottom: 8 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
    overflow: "hidden",
    flexDirection: "row",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
  rowSub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  codes: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  codeChip: {
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  noCode: { color: colors.muted, fontSize: 11, fontStyle: "italic" },
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: {
    color: "#fff",
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
    letterSpacing: 0.4,
  },
  compTag: { color: colors.muted, fontSize: 12, fontWeight: "700", flex: 1 },
  cardPct: { color: colors.primary, fontWeight: "900", marginLeft: "auto" },
  cardText: { color: colors.text, marginTop: 8, lineHeight: 20 },
  cardMeta: { color: colors.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  num: {
    color: "#fff",
    backgroundColor: colors.primaryDark,
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "900",
    overflow: "hidden",
  },
  help: { color: colors.muted, fontSize: 13, marginTop: -4, marginBottom: 10 },
  note: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 18, lineHeight: 17 },
});
