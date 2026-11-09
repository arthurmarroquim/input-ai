import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { colors, shadow } from "../../lib/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Ícone da aba: fica dentro de uma "pílula" lilás quando a aba está ativa.
const icon =
  (name: IconName) =>
  ({ focused }: { focused: boolean }) => (
    <View style={[styles.pill, focused && { backgroundColor: colors.primarySoft }]}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as IconName)}
        color={focused ? colors.primary : colors.muted}
        size={20}
      />
    </View>
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
        tabBarStyle: styles.bar,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontWeight: "800", fontSize: 22, color: colors.text },
        headerTitleAlign: "left",
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início", headerShown: false, tabBarIcon: icon("home") }} />
      <Tabs.Screen
        name="shorts"
        options={{ title: "Shorts", headerShown: false, tabBarIcon: icon("play-circle") }}
      />
      <Tabs.Screen
        name="aulas"
        options={{ title: "Aulas", headerTitle: "Videoaulas 🎓", tabBarIcon: icon("school") }}
      />
      <Tabs.Screen
        name="tutor"
        options={{ title: "Tutor IA", headerTitle: "Tutor IA ✨", tabBarIcon: icon("sparkles") }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", headerTitle: "Meu perfil", tabBarIcon: icon("person") }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadow,
  },
  pill: { width: 48, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
