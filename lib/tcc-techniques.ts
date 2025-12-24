/**
 * Módulo de Técnicas TCC (Terapia Cognitivo-Comportamental)
 * Implementa técnicas baseadas em evidências para reestruturação cognitiva
 */

// Tipos de distorções cognitivas
export type CognitiveDistortion =
  | 'all_or_nothing'        // Pensamento tudo ou nada
  | 'overgeneralization'    // Generalização excessiva
  | 'mental_filter'         // Filtro mental (foco no negativo)
  | 'disqualifying_positive' // Desqualificar o positivo
  | 'jumping_conclusions'   // Tirar conclusões precipitadas
  | 'mind_reading'          // Leitura da mente
  | 'fortune_telling'       // Previsão do futuro
  | 'magnification'         // Magnificação/Catastrofização
  | 'minimization'          // Minimização
  | 'emotional_reasoning'   // Raciocínio emocional
  | 'should_statements'     // Declarações de "deveria"
  | 'labeling'              // Rotulação
  | 'personalization'       // Personalização
  | 'blame'                 // Culpa

export interface CognitiveDistortionInfo {
  id: CognitiveDistortion
  name: string
  description: string
  example: string
  challenge: string
}

export const COGNITIVE_DISTORTIONS: CognitiveDistortionInfo[] = [
  {
    id: 'all_or_nothing',
    name: 'Pensamento Tudo ou Nada',
    description: 'Ver as situações em apenas duas categorias, sem meio-termo.',
    example: '"Se eu não for perfeito, sou um fracasso total."',
    challenge: 'Existe algum meio-termo? O que seria um resultado parcialmente bom?'
  },
  {
    id: 'overgeneralization',
    name: 'Generalização Excessiva',
    description: 'Tirar uma conclusão ampla baseada em um único evento.',
    example: '"Fui rejeitado uma vez, ninguém nunca vai me aceitar."',
    challenge: 'Esse evento único realmente representa todas as situações?'
  },
  {
    id: 'mental_filter',
    name: 'Filtro Mental',
    description: 'Focar apenas nos aspectos negativos, ignorando os positivos.',
    example: '"Recebi 10 elogios e 1 crítica. Só consigo pensar na crítica."',
    challenge: 'O que você está deixando de ver? Quais foram os aspectos positivos?'
  },
  {
    id: 'disqualifying_positive',
    name: 'Desqualificar o Positivo',
    description: 'Rejeitar experiências positivas insistindo que "não contam".',
    example: '"Eles só disseram isso para ser educados, não é verdade."',
    challenge: 'Por que esse elogio não pode ser genuíno?'
  },
  {
    id: 'jumping_conclusions',
    name: 'Conclusões Precipitadas',
    description: 'Tirar conclusões negativas sem evidências suficientes.',
    example: '"Ela não respondeu minha mensagem, deve estar com raiva de mim."',
    challenge: 'Quais outras explicações existem para essa situação?'
  },
  {
    id: 'mind_reading',
    name: 'Leitura da Mente',
    description: 'Assumir que sabe o que os outros estão pensando.',
    example: '"Sei que ele me acha incompetente."',
    challenge: 'Você realmente sabe o que ele está pensando? Já perguntou?'
  },
  {
    id: 'fortune_telling',
    name: 'Previsão do Futuro',
    description: 'Prever que as coisas vão dar errado sem evidências.',
    example: '"Não vou conseguir, vai ser um desastre."',
    challenge: 'Você tem certeza do futuro? O que poderia dar certo?'
  },
  {
    id: 'magnification',
    name: 'Catastrofização',
    description: 'Exagerar a importância dos problemas.',
    example: '"Errei na apresentação, minha carreira acabou."',
    challenge: 'Qual é a real proporção desse problema? É realmente tão grave?'
  },
  {
    id: 'minimization',
    name: 'Minimização',
    description: 'Diminuir a importância das suas qualidades ou conquistas.',
    example: '"Qualquer um conseguiria fazer isso, não é nada demais."',
    challenge: 'Se um amigo fizesse isso, você diria o mesmo?'
  },
  {
    id: 'emotional_reasoning',
    name: 'Raciocínio Emocional',
    description: 'Assumir que suas emoções refletem a realidade.',
    example: '"Sinto que sou um fracasso, então devo ser."',
    challenge: 'Sentir algo é o mesmo que ser verdade? Quais são os fatos?'
  },
  {
    id: 'should_statements',
    name: 'Declarações de "Deveria"',
    description: 'Ter regras rígidas sobre como você ou outros devem agir.',
    example: '"Eu deveria sempre agradar a todos."',
    challenge: 'Essa regra é realista? O que acontece se você não seguir?'
  },
  {
    id: 'labeling',
    name: 'Rotulação',
    description: 'Colocar rótulos negativos fixos em si mesmo ou nos outros.',
    example: '"Sou um idiota" em vez de "Cometi um erro".',
    challenge: 'Esse rótulo define quem você é, ou apenas descreve uma ação?'
  },
  {
    id: 'personalization',
    name: 'Personalização',
    description: 'Assumir responsabilidade por eventos fora do seu controle.',
    example: '"Meu filho foi mal na prova, sou uma mãe terrível."',
    challenge: 'Você é realmente o único responsável? Quais outros fatores existem?'
  },
  {
    id: 'blame',
    name: 'Culpa',
    description: 'Culpar outros por seus problemas ou culpar-se pelos problemas dos outros.',
    example: '"É tudo culpa dele" ou "É tudo minha culpa".',
    challenge: 'Qual é a responsabilidade real de cada pessoa nessa situação?'
  },
]

