import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { youtubeSearchUrl } from "../lib/api";
import { useTheme } from "../lib/theme";

type Props = { error: string; query: string; tipo: "short" | "aula"; onRetry: () => void; dark?: boolean };

// Mostrado quando o servidor não consegue buscar vídeos (sem chave do YouTube ou offline).
export default function VideosIndisponiveis({ error, query, tipo, onRetry, dark }: Props) {
  const t = useTheme();
  const color = dark ? "#fff" : t.text;
  return (
    <View style={styles.box}>
      <Text style={[styles.title, { color }]}>Não foi possível carregar os vídeos</Text>
      <Text style={[styles.msg, { color: dark ? "#ddd" : t.muted }]}>{error}</Text>
      <Pressable
        style={[styles.btn, { backgroundColor: t.primary }]}
        onPress={() => Linking.openURL(youtubeSearchUrl(query, tipo))}
      >
        <Text style={styles.btnText}>Abrir no YouTube</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, styles.outline, { borderColor: dark ? "#fff" : t.border }]}
        onPress={onRetry}
      >
        <Text style={[styles.btnText, { color }]}>Tentar de novo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  msg: { textAlign: "center", marginBottom: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, minWidth: 200, alignItems: "center" },
  outline: { backgroundColor: "transparent", borderWidth: 1 },
  btnText: { color: "#fff", fontWeight: "700" },
});
