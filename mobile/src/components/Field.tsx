import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius } from "../lib/theme";

type Props = TextInputProps & {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  password?: boolean;
};

// Campo de formulário com ícone; em senhas, tem botão de mostrar/esconder.
export default function Field({ label, icon, password, style, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.boxFocused]}>
        <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.muted} />
        <TextInput
          {...rest}
          secureTextEntry={password && !visible}
          placeholderTextColor={colors.muted}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, Platform.OS === "web" && ({ outlineStyle: "none" } as object), style]}
        />
        {password && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            accessibilityLabel={visible ? "Esconder senha" : "Mostrar senha"}
          >
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: "700", marginBottom: 6, marginLeft: 4 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: "transparent",
  },
  boxFocused: { borderColor: colors.primaryLight, backgroundColor: colors.bg },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
});
