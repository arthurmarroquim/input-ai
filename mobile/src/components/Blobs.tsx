import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

// Formas decorativas magenta/turquesa, como as da identidade visual do ENSINA A.I.
export default function Blobs() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#E6149A", "#7A1180"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.blob,
          { width: 180, height: 150, top: -60, right: -50, borderRadius: 90, opacity: 0.55 },
        ]}
      />
      <LinearGradient
        colors={["#45BCD6", "#7A1180"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.blob,
          { width: 120, height: 100, bottom: -30, left: -40, borderRadius: 60, opacity: 0.45 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({ blob: { position: "absolute", transform: [{ rotate: "-20deg" }] } });
