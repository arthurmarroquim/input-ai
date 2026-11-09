import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { askTutor, ChatImage, ChatMessage, TutorMode } from "../../lib/api";
import { Theme, useTheme } from "../../lib/theme";

const BOAS_VINDAS: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Oi! Eu sou o Tutor do Estude A.I. ✨\n\n" +
    "- Tire uma **foto** do exercício, do caderno ou do livro e eu reconheço o que está escrito.\n" +
    "- No modo **Dica**, eu te dou pistas para você chegar à resposta sozinho.\n" +
    "- No modo **Explicar**, eu resolvo passo a passo.\n\n" +
    "Também posso montar seu plano de estudos e ensinar técnicas para estudar melhor. Por onde começamos?",
};

const SUGESTOES = [
  "Monte um plano de estudos para minha semana",
  "Como decorar fórmulas sem esquecer?",
  "Me explique a técnica Feynman com um exemplo",
  "Faça 3 perguntas para eu testar o que sei de frações",
];

let nextId = 0;
const uid = () => `${Date.now()}-${nextId++}`;

export default function Tutor() {
  const t = useTheme();
  const { assunto } = useLocalSearchParams<{ assunto?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([BOAS_VINDAS]);
  const [texto, setTexto] = useState("");
  const [imagem, setImagem] = useState<ChatImage | null>(null);
  const [modo, setModo] = useState<TutorMode>("dica");
  const [enviando, setEnviando] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (assunto) setTexto(`Tenho uma dúvida sobre a aula "${assunto}": `);
  }, [assunto]);

  async function escolherImagem(origem: "camera" | "galeria") {
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      base64: true,
      quality: 0.5, // reduz o tamanho para envio rápido
      allowsEditing: true, // permite recortar só o exercício
    };
    let result: ImagePicker.ImagePickerResult;
    if (origem === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Câmera bloqueada",
          "Permita o acesso à câmera nas configurações para fotografar exercícios.",
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync(opts);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(opts);
    }
    const asset = result.canceled ? null : result.assets[0];
    if (asset?.base64) {
      setImagem({ base64: asset.base64, mediaType: asset.mimeType || "image/jpeg", uri: asset.uri });
    }
  }

  async function enviar(conteudo?: string) {
    const msgTexto = (conteudo ?? texto).trim();
    if ((!msgTexto && !imagem) || enviando) return;

    const nova: ChatMessage = { id: uid(), role: "user", text: msgTexto, image: imagem ?? undefined };
    const historico = [...messages, nova];
    setMessages(historico);
    setTexto("");
    setImagem(null);
    setEnviando(true);
    try {
      // A mensagem de boas-vindas é só local; não vai para a IA.
      const reply = await askTutor(
        historico.filter((m) => m.id !== "welcome"),
        modo,
      );
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.modeBar, { backgroundColor: t.card, borderColor: t.border }]}>
        {(["dica", "explicar"] as TutorMode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setModo(m)}
            accessibilityRole="button"
            accessibilityState={{ selected: modo === m }}
            style={[styles.modeBtn, modo === m && { backgroundColor: t.primary }]}
          >
            <Text style={{ color: modo === m ? "#fff" : t.text, fontWeight: "700" }}>
              {m === "dica" ? "💡 Dica" : "📖 Explicar"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <Bubble msg={item} t={t} />}
        ListFooterComponent={
          <>
            {enviando && (
              <View
                style={[styles.bubble, styles.bot, { backgroundColor: t.bubbleBot, borderColor: t.border }]}
              >
                <ActivityIndicator color={t.primary} />
              </View>
            )}
            {messages.length === 1 && (
              <View style={styles.suggestions}>
                {SUGESTOES.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => enviar(s)}
                    style={[styles.suggestion, { borderColor: t.primary, backgroundColor: t.primarySoft }]}
                  >
                    <Text style={{ color: t.primary, fontWeight: "600" }}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        }
      />

      {imagem && (
        <View style={[styles.preview, { backgroundColor: t.card, borderColor: t.border }]}>
          <Image source={{ uri: imagem.uri }} style={styles.previewImg} />
          <Text style={{ color: t.text, flex: 1 }}>
            Foto pronta para enviar. Escreva sua dúvida (opcional).
          </Text>
          <Pressable onPress={() => setImagem(null)} accessibilityLabel="Remover foto">
            <Ionicons name="close-circle" size={24} color={t.muted} />
          </Pressable>
        </View>
      )}

      <View style={[styles.inputBar, { backgroundColor: t.card, borderColor: t.border }]}>
        <Pressable
          onPress={() => escolherImagem("camera")}
          style={styles.iconBtn}
          accessibilityLabel="Tirar foto"
        >
          <Ionicons name="camera" size={26} color={t.primary} />
        </Pressable>
        <Pressable
          onPress={() => escolherImagem("galeria")}
          style={styles.iconBtn}
          accessibilityLabel="Escolher da galeria"
        >
          <Ionicons name="image" size={24} color={t.primary} />
        </Pressable>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder={
            modo === "dica" ? "Pergunte e eu te dou uma pista…" : "Pergunte e eu explico passo a passo…"
          }
          placeholderTextColor={t.muted}
          style={[styles.input, { color: t.text, backgroundColor: t.bg }]}
          multiline
        />
        <Pressable
          onPress={() => enviar()}
          disabled={enviando || (!texto.trim() && !imagem)}
          style={[
            styles.send,
            { backgroundColor: t.primary, opacity: enviando || (!texto.trim() && !imagem) ? 0.4 : 1 },
          ]}
          accessibilityLabel="Enviar"
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ msg, t }: { msg: ChatMessage; t: Theme }) {
  const isUser = msg.role === "user";
  return (
    <View
      style={[
        styles.bubble,
        isUser
          ? [styles.user, { backgroundColor: t.bubbleUser }]
          : [styles.bot, { backgroundColor: t.bubbleBot, borderColor: t.border }],
      ]}
    >
      {msg.image && <Image source={{ uri: msg.image.uri }} style={styles.msgImg} />}
      {!!msg.text && <RichText text={msg.text} color={isUser ? t.bubbleUserText : t.text} />}
    </View>
  );
}

// Renderiza **negrito** de forma simples (o tutor é instruído a usar só isso e listas).
function RichText({ text, color }: { text: string; color: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={{ color, fontSize: 15, lineHeight: 22 }} selectable>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <Text key={i} style={{ fontWeight: "800" }}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  modeBar: {
    flexDirection: "row",
    margin: 12,
    marginBottom: 0,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  bubble: { maxWidth: "88%", padding: 12, borderRadius: 16 },
  user: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bot: { alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: 1 },
  msgImg: { width: 220, height: 220, borderRadius: 10, marginBottom: 8 },
  suggestions: { gap: 8, marginTop: 8 },
  suggestion: { padding: 12, borderRadius: 12, borderWidth: 1 },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewImg: { width: 48, height: 48, borderRadius: 8 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 4, padding: 8, borderTopWidth: 1 },
  iconBtn: { padding: 8 },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 18,
    fontSize: 15,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});
