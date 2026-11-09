import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import YouTubePlayer from "../../components/YouTubePlayer";
import { useTheme } from "../../lib/theme";

export default function Aula() {
  const t = useTheme();
  const { id, title, channel } = useLocalSearchParams<{ id: string; title?: string; channel?: string }>();

  return (
    <ScrollView>
      <Stack.Screen options={{ title: "Videoaula" }} />
      <View style={styles.player}>
        <YouTubePlayer videoId={id} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {!!channel && <Text style={{ color: t.muted, marginTop: 4 }}>{channel}</Text>}

        <View style={[styles.tip, { backgroundColor: t.primarySoft }]}>
          <Text style={[styles.tipTitle, { color: t.primary }]}>Como assistir para aprender</Text>
          <Text style={[styles.tipText, { color: t.text }]}>
            1. Tenha um caderno aberto e anote só palavras-chave.{"\n"}
            2. Pause e tente prever o próximo passo antes do professor.{"\n"}
            3. Ao terminar, feche o vídeo e explique o conteúdo em voz alta (técnica Feynman).{"\n"}
            4. Resolva exercícios logo depois — ver não é o mesmo que saber fazer.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push({ pathname: "/tutor", params: { assunto: title } })}
          style={[styles.btn, { backgroundColor: t.primary }]}
        >
          <Text style={styles.btnText}>✨ Tirar dúvida sobre esta aula com o Tutor IA</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  player: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: "800" },
  tip: { padding: 14, borderRadius: 14, marginTop: 16 },
  tipTitle: { fontWeight: "800", marginBottom: 6 },
  tipText: { lineHeight: 22 },
  btn: { padding: 15, borderRadius: 14, alignItems: "center", marginTop: 16 },
  btnText: { color: "#fff", fontWeight: "800", textAlign: "center" },
});
