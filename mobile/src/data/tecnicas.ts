// Conteúdo do módulo "Aprenda a estudar".
export type Tecnica = {
  id: string;
  emoji: string;
  nome: string;
  resumo: string;
  quandoUsar: string;
  passos: string[];
  dica: string;
};

export const TECNICAS: Tecnica[] = [
  {
    id: "pomodoro",
    emoji: "🍅",
    nome: "Técnica Pomodoro",
    resumo: "Estude em blocos curtos de foco total, com pausas programadas.",
    quandoUsar:
      "Quando você tem dificuldade de começar, se distrai fácil ou estuda por muitas horas seguidas.",
    passos: [
      "Escolha UMA tarefa (ex.: 10 exercícios de frações).",
      "Deixe o celular no silencioso e longe da mão (use só o timer do app).",
      "Foque por 25 minutos sem interrupções.",
      "Faça uma pausa de 5 minutos: levante, beba água, alongue.",
      "A cada 4 pomodoros, faça uma pausa maior de 15 a 30 minutos.",
    ],
    dica: "Se surgir um pensamento no meio do pomodoro, anote num papel e volte ao foco.",
  },
  {
    id: "recordacao-ativa",
    emoji: "🧠",
    nome: "Recordação ativa",
    resumo: "Em vez de reler, teste sua memória: feche o livro e tente lembrar.",
    quandoUsar: "Depois de ler um conteúdo, antes de provas e para revisar matérias decorativas.",
    passos: [
      "Leia ou assista à explicação uma vez com atenção.",
      "Feche o material e escreva tudo o que você lembra.",
      "Compare com o material e marque o que esqueceu ou errou.",
      "Transforme os erros em perguntas (flashcards).",
      "Repita o teste no dia seguinte.",
    ],
    dica: "Errar ao tentar lembrar faz parte: é justamente o esforço que fixa o conteúdo.",
  },
  {
    id: "repeticao-espacada",
    emoji: "📅",
    nome: "Repetição espaçada",
    resumo: "Revise o mesmo conteúdo em intervalos cada vez maiores.",
    quandoUsar: "Para não esquecer o que já estudou — fórmulas, datas, vocabulário, conceitos.",
    passos: [
      "Estude o conteúdo hoje (dia 0).",
      "Revise rapidamente no dia seguinte (dia 1).",
      "Revise de novo depois de 3 dias.",
      "Depois de 1 semana.",
      "Depois de 1 mês. Se errar muito, volte um intervalo.",
    ],
    dica: "Combine com flashcards: cada revisão é um teste de recordação ativa.",
  },
  {
    id: "feynman",
    emoji: "👩‍🏫",
    nome: "Técnica Feynman",
    resumo: "Explique o conteúdo com palavras simples, como se fosse para uma criança.",
    quandoUsar: "Para conferir se você realmente entendeu um conceito, e não só decorou.",
    passos: [
      "Escreva o nome do conceito no topo de uma folha.",
      "Explique-o com suas palavras, de forma bem simples.",
      "Onde você travar ou usar palavras difíceis, há uma lacuna.",
      "Volte ao material e estude só essa lacuna.",
      "Simplifique a explicação e use um exemplo do dia a dia.",
    ],
    dica: "Peça ao Tutor IA para fazer o papel de aluno e te fazer perguntas sobre sua explicação.",
  },
  {
    id: "mapa-mental",
    emoji: "🗺️",
    nome: "Mapa mental",
    resumo: "Organize as ideias em um desenho com o tema no centro e ramificações.",
    quandoUsar: "Para visualizar matérias com muitos tópicos ligados (História, Biologia, Geografia).",
    passos: [
      "Escreva o tema principal no centro da folha.",
      "Puxe ramos com os subtemas mais importantes.",
      "Em cada ramo, use palavras-chave curtas — nada de frases longas.",
      "Use cores e pequenos desenhos para cada ramo.",
      "Ligue ideias de ramos diferentes que se relacionam.",
    ],
    dica: "Refazer o mapa de memória é uma ótima revisão.",
  },
  {
    id: "intercalacao",
    emoji: "🔀",
    nome: "Intercalação",
    resumo: "Misture tipos de exercícios e matérias diferentes na mesma sessão.",
    quandoUsar: "Ao praticar exercícios de exatas e se preparar para provas como o ENEM.",
    passos: [
      "Separe exercícios de 2 ou 3 assuntos diferentes.",
      "Resolva-os misturados, sem seguir a ordem por assunto.",
      "Antes de resolver, identifique: qual conteúdo essa questão cobra?",
      "Confira e anote em quais tipos você mais erra.",
    ],
    dica: "Parece mais difícil no começo, mas treina seu cérebro para escolher a estratégia certa na prova.",
  },
  {
    id: "planejamento",
    emoji: "🗓️",
    nome: "Planejamento semanal",
    resumo: "Monte uma rotina realista com horários fixos para cada matéria.",
    quandoUsar: "No começo da semana, ou quando você sente que está estudando sem rumo.",
    passos: [
      "Liste suas provas, trabalhos e metas da semana.",
      "Reserve horários fixos e curtos todos os dias (ex.: 1h por dia).",
      "Distribua as matérias, priorizando as mais difíceis e as provas mais próximas.",
      "Inclua revisões (repetição espaçada) e descanso.",
      "No domingo, avalie o que funcionou e ajuste.",
    ],
    dica: "Uma rotina pequena que você cumpre vale mais que uma rotina enorme que você abandona.",
  },
];

export const DICAS_DO_DIA = [
  "Dormir bem é parte do estudo: é durante o sono que o cérebro fixa o que você aprendeu.",
  "Estude no mesmo lugar e horário: o cérebro cria o hábito mais rápido.",
  "Reler e grifar dá sensação de aprendizado, mas testar a memória funciona muito mais.",
  "Comece pela tarefa mais difícil, quando você ainda tem mais energia.",
  "Celular longe = foco perto. Deixe-o em outro cômodo durante o pomodoro.",
  "Ensinar alguém é a melhor forma de descobrir o que você ainda não entendeu.",
  "Beba água e faça pausas: o cérebro também cansa.",
  "Errou uma questão? Anote o porquê. Um caderno de erros vale ouro antes da prova.",
];

export function dicaDoDia() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  return DICAS_DO_DIA[dayOfYear % DICAS_DO_DIA.length];
}
