import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.primaryDark,
          headerTitleStyle: { fontWeight: "800", color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tecnica/[id]" options={{ title: "" }} />
        <Stack.Screen name="pomodoro" options={{ title: "Modo foco" }} />
        <Stack.Screen name="aula/[id]" options={{ title: "Videoaula" }} />
      </Stack>
    </>
  );
}
