import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import GradientButton from "../../components/GradientButton";
import YouTubePlayer from "../../components/YouTubePlayer";
import { colors, radius } from "../../lib/theme";

const DICAS = [
  "Tenha um caderno aberto e anote só palavras-chave.",
  "Pause e tente prever o próximo passo antes do professor.",
  "Ao terminar, feche o vídeo e explique o conteúdo em voz alta (técnica Feynman).",
  "Resolva exercícios logo depois — ver não é o mesmo que saber fazer.",
];

export default function Aula() {
  const { id, title, channel } = useLocalSearchParams<{ id: string; title?: string; channel?: string }>();

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: "Videoaula" }} />
      <View style={styles.playerWrap}>
        <View style={styles.player}>
          <YouTubePlayer videoId={id} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {!!channel && <Text style={styles.channel}>{channel}</Text>}

        <View style={styles.tip}>
          <Text style={styles.tipTitle}>🎯 Como assistir para aprender</Text>
          {DICAS.map((d, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.dot}>
                <Text style={styles.dotText}>{i + 1}</Text>
              </View>
              <Text style={styles.tipText}>{d}</Text>
            </View>
          ))}
        </View>

        <GradientButton
          title="✨ Tirar dúvida com o Tutor IA"
          onPress={() => router.push({ pathname: "/tutor", params: { assunto: title } })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  playerWrap: { paddingHorizontal: 16, paddingTop: 4 },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  body: { padding: 20 },
  title: { fontSize: 20, fontWeight: "900", color: colors.text, lineHeight: 26 },
  channel: { color: colors.muted, marginTop: 4, fontWeight: "600" },
  tip: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    marginVertical: 20,
    gap: 10,
  },
  tipTitle: { fontWeight: "900", color: colors.primaryDark, fontSize: 16, marginBottom: 2 },
  tipRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  tipText: { flex: 1, color: colors.text, lineHeight: 21 },
});
