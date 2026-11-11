import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ExameChips from "../../components/ExameChips";
import MateriaChips from "../../components/MateriaChips";
import VideosIndisponiveis from "../../components/VideosIndisponiveis";
import { materiaPorId } from "../../data/conteudos";
import { MATERIAS } from "../../data/materias";
import type { VideoCurado } from "../../lib/api";
import { EXAMES_FOCO, ExameFoco, useExameFoco } from "../../lib/exameFoco";
import { colors, radius, shadow } from "../../lib/theme";
import { useCurados, useVideos } from "../../lib/useVideos";

const TERMO: Record<ExameFoco, string> = {
  enem: "ENEM",
  ssa1: "SSA 1 UPE",
  ssa2: "SSA 2 UPE",
  ssa3: "SSA 3 UPE",
};

function abrir(id: string, title: string, channel: string) {
  router.push({ pathname: "/aula/[id]", params: { id, title, channel } });
}

export default function Aulas() {
  const [materia, setMateria] = useState<string>(MATERIAS[1].id);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState(MATERIAS[1].busca);
  const { exame, setExame } = useExameFoco();
  const { q, exame: exameParam } = useLocalSearchParams<{ q?: string; exame?: string }>();

  // Vindo do painel de progresso: já busca o assunto escolhido, na prova escolhida.
  useEffect(() => {
    if (q) {
      setMateria("");
      setTexto(q);
      setBusca(q);
    }
    if (exameParam && EXAMES_FOCO.some((e) => e.id === exameParam)) setExame(exameParam as ExameFoco);
  }, [q, exameParam, setExame]);

  const { items, loading, error, retry } = useVideos(busca, "aula", exame);
  const curados = useCurados(exame, "aula");

  function buscar() {
    if (texto.trim()) {
      setMateria("");
      setBusca(texto.trim());
    }
  }

  const cabecalho = (
    <View>
      {curados.length > 0 && (
        <View style={{ marginBottom: 18 }}>
          <Text style={styles.section}>
            ⭐ Indicados pelo professor · {EXAMES_FOCO.find((e) => e.id === exame)?.nome}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {curados.map((v) => (
              <Curado key={v.id} v={v} />
            ))}
          </ScrollView>
        </View>
      )}
      <Text style={styles.section}>🔎 Videoaulas para o {EXAMES_FOCO.find((e) => e.id === exame)?.nome}</Text>
      {loading && <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} size="large" />}
      {!loading && error && (
        <View style={{ minHeight: 360 }}>
          <VideosIndisponiveis error={error} query={`${busca} ${TERMO[exame]}`} tipo="aula" onRetry={retry} />
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.search}>
        <Ionicons name="search" size={20} color={colors.primary} />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="O que você quer aprender hoje?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={buscar}
        />
      </View>
      <View style={{ paddingTop: 10 }}>
        <ExameChips value={exame} onChange={setExame} />
      </View>
      <View>
        <MateriaChips
          selected={materia}
          onSelect={(m) => {
            setMateria(m.id);
            setTexto("");
            setBusca(m.busca);
          }}
        />
      </View>

      <FlatList
        data={loading || error ? [] : items}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 20, paddingTop: 6, gap: 18 }}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={{ color: colors.muted, textAlign: "center" }}>Nenhuma aula encontrada.</Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => abrir(item.id, item.title, item.channel)}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
          >
            <View>
              <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
              <View style={styles.play}>
                <Ionicons name="play" size={22} color={colors.primary} />
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.channel}>{item.channel}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function Curado({ v }: { v: VideoCurado }) {
  const materia = v.materia ? materiaPorId[v.materia] : null;
  return (
    <Pressable onPress={() => abrir(v.youtubeId, v.title, v.channel)} style={styles.curado}>
      <Image source={{ uri: v.thumbnail }} style={styles.curadoThumb} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⭐ Professor</Text>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={styles.curadoTitle} numberOfLines={2}>
          {v.title}
        </Text>
        <Text style={styles.channel} numberOfLines={1}>
          {materia ? `${materia.emoji} ${materia.nome}` : v.channel || "YouTube"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 6,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text },
  section: { fontSize: 16, fontWeight: "900", color: colors.text, marginBottom: 10 },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...shadow,
    shadowOpacity: 0.08,
  },
  thumb: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.lilac2 },
  play: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },
  title: { fontSize: 16, fontWeight: "800", color: colors.text, lineHeight: 21 },
  channel: { color: colors.muted, marginTop: 4, fontWeight: "600" },
  curado: {
    width: 230,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  curadoThumb: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.lilac2 },
  curadoTitle: { fontSize: 14, fontWeight: "800", color: colors.text, lineHeight: 18 },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 11 },
});
