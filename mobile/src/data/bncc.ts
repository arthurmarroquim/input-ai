// BNCC — Ensino Médio (Base Nacional Comum Curricular).
//
// Como a BNCC do Ensino Médio está organizada:
// - Habilidades têm códigos como EM13MAT302: "EM" = Ensino Médio, "13" = podem ser
//   trabalhadas da 1ª à 3ª série, "MAT" = área/componente, e o 1º dígito do número final
//   indica a competência específica da área (302 → competência 3).
// - Língua Portuguesa usa códigos EM13LP01, EM13LP02… (organizados por campos de atuação).
// - A BNCC não fixa em qual série cada habilidade é ensinada; a distribuição por série
//   deste app segue o currículo usual das escolas (ver conteudos.ts).
//
// Os textos abaixo são RESUMOS para leitura rápida no celular. O texto oficial completo
// está em https://basenacionalcomum.mec.gov.br — confira lá antes de usar em documentos.

import type { AreaId } from "./conteudos";

export type AreaBncc = Exclude<AreaId, "redacao">;

export type Habilidade = { codigo: string; area: AreaBncc; resumo: string };
export type Competencia = { area: AreaBncc; numero: number; resumo: string };

// ---------- Competências gerais (as 10 da Educação Básica) ----------
export const COMPETENCIAS_GERAIS: { numero: number; nome: string; resumo: string }[] = [
  {
    numero: 1,
    nome: "Conhecimento",
    resumo: "Valorizar e usar os conhecimentos construídos para entender e explicar a realidade.",
  },
  {
    numero: 2,
    nome: "Pensamento científico, crítico e criativo",
    resumo: "Investigar, refletir, levantar hipóteses e resolver problemas com base nas ciências.",
  },
  {
    numero: 3,
    nome: "Repertório cultural",
    resumo: "Valorizar e fruir manifestações artísticas e culturais, das locais às mundiais.",
  },
  {
    numero: 4,
    nome: "Comunicação",
    resumo:
      "Usar diferentes linguagens (verbal, corporal, visual, sonora, digital, matemática e científica).",
  },
  {
    numero: 5,
    nome: "Cultura digital",
    resumo: "Usar tecnologias digitais de forma crítica, significativa, reflexiva e ética.",
  },
  {
    numero: 6,
    nome: "Trabalho e projeto de vida",
    resumo: "Fazer escolhas ligadas ao mundo do trabalho e ao seu projeto de vida.",
  },
  {
    numero: 7,
    nome: "Argumentação",
    resumo: "Argumentar com base em fatos, dados e informações confiáveis, respeitando os direitos humanos.",
  },
  {
    numero: 8,
    nome: "Autoconhecimento e autocuidado",
    resumo: "Conhecer-se, cuidar da saúde física e emocional e lidar com as emoções.",
  },
  {
    numero: 9,
    nome: "Empatia e cooperação",
    resumo: "Exercitar o diálogo, a empatia e a cooperação, valorizando a diversidade.",
  },
  {
    numero: 10,
    nome: "Responsabilidade e cidadania",
    resumo: "Agir com autonomia, responsabilidade e princípios éticos, democráticos e sustentáveis.",
  },
];

// Competências gerais mais mobilizadas em cada área (relação sugerida pelo app).
export const GERAIS_POR_AREA: Record<AreaId, number[]> = {
  matematica: [2, 4, 5],
  linguagens: [3, 4, 7],
  natureza: [2, 7, 10],
  humanas: [1, 7, 9, 10],
  redacao: [4, 7, 10],
};

