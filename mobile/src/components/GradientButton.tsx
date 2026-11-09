import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { gradient, radius, shadow } from "../lib/theme";

type Props = { title: string; onPress: () => void; style?: StyleProp<ViewStyle>; disabled?: boolean };

export default function GradientButton({ title, onPress, style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.wrap, style, { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }]}
    >
      <LinearGradient colors={gradient.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.pill, ...shadow },
  btn: { paddingVertical: 16, paddingHorizontal: 28, borderRadius: radius.pill, alignItems: "center" },
  text: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
});
