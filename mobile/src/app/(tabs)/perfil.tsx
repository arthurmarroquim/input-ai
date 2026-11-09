import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TECNICAS } from "../../data/tecnicas";
import { useAuth } from "../../lib/auth";
import { streak, useProgress } from "../../lib/storage";
import { colors, gradient, radius, shadow } from "../../lib/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function Perfil() {
  const { user, signOut } = useAuth();
  const { progress } = useProgress();
  if (!user) return null;
  const iniciais = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  function sair() {
    if (Platform.OS === "web") return void signOut();
    Alert.alert("Sair da conta?", "Você precisará entrar de novo com e-mail e senha.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.card, shadow]}>
        <LinearGradient colors={gradient.button} style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciais || "🙂"}</Text>
        </LinearGradient>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.badge, user.role === "admin" && { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, user.role === "admin" && { color: "#fff" }]}>
            {user.role === "admin" ? "🛡️ Administrador" : "🎒 Estudante"}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat value={`🔥 ${streak(progress.studyDays)}`} label="dias seguidos" />
        <Stat value={`${progress.focusMinutes}`} label="min de foco" />
        <Stat value={`${progress.learned.length}/${TECNICAS.length}`} label="técnicas" />
      </View>

      {user.role === "admin" && (
        <Item
          icon="shield-checkmark"
          label="Painel do administrador"
          sub="Usuários e permissões"
          onPress={() => router.push("/admin")}
          strong
        />
      )}
      <Item icon="key-outline" label="Trocar senha" onPress={() => router.push("/senha")} />
      <Item icon="log-out-outline" label="Sair da conta" onPress={sair} danger />
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Item(props: {
  icon: IconName;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
  strong?: boolean;
}) {
  const color = props.danger ? "#C2365B" : props.strong ? "#fff" : colors.primary;
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.item,
        props.strong && { backgroundColor: colors.primary },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.itemIcon, props.strong && { backgroundColor: "rgba(255,255,255,0.22)" }]}>
        <Ionicons name={props.icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.itemLabel,
            { color: props.danger ? "#C2365B" : props.strong ? "#fff" : colors.text },
          ]}
        >
          {props.label}
        </Text>
        {props.sub && (
          <Text style={{ color: props.strong ? "rgba(255,255,255,0.85)" : colors.muted }}>{props.sub}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={props.strong ? "#fff" : colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingTop: 8, gap: 12 },
  card: { alignItems: "center", backgroundColor: colors.card, borderRadius: radius.xl, padding: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "900" },
  name: { fontSize: 22, fontWeight: "900", color: colors.text, marginTop: 12 },
  email: { color: colors.muted, marginTop: 2 },
  badge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  badgeText: { color: colors.primaryDark, fontWeight: "800" },
  stats: { flexDirection: "row", gap: 10, marginBottom: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "900", color: colors.text },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: { fontWeight: "800", fontSize: 16 },
});