// ---------- Competências específicas de cada área ----------
export const COMPETENCIAS_ESPECIFICAS: Competencia[] = [
  // Matemática e suas Tecnologias (5)
  {
    area: "matematica",
    numero: 1,
    resumo:
      "Usar conceitos e procedimentos matemáticos para interpretar situações do cotidiano, das ciências e da sociedade.",
  },
  {
    area: "matematica",
    numero: 2,
    resumo:
      "Investigar desafios do mundo contemporâneo e tomar decisões éticas e responsáveis com base na Matemática.",
  },
  {
    area: "matematica",
    numero: 3,
    resumo:
      "Construir modelos e resolver problemas em diversos contextos, avaliando se os resultados fazem sentido.",
  },
  {
    area: "matematica",
    numero: 4,
    resumo:
      "Compreender e usar diferentes registros de representação (algébrico, geométrico, estatístico, computacional).",
  },
  {
    area: "matematica",
    numero: 5,
    resumo: "Investigar e formular conjecturas sobre conceitos e propriedades matemáticas, validando-as.",
  },
  // Linguagens e suas Tecnologias (7)
  {
    area: "linguagens",
    numero: 1,
    resumo:
      "Compreender o funcionamento das linguagens (artísticas, corporais e verbais) para interpretar e produzir discursos.",
  },
  {
    area: "linguagens",
    numero: 2,
    resumo:
      "Compreender processos identitários, conflitos e relações de poder nas práticas de linguagem, respeitando as diversidades.",
  },
  {
    area: "linguagens",
    numero: 3,
    resumo: "Usar diferentes linguagens com autonomia e protagonismo para se expressar e atuar socialmente.",
  },
  {
    area: "linguagens",
    numero: 4,
    resumo:
      "Compreender as línguas como fenômeno histórico, cultural, social e variável, respeitando os usos.",
  },
  {
    area: "linguagens",
    numero: 5,
    resumo: "Compreender e vivenciar práticas corporais, com consciência sobre corpo, saúde e convivência.",
  },
  {
    area: "linguagens",
    numero: 6,
    resumo: "Apreciar e produzir manifestações artísticas e culturais de diferentes tempos e lugares.",
  },
  {
    area: "linguagens",
    numero: 7,
    resumo: "Usar práticas de linguagem no universo digital de forma crítica, criativa e ética.",
  },
  // Ciências da Natureza e suas Tecnologias (3)
  {
    area: "natureza",
    numero: 1,
    resumo:
      "Analisar fenômenos naturais e processos tecnológicos com base nas relações entre matéria e energia.",
  },
  {
    area: "natureza",
    numero: 2,
    resumo: "Interpretar a dinâmica da Vida, da Terra e do Cosmos para argumentar e prever fenômenos.",
  },
  {
    area: "natureza",
    numero: 3,
    resumo: "Investigar problemas e avaliar aplicações da ciência e da tecnologia, comunicando resultados.",
  },
  // Ciências Humanas e Sociais Aplicadas (6)
  {
    area: "humanas",
    numero: 1,
    resumo:
      "Analisar processos políticos, econômicos, sociais, ambientais e culturais em diferentes tempos e lugares.",
  },
  {
    area: "humanas",
    numero: 2,
    resumo: "Analisar a formação de territórios e fronteiras e as relações de poder entre povos e Estados.",
  },
  {
    area: "humanas",
    numero: 3,
    resumo: "Avaliar as relações das sociedades com a natureza e seus impactos econômicos e socioambientais.",
  },
  {
    area: "humanas",
    numero: 4,
    resumo: "Analisar as relações de produção, capital e trabalho e seu papel nas transformações sociais.",
  },
  {
    area: "humanas",
    numero: 5,
    resumo: "Identificar e combater injustiças, preconceitos e violências, respeitando os Direitos Humanos.",
  },
  {
    area: "humanas",
    numero: 6,
    resumo: "Participar do debate público de forma crítica, com cidadania e respeito a diferentes posições.",
  },
];

