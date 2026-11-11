import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import GradientButton from "../components/GradientButton";
import { MATERIAS, materiaPorId } from "../data/conteudos";
import { adminAddCurado, adminDelCurado, ExameVideo, listCurados, VideoCurado } from "../lib/api";
import { colors, radius } from "../lib/theme";

const PROVAS: { id: ExameVideo; nome: string }[] = [
  { id: "enem", nome: "ENEM" },
  { id: "ssa1", nome: "SSA 1" },
  { id: "ssa2", nome: "SSA 2" },
  { id: "ssa3", nome: "SSA 3" },
  { id: "todas", nome: "Todas" },
];
const nomeProva = (e: ExameVideo) => PROVAS.find((p) => p.id === e)?.nome ?? e;

function confirmar(titulo: string, msg: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(`${titulo}\n\n${msg}`));
  return new Promise((resolve) =>
    Alert.alert(titulo, msg, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Remover", style: "destructive", onPress: () => resolve(true) },
    ]),
  );
}

// Administrador indica vídeos do YouTube para cada prova; os alunos veem em "Indicados pelo professor".
export default function AdminVideos() {
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [exame, setExame] = useState<ExameVideo>("enem");
  const [materia, setMateria] = useState<string | null>(null);
  const [lista, setLista] = useState<VideoCurado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(() => {
    listCurados("todas")
      .then(setLista)
      .catch((e: Error) => setErro(e.message));
  }, []);
  useEffect(carregar, [carregar]);

  async function adicionar() {
    if (!url.trim()) return setErro("Cole o link do vídeo do YouTube.");
    setErro(null);
    setOk(null);
    setEnviando(true);
    try {
      const v = await adminAddCurado({ url: url.trim(), titulo: titulo.trim() || undefined, exame, materia });
      setOk(`Adicionado: ${v.title}`);
      setUrl("");
      setTitulo("");
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  async function remover(v: VideoCurado) {
    if (!(await confirmar("Remover indicação?", `"${v.title}" deixa de aparecer para os alunos.`))) return;
    try {
      await adminDelCurado(v.id);
      setLista((l) => l.filter((x) => x.id !== v.id));
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.help}>
        Cole o link de um vídeo do YouTube (aula, resolução de prova ou short). Ele aparece para os alunos em
        Videoaulas e Shorts, na prova escolhida, com o selo ⭐ Professor.
      </Text>

      <Text style={styles.label}>Link do vídeo</Text>
      <View style={styles.box}>
        <Ionicons name="logo-youtube" size={20} color={colors.primary} />
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://www.youtube.com/watch?v=…"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      <Text style={styles.label}>Título (opcional)</Text>
      <View style={styles.box}>
        <Ionicons name="text-outline" size={20} color={colors.primary} />
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Se deixar vazio, usa o título do YouTube"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>

      <Text style={styles.label}>Para qual prova?</Text>
      <View style={styles.chips}>
        {PROVAS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setExame(p.id)}
            style={[styles.chip, exame === p.id && styles.chipOn]}
            accessibilityState={{ selected: exame === p.id }}
          >
            <Text style={[styles.chipText, exame === p.id && { color: "#fff" }]}>{p.nome}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Matéria (opcional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {MATERIAS.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setMateria(materia === m.id ? null : m.id)}
            style={[styles.chip, materia === m.id && styles.chipOn]}
          >
            <Text style={[styles.chipText, materia === m.id && { color: "#fff" }]}>
              {m.emoji} {m.nome}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {erro && <Text style={styles.erro}>⚠️ {erro}</Text>}
      {ok && <Text style={styles.ok}>✅ {ok}</Text>}
      <GradientButton
        title={enviando ? "Adicionando…" : "Adicionar vídeo"}
        onPress={adicionar}
        disabled={enviando}
        style={{ marginTop: 16 }}
      />

      <Text style={[styles.label, { marginTop: 28, fontSize: 17 }]}>Vídeos indicados ({lista.length})</Text>
      {lista.length === 0 && <Text style={styles.help}>Nenhum vídeo indicado ainda.</Text>}
      {lista.map((v) => {
        const m = v.materia ? materiaPorId[v.materia] : null;
        return (
          <View key={v.id} style={styles.item}>
            <Image source={{ uri: v.thumbnail }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {v.title}
              </Text>
              <Text style={styles.itemMeta}>
                {nomeProva(v.exame)}
                {m ? ` · ${m.emoji} ${m.nome}` : ""}
                {v.tipo === "short" ? " · Short" : ""}
              </Text>
            </View>
            <Pressable
              onPress={() => remover(v)}
              style={styles.del}
              accessibilityLabel={`Remover ${v.title}`}
            >
              <Ionicons name="trash-outline" size={18} color="#C2365B" />
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingTop: 6, paddingBottom: 40 },
  help: { color: colors.muted, lineHeight: 20, marginBottom: 8 },
  label: { color: colors.text, fontWeight: "800", marginTop: 14, marginBottom: 6 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.primaryDark, fontWeight: "700" },
  erro: { color: "#B4234A", fontWeight: "600", marginTop: 12 },
  ok: { color: colors.primaryDark, fontWeight: "700", marginTop: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  thumb: { width: 96, height: 54, borderRadius: 8, backgroundColor: colors.lilac2 },
  itemTitle: { color: colors.text, fontWeight: "700" },
  itemMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  del: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFF0F3",
    alignItems: "center",
    justifyContent: "center",
  },
});
