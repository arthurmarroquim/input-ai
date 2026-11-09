import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MateriaChips from "../../components/MateriaChips";
import VideosIndisponiveis from "../../components/VideosIndisponiveis";
import { MATERIAS } from "../../data/materias";
import { colors, radius, shadow } from "../../lib/theme";
import { useVideos } from "../../lib/useVideos";

export default function Aulas() {
  const [materia, setMateria] = useState<string>(MATERIAS[1].id);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState(MATERIAS[1].busca);
  const { q } = useLocalSearchParams<{ q?: string }>();

  // Vindo do painel de progresso: já busca o assunto escolhido.
  useEffect(() => {
    if (q) {
      setMateria("");
      setTexto(q);
      setBusca(q);
    }
  }, [q]);
  const { items, loading, error, retry } = useVideos(busca, "aula");

  function buscar() {
    if (texto.trim()) {
      setMateria("");
      setBusca(texto.trim());
    }
  }

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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
      ) : error ? (
        <VideosIndisponiveis error={error} query={busca} tipo="aula" onRetry={retry} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: 20, paddingTop: 6, gap: 18 }}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center" }}>Nenhuma aula encontrada.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/aula/[id]",
                  params: { id: item.id, title: item.title, channel: item.channel },
                })
              }
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
      )}
    </View>
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
});