// ---------- Habilidades usadas no app (resumos) ----------
const H: [string, AreaBncc, string][] = [
  // Matemática
  [
    "EM13MAT101",
    "matematica",
    "Interpretar situações econômicas, sociais e das ciências que envolvem variação de grandezas, analisando gráficos de funções.",
  ],
  [
    "EM13MAT102",
    "matematica",
    "Analisar tabelas, gráficos e pesquisas estatísticas divulgadas pela mídia, identificando inadequações.",
  ],
  [
    "EM13MAT104",
    "matematica",
    "Interpretar taxas e índices socioeconômicos (como IDH e inflação) e analisar criticamente a realidade.",
  ],
  [
    "EM13MAT105",
    "matematica",
    "Usar transformações geométricas (isometrias e homotetias) para construir figuras e analisar produções humanas.",
  ],
  [
    "EM13MAT106",
    "matematica",
    "Identificar situações do dia a dia em que é preciso fazer escolhas considerando riscos probabilísticos.",
  ],
  [
    "EM13MAT203",
    "matematica",
    "Aplicar a Matemática no planejamento com aplicativos e planilhas (orçamento, juros simples e compostos).",
  ],
  [
    "EM13MAT301",
    "matematica",
    "Resolver e elaborar problemas com equações lineares simultâneas (sistemas), usando técnicas algébricas e gráficas.",
  ],
  [
    "EM13MAT302",
    "matematica",
    "Construir modelos com funções polinomiais de 1º e 2º graus para resolver problemas em contextos diversos.",
  ],
  ["EM13MAT303", "matematica", "Interpretar e comparar situações de juros simples e juros compostos."],
  [
    "EM13MAT304",
    "matematica",
    "Resolver e elaborar problemas com funções exponenciais, interpretando a variação das grandezas.",
  ],
  [
    "EM13MAT305",
    "matematica",
    "Resolver e elaborar problemas com funções logarítmicas em contextos como abalos sísmicos, pH e som.",
  ],
  [
    "EM13MAT306",
    "matematica",
    "Resolver problemas com fenômenos periódicos e relacioná-los às funções seno e cosseno.",
  ],
  [
    "EM13MAT307",
    "matematica",
    "Usar diferentes métodos para calcular a área de superfícies (reconfiguração, aproximações).",
  ],
  [
    "EM13MAT308",
    "matematica",
    "Aplicar relações métricas, leis do seno e do cosseno, congruência e semelhança em problemas com triângulos.",
  ],
  [
    "EM13MAT309",
    "matematica",
    "Resolver problemas com áreas e volumes de prismas, pirâmides e corpos redondos.",
  ],
  ["EM13MAT310", "matematica", "Resolver problemas de contagem com os princípios multiplicativo e aditivo."],
  [
    "EM13MAT311",
    "matematica",
    "Descrever o espaço amostral de eventos aleatórios e calcular probabilidades.",
  ],
  [
    "EM13MAT312",
    "matematica",
    "Resolver problemas com probabilidade de eventos em experimentos aleatórios sucessivos.",
  ],
  [
    "EM13MAT314",
    "matematica",
    "Resolver problemas com grandezas obtidas pela razão ou pelo produto de outras (velocidade, densidade etc.).",
  ],
  [
    "EM13MAT316",
    "matematica",
    "Calcular e interpretar medidas de tendência central (média, moda, mediana) e de dispersão.",
  ],
  [
    "EM13MAT401",
    "matematica",
    "Converter funções do 1º grau da forma algébrica para o gráfico no plano cartesiano e vice-versa.",
  ],
  [
    "EM13MAT402",
    "matematica",
    "Converter funções do 2º grau da forma algébrica para o gráfico no plano cartesiano e vice-versa.",
  ],
  [
    "EM13MAT403",
    "matematica",
    "Relacionar as representações (tabelas e gráficos) das funções exponencial e logarítmica.",
  ],
  [
    "EM13MAT404",
    "matematica",
    "Analisar funções definidas por mais de uma sentença (como tabelas de impostos e contas de consumo).",
  ],
  [
    "EM13MAT406",
    "matematica",
    "Construir e interpretar tabelas e gráficos de frequências a partir de pesquisas por amostragem.",
  ],
  [
    "EM13MAT407",
    "matematica",
    "Interpretar e comparar dados estatísticos em diferentes gráficos (histograma, box-plot etc.).",
  ],
  [
    "EM13MAT501",
    "matematica",
    "Investigar padrões em tabelas e generalizá-los algebricamente, reconhecendo funções do 1º grau.",
  ],
  [
    "EM13MAT502",
    "matematica",
    "Investigar padrões em tabelas e generalizá-los algebricamente, reconhecendo funções do 2º grau.",
  ],
  [
    "EM13MAT503",
    "matematica",
    "Investigar pontos de máximo e mínimo de funções quadráticas em contextos diversos.",
  ],
  ["EM13MAT507", "matematica", "Associar progressões aritméticas (PA) a funções afins de domínio discreto."],
  [
    "EM13MAT508",
    "matematica",
    "Associar progressões geométricas (PG) a funções exponenciais de domínio discreto.",
  ],
  [
    "EM13MAT511",
    "matematica",
    "Reconhecer diferentes tipos de espaços amostrais (discretos ou não) e de eventos.",
  ],
  // Linguagens (área)
  [
    "EM13LGG101",
    "linguagens",
    "Analisar a produção e a circulação de discursos nas diferentes linguagens para fazer escolhas fundamentadas.",
  ],
  [
    "EM13LGG103",
    "linguagens",
    "Analisar o funcionamento das linguagens para interpretar e produzir textos em diversas semioses.",
  ],
  [
    "EM13LGG401",
    "linguagens",
    "Analisar textos compreendendo as línguas como fenômeno histórico, social, cultural e variável.",
  ],
  [
    "EM13LGG402",
    "linguagens",
    "Empregar a variedade e o estilo de língua adequados a cada situação comunicativa.",
  ],
  [
    "EM13LGG403",
    "linguagens",
    "Usar o inglês como língua de comunicação global, considerando a variedade de usos e usuários.",
  ],
  [
    "EM13LGG501",
    "linguagens",
    "Usar movimentos corporais de forma consciente para interagir em práticas corporais.",
  ],
  [
    "EM13LGG503",
    "linguagens",
    "Vivenciar práticas corporais como forma de autoconhecimento e cuidado com o corpo e a saúde.",
  ],
  [
    "EM13LGG601",
    "linguagens",
    "Apropriar-se do patrimônio artístico de diferentes tempos e lugares, compreendendo sua diversidade.",
  ],
  [
    "EM13LGG602",
    "linguagens",
    "Fruir e apreciar manifestações artísticas e culturais, das locais às mundiais.",
  ],
  [
    "EM13LGG604",
    "linguagens",
    "Relacionar as práticas artísticas às dimensões social, cultural, política e econômica da vida.",
  ],
  // Língua Portuguesa
  [
    "EM13LP01",
    "linguagens",
    "Relacionar o texto às suas condições de produção e ao contexto sócio-histórico de circulação.",
  ],
  [
    "EM13LP02",
    "linguagens",
    "Relacionar as partes do texto e usar recursos coesivos que garantam coerência e progressão temática.",
  ],
  ["EM13LP03", "linguagens", "Analisar relações de intertextualidade e interdiscursividade entre textos."],
  [
    "EM13LP05",
    "linguagens",
    "Analisar posicionamentos, movimentos argumentativos e argumentos em textos argumentativos.",
  ],
  [
    "EM13LP06",
    "linguagens",
    "Analisar efeitos de sentido produzidos pela escolha e combinação de palavras e expressões.",
  ],
  ["EM13LP07", "linguagens", "Analisar marcas que mostram a posição do enunciador diante do que é dito."],
  [
    "EM13LP08",
    "linguagens",
    "Analisar a sintaxe do português: ordem dos termos, coordenação, subordinação, concordância e regência.",
  ],
  [
    "EM13LP09",
    "linguagens",
    "Comparar o tratamento da gramática tradicional e das gramáticas de uso sobre tópicos gramaticais.",
  ],
  ["EM13LP10", "linguagens", "Analisar a variação linguística em seus diferentes níveis e dimensões."],
  [
    "EM13LP15",
    "linguagens",
    "Planejar, produzir, revisar e reescrever textos considerando sua adequação às condições de produção.",
  ],
  [
    "EM13LP48",
    "linguagens",
    "Identificar rupturas e permanências na formação e na trajetória da literatura brasileira.",
  ],
  [
    "EM13LP49",
    "linguagens",
    "Perceber as peculiaridades estruturais e estilísticas de diferentes gêneros literários.",
  ],
  [
    "EM13LP50",
    "linguagens",
    "Analisar relações intertextuais entre obras de diferentes autores, gêneros e épocas.",
  ],
  [
    "EM13LP52",
    "linguagens",
    "Analisar obras significativas das literaturas brasileira, portuguesa, indígena, africana e latino-americana.",
  ],
  // Ciências da Natureza
  [
    "EM13CNT101",
    "natureza",
    "Analisar transformações e conservações de matéria, energia e movimento para fazer previsões.",
  ],
  [
    "EM13CNT102",
    "natureza",
    "Avaliar sistemas térmicos considerando as variáveis termodinâmicas e a sustentabilidade.",
  ],
  [
    "EM13CNT103",
    "natureza",
    "Avaliar potencialidades e riscos das radiações em equipamentos, saúde, ambiente e geração de energia.",
  ],
  [
    "EM13CNT104",
    "natureza",
    "Avaliar riscos de materiais e produtos à saúde e ao ambiente, considerando composição e reatividade.",
  ],
  [
    "EM13CNT105",
    "natureza",
    "Analisar os ciclos biogeoquímicos e os efeitos da interferência humana sobre eles.",
  ],
  ["EM13CNT106", "natureza", "Avaliar tecnologias de geração, transmissão e consumo de energia elétrica."],
  [
    "EM13CNT107",
    "natureza",
    "Prever o funcionamento de geradores, motores, transformadores, pilhas, baterias e dispositivos elétricos.",
  ],
  [
    "EM13CNT201",
    "natureza",
    "Comparar modelos e teorias sobre a origem e a evolução da Vida, da Terra e do Universo.",
  ],
  [
    "EM13CNT202",
    "natureza",
    "Analisar as formas de vida em seus níveis de organização e as condições que as favorecem ou limitam.",
  ],
  [
    "EM13CNT203",
    "natureza",
    "Prever efeitos de intervenções nos ecossistemas, nos seres vivos e no corpo humano.",
  ],
  [
    "EM13CNT204",
    "natureza",
    "Explicar e calcular movimentos de objetos na Terra e no espaço com base nas interações gravitacionais.",
  ],
  [
    "EM13CNT205",
    "natureza",
    "Interpretar resultados e fenômenos com base nas noções de probabilidade e incerteza.",
  ],
  ["EM13CNT206", "natureza", "Discutir a importância da preservação e conservação da biodiversidade."],
  [
    "EM13CNT207",
    "natureza",
    "Analisar vulnerabilidades à saúde a que os jovens estão expostos e propor formas de cuidado.",
  ],
  ["EM13CNT208", "natureza", "Aplicar princípios da evolução biológica para analisar a história humana."],
  ["EM13CNT209", "natureza", "Analisar a evolução estelar e a origem dos elementos químicos no Universo."],
  [
    "EM13CNT301",
    "natureza",
    "Formular hipóteses, fazer medições e interpretar modelos, dados e resultados experimentais.",
  ],
  [
    "EM13CNT304",
    "natureza",
    "Debater situações controversas sobre aplicações científicas (como DNA e células-tronco).",
  ],
  [
    "EM13CNT306",
    "natureza",
    "Avaliar riscos em atividades cotidianas e justificar o uso de equipamentos de segurança.",
  ],
  [
    "EM13CNT307",
    "natureza",
    "Analisar propriedades dos materiais para avaliar seu uso em diferentes aplicações.",
  ],
  ["EM13CNT309", "natureza", "Analisar a dependência dos recursos não renováveis e discutir alternativas."],
  [
    "EM13CNT310",
    "natureza",
    "Analisar os efeitos de serviços básicos (saneamento, vacinação, energia) na qualidade de vida.",
  ],
  // Ciências Humanas
  [
    "EM13CHS101",
    "humanas",
    "Comparar fontes e narrativas em diversas linguagens para compreender ideias e processos históricos e sociais.",
  ],
  [
    "EM13CHS102",
    "humanas",
    "Discutir as circunstâncias de matrizes conceituais como etnocentrismo, racismo e modernidade.",
  ],
  [
    "EM13CHS106",
    "humanas",
    "Usar linguagens cartográfica, gráfica e iconográfica e tecnologias digitais de forma crítica.",
  ],
  [
    "EM13CHS201",
    "humanas",
    "Analisar as dinâmicas de populações, mercadorias e capital e a mobilidade de povos.",
  ],
  [
    "EM13CHS202",
    "humanas",
    "Avaliar os impactos das tecnologias nas sociedades contemporâneas (fluxos de pessoas, dinheiro e informação).",
  ],
  [
    "EM13CHS204",
    "humanas",
    "Comparar processos de ocupação do espaço e de formação de territórios e fronteiras.",
  ],
  ["EM13CHS301", "humanas", "Problematizar hábitos de produção, consumo e descarte de resíduos."],
  [
    "EM13CHS302",
    "humanas",
    "Avaliar impactos de cadeias produtivas ligadas a recursos naturais e à agropecuária.",
  ],
  ["EM13CHS304", "humanas", "Analisar impactos socioambientais de práticas de governos, empresas e pessoas."],
  [
    "EM13CHS401",
    "humanas",
    "Analisar relações entre grupos e sociedades diante de transformações técnicas e novas formas de trabalho.",
  ],
  [
    "EM13CHS403",
    "humanas",
    "Analisar os impactos das transformações tecnológicas nas relações sociais e de trabalho atuais.",
  ],
  ["EM13CHS501", "humanas", "Analisar os fundamentos da ética em diferentes culturas, tempos e espaços."],
  [
    "EM13CHS502",
    "humanas",
    "Problematizar desigualdades, preconceitos, intolerâncias e discriminações no cotidiano.",
  ],
  ["EM13CHS503", "humanas", "Identificar formas de violência, suas causas e seus usos políticos e sociais."],
  [
    "EM13CHS504",
    "humanas",
    "Avaliar impasses ético-políticos das transformações científicas, tecnológicas e culturais.",
  ],
  [
    "EM13CHS601",
    "humanas",
    "Analisar demandas e protagonismos de povos indígenas e populações afrodescendentes no Brasil.",
  ],
  [
    "EM13CHS602",
    "humanas",
    "Identificar paternalismo, autoritarismo e populismo na política brasileira e latino-americana.",
  ],
  [
    "EM13CHS603",
    "humanas",
    "Analisar a formação de países e nações aplicando conceitos políticos (Estado, poder, regimes de governo).",
  ],
  ["EM13CHS604", "humanas", "Discutir o papel e os limites dos organismos internacionais no mundo."],
  [
    "EM13CHS606",
    "humanas",
    "Analisar dados socioeconômicos do Brasil e propor medidas para enfrentar os problemas identificados.",
  ],
];

