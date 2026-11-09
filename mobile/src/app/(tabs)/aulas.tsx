import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
import { useTheme } from "../../lib/theme";
import { useVideos } from "../../lib/useVideos";

export default function Aulas() {
  const t = useTheme();
  const [materia, setMateria] = useState<string>(MATERIAS[1].id);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState(MATERIAS[1].busca);
  const { items, loading, error, retry } = useVideos(busca, "aula");

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.search, { backgroundColor: t.card, borderColor: t.border }]}>
        <Ionicons name="search" size={18} color={t.muted} />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Busque um assunto (ex.: equação do 2º grau)"
          placeholderTextColor={t.muted}
          style={[styles.input, { color: t.text }]}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (texto.trim()) {
              setMateria("");
              setBusca(texto.trim());
            }
          }}
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
        <ActivityIndicator style={{ marginTop: 40 }} color={t.primary} size="large" />
      ) : error ? (
        <VideosIndisponiveis error={error} query={busca} tipo="aula" onRetry={retry} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 14 }}
          ListEmptyComponent={
            <Text style={{ color: t.muted, textAlign: "center" }}>Nenhuma aula encontrada.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/aula/[id]",
                  params: { id: item.id, title: item.title, channel: item.channel },
                })
              }
              style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
              <View style={{ padding: 12 }}>
                <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={{ color: t.muted, marginTop: 2 }}>{item.channel}</Text>
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
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  thumb: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  title: { fontSize: 16, fontWeight: "700" },
});
