// Base de assuntos para o painel de progresso (ENEM e SSA/UPE).
//
// Organização:
// - Cada assunto pertence a uma matéria e a uma série do ensino médio (1ª, 2ª ou 3ª).
// - ENEM: cobra o conteúdo das três séries, dividido nas 4 áreas do conhecimento + Redação.
// - SSA (Sistema Seriado de Avaliação da UPE): SSA 1 = conteúdos da 1ª série,
//   SSA 2 = 2ª série, SSA 3 = 3ª série.
//
// A lista segue o currículo usual do ensino médio. Confira sempre a matriz do ENEM (INEP)
// e o edital/programa do SSA do ano para ajustar os assuntos.

export type ExamId = "enem" | "ssa1" | "ssa2" | "ssa3";
export type AreaId = "linguagens" | "humanas" | "natureza" | "matematica" | "redacao";
export type Serie = 1 | 2 | 3;

export type Materia = { id: string; nome: string; emoji: string; area: AreaId };
export type Assunto = { id: string; nome: string; materia: string; serie: Serie; somenteEnem?: boolean };

export const EXAMES: { id: ExamId; nome: string; sub: string }[] = [
  { id: "enem", nome: "ENEM", sub: "Todo o ensino médio" },
  { id: "ssa1", nome: "SSA 1", sub: "1ª série" },
  { id: "ssa2", nome: "SSA 2", sub: "2ª série" },
  { id: "ssa3", nome: "SSA 3", sub: "3ª série" },
];

export const AREAS: Record<AreaId, { nome: string; emoji: string; cor: string }> = {
  linguagens: { nome: "Linguagens", emoji: "📖", cor: "#E6149A" },
  humanas: { nome: "Ciências Humanas", emoji: "🌎", cor: "#8A1FB8" },
  natureza: { nome: "Ciências da Natureza", emoji: "🧪", cor: "#45BCD6" },
  matematica: { nome: "Matemática", emoji: "➗", cor: "#7FA2EA" },
  redacao: { nome: "Redação", emoji: "📝", cor: "#4A0552" },
};

export const MATERIAS: Materia[] = [
  { id: "portugues", nome: "Língua Portuguesa", emoji: "✍️", area: "linguagens" },
  { id: "literatura", nome: "Literatura", emoji: "📚", area: "linguagens" },
  { id: "estrangeira", nome: "Inglês / Espanhol", emoji: "🌐", area: "linguagens" },
  { id: "artes", nome: "Artes", emoji: "🎨", area: "linguagens" },
  { id: "edfisica", nome: "Educação Física", emoji: "🏃", area: "linguagens" },
  { id: "historia", nome: "História", emoji: "🏛️", area: "humanas" },
  { id: "geografia", nome: "Geografia", emoji: "🗺️", area: "humanas" },
  { id: "filosofia", nome: "Filosofia", emoji: "🤔", area: "humanas" },
  { id: "sociologia", nome: "Sociologia", emoji: "👥", area: "humanas" },
  { id: "biologia", nome: "Biologia", emoji: "🧬", area: "natureza" },
  { id: "quimica", nome: "Química", emoji: "⚗️", area: "natureza" },
  { id: "fisica", nome: "Física", emoji: "⚛️", area: "natureza" },
  { id: "matematica", nome: "Matemática", emoji: "➗", area: "matematica" },
  { id: "redacao", nome: "Redação", emoji: "📝", area: "redacao" },
];

