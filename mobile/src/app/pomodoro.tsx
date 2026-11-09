import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import { useProgress } from "../lib/storage";
import { useTheme } from "../lib/theme";

const MODOS = {
  foco: { label: "Foco", min: 25, frase: "Uma tarefa só. Celular longe. Você consegue! 💪" },
  pausa: { label: "Pausa", min: 5, frase: "Levante, beba água e alongue o corpo. 🧘" },
  longa: { label: "Pausa longa", min: 15, frase: "Você merece! Descanse de verdade. 🌿" },
} as const;
type Modo = keyof typeof MODOS;

export default function Pomodoro() {
  const t = useTheme();
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
  const cor = modo === "foco" ? t.accent : t.success;

  return (
    <View style={[styles.page, { backgroundColor: t.bg }]}>
      <View style={styles.tabs}>
        {(Object.keys(MODOS) as Modo[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => trocar(m)}
            style={[styles.tab, { backgroundColor: m === modo ? cor : t.card, borderColor: t.border }]}
          >
            <Text style={{ color: m === modo ? "#fff" : t.text, fontWeight: "700" }}>{MODOS[m].label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.circle, { borderColor: t.border }]}>
        <Text style={[styles.time, { color: t.text }]} accessibilityLabel={`${mm} minutos e ${ss} segundos`}>
          {mm}:{ss}
        </Text>
        <View style={[styles.bar, { backgroundColor: t.border }]}>
          <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: cor }]} />
        </View>
      </View>

      <Text style={[styles.frase, { color: t.muted }]}>{MODOS[modo].frase}</Text>

      <Pressable onPress={iniciarPausar} style={[styles.btn, { backgroundColor: cor }]}>
        <Text style={styles.btnText}>{rodando ? "Pausar" : restante < total ? "Continuar" : "Começar"}</Text>
      </Pressable>
      <Pressable onPress={() => trocar(modo)}>
        <Text style={{ color: t.muted, padding: 12 }}>Reiniciar</Text>
      </Pressable>

      <Text style={{ color: t.text, marginTop: 8 }}>
        🍅 Pomodoros concluídos hoje nesta sessão: <Text style={{ fontWeight: "800" }}>{ciclos}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", padding: 20 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 28 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  time: { fontSize: 64, fontWeight: "800", fontVariant: ["tabular-nums"] },
  bar: { width: 150, height: 6, borderRadius: 3, overflow: "hidden", marginTop: 8 },
  fill: { height: 6 },
  frase: { textAlign: "center", marginVertical: 24, fontSize: 15, maxWidth: 300 },
  btn: { paddingVertical: 16, paddingHorizontal: 60, borderRadius: 16 },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
