import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../lib/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const icon =
  (name: IconName) =>
  ({ color, size }: { color: unknown; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
        headerStyle: { backgroundColor: t.card },
        headerTintColor: t.text,
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", headerTitle: "Estude A.I.", tabBarIcon: icon("home") }}
      />
      <Tabs.Screen
        name="shorts"
        options={{ title: "Shorts", headerShown: false, tabBarIcon: icon("play-circle") }}
      />
      <Tabs.Screen
        name="aulas"
        options={{ title: "Aulas", headerTitle: "Videoaulas", tabBarIcon: icon("school") }}
      />
      <Tabs.Screen
        name="tutor"
        options={{ title: "Tutor IA", headerTitle: "Tutor IA", tabBarIcon: icon("sparkles") }}
      />
    </Tabs>
  );
}
