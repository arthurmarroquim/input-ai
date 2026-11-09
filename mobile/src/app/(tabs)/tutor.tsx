import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
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
import { colors, gradient, radius, shadow } from "../../lib/theme";

const BOAS_VINDAS: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Oi! Eu sou o Tutor do ENSINA A.I ✨\n\n" +
    "- Tire uma **foto** do exercício, do caderno ou do livro e eu reconheço o que está escrito.\n" +
    "- No modo **Dica**, eu te dou pistas para você chegar à resposta sozinho.\n" +
    "- No modo **Explicar**, eu resolvo passo a passo.\n\n" +
    "Também posso montar seu plano de estudos e ensinar técnicas para estudar melhor. Por onde começamos?",
};

const SUGESTOES = [
  "📅 Monte um plano de estudos para minha semana",
  "🧠 Como decorar fórmulas sem esquecer?",
  "👩‍🏫 Me explique a técnica Feynman com um exemplo",
  "❓ Faça 3 perguntas para eu testar o que sei de frações",
];

let nextId = 0;
const uid = () => `${Date.now()}-${nextId++}`;

export default function Tutor() {
  const { assunto, topico, exame } = useLocalSearchParams<{
    assunto?: string;
    topico?: string;
    exame?: string;
  }>();
  const [messages, setMessages] = useState<ChatMessage[]>([BOAS_VINDAS]);
  const [texto, setTexto] = useState("");
  const [imagem, setImagem] = useState<ChatImage | null>(null);
  const [modo, setModo] = useState<TutorMode>("dica");
  const [enviando, setEnviando] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (assunto) setTexto(`Tenho uma dúvida sobre a aula "${assunto}": `);
    else if (topico)
      setTexto(
        `Quero estudar "${topico}"${exame ? ` para o ${exame}` : ""}. Me explique o essencial e depois me faça 3 perguntas para eu testar o que aprendi.`,
      );
  }, [assunto, topico, exame]);

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

  const podeEnviar = !enviando && (!!texto.trim() || !!imagem);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgSoft }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Seletor de modo */}
      <View style={styles.modeBar}>
        {(["dica", "explicar"] as TutorMode[]).map((m) => {
          const ativo = modo === m;
          return (
            <Pressable
              key={m}
              onPress={() => setModo(m)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              style={[styles.modeBtn, ativo && styles.modeBtnActive]}
            >
              <Text style={[styles.modeText, ativo && { color: "#fff" }]}>
                {m === "dica" ? "💡 Dica" : "📖 Explicar"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <Bubble msg={item} />}
        ListFooterComponent={
          <>
            {enviando && (
              <View style={[styles.row, { marginTop: 12 }]}>
                <Avatar />
                <View style={[styles.bubble, styles.bot]}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              </View>
            )}
            {messages.length === 1 && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestTitle}>Experimente perguntar:</Text>
                {SUGESTOES.map((s) => (
                  <Pressable key={s} onPress={() => enviar(s)} style={styles.suggestion}>
                    <Text style={styles.suggestionText}>{s}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            )}
          </>
        }
      />

      {imagem && (
        <View style={styles.preview}>
          <Image source={{ uri: imagem.uri }} style={styles.previewImg} />
          <Text style={{ color: colors.text, flex: 1, fontSize: 13 }}>
            Foto pronta! Escreva sua dúvida ou só envie. 📸
          </Text>
          <Pressable onPress={() => setImagem(null)} accessibilityLabel="Remover foto">
            <Ionicons name="close-circle" size={26} color={colors.muted} />
          </Pressable>
        </View>
      )}

      {/* Barra de digitação */}
      <View style={styles.inputBar}>
        <Pressable onPress={() => escolherImagem("camera")} accessibilityLabel="Tirar foto">
          <LinearGradient colors={gradient.button} style={styles.cameraBtn}>
            <Ionicons name="camera" size={24} color="#fff" />
          </LinearGradient>
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder={modo === "dica" ? "Pergunte e eu te dou uma pista…" : "Pergunte e eu explico…"}
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={() => escolherImagem("galeria")}
            style={styles.galleryBtn}
            accessibilityLabel="Escolher da galeria"
          >
            <Ionicons name="image-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => enviar()}
          disabled={!podeEnviar}
          style={[styles.send, { opacity: podeEnviar ? 1 : 0.35 }]}
          accessibilityLabel="Enviar"
        >
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Avatar() {
  return (
    <LinearGradient colors={gradient.button} style={styles.avatar}>
      <Ionicons name="sparkles" size={14} color="#fff" />
    </LinearGradient>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <LinearGradient
        colors={gradient.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bubble, styles.user]}
      >
        {msg.image && <Image source={{ uri: msg.image.uri }} style={styles.msgImg} />}
        {!!msg.text && <RichText text={msg.text} color={colors.bubbleUserText} />}
      </LinearGradient>
    );
  }
  return (
    <View style={styles.row}>
      <Avatar />
      <View style={[styles.bubble, styles.bot]}>
        <RichText text={msg.text} color={colors.text} />
      </View>
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
    marginHorizontal: 16,
    marginTop: 8,
    padding: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.lilac2,
  },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: "center" },
  modeBtnActive: { backgroundColor: colors.primary, ...shadow },
  modeText: { color: colors.primaryDark, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "84%", padding: 14, borderRadius: 22 },
  user: { alignSelf: "flex-end", borderBottomRightRadius: 6 },
  bot: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
    flexShrink: 1,
    ...shadow,
    shadowOpacity: 0.06,
  },
  msgImg: { width: 220, height: 220, borderRadius: 14, marginBottom: 8 },
  suggestions: { gap: 10, marginTop: 16 },
  suggestTitle: { color: colors.muted, fontWeight: "700", marginLeft: 4 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.lilac2,
  },
  suggestionText: { color: colors.text, fontWeight: "600", flex: 1 },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  previewImg: { width: 48, height: 48, borderRadius: 10 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cameraBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.primarySoft,
    borderRadius: 24,
    minHeight: 48,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  galleryBtn: { padding: 12 },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDark,
  },
});
