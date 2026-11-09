import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../lib/auth";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AuthProvider>
  );
}

function RootStack() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: "800", color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* Sem login: só as telas de entrada */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Com login: o app */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tecnica/[id]" options={{ title: "" }} />
        <Stack.Screen name="pomodoro" options={{ title: "Modo foco" }} />
        <Stack.Screen name="aula/[id]" options={{ title: "Videoaula" }} />
        <Stack.Screen name="senha" options={{ title: "Trocar senha" }} />
        <Stack.Protected guard={user?.role === "admin"}>
          <Stack.Screen name="admin" options={{ title: "Painel do administrador" }} />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
}
