import { Assunto, materiaPorId } from "../data/conteudos";
import {
  AreaBncc,
  COMPETENCIAS_ESPECIFICAS,
  COMPETENCIAS_GERAIS,
  competenciaDa,
  GERAIS_POR_AREA,
  Habilidade,
  habilidadesDo,
} from "../data/bncc";
import type { TopicStatus } from "./api";
import { resumo } from "./topics";

export type HabilidadeProgresso = Habilidade & {
  competencia: number | null;
  assuntos: Assunto[];
  r: ReturnType<typeof resumo>;
};

/**
 * Calcula, para uma lista de assuntos (ex.: os da série do aluno), o progresso de cada
 * habilidade e competência da BNCC. O progresso vem dos assuntos ligados a elas.
 */
export function progressoBncc(assuntos: Assunto[], status: Record<string, TopicStatus>) {
  // Habilidades → assuntos que as trabalham
  const porHab = new Map<string, { h: Habilidade; assuntos: Assunto[] }>();
  for (const a of assuntos) {
    for (const h of habilidadesDo(a.id)) {
      const item = porHab.get(h.codigo) ?? { h, assuntos: [] };
      item.assuntos.push(a);
      porHab.set(h.codigo, item);
    }
  }
  const habilidades: HabilidadeProgresso[] = [...porHab.values()]
    .map(({ h, assuntos: list }) => ({
      ...h,
      competencia: competenciaDa(h.codigo),
      assuntos: list,
      r: resumo(
        list.map((a) => a.id),
        status,
      ),
    }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  // Competências específicas → assuntos (via habilidades com número de competência)
  const especificas = COMPETENCIAS_ESPECIFICAS.map((c) => {
    const habs = habilidades.filter((h) => h.area === c.area && h.competencia === c.numero);
    const ids = [...new Set(habs.flatMap((h) => h.assuntos.map((a) => a.id)))];
    return { ...c, habilidades: habs.map((h) => h.codigo), r: resumo(ids, status) };
  }).filter((c) => c.habilidades.length > 0);

  // Competências gerais → assuntos das áreas que mais as mobilizam
  const gerais = COMPETENCIAS_GERAIS.map((g) => {
    const ids = assuntos
      .filter((a) => GERAIS_POR_AREA[materiaPorId[a.materia].area].includes(g.numero))
      .map((a) => a.id);
    return { ...g, r: resumo(ids, status) };
  }).filter((g) => g.r.total > 0);

  return { habilidades, especificas, gerais };
}

export const NOME_AREA_BNCC: Record<AreaBncc, string> = {
  linguagens: "Linguagens e suas Tecnologias",
  matematica: "Matemática e suas Tecnologias",
  natureza: "Ciências da Natureza e suas Tecnologias",
  humanas: "Ciências Humanas e Sociais Aplicadas",
};
