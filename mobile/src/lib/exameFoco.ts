import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { ExameVideo } from "./api";
import { useAuth } from "./auth";
import { exameDaSerie } from "./serie";

// Prova em foco nos vídeos (ENEM, SSA 1, 2 ou 3). Começa pela prova da série do aluno
// e fica guardada no aparelho quando ele troca.
export type ExameFoco = Exclude<ExameVideo, "todas">;

export const EXAMES_FOCO: { id: ExameFoco; nome: string }[] = [
  { id: "enem", nome: "ENEM" },
  { id: "ssa1", nome: "SSA 1" },
  { id: "ssa2", nome: "SSA 2" },
  { id: "ssa3", nome: "SSA 3" },
];

const listeners = new Set<(e: ExameFoco) => void>();
let atual: ExameFoco | null = null;
const chave = (userId?: string) => `ensinaai:exameFoco:${userId ?? "anon"}`;

export function useExameFoco() {
  const { user } = useAuth();
  const padrao = exameDaSerie(user?.serie) as ExameFoco;
  const [exame, setExameState] = useState<ExameFoco>(atual ?? padrao);

  useEffect(() => {
    listeners.add(setExameState);
    AsyncStorage.getItem(chave(user?.id))
      .then((v) => {
        const salvo = EXAMES_FOCO.some((e) => e.id === v) ? (v as ExameFoco) : padrao;
        atual = salvo;
        listeners.forEach((l) => l(salvo));
      })
      .catch(() => {});
    return () => {
      listeners.delete(setExameState);
    };
  }, [user?.id, padrao]);

  const setExame = useCallback(
    (e: ExameFoco) => {
      atual = e;
      listeners.forEach((l) => l(e));
      AsyncStorage.setItem(chave(user?.id), e).catch(() => {});
    },
    [user?.id],
  );

  return { exame, setExame };
}
