import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { youtubeSearchUrl } from "../lib/api";
import { colors, radius } from "../lib/theme";
import GradientButton from "./GradientButton";

type Props = { error: string; query: string; tipo: "short" | "aula"; onRetry: () => void; dark?: boolean };

// Mostrado quando o servidor não consegue buscar vídeos (sem chave do YouTube ou offline).
export default function VideosIndisponiveis({ error, query, tipo, onRetry, dark }: Props) {
  const color = dark ? "#fff" : colors.text;
  return (
    <View style={styles.box}>
      <Text style={styles.emoji}>📺</Text>
      <Text style={[styles.title, { color }]}>Ops! Os vídeos não carregaram</Text>
      <Text style={[styles.msg, { color: dark ? "#ddd" : colors.muted }]}>{error}</Text>
      <GradientButton
        title="Abrir no YouTube"
        onPress={() => Linking.openURL(youtubeSearchUrl(query, tipo))}
        style={{ minWidth: 220 }}
      />
      <Pressable style={[styles.outline, { borderColor: dark ? "#fff" : colors.lilac2 }]} onPress={onRetry}>
        <Text style={[styles.outlineText, { color: dark ? "#fff" : colors.primaryDark }]}>
          Tentar de novo
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emoji: { fontSize: 48 },
  title: { fontSize: 19, fontWeight: "800", textAlign: "center" },
  msg: { textAlign: "center", marginBottom: 8, lineHeight: 20 },
  outline: {
    paddingVertical: 14,
    borderRadius: radius.pill,
    borderWidth: 2,
    minWidth: 220,
    alignItems: "center",
  },
  outlineText: { fontWeight: "800" },
});
