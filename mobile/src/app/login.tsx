import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";
import GradientButton from "../components/GradientButton";
import { useAuth } from "../lib/auth";
import { authStyles as styles } from "../components/authStyles";
import { colors } from "../lib/theme";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) return setErro("Preencha e-mail e senha.");
    setErro(null);
    setEnviando(true);
    try {
      await signIn(email, senha);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Bem-vindo de volta! 👋" subtitle="Entre para continuar seus estudos.">
      <Field
        label="E-mail"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <Field
        label="Senha"
        icon="lock-closed-outline"
        password
        value={senha}
        onChangeText={setSenha}
        placeholder="Sua senha"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={entrar}
      />

      {erro && (
        <View style={styles.erro}>
          <Text style={styles.erroText}>⚠️ {erro}</Text>
        </View>
      )}

      <GradientButton
        title={enviando ? "Entrando…" : "Entrar"}
        onPress={entrar}
        disabled={enviando}
        style={{ marginTop: 8 }}
      />

      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>Ainda não tem conta?</Text>
        <Pressable onPress={() => router.replace("/cadastro")} hitSlop={8}>
          <Text style={styles.link}>Criar conta grátis</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