export const HABILIDADES: Record<string, Habilidade> = Object.fromEntries(
  H.map(([codigo, area, resumo]) => [codigo, { codigo, area, resumo }]),
);

/** Número da competência específica de uma habilidade (Língua Portuguesa não tem: retorna null). */
export function competenciaDa(codigo: string): number | null {
  const m = codigo.match(/^EM13(MAT|LGG|CNT|CHS)(\d)\d\d$/);
  return m ? Number(m[2]) : null;
}

// ---------- Relação assunto → habilidades (relação sugerida pelo app) ----------
// Assuntos sem habilidade são tradicionais em vestibulares, mas não aparecem
// explicitamente na BNCC (ex.: matrizes, números complexos).
const MAPA: Record<string, string[]> = {
  // Matemática
  "matematica.razao-proporcao-e-porcentagem": ["EM13MAT104", "EM13MAT314"],
  "matematica.conjuntos-e-intervalos": [],
  "matematica.funcoes-conceito-e-graficos": ["EM13MAT101", "EM13MAT404"],
  "matematica.funcao-afim-1-grau": ["EM13MAT302", "EM13MAT401", "EM13MAT501"],
  "matematica.funcao-quadratica-2-grau": ["EM13MAT302", "EM13MAT402", "EM13MAT502", "EM13MAT503"],
  "matematica.funcao-exponencial": ["EM13MAT304", "EM13MAT403"],
  "matematica.logaritmos": ["EM13MAT305", "EM13MAT403"],
  "matematica.progressoes-aritmetica-e-geometrica": ["EM13MAT507", "EM13MAT508"],
  "matematica.trigonometria-no-triangulo-retangulo": ["EM13MAT308"],
  "matematica.trigonometria-no-ciclo-trigonometrico": ["EM13MAT306"],
  "matematica.matrizes-e-determinantes": [],
  "matematica.sistemas-lineares": ["EM13MAT301"],
  "matematica.analise-combinatoria": ["EM13MAT310"],
  "matematica.probabilidade": ["EM13MAT106", "EM13MAT311", "EM13MAT312", "EM13MAT511"],
  "matematica.geometria-plana-areas-e-perimetros": ["EM13MAT307", "EM13MAT105"],
  "matematica.geometria-espacial-prismas-piramides-cilindros-cones-e-esfer": ["EM13MAT309"],
  "matematica.matematica-financeira-juros-simples-e-compostos": ["EM13MAT303", "EM13MAT203"],
  "matematica.estatistica-media-moda-mediana-e-desvio-padrao": ["EM13MAT316", "EM13MAT406", "EM13MAT407"],
  "matematica.leitura-de-graficos-e-tabelas": ["EM13MAT102", "EM13MAT406"],
  "matematica.geometria-analitica-ponto-reta-e-circunferencia": ["EM13MAT401"],
  "matematica.numeros-complexos": [],
  "matematica.polinomios-e-equacoes-algebricas": [],
  // Língua Portuguesa
  "portugues.interpretacao-de-texto": ["EM13LGG101", "EM13LP01", "EM13LP07"],
  "portugues.generos-textuais": ["EM13LGG101", "EM13LP01", "EM13LP02"],
  "portugues.funcoes-da-linguagem": ["EM13LGG101", "EM13LGG103"],
  "portugues.variacao-linguistica": ["EM13LGG401", "EM13LGG402", "EM13LP10"],
  "portugues.figuras-de-linguagem": ["EM13LGG103", "EM13LP06"],
  "portugues.fonologia-e-acentuacao": [],
  "portugues.classes-de-palavras": ["EM13LP08", "EM13LP09"],
  "portugues.formacao-de-palavras": ["EM13LP09"],
  "portugues.concordancia-verbal-e-nominal": ["EM13LP08"],
  "portugues.regencia-e-crase": ["EM13LP08"],
  "portugues.coesao-e-coerencia": ["EM13LP02"],
  "portugues.sintaxe-do-periodo-simples-e-composto": ["EM13LP08"],
  "portugues.pontuacao": [],
  "portugues.semantica-e-sentido": ["EM13LP06"],
  "portugues.intertextualidade": ["EM13LP03", "EM13LP50"],
  // Literatura
  "literatura.trovadorismo-humanismo-e-classicismo": ["EM13LP48", "EM13LP52", "EM13LGG601"],
  "literatura.quinhentismo": ["EM13LP48", "EM13LP52"],
  "literatura.barroco": ["EM13LP48", "EM13LP50", "EM13LGG601"],
  "literatura.arcadismo": ["EM13LP48", "EM13LP50"],
  "literatura.romantismo-poesia-e-prosa": ["EM13LP48", "EM13LP49", "EM13LP52"],
  "literatura.realismo-e-naturalismo": ["EM13LP48", "EM13LP50", "EM13LP52"],
  "literatura.parnasianismo": ["EM13LP48", "EM13LP49"],
  "literatura.simbolismo": ["EM13LP48", "EM13LP49"],
  "literatura.pre-modernismo": ["EM13LP48", "EM13LP52"],
  "literatura.semana-de-22-e-1-fase-modernista": ["EM13LP48", "EM13LP50", "EM13LGG601"],
  "literatura.modernismo-2-e-3-fases": ["EM13LP48", "EM13LP49", "EM13LP52"],
  "literatura.literatura-contemporanea": ["EM13LP49", "EM13LP52"],
  // Língua estrangeira
  "estrangeira.estrategias-de-leitura-skimming-e-scanning": ["EM13LGG403", "EM13LGG101"],
  "estrangeira.vocabulario-cognatos-e-falsos-cognatos": ["EM13LGG403"],
  "estrangeira.tempos-verbais-na-leitura-de-textos": ["EM13LGG403"],
  "estrangeira.interpretacao-de-textos-charges-e-tirinhas": ["EM13LGG403", "EM13LGG103"],
  // Artes e Educação Física
  "artes.elementos-das-linguagens-artisticas": ["EM13LGG602", "EM13LGG103"],
  "artes.movimentos-artisticos-do-renascimento-as-vanguardas": ["EM13LGG601", "EM13LGG604"],
  "artes.arte-brasileira-e-cultura-popular": ["EM13LGG601", "EM13LGG602", "EM13LGG604"],
  "edfisica.corpo-saude-e-praticas-corporais": ["EM13LGG501", "EM13LGG503"],
  "edfisica.esporte-lazer-e-sociedade": ["EM13LGG501", "EM13LGG503"],
  // História
  "historia.pre-historia-e-primeiras-civilizacoes": ["EM13CHS101", "EM13CHS201"],
  "historia.antiguidade-classica-grecia-e-roma": ["EM13CHS101", "EM13CHS603"],
  "historia.idade-media": ["EM13CHS101", "EM13CHS401"],
  "historia.renascimento-e-reformas-religiosas": ["EM13CHS101", "EM13CHS102"],
  "historia.grandes-navegacoes": ["EM13CHS201", "EM13CHS204"],
  "historia.brasil-colonia": ["EM13CHS204", "EM13CHS401", "EM13CHS601"],
  "historia.absolutismo-e-iluminismo": ["EM13CHS603", "EM13CHS501"],
  "historia.revolucoes-inglesa-francesa-e-industrial": ["EM13CHS401", "EM13CHS603"],
  "historia.independencias-na-america": ["EM13CHS204", "EM13CHS603"],
  "historia.brasil-imperio": ["EM13CHS603", "EM13CHS601"],
  "historia.primeira-republica-e-era-vargas": ["EM13CHS602", "EM13CHS401"],
  "historia.primeira-e-segunda-guerras-mundiais": ["EM13CHS503", "EM13CHS204"],
  "historia.guerra-fria": ["EM13CHS204", "EM13CHS604"],
  "historia.ditadura-militar-e-redemocratizacao": ["EM13CHS602", "EM13CHS503"],
  "historia.mundo-contemporaneo-e-globalizacao": ["EM13CHS202", "EM13CHS604"],
  // Geografia
  "geografia.cartografia": ["EM13CHS106"],
  "geografia.geologia-e-relevo": ["EM13CHS106"],
  "geografia.clima-e-vegetacao": ["EM13CHS106", "EM13CHS304"],
  "geografia.hidrografia": ["EM13CHS302", "EM13CHS304"],
  "geografia.populacao-e-demografia": ["EM13CHS201"],
  "geografia.urbanizacao": ["EM13CHS201", "EM13CHS301"],
  "geografia.agropecuaria-e-questao-agraria": ["EM13CHS302", "EM13CHS401"],
  "geografia.industria-e-fontes-de-energia": ["EM13CHS401", "EM13CHS302"],
  "geografia.globalizacao-e-blocos-economicos": ["EM13CHS202", "EM13CHS604"],
  "geografia.geopolitica-e-conflitos": ["EM13CHS204", "EM13CHS604"],
  "geografia.questoes-ambientais": ["EM13CHS301", "EM13CHS304"],
  "geografia.regionalizacao-do-brasil-e-o-nordeste": ["EM13CHS204", "EM13CHS606"],
  // Filosofia e Sociologia
  "filosofia.filosofia-antiga-pre-socraticos-socrates-platao-e-aristotele": ["EM13CHS101", "EM13CHS501"],
  "filosofia.filosofia-medieval-e-moderna": ["EM13CHS101", "EM13CHS504"],
  "filosofia.filosofia-politica-contratualistas": ["EM13CHS603", "EM13CHS501"],
  "filosofia.etica-e-filosofia-contemporanea": ["EM13CHS501", "EM13CHS504"],
  "sociologia.classicos-durkheim-weber-e-marx": ["EM13CHS102", "EM13CHS401"],
  "sociologia.cultura-identidade-e-movimentos-sociais": ["EM13CHS502", "EM13CHS601"],
  "sociologia.trabalho-desigualdade-e-cidadania": ["EM13CHS403", "EM13CHS606"],
  // Biologia
  "biologia.bioquimica-celular": ["EM13CNT202"],
  "biologia.citologia": ["EM13CNT202"],
  "biologia.metabolismo-energetico-respiracao-e-fotossintese": ["EM13CNT202", "EM13CNT101"],
  "biologia.divisao-celular": ["EM13CNT202"],
  "biologia.histologia": ["EM13CNT202"],
  "biologia.classificacao-dos-seres-vivos": ["EM13CNT202", "EM13CNT206"],
  "biologia.virus-bacterias-protozoarios-e-fungos": ["EM13CNT202", "EM13CNT310"],
  "biologia.botanica": ["EM13CNT202"],
  "biologia.zoologia": ["EM13CNT202", "EM13CNT206"],
  "biologia.fisiologia-humana": ["EM13CNT202", "EM13CNT207"],
  "biologia.genetica-e-leis-de-mendel": ["EM13CNT205", "EM13CNT304"],
  "biologia.evolucao": ["EM13CNT201", "EM13CNT208"],
  "biologia.ecologia": ["EM13CNT203", "EM13CNT206", "EM13CNT105"],
  "biologia.biotecnologia": ["EM13CNT304"],
  // Química
  "quimica.materia-e-separacao-de-misturas": ["EM13CNT307", "EM13CNT101"],
  "quimica.modelos-atomicos-e-tabela-periodica": ["EM13CNT201", "EM13CNT209"],
  "quimica.ligacoes-quimicas": ["EM13CNT307"],
  "quimica.funcoes-inorganicas": ["EM13CNT104"],
  "quimica.reacoes-quimicas-e-balanceamento": ["EM13CNT101"],
  "quimica.estequiometria": ["EM13CNT101"],
  "quimica.solucoes": ["EM13CNT104"],
  "quimica.termoquimica": ["EM13CNT101", "EM13CNT102"],
  "quimica.cinetica-quimica": ["EM13CNT101"],
  "quimica.equilibrio-quimico-e-ph": ["EM13CNT101", "EM13CNT104"],
  "quimica.eletroquimica": ["EM13CNT107"],
  "quimica.radioatividade": ["EM13CNT103"],
  "quimica.quimica-organica-cadeias-e-funcoes": ["EM13CNT307", "EM13CNT104"],
  "quimica.isomeria": ["EM13CNT307"],
  "quimica.reacoes-organicas": ["EM13CNT101"],
  "quimica.polimeros-e-quimica-ambiental": ["EM13CNT104", "EM13CNT309"],
  // Física
  "fisica.cinematica": ["EM13CNT101", "EM13CNT204"],
  "fisica.leis-de-newton": ["EM13CNT101", "EM13CNT204"],
  "fisica.trabalho-energia-e-potencia": ["EM13CNT101"],
  "fisica.quantidade-de-movimento": ["EM13CNT101"],
  "fisica.gravitacao": ["EM13CNT204"],
  "fisica.hidrostatica": ["EM13CNT101"],
  "fisica.termologia-e-calorimetria": ["EM13CNT102"],
  "fisica.termodinamica": ["EM13CNT102"],
  "fisica.optica-geometrica": ["EM13CNT103", "EM13CNT301"],
  "fisica.ondulatoria-e-acustica": ["EM13CNT103", "EM13CNT301"],
  "fisica.eletrostatica": ["EM13CNT107", "EM13CNT306"],
  "fisica.eletrodinamica-circuitos": ["EM13CNT106", "EM13CNT107"],
  "fisica.magnetismo-e-eletromagnetismo": ["EM13CNT107"],
  "fisica.fisica-moderna": ["EM13CNT103", "EM13CNT209"],
  // Redação
  "redacao.estrutura-do-texto-dissertativo-argumentativo": ["EM13LP05", "EM13LP15"],
  "redacao.as-5-competencias-da-correcao": ["EM13LP15"],
  "redacao.repertorio-sociocultural": ["EM13LP01", "EM13LGG101"],
  "redacao.proposta-de-intervencao": ["EM13LP05", "EM13LP15"],
};

/** Habilidades da BNCC relacionadas a um assunto. */
export function habilidadesDo(assuntoId: string): Habilidade[] {
  return (MAPA[assuntoId] ?? []).map((c) => HABILIDADES[c]).filter(Boolean);
}

/** Para testes: ids do mapa. */
export const _ASSUNTOS_MAPEADOS = Object.keys(MAPA);
