import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradient, radius } from "../lib/theme";

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
          <View style={styles.logo}>
            <Text style={{ fontSize: 34 }}>📚</Text>
          </View>
          <Text style={styles.brand}>Estude A.I.</Text>
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
  hero: { alignItems: "center", paddingBottom: 56 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { color: "#fff", fontSize: 30, fontWeight: "900", marginTop: 12 },
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
