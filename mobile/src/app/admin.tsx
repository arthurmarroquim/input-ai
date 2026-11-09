import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { adminDeleteUser, adminListUsers, adminSetRole, User } from "../lib/api";
import { useAuth } from "../lib/auth";
import { colors, radius } from "../lib/theme";

// Confirmação que funciona no celular e na web.
function confirmar(titulo: string, msg: string, acao: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(`${titulo}\n\n${msg}`));
  return new Promise((resolve) =>
    Alert.alert(titulo, msg, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: acao, style: "destructive", onPress: () => resolve(true) },
    ]),
  );
}

export default function Admin() {
  const { user: eu } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const { users: u } = await adminListUsers();
      setUsers(u.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return q ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q)) : users;
  }, [users, busca]);

  const admins = users.filter((u) => u.role === "admin").length;
  const novos7d = users.filter((u) => Date.now() - Date.parse(u.createdAt) < 7 * 86_400_000).length;

  async function alternarPapel(u: User) {
    const novo = u.role === "admin" ? "aluno" : "admin";
    const ok = await confirmar(
      novo === "admin" ? "Tornar administrador?" : "Remover administrador?",
      `${u.name} (${u.email}) ${novo === "admin" ? "poderá gerenciar todos os usuários." : "voltará a ser estudante."}`,
      "Confirmar",
    );
    if (!ok) return;
    try {
      const { user } = await adminSetRole(u.id, novo);
      setUsers((list) => list.map((x) => (x.id === user.id ? user : x)));
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function excluir(u: User) {
    if (
      !(await confirmar(
        "Excluir usuário?",
        `${u.name} (${u.email}) perderá o acesso. Isso não pode ser desfeito.`,
        "Excluir",
      ))
    )
      return;
    try {
      await adminDeleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />;

  return (
    <FlatList
      data={filtrados}
      keyExtractor={(u) => u.id}
      contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 10 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 6 }}>
          <View style={styles.stats}>
            <Stat value={users.length} label="usuários" />
            <Stat value={admins} label="admins" />
            <Stat value={novos7d} label="novos (7 dias)" />
          </View>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.primary} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou e-mail"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={styles.searchInput}
            />
          </View>
          {erro && <Text style={styles.erro}>⚠️ {erro}</Text>}
        </View>
      }
      ListEmptyComponent={
        <Text style={{ color: colors.muted, textAlign: "center" }}>Nenhum usuário encontrado.</Text>
      }
      renderItem={({ item: u }) => {
        const souEu = u.id === eu?.id;
        return (
          <View style={styles.row}>
            <View style={[styles.avatar, u.role === "admin" && { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, u.role === "admin" && { color: "#fff" }]}>
                {u.name[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {u.name} {souEu && <Text style={{ color: colors.muted, fontWeight: "600" }}>(você)</Text>}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {u.email}
              </Text>
              <Text style={styles.meta}>
                {u.role === "admin" ? "🛡️ Admin" : "🎒 Estudante"} · desde{" "}
                {new Date(u.createdAt).toLocaleDateString("pt-BR")}
              </Text>
            </View>
            {!souEu && (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Pressable
                  onPress={() => alternarPapel(u)}
                  style={styles.action}
                  accessibilityLabel={u.role === "admin" ? "Remover administrador" : "Tornar administrador"}
                >
                  <Ionicons
                    name={u.role === "admin" ? "shield" : "shield-outline"}
                    size={18}
                    color={colors.primary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => excluir(u)}
                  style={[styles.action, { backgroundColor: "#FFF0F3" }]}
                  accessibilityLabel="Excluir usuário"
                >
                  <Ionicons name="trash-outline" size={18} color="#C2365B" />
                </Pressable>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "900", color: colors.primaryDark },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2, textAlign: "center" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  searchInput: { flex: 1, paddingVertical: 12, color: colors.text, fontSize: 15 },
  erro: { color: "#B4234A", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.primaryDark, fontWeight: "900", fontSize: 17 },
  name: { fontWeight: "800", color: colors.text, fontSize: 15 },
  email: { color: colors.muted, fontSize: 13 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  action: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
