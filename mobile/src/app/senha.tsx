import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { authStyles as styles } from "../components/authStyles";
import Field from "../components/Field";
import GradientButton from "../components/GradientButton";
import { changePassword } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function TrocarSenha() {
  const { updateToken } = useAuth();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function salvar() {
    if (nova !== confirma) return setErro("As senhas novas não são iguais.");
    setErro(null);
    setEnviando(true);
    try {
      const { token } = await changePassword(atual, nova);
      await updateToken(token); // as outras sessões são encerradas pelo servidor
      setOk(true);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Field
        label="Senha atual"
        icon="lock-closed-outline"
        password
        value={atual}
        onChangeText={setAtual}
        autoComplete="current-password"
      />
      <Field
        label="Nova senha"
        icon="key-outline"
        password
        value={nova}
        onChangeText={setNova}
        placeholder="Mínimo 8 caracteres, com letras e números"
        autoComplete="new-password"
      />
      <Field
        label="Confirme a nova senha"
        icon="shield-checkmark-outline"
        password
        value={confirma}
        onChangeText={setConfirma}
        autoComplete="new-password"
      />
      {erro && (
        <View style={styles.erro}>
          <Text style={styles.erroText}>⚠️ {erro}</Text>
        </View>
      )}
      {ok && (
        <View style={styles.ok}>
          <Text style={styles.okText}>✅ Senha alterada! Outros aparelhos foram desconectados.</Text>
        </View>
      )}
      <GradientButton
        title={enviando ? "Salvando…" : "Salvar nova senha"}
        onPress={salvar}
        disabled={enviando || ok}
      />
    </ScrollView>
  );
}
