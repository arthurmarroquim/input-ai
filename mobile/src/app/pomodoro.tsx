import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "../components/GradientButton";
import { useProgress } from "../lib/storage";
import { colors, gradient, radius, shadow } from "../lib/theme";

const MODOS = {
  foco: { label: "Foco", min: 25, frase: "Uma tarefa só. Celular longe. Você consegue! 💪" },
  pausa: { label: "Pausa", min: 5, frase: "Levante, beba água e alongue o corpo. 🧘" },
  longa: { label: "Pausa longa", min: 15, frase: "Você merece! Descanse de verdade. 🌿" },
} as const;
type Modo = keyof typeof MODOS;

export default function Pomodoro() {
  const { addFocusSession } = useProgress();
  const [modo, setModo] = useState<Modo>("foco");
  const [restante, setRestante] = useState<number>(MODOS.foco.min * 60);
  const [rodando, setRodando] = useState(false);
  const [ciclos, setCiclos] = useState(0);
  const fimRef = useRef<number | null>(null);

  // O tempo é calculado a partir do horário de término: continua certo mesmo se o app pausar.
  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => {
      const s = Math.max(0, Math.round(((fimRef.current ?? Date.now()) - Date.now()) / 1000));
      setRestante(s);
      if (s === 0) {
        clearInterval(id);
        terminar();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando]);

  function trocar(m: Modo) {
    setRodando(false);
    fimRef.current = null;
    setModo(m);
    setRestante(MODOS[m].min * 60);
  }

  function iniciarPausar() {
    if (rodando) {
      setRodando(false);
    } else {
      fimRef.current = Date.now() + restante * 1000;
      setRodando(true);
    }
  }

  function terminar() {
    setRodando(false);
    Vibration.vibrate([0, 400, 200, 400]);
    if (modo === "foco") {
      addFocusSession(MODOS.foco.min);
      const n = ciclos + 1;
      setCiclos(n);
      trocar(n % 4 === 0 ? "longa" : "pausa");
    } else {
      trocar("foco");
    }
  }

  const mm = String(Math.floor(restante / 60)).padStart(2, "0");
  const ss = String(restante % 60).padStart(2, "0");
  const total = MODOS[modo].min * 60;
  const pct = 1 - restante / total;

  return (
    <View style={styles.page}>
      <View style={styles.tabs}>
        {(Object.keys(MODOS) as Modo[]).map((m) => (
          <Pressable key={m} onPress={() => trocar(m)} style={[styles.tab, m === modo && styles.tabActive]}>
            <Text style={[styles.tabText, m === modo && { color: "#fff" }]}>{MODOS[m].label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.outer}>
        <LinearGradient
          colors={gradient.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <Text style={styles.modeLabel}>{MODOS[modo].label.toUpperCase()}</Text>
          <Text style={styles.time} accessibilityLabel={`${mm} minutos e ${ss} segundos`}>
            {mm}:{ss}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.frase}>{MODOS[modo].frase}</Text>

      <GradientButton
        title={rodando ? "⏸  Pausar" : restante < total ? "▶  Continuar" : "▶  Começar"}
        onPress={iniciarPausar}
        style={{ minWidth: 240 }}
      />
      <Pressable onPress={() => trocar(modo)}>
        <Text style={styles.reset}>↺ Reiniciar</Text>
      </Pressable>

      <View style={styles.counter}>
        <Text style={{ fontSize: 22 }}>{ciclos > 0 ? "🍅".repeat(Math.min(ciclos, 8)) : "🍅"}</Text>
        <Text style={styles.counterText}>
          {ciclos === 0
            ? "Seu primeiro pomodoro te espera!"
            : `${ciclos} pomodoro${ciclos > 1 ? "s" : ""} nesta sessão`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", padding: 20, backgroundColor: colors.bg },
  tabs: {
    flexDirection: "row",
    padding: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    marginBottom: 32,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.primaryDark, fontWeight: "800" },
  outer: { padding: 14, borderRadius: 160, backgroundColor: colors.primarySoft, ...shadow },
  circle: { width: 250, height: 250, borderRadius: 125, alignItems: "center", justifyContent: "center" },
  modeLabel: { color: "rgba(255,255,255,0.85)", fontWeight: "800", letterSpacing: 2, fontSize: 12 },
  time: { color: "#fff", fontSize: 64, fontWeight: "900", fontVariant: ["tabular-nums"] },
  bar: {
    width: 140,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  fill: { height: 6, backgroundColor: "#fff" },
  frase: {
    textAlign: "center",
    marginVertical: 28,
    fontSize: 15,
    maxWidth: 300,
    color: colors.muted,
    lineHeight: 21,
  },
  reset: { color: colors.primary, padding: 14, fontWeight: "700" },
  counter: {
    marginTop: 12,
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.bgSoft,
    padding: 14,
    borderRadius: radius.md,
  },
  counterText: { color: colors.text, fontWeight: "600" },
});