// Registro de Pensamentos (Thought Record)
export interface ThoughtRecord {
  id: string
  date: Date
  situation: string              // Situação que desencadeou
  automaticThought: string       // Pensamento automático
  emotions: { name: string; intensity: number }[]  // Emoções (0-100)
  cognitiveDistortions: CognitiveDistortion[]
  evidence_for: string           // Evidências a favor do pensamento
  evidence_against: string       // Evidências contra o pensamento
  balancedThought: string        // Pensamento equilibrado
  newEmotions: { name: string; intensity: number }[]  // Novas emoções após
  actionPlan?: string            // Plano de ação
}

// Experimento Comportamental
export interface BehavioralExperiment {
  id: string
  date: Date
  belief: string                 // Crença a testar
  prediction: string             // Previsão (o que espera acontecer)
  experiment: string             // Descrição do experimento
  outcome: string                // Resultado real
  conclusion: string             // O que aprendeu
  newBelief?: string            // Nova crença atualizada
}

// Técnicas TCC disponíveis
export interface TCCTechnique {
  id: string
  name: string
  category: 'cognitive' | 'behavioral' | 'both'
  description: string
  steps: string[]
  benefits: string[]
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const TCC_TECHNIQUES: TCCTechnique[] = [
  {
    id: 'thought_record',
    name: 'Registro de Pensamentos',
    category: 'cognitive',
    description: 'Identifique e questione pensamentos automáticos negativos.',
    steps: [
      '1. Descreva a situação que desencadeou o pensamento',
      '2. Identifique o pensamento automático',
      '3. Nomeie as emoções e sua intensidade (0-100)',
      '4. Identifique distorções cognitivas presentes',
      '5. Liste evidências a favor e contra o pensamento',
      '6. Formule um pensamento mais equilibrado',
      '7. Reavalie as emoções'
    ],
    benefits: ['Reduz ruminação', 'Melhora perspectiva', 'Diminui ansiedade'],
    duration: '10-20 minutos',
    difficulty: 'medium'
  },
  {
    id: 'behavioral_activation',
    name: 'Ativação Comportamental',
    category: 'behavioral',
    description: 'Agende atividades prazerosas para combater a depressão.',
    steps: [
      '1. Liste atividades que já trouxeram prazer ou realização',
      '2. Avalie seu humor atual (0-10)',
      '3. Escolha uma atividade pequena e realizável',
      '4. Agende um horário específico',
      '5. Faça a atividade mesmo sem vontade',
      '6. Avalie seu humor depois (0-10)',
      '7. Celebre o pequeno passo'
    ],
    benefits: ['Aumenta energia', 'Melhora humor', 'Quebra ciclo de inatividade'],
    duration: 'Variável',
    difficulty: 'easy'
  },
  {
    id: 'behavioral_experiment',
    name: 'Experimento Comportamental',
    category: 'both',
    description: 'Teste suas crenças negativas na prática.',
    steps: [
      '1. Identifique uma crença negativa específica',
      '2. Faça uma previsão baseada nessa crença',
      '3. Planeje um experimento seguro para testar',
      '4. Execute o experimento',
      '5. Compare o resultado com sua previsão',
      '6. Tire conclusões baseadas em evidências',
      '7. Atualize sua crença se necessário'
    ],
    benefits: ['Evidência real', 'Aumenta confiança', 'Desafia medos'],
    duration: 'Variável',
    difficulty: 'medium'
  },
  {
    id: 'cognitive_restructuring',
    name: 'Reestruturação Cognitiva',
    category: 'cognitive',
    description: 'Substitua pensamentos distorcidos por pensamentos realistas.',
    steps: [
      '1. Identifique o pensamento negativo',
      '2. Reconheça a distorção cognitiva',
      '3. Pergunte: "Quais são as evidências?"',
      '4. Considere perspectivas alternativas',
      '5. Formule um pensamento mais realista',
      '6. Pratique o novo pensamento'
    ],
    benefits: ['Pensamento mais flexível', 'Reduz emoções negativas'],
    duration: '5-15 minutos',
    difficulty: 'medium'
  },
  {
    id: 'socratic_questioning',
    name: 'Questionamento Socrático',
    category: 'cognitive',
    description: 'Use perguntas para examinar e desafiar pensamentos.',
    steps: [
      '1. "Qual é a evidência para esse pensamento?"',
      '2. "Qual é a evidência contra?"',
      '3. "Existe uma explicação alternativa?"',
      '4. "O que de pior poderia acontecer? E de melhor? E mais provável?"',
      '5. "Se um amigo pensasse isso, o que você diria?"',
      '6. "Esse pensamento te ajuda ou te prejudica?"'
    ],
    benefits: ['Autoconhecimento', 'Pensamento crítico', 'Perspectiva'],
    duration: '5-10 minutos',
    difficulty: 'easy'
  },
  {
    id: 'graded_exposure',
    name: 'Exposição Gradual',
    category: 'behavioral',
    description: 'Enfrente medos gradualmente, do menos ao mais difícil.',
    steps: [
      '1. Liste situações que causam ansiedade',
      '2. Ordene da menos à mais ansiogênica (0-100)',
      '3. Comece pela situação menos difícil',
      '4. Permaneça na situação até a ansiedade diminuir',
      '5. Repita até sentir confiança',
      '6. Avance para o próximo nível',
      '7. Celebre cada conquista'
    ],
    benefits: ['Supera fobias', 'Aumenta tolerância', 'Gera confiança'],
    duration: 'Semanas a meses',
    difficulty: 'hard'
  },
  {
    id: 'worry_time',
    name: 'Tempo de Preocupação',
    category: 'behavioral',
    description: 'Limite preocupações a um período específico do dia.',
    steps: [
      '1. Escolha um horário fixo para se preocupar (15-30 min)',
      '2. Durante o dia, anote preocupações que surgirem',
      '3. Diga a si mesmo: "Vou pensar nisso no meu horário"',
      '4. No horário marcado, preocupe-se ativamente',
      '5. Busque soluções para preocupações controláveis',
      '6. Aceite preocupações incontroláveis',
      '7. Quando o tempo acabar, pare'
    ],
    benefits: ['Reduz ruminação', 'Mais controle', 'Libera o resto do dia'],
    duration: '15-30 minutos',
    difficulty: 'easy'
  },
  {
    id: 'activity_monitoring',
    name: 'Monitoramento de Atividades',
    category: 'behavioral',
    description: 'Registre atividades e humor para identificar padrões.',
    steps: [
      '1. Divida o dia em blocos de 1-2 horas',
      '2. Anote o que fez em cada bloco',
      '3. Avalie prazer (0-10) e realização (0-10)',
      '4. Faça isso por uma semana',
      '5. Identifique padrões: o que aumenta/diminui humor?',
      '6. Planeje mais atividades que melhoram o humor',
      '7. Reduza atividades que pioram'
    ],
    benefits: ['Autoconhecimento', 'Identificação de padrões', 'Base para mudança'],
    duration: '5 min por dia',
    difficulty: 'easy'
  }
]

// Funções auxiliares

/**
 * Detecta possíveis distorções cognitivas em um texto
 */
export function detectCognitiveDistortions(text: string): CognitiveDistortion[] {
  const detected: CognitiveDistortion[] = []
  const lowerText = text.toLowerCase()
  
  // Padrões de detecção
  const patterns: { distortion: CognitiveDistortion; keywords: string[] }[] = [
    { distortion: 'all_or_nothing', keywords: ['sempre', 'nunca', 'tudo', 'nada', 'completamente', 'totalmente', 'perfeito'] },
    { distortion: 'overgeneralization', keywords: ['todo mundo', 'ninguém', 'todos', 'sempre acontece', 'nunca consigo'] },
    { distortion: 'mental_filter', keywords: ['só consigo ver', 'só penso', 'não consigo esquecer'] },
    { distortion: 'should_statements', keywords: ['deveria', 'devo', 'tenho que', 'preciso', 'não deveria'] },
    { distortion: 'labeling', keywords: ['sou um', 'sou uma', 'ele é um', 'ela é uma', 'idiota', 'fracasso', 'inútil'] },
    { distortion: 'fortune_telling', keywords: ['vai dar errado', 'não vai funcionar', 'com certeza', 'sei que vai'] },
    { distortion: 'mind_reading', keywords: ['ele acha', 'ela pensa', 'eles acham', 'sei que pensam'] },
    { distortion: 'emotional_reasoning', keywords: ['sinto que', 'me sinto', 'parece que'] },
    { distortion: 'magnification', keywords: ['terrível', 'horrível', 'catástrofe', 'desastre', 'fim do mundo'] },
    { distortion: 'personalization', keywords: ['minha culpa', 'por minha causa', 'eu causei'] },
  ]
  
  for (const { distortion, keywords } of patterns) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        if (!detected.includes(distortion)) {
          detected.push(distortion)
        }
        break
      }
    }
  }
  
  return detected
}