// [matéria, série, nomes dos assuntos]
const BASE: [string, Serie, string[], boolean?][] = [
  // ---------- Matemática ----------
  [
    "matematica",
    1,
    [
      "Razão, proporção e porcentagem",
      "Conjuntos e intervalos",
      "Funções: conceito e gráficos",
      "Função afim (1º grau)",
      "Função quadrática (2º grau)",
      "Função exponencial",
      "Logaritmos",
      "Progressões aritmética e geométrica",
      "Trigonometria no triângulo retângulo",
    ],
  ],
  [
    "matematica",
    2,
    [
      "Trigonometria no ciclo trigonométrico",
      "Matrizes e determinantes",
      "Sistemas lineares",
      "Análise combinatória",
      "Probabilidade",
      "Geometria plana: áreas e perímetros",
      "Geometria espacial: prismas, pirâmides, cilindros, cones e esferas",
    ],
  ],
  [
    "matematica",
    3,
    [
      "Matemática financeira: juros simples e compostos",
      "Estatística: média, moda, mediana e desvio padrão",
      "Leitura de gráficos e tabelas",
      "Geometria analítica: ponto, reta e circunferência",
      "Números complexos",
      "Polinômios e equações algébricas",
    ],
  ],
  // ---------- Língua Portuguesa ----------
  [
    "portugues",
    1,
    [
      "Interpretação de texto",
      "Gêneros textuais",
      "Funções da linguagem",
      "Variação linguística",
      "Figuras de linguagem",
      "Fonologia e acentuação",
    ],
  ],
  [
    "portugues",
    2,
    [
      "Classes de palavras",
      "Formação de palavras",
      "Concordância verbal e nominal",
      "Regência e crase",
      "Coesão e coerência",
    ],
  ],
  [
    "portugues",
    3,
    ["Sintaxe do período simples e composto", "Pontuação", "Semântica e sentido", "Intertextualidade"],
  ],
  // ---------- Literatura ----------
  ["literatura", 1, ["Trovadorismo, Humanismo e Classicismo", "Quinhentismo", "Barroco", "Arcadismo"]],
  ["literatura", 2, ["Romantismo (poesia e prosa)", "Realismo e Naturalismo", "Parnasianismo", "Simbolismo"]],
  [
    "literatura",
    3,
    [
      "Pré-Modernismo",
      "Semana de 22 e 1ª fase modernista",
      "Modernismo: 2ª e 3ª fases",
      "Literatura contemporânea",
    ],
  ],
  // ---------- Língua estrangeira ----------
  [
    "estrangeira",
    1,
    ["Estratégias de leitura (skimming e scanning)", "Vocabulário, cognatos e falsos cognatos"],
  ],
  ["estrangeira", 2, ["Tempos verbais na leitura de textos"]],
  ["estrangeira", 3, ["Interpretação de textos, charges e tirinhas"]],
  // ---------- Artes e Educação Física ----------
  ["artes", 1, ["Elementos das linguagens artísticas"]],
  ["artes", 2, ["Movimentos artísticos: do Renascimento às Vanguardas"]],
  ["artes", 3, ["Arte brasileira e cultura popular"]],
  ["edfisica", 1, ["Corpo, saúde e práticas corporais"]],
  ["edfisica", 2, ["Esporte, lazer e sociedade"]],
  // ---------- História ----------
  [
    "historia",
    1,
    [
      "Pré-história e primeiras civilizações",
      "Antiguidade clássica: Grécia e Roma",
      "Idade Média",
      "Renascimento e Reformas religiosas",
      "Grandes Navegações",
    ],
  ],
  [
    "historia",
    2,
    [
      "Brasil Colônia",
      "Absolutismo e Iluminismo",
      "Revoluções Inglesa, Francesa e Industrial",
      "Independências na América",
      "Brasil Império",
    ],
  ],
  [
    "historia",
    3,
    [
      "Primeira República e Era Vargas",
      "Primeira e Segunda Guerras Mundiais",
      "Guerra Fria",
      "Ditadura militar e redemocratização",
      "Mundo contemporâneo e globalização",
    ],
  ],
  // ---------- Geografia ----------
  ["geografia", 1, ["Cartografia", "Geologia e relevo", "Clima e vegetação", "Hidrografia"]],
  [
    "geografia",
    2,
    [
      "População e demografia",
      "Urbanização",
      "Agropecuária e questão agrária",
      "Indústria e fontes de energia",
    ],
  ],
  [
    "geografia",
    3,
    [
      "Globalização e blocos econômicos",
      "Geopolítica e conflitos",
      "Questões ambientais",
      "Regionalização do Brasil e o Nordeste",
    ],
  ],
  // ---------- Filosofia e Sociologia ----------
  ["filosofia", 1, ["Filosofia antiga: pré-socráticos, Sócrates, Platão e Aristóteles"]],
  ["filosofia", 2, ["Filosofia medieval e moderna", "Filosofia política: contratualistas"]],
  ["filosofia", 3, ["Ética e filosofia contemporânea"]],
  ["sociologia", 1, ["Clássicos: Durkheim, Weber e Marx"]],
  ["sociologia", 2, ["Cultura, identidade e movimentos sociais"]],
  ["sociologia", 3, ["Trabalho, desigualdade e cidadania"]],
  // ---------- Biologia ----------
  [
    "biologia",
    1,
    [
      "Bioquímica celular",
      "Citologia",
      "Metabolismo energético: respiração e fotossíntese",
      "Divisão celular",
      "Histologia",
    ],
  ],
  [
    "biologia",
    2,
    [
      "Classificação dos seres vivos",
      "Vírus, bactérias, protozoários e fungos",
      "Botânica",
      "Zoologia",
      "Fisiologia humana",
    ],
  ],
  ["biologia", 3, ["Genética e Leis de Mendel", "Evolução", "Ecologia", "Biotecnologia"]],
  // ---------- Química ----------
  [
    "quimica",
    1,
    [
      "Matéria e separação de misturas",
      "Modelos atômicos e tabela periódica",
      "Ligações químicas",
      "Funções inorgânicas",
      "Reações químicas e balanceamento",
      "Estequiometria",
    ],
  ],
  [
    "quimica",
    2,
    [
      "Soluções",
      "Termoquímica",
      "Cinética química",
      "Equilíbrio químico e pH",
      "Eletroquímica",
      "Radioatividade",
    ],
  ],
  [
    "quimica",
    3,
    ["Química orgânica: cadeias e funções", "Isomeria", "Reações orgânicas", "Polímeros e química ambiental"],
  ],
  // ---------- Física ----------
  [
    "fisica",
    1,
    [
      "Cinemática",
      "Leis de Newton",
      "Trabalho, energia e potência",
      "Quantidade de movimento",
      "Gravitação",
      "Hidrostática",
    ],
  ],
  [
    "fisica",
    2,
    ["Termologia e calorimetria", "Termodinâmica", "Óptica geométrica", "Ondulatória e acústica"],
  ],
  [
    "fisica",
    3,
    ["Eletrostática", "Eletrodinâmica: circuitos", "Magnetismo e eletromagnetismo", "Física moderna"],
  ],
  // ---------- Redação (modelo ENEM) ----------
  [
    "redacao",
    3,
    [
      "Estrutura do texto dissertativo-argumentativo",
      "As 5 competências da correção",
      "Repertório sociocultural",
      "Proposta de intervenção",
    ],
    true,
  ],
];

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const ASSUNTOS: Assunto[] = BASE.flatMap(([materia, serie, nomes, somenteEnem]) =>
  nomes.map((nome) => ({ id: `${materia}.${slug(nome)}`, nome, materia, serie, somenteEnem })),
);

export function assuntosDoExame(exam: ExamId): Assunto[] {
  if (exam === "enem") return ASSUNTOS;
  const serie = Number(exam.slice(3)) as Serie;
  return ASSUNTOS.filter((a) => a.serie === serie && !a.somenteEnem);
}

export const materiaPorId = Object.fromEntries(MATERIAS.map((m) => [m.id, m])) as Record<string, Materia>;
