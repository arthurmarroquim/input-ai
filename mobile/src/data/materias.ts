// Matérias usadas para buscar vídeos curtos e videoaulas no YouTube.
export type Materia = { id: string; nome: string; emoji: string; busca: string };

export const MATERIAS: Materia[] = [
  { id: "estudo", nome: "Como estudar", emoji: "📚", busca: "como estudar melhor técnicas de estudo" },
  { id: "matematica", nome: "Matemática", emoji: "➗", busca: "matemática" },
  { id: "portugues", nome: "Português", emoji: "✍️", busca: "língua portuguesa gramática" },
  { id: "redacao", nome: "Redação", emoji: "📝", busca: "redação ENEM" },
  { id: "fisica", nome: "Física", emoji: "⚛️", busca: "física" },
  { id: "quimica", nome: "Química", emoji: "🧪", busca: "química" },
  { id: "biologia", nome: "Biologia", emoji: "🧬", busca: "biologia" },
  { id: "historia", nome: "História", emoji: "🏛️", busca: "história" },
  { id: "geografia", nome: "Geografia", emoji: "🌎", busca: "geografia" },
  { id: "ingles", nome: "Inglês", emoji: "🇬🇧", busca: "inglês para iniciantes" },
  { id: "enem", nome: "ENEM", emoji: "🎯", busca: "ENEM dicas e resolução de questões" },
  { id: "ssa", nome: "SSA (UPE)", emoji: "🏫", busca: "SSA UPE dicas e resolução de questões" },
];
