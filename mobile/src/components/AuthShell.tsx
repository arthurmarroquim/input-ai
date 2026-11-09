import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradient, radius } from "../lib/theme";
import Blobs from "./Blobs";

// Moldura das telas de login e cadastro: topo lilás com a marca e um cartão branco.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={gradient.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 36 }]}
        >
          <Blobs />
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            accessibilityLabel="Logo Ensina Aí"
          />
          <Text style={styles.brand}>ENSINA A.I</Text>
          <Text style={styles.tagline}>Aprenda a estudar do seu jeito ✨</Text>
        </LinearGradient>
        <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingBottom: 56, overflow: "hidden" },
  logo: { width: 124, height: 124, borderRadius: 62, borderWidth: 4, borderColor: "rgba(255,255,255,0.35)" },
  brand: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: 14,
    letterSpacing: 0.5,
  },
  tagline: { color: "rgba(255,255,255,0.9)", fontSize: 15, marginTop: 4, fontWeight: "600" },
  card: {
    flex: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -28,
    padding: 24,
  },
  title: { fontSize: 26, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: 22, fontSize: 15 },
});
