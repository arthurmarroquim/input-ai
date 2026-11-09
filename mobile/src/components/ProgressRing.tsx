import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  stroke?: number;
  dominado: number; // 0..1
  estudando: number; // 0..1
  label: string;
  sub?: string;
  track?: string;
  colorDone?: string;
  colorDoing?: string;
  textColor?: string;
};

// Anel com duas camadas: dominado (cor cheia) e estudando (cor clara) logo em seguida.
export default function ProgressRing({
  size = 150,
  stroke = 14,
  dominado,
  estudando,
  label,
  sub,
  track = "rgba(255,255,255,0.18)",
  colorDone = "#FFFFFF",
  colorDoing = "rgba(255,255,255,0.5)",
  textColor = "#FFFFFF",
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const done = Math.max(0, Math.min(1, dominado));
  const doing = Math.max(0, Math.min(1 - done, estudando));
  const center = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={center} cy={center} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {doing > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={colorDoing}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c * (done + doing)} ${c}`}
            strokeLinecap="round"
          />
        )}
        {done > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={colorDone}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c * done} ${c}`}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {sub && <Text style={[styles.sub, { color: textColor }]}>{sub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  label: { fontSize: 34, fontWeight: "900" },
  sub: { fontSize: 12, fontWeight: "700", opacity: 0.85, marginTop: -2 },
});
