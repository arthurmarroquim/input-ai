import { useIsFocused } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExameChips from "../../components/ExameChips";
import MateriaChips from "../../components/MateriaChips";
import VideosIndisponiveis from "../../components/VideosIndisponiveis";
import YouTubePlayer from "../../components/YouTubePlayer";
import { MATERIAS } from "../../data/materias";
import { Video } from "../../lib/api";
import { useExameFoco } from "../../lib/exameFoco";
import { useCurados, useVideos } from "../../lib/useVideos";

// Feed vertical de vídeos curtos: deslize para cima para o próximo.
export default function Shorts() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const [materia, setMateria] = useState(MATERIAS[0]);
  const [height, setHeight] = useState(0);
  const [ativo, setAtivo] = useState(0);
  const { exame, setExame } = useExameFoco();
  const busca = useVideos(materia.busca, "short", exame);
  const curados = useCurados(exame, "short");
  const { loading, error, retry } = busca;
  // Shorts indicados pelo professor vêm primeiro; depois os da busca (sem repetir).
  const items: Video[] = [
    ...curados.map((c) => ({
      id: c.youtubeId,
      title: `⭐ ${c.title}`,
      channel: c.channel || "Indicado pelo professor",
      thumbnail: c.thumbnail,
    })),
    ...busca.items.filter((v) => !curados.some((c) => c.youtubeId === v.id)),
  ];

  const onViewable = useRef(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    if (viewableItems[0]?.index != null) setAtivo(viewableItems[0].index);
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <View style={{ height, backgroundColor: "#000" }}>
        {index === ativo && focused ? (
          <YouTubePlayer videoId={item.id} autoplay />
        ) : (
          <Image source={{ uri: item.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        <View style={[styles.caption, { paddingBottom: 16 }]} pointerEvents="none">
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.channel}>@{item.channel}</Text>
        </View>
      </View>
    ),
    [height, ativo, focused],
  );

  return (
    <View style={styles.page} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {loading && items.length === 0 ? (
        <ActivityIndicator color="#fff" size="large" style={{ flex: 1 }} />
      ) : error && items.length === 0 ? (
        <View style={{ flex: 1, paddingTop: insets.top + 56 }}>
          <VideosIndisponiveis
            error={error}
            query={`${materia.busca} ${exame === "enem" ? "ENEM" : `SSA ${exame.slice(3)} UPE`}`}
            tipo="short"
            onRetry={retry}
            dark
          />
        </View>
      ) : items.length === 0 ? (
        <Text style={[styles.empty, { paddingTop: insets.top + 80 }]}>Nenhum vídeo encontrado.</Text>
      ) : (
        height > 0 && (
          <FlatList
            key={`${materia.id}-${exame}`}
            data={items}
            keyExtractor={(v) => v.id}
            renderItem={renderItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
            windowSize={3}
          />
        )
      )}
      <View style={[styles.top, { paddingTop: insets.top }]}>
        <MateriaChips
          selected={materia.id}
          onSelect={(m) => {
            setMateria(m);
            setAtivo(0);
          }}
          dark
        />
        <ExameChips
          value={exame}
          onChange={(e) => {
            setExame(e);
            setAtivo(0);
          }}
          dark
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000" },
  top: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },
  channel: { color: "#ddd", marginTop: 4 },
  empty: { color: "#fff", textAlign: "center" },
});