/**
 * Gera perguntas socráticas para um pensamento
 */
export function generateSocraticQuestions(thought: string): string[] {
  return [
    `Quais são as evidências concretas de que "${thought.slice(0, 50)}..." é verdade?`,
    'Quais são as evidências contra esse pensamento?',
    'Existe uma explicação alternativa para essa situação?',
    'Se um amigo querido tivesse esse pensamento, o que você diria a ele?',
    'O que de pior poderia acontecer? E de melhor? E o mais provável?',
    'Esse pensamento está te ajudando ou te prejudicando agora?',
    'Como você se sentirá sobre isso daqui a uma semana? Um mês? Um ano?',
    'O que você pode fazer de diferente nessa situação?'
  ]
}

/**
 * Sugere técnicas TCC baseadas no problema
 */
export function suggestTCCTechniques(problem: string): TCCTechnique[] {
  const lowerProblem = problem.toLowerCase()
  const suggestions: TCCTechnique[] = []
  
  // Mapeamento problema -> técnicas
  if (lowerProblem.includes('pensamento') || lowerProblem.includes('penso')) {
    suggestions.push(...TCC_TECHNIQUES.filter(t => t.category === 'cognitive' || t.id === 'thought_record'))
  }
  
  if (lowerProblem.includes('ansiedad') || lowerProblem.includes('medo') || lowerProblem.includes('preocup')) {
    suggestions.push(...TCC_TECHNIQUES.filter(t => ['graded_exposure', 'worry_time', 'socratic_questioning'].includes(t.id)))
  }
  
  if (lowerProblem.includes('depress') || lowerProblem.includes('triste') || lowerProblem.includes('desanim')) {
    suggestions.push(...TCC_TECHNIQUES.filter(t => ['behavioral_activation', 'activity_monitoring'].includes(t.id)))
  }
  
  if (lowerProblem.includes('crença') || lowerProblem.includes('acho que')) {
    suggestions.push(...TCC_TECHNIQUES.filter(t => t.id === 'behavioral_experiment'))
  }
  
  // Se não houver sugestões específicas, retorna técnicas básicas
  if (suggestions.length === 0) {
    suggestions.push(...TCC_TECHNIQUES.filter(t => t.difficulty === 'easy'))
  }
  
  // Remove duplicatas
  return [...new Set(suggestions)]
}

/**
 * Cria um template de registro de pensamentos
 */
export function createThoughtRecordTemplate(): Omit<ThoughtRecord, 'id'> {
  return {
    date: new Date(),
    situation: '',
    automaticThought: '',
    emotions: [],
    cognitiveDistortions: [],
    evidence_for: '',
    evidence_against: '',
    balancedThought: '',
    newEmotions: [],
    actionPlan: ''
  }
}
