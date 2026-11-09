import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const t = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.card },
          headerTintColor: t.text,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tecnica/[id]" options={{ title: "Técnica de estudo" }} />
        <Stack.Screen name="pomodoro" options={{ title: "Pomodoro" }} />
        <Stack.Screen name="aula/[id]" options={{ title: "Videoaula" }} />
      </Stack>
    </>
  );
}
