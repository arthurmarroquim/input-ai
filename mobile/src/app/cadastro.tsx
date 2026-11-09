import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";
import GradientButton from "../components/GradientButton";
import { useAuth } from "../lib/auth";
import { colors } from "../lib/theme";
import { authStyles as styles } from "../components/authStyles";

// Mesmas regras do servidor, para avisar antes de enviar.
function validar(nome: string, email: string, senha: string, confirma: string) {
  if (nome.trim().length < 2) return "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "E-mail inválido.";
  if (senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return "Use letras e números na senha.";
  if (senha !== confirma) return "As senhas não são iguais.";
  return null;
}

export default function Cadastro() {
  const { signUp } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const forca = [senha.length >= 8, /[A-Za-z]/.test(senha) && /\d/.test(senha), senha.length >= 12].filter(
    Boolean,
  ).length;

  async function criar() {
    const invalido = validar(nome, email, senha, confirma);
    if (invalido) return setErro(invalido);
    setErro(null);
    setEnviando(true);
    try {
      await signUp(nome, email, senha);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Crie sua conta 🚀" subtitle="Leva menos de um minuto.">
      <Field
        label="Nome"
        icon="person-outline"
        value={nome}
        onChangeText={setNome}
        placeholder="Como quer ser chamado?"
        autoComplete="name"
        textContentType="name"
      />
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
      />
      <Field
        label="Senha"
        icon="lock-closed-outline"
        password
        value={senha}
        onChangeText={setSenha}
        placeholder="Mínimo 8 caracteres, com letras e números"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      {senha.length > 0 && (
        <View style={{ flexDirection: "row", gap: 6, marginTop: -6, marginBottom: 14, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: i < forca ? colors.primary : colors.lilac2,
              }}
            />
          ))}
          <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 4 }}>
            {["fraca", "fraca", "boa", "forte"][forca]}
          </Text>
        </View>
      )}
      <Field
        label="Confirme a senha"
        icon="shield-checkmark-outline"
        password
        value={confirma}
        onChangeText={setConfirma}
        placeholder="Digite a senha de novo"
        autoComplete="new-password"
        onSubmitEditing={criar}
      />

      {erro && (
        <View style={styles.erro}>
          <Text style={styles.erroText}>⚠️ {erro}</Text>
        </View>
      )}

      <GradientButton
        title={enviando ? "Criando…" : "Criar conta"}
        onPress={criar}
        disabled={enviando}
        style={{ marginTop: 8 }}
      />

      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>Já tem conta?</Text>
        <Pressable onPress={() => router.replace("/login")} hitSlop={8}>
          <Text style={styles.link}>Entrar</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
