import type { Serie } from "./api";
import type { ExamId } from "../data/conteudos";

export const SERIES: { id: Serie; curto: string; longo: string; emoji: string }[] = [
  { id: 1, curto: "1º ano", longo: "1º ano do Ensino Médio", emoji: "🌱" },
  { id: 2, curto: "2º ano", longo: "2º ano do Ensino Médio", emoji: "🌿" },
  { id: 3, curto: "3º ano", longo: "3º ano do Ensino Médio", emoji: "🌳" },
  { id: "concluido", curto: "Concluí / cursinho", longo: "Ensino Médio concluído / cursinho", emoji: "🎓" },
];

export const nomeSerie = (s: Serie | null | undefined, longo = false) => {
  const x = SERIES.find((i) => i.id === s);
  return x ? (longo ? x.longo : x.curto) : "Série não informada";
};

/** Prova mais indicada para a série: SSA da fase correspondente ou ENEM. */
export const exameDaSerie = (s: Serie | null | undefined): ExamId =>
  s === 1 ? "ssa1" : s === 2 ? "ssa2" : s === 3 ? "ssa3" : "enem";
