/**
 * Módulo de Técnicas DBT (Terapia Comportamental Dialética)
 * Implementa as 4 habilidades principais: Mindfulness, Tolerância ao Mal-estar,
 * Regulação Emocional e Efetividade Interpessoal
 */

// Categorias de habilidades DBT
export type DBTSkillCategory = 
  | 'mindfulness'           // Atenção plena
  | 'distress_tolerance'    // Tolerância ao mal-estar
  | 'emotion_regulation'    // Regulação emocional
  | 'interpersonal'         // Efetividade interpessoal

export interface DBTSkill {
  id: string
  name: string
  acronym?: string
  category: DBTSkillCategory
  description: string
  steps: string[]
  whenToUse: string[]
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// =====================
// MINDFULNESS (Atenção Plena)
// =====================

export const MINDFULNESS_SKILLS: DBTSkill[] = [
  {
    id: 'wise_mind',
    name: 'Mente Sábia',
    category: 'mindfulness',
    description: 'Encontre o equilíbrio entre razão e emoção.',
    steps: [
      '1. Feche os olhos e respire profundamente',
      '2. Identifique o que sua "mente racional" diz (fatos, lógica)',
      '3. Identifique o que sua "mente emocional" diz (sentimentos)',
      '4. Procure o ponto de encontro entre as duas',
      '5. Pergunte: "O que minha intuição mais profunda diz?"',
      '6. Essa é sua mente sábia falando'
    ],
    whenToUse: ['Decisões difíceis', 'Conflitos internos', 'Quando se sente dividido'],
    duration: '5-10 minutos',
    difficulty: 'medium'
  },
  {
    id: 'observe',
    name: 'Observar',
    category: 'mindfulness',
    description: 'Observe sua experiência sem julgamento.',
    steps: [
      '1. Escolha algo para observar (respiração, sons, sensações)',
      '2. Apenas observe, como se fosse um cientista curioso',
      '3. Quando pensamentos surgirem, note-os e volte a observar',
      '4. Não tente mudar nada, apenas perceba',
      '5. Observe sem palavras, apenas experienciando'
    ],
    whenToUse: ['Início de mindfulness', 'Quando sobrecarregado', 'Para se centrar'],
    duration: '3-10 minutos',
    difficulty: 'easy'
  },
  {
    id: 'describe',
    name: 'Descrever',
    category: 'mindfulness',
    description: 'Coloque palavras na sua experiência.',
    steps: [
      '1. Observe sua experiência atual',
      '2. Descreva usando fatos, não julgamentos',
      '3. Diga "Estou tendo o pensamento de que..." em vez de "É verdade que..."',
      '4. Separe observações de interpretações',
      '5. Use palavras simples e precisas'
    ],
    whenToUse: ['Processamento emocional', 'Comunicação', 'Autoconhecimento'],
    duration: '5 minutos',
    difficulty: 'easy'
  },
  {
    id: 'participate',
    name: 'Participar',
    category: 'mindfulness',
    description: 'Engaje-se completamente no momento presente.',
    steps: [
      '1. Escolha uma atividade (caminhar, comer, conversar)',
      '2. Dê toda sua atenção a ela',
      '3. Solte a autoconsciência excessiva',
      '4. Torne-se um com a experiência',
      '5. Se distrair, gentilmente volte à atividade'
    ],
    whenToUse: ['Qualquer atividade', 'Quando se sente desconectado', 'Para aumentar prazer'],
    duration: 'Variável',
    difficulty: 'easy'
  }
]

// =====================
// TOLERÂNCIA AO MAL-ESTAR (Distress Tolerance)
// =====================

export const DISTRESS_TOLERANCE_SKILLS: DBTSkill[] = [
  {
    id: 'tipp',
    name: 'TIPP',
    acronym: 'TIPP',
    category: 'distress_tolerance',
    description: 'Técnica de emergência para crises intensas.',
    steps: [
      'T - Temperatura: Coloque água fria no rosto ou segure gelo',
      'I - Exercício Intenso: Faça exercício vigoroso por 20 minutos',
      'P - Respiração Pausada: Expire mais devagar que inspira (4-7-8)',
      'P - Relaxamento muscular Progressivo: Tensione e solte grupos musculares'
    ],
    whenToUse: ['Crise intensa', 'Impulsos fortes', 'Pânico', 'Raiva extrema'],
    duration: '5-20 minutos',
    difficulty: 'easy'
  },
  {
    id: 'stop',
    name: 'STOP',
    acronym: 'STOP',
    category: 'distress_tolerance',
    description: 'Pare antes de agir impulsivamente.',
    steps: [
      'S - Stop (Pare): Congele, não reaja',
      'T - Take a step back (Dê um passo atrás): Respire, não aja imediatamente',
      'O - Observe: O que está acontecendo? O que você está sentindo?',
      'P - Proceed mindfully (Proceda com atenção): Aja com consciência'
    ],
    whenToUse: ['Impulsos', 'Raiva', 'Antes de decisões importantes'],
    duration: '1-5 minutos',
    difficulty: 'easy'
  },
  {
    id: 'accepts',
    name: 'ACCEPTS',
    acronym: 'ACCEPTS',
    category: 'distress_tolerance',
    description: 'Estratégias de distração para crises.',
    steps: [
      'A - Atividades: Faça algo que ocupe sua mente',
      'C - Contribuir: Ajude alguém, faça voluntariado',
      'C - Comparações: Compare com momentos piores que você superou',
      'E - Emoções opostas: Gere emoções diferentes (música alegre, comédia)',
      'P - Pensamentos afastadores: Conte de 7 em 7, recite algo',
      'T - Sensações físicas: Gelo, elástico no pulso, cheiro forte',
      'S - Saia da situação: Afaste-se temporariamente'
    ],
    whenToUse: ['Quando não pode resolver o problema agora', 'Emoções avassaladoras'],
    duration: 'Variável',
    difficulty: 'easy'
  },
  {
    id: 'improve',
    name: 'IMPROVE',
    acronym: 'IMPROVE',
    category: 'distress_tolerance',
    description: 'Melhore o momento presente.',
    steps: [
      'I - Imagery (Imaginação): Visualize um lugar seguro e calmo',
      'M - Meaning (Significado): Encontre sentido na situação',
      'P - Prayer (Oração/Meditação): Conecte-se com algo maior',
      'R - Relaxamento: Use técnicas de relaxamento',
      'O - One thing (Uma coisa): Foque em uma coisa de cada vez',
      'V - Vacation (Férias mentais): Tire uma pausa mental breve',
      'E - Encouragement (Encorajamento): Fale gentilmente consigo mesmo'
    ],
    whenToUse: ['Situações estressantes prolongadas', 'Quando não pode mudar a situação'],
    duration: 'Variável',
    difficulty: 'medium'
  },
  {
    id: 'radical_acceptance',
    name: 'Aceitação Radical',
    category: 'distress_tolerance',
    description: 'Aceite a realidade como ela é, sem aprovação.',
    steps: [
      '1. Observe que está lutando contra a realidade',
      '2. Lembre-se: rejeitar a realidade não a muda, só aumenta o sofrimento',
      '3. Aceite que o momento presente é o único que existe',
      '4. Aceitar não significa aprovar ou desistir',
      '5. Pratique aceitar com todo o corpo (relaxe os músculos)',
      '6. Use uma frase: "É assim que as coisas são neste momento"',
      '7. Aceite que a vida vale a pena mesmo com dor'
    ],
    whenToUse: ['Perdas', 'Situações que não pode mudar', 'Sofrimento intenso'],
    duration: 'Prática contínua',
    difficulty: 'hard'
  },
  {
    id: 'self_soothe',
    name: 'Auto-acalmar com os 5 Sentidos',
    category: 'distress_tolerance',
    description: 'Use os sentidos para se acalmar.',
    steps: [
      'Visão: Olhe algo bonito - natureza, arte, fotos queridas',
      'Audição: Ouça música calma, sons da natureza, silêncio',
      'Olfato: Use aromas agradáveis - lavanda, café, flores',
      'Paladar: Saboreie algo gostoso lentamente - chá, chocolate',
      'Tato: Tome banho quente, use cobertor macio, abrace um pet'
    ],
    whenToUse: ['Ansiedade', 'Tristeza', 'Necessidade de conforto'],
    duration: '5-30 minutos',
    difficulty: 'easy'
  }
]

// =====================
// REGULAÇÃO EMOCIONAL
// =====================

export const EMOTION_REGULATION_SKILLS: DBTSkill[] = [
  {
    id: 'please',
    name: 'PLEASE',
    acronym: 'PLEASE',
    category: 'emotion_regulation',
    description: 'Cuide do corpo para reduzir vulnerabilidade emocional.',
    steps: [
      'PL - Treat PhysicaL illness (Trate doenças físicas)',
      'E - Eating balanced (Alimentação equilibrada)',
      'A - Avoid mood-altering substances (Evite substâncias)',
      'S - Sleep balanced (Sono equilibrado - 7-9 horas)',
      'E - Exercise (Exercício regular - 20-30 min/dia)'
    ],
    whenToUse: ['Prevenção diária', 'Quando vulnerável', 'Antes de situações difíceis'],
    duration: 'Estilo de vida',
    difficulty: 'medium'
  },
  {
    id: 'abc',
    name: 'ABC PLEASE',
    acronym: 'ABC',
    category: 'emotion_regulation',
    description: 'Acumule experiências positivas.',
    steps: [
      'A - Accumulate positives (Acumule experiências positivas)',
      '   - Curto prazo: Faça coisas agradáveis diariamente',
      '   - Longo prazo: Trabalhe em direção aos seus valores',
      'B - Build mastery (Construa maestria)',
      '   - Faça coisas que te fazem sentir competente',
      'C - Cope ahead (Prepare-se antecipadamente)',
      '   - Planeje como lidar com situações difíceis futuras'
    ],
    whenToUse: ['Prevenção', 'Construir resiliência', 'Antes de eventos difíceis'],
    duration: 'Estilo de vida',
    difficulty: 'medium'
  },
  {
    id: 'opposite_action',
    name: 'Ação Oposta',
    category: 'emotion_regulation',
    description: 'Aja de forma oposta à urgência da emoção.',
    steps: [
      '1. Identifique a emoção e sua intensidade',
      '2. Pergunte: essa emoção é justificada pelos fatos?',
      '3. Se não justificada, ou se agir pioraria as coisas:',
      '4. Identifique a urgência de ação da emoção',
      '5. Faça o OPOSTO dessa urgência',
      '6. Aja por completo, incluindo postura e expressão',
      '7. Repita até a emoção diminuir'
    ],
    whenToUse: [
      'Medo injustificado → Aproxime-se',
      'Tristeza → Ative-se, socialize',
      'Raiva injustificada → Seja gentil, afaste-se',
      'Vergonha injustificada → Exponha-se, repita'
    ],
    duration: 'Variável',
    difficulty: 'hard'
  },
  {
    id: 'check_the_facts',
    name: 'Checar os Fatos',
    category: 'emotion_regulation',
    description: 'Verifique se sua emoção corresponde aos fatos.',
    steps: [
      '1. Qual é a emoção que estou sentindo?',
      '2. Qual é o evento que desencadeou?',
      '3. Quais são minhas interpretações/suposições sobre o evento?',
      '4. Estou assumindo uma ameaça que não existe?',
      '5. Qual é a catástrofe que imagino? Qual a probabilidade real?',
      '6. Essa emoção corresponde aos fatos reais?',
      '7. A intensidade corresponde à situação real?'
    ],
    whenToUse: ['Emoções intensas', 'Antes de reagir', 'Quando em dúvida'],
    duration: '5-10 minutos',
    difficulty: 'medium'
  },
  {
    id: 'wave',
    name: 'Surfar a Onda Emocional',
    category: 'emotion_regulation',
    description: 'Deixe a emoção passar naturalmente.',
    steps: [
      '1. Observe a emoção surgindo, como uma onda',
      '2. Não tente empurrar ou intensificar',
      '3. Lembre-se: emoções são temporárias',
      '4. Imagine-se surfando a onda',
      '5. A onda sobe, atinge o pico e desce',
      '6. Você pode sobreviver a essa onda',
      '7. Depois que passar, você ainda estará aqui'
    ],
    whenToUse: ['Emoções intensas', 'Crises', 'Quando não pode fazer nada'],
    duration: '10-30 minutos',
    difficulty: 'medium'
  }
]

// =====================
// EFETIVIDADE INTERPESSOAL
// =====================

export const INTERPERSONAL_SKILLS: DBTSkill[] = [
  {
    id: 'dearman',
    name: 'DEAR MAN',
    acronym: 'DEAR MAN',
    category: 'interpersonal',
    description: 'Peça o que você quer de forma efetiva.',
    steps: [
      'D - Describe (Descreva): Descreva a situação com fatos',
      'E - Express (Expresse): Diga como você se sente ("Eu me sinto...")',
      'A - Assert (Afirme): Peça o que você quer claramente',
      'R - Reinforce (Reforce): Explique os benefícios de atender seu pedido',
      'M - Mindful (Atento): Mantenha o foco no seu objetivo',
      'A - Appear confident (Pareça confiante): Postura, tom de voz',
      'N - Negotiate (Negocie): Esteja disposto a dar para receber'
    ],
    whenToUse: ['Pedidos', 'Negociações', 'Resolver conflitos'],
    duration: 'Variável',
    difficulty: 'medium'
  },
  {
    id: 'give',
    name: 'GIVE',
    acronym: 'GIVE',
    category: 'interpersonal',
    description: 'Mantenha relacionamentos saudáveis.',
    steps: [
      'G - Gentle (Gentil): Seja gentil, não ataque ou julgue',
      'I - Interested (Interessado): Mostre interesse genuíno',
      'V - Validate (Valide): Reconheça sentimentos e perspectivas do outro',
      'E - Easy manner (Maneira leve): Use humor, sorria'
    ],
    whenToUse: ['Conversas difíceis', 'Manutenção de relacionamentos', 'Conflitos'],
    duration: 'Durante interações',
    difficulty: 'easy'
  },
  {
    id: 'fast',
    name: 'FAST',
    acronym: 'FAST',
    category: 'interpersonal',
    description: 'Mantenha seu autorrespeito.',
    steps: [
      'F - Fair (Justo): Seja justo consigo e com o outro',
      'A - no Apologies (Sem desculpas excessivas): Não peça desculpas demais',
      'S - Stick to values (Mantenha valores): Não abandone seus princípios',
      'T - Truthful (Verdadeiro): Seja honesto, não exagere'
    ],
    whenToUse: ['Quando pressionado', 'Situações de pressão social', 'Manter limites'],
    duration: 'Durante interações',
    difficulty: 'medium'
  },
  {
    id: 'think',
    name: 'THINK',
    acronym: 'THINK',
    category: 'interpersonal',
    description: 'Antes de falar, pergunte-se:',
    steps: [
      'T - É True (Verdade)?',
      'H - É Helpful (Útil)?',
      'I - É Inspiring (Inspirador)?',
      'N - É Necessary (Necessário)?',
      'K - É Kind (Gentil)?'
    ],
    whenToUse: ['Antes de falar', 'Conversas difíceis', 'Redes sociais'],
    duration: 'Momentâneo',
    difficulty: 'easy'
  }
]

// Todas as habilidades DBT combinadas
export const ALL_DBT_SKILLS: DBTSkill[] = [
  ...MINDFULNESS_SKILLS,
  ...DISTRESS_TOLERANCE_SKILLS,
  ...EMOTION_REGULATION_SKILLS,
  ...INTERPERSONAL_SKILLS
]

// =====================
// FUNÇÕES AUXILIARES
// =====================

/**
 * Retorna habilidades por categoria
 */
export function getSkillsByCategory(category: DBTSkillCategory): DBTSkill[] {
  return ALL_DBT_SKILLS.filter(skill => skill.category === category)
}

/**
 * Sugere habilidades DBT baseadas no problema
 */
export function suggestDBTSkills(problem: string): DBTSkill[] {
  const lowerProblem = problem.toLowerCase()
  const suggestions: DBTSkill[] = []
  
  // Crise / Emergência
  if (lowerProblem.match(/crise|pânico|desespero|urgente|agora|não aguento/)) {
    suggestions.push(...DISTRESS_TOLERANCE_SKILLS.filter(s => ['tipp', 'stop', 'self_soothe'].includes(s.id)))
  }
  
  // Ansiedade / Preocupação
  if (lowerProblem.match(/ansie|preocup|nervos|medo|apavorad/)) {
    suggestions.push(
      ...MINDFULNESS_SKILLS.filter(s => ['observe', 'wise_mind'].includes(s.id)),
      ...DISTRESS_TOLERANCE_SKILLS.filter(s => ['tipp', 'accepts'].includes(s.id)),
      ...EMOTION_REGULATION_SKILLS.filter(s => ['check_the_facts', 'wave'].includes(s.id))
    )
  }
  
  // Raiva / Irritação
  if (lowerProblem.match(/raiva|irritad|brav|ódio|furios/)) {
    suggestions.push(
      ...DISTRESS_TOLERANCE_SKILLS.filter(s => ['tipp', 'stop'].includes(s.id)),
      ...EMOTION_REGULATION_SKILLS.filter(s => ['opposite_action', 'check_the_facts'].includes(s.id)),
      ...INTERPERSONAL_SKILLS.filter(s => ['give', 'think'].includes(s.id))
    )
  }
  
  // Tristeza / Depressão
  if (lowerProblem.match(/trist|deprim|desanim|chorand|vazio/)) {
    suggestions.push(
      ...EMOTION_REGULATION_SKILLS.filter(s => ['please', 'abc', 'opposite_action'].includes(s.id)),
      ...DISTRESS_TOLERANCE_SKILLS.filter(s => ['improve', 'self_soothe'].includes(s.id))
    )
  }
  
  // Relacionamentos
  if (lowerProblem.match(/relacion|briga|conflito|discussão|família|namorad|amig/)) {
    suggestions.push(...INTERPERSONAL_SKILLS)
  }
  
  // Impulsividade
  if (lowerProblem.match(/impuls|vontade de|urge|não consigo parar/)) {
    suggestions.push(
      ...DISTRESS_TOLERANCE_SKILLS.filter(s => ['stop', 'tipp', 'radical_acceptance'].includes(s.id)),
      ...MINDFULNESS_SKILLS.filter(s => s.id === 'wise_mind')
    )
  }
  
  // Aceitação
  if (lowerProblem.match(/aceitar|superar|seguir em frente|perda|luto/)) {
    suggestions.push(
      ...DISTRESS_TOLERANCE_SKILLS.filter(s => ['radical_acceptance', 'improve'].includes(s.id)),
      ...EMOTION_REGULATION_SKILLS.filter(s => s.id === 'wave')
    )
  }
  
  // Se não houver sugestões específicas, retorna habilidades básicas
  if (suggestions.length === 0) {
    suggestions.push(
      ...MINDFULNESS_SKILLS.filter(s => s.difficulty === 'easy'),
      ...DISTRESS_TOLERANCE_SKILLS.filter(s => s.id === 'self_soothe')
    )
  }
  
  // Remove duplicatas
  const uniqueIds = new Set<string>()
  return suggestions.filter(skill => {
    if (uniqueIds.has(skill.id)) return false
    uniqueIds.add(skill.id)
    return true
  })
}

/**
 * Guia uma técnica de respiração 4-7-8
 */
export function getBreathingExercise(): { phase: string; duration: number }[] {
  return [
    { phase: 'Inspire pelo nariz', duration: 4000 },
    { phase: 'Segure a respiração', duration: 7000 },
    { phase: 'Expire pela boca', duration: 8000 },
  ]
}

/**
 * Retorna exercício de grounding 5-4-3-2-1
 */
export function getGroundingExercise(): { sense: string; count: number; instruction: string }[] {
  return [
    { sense: 'Visão', count: 5, instruction: 'Nomeie 5 coisas que você pode VER' },
    { sense: 'Tato', count: 4, instruction: 'Nomeie 4 coisas que você pode TOCAR' },
    { sense: 'Audição', count: 3, instruction: 'Nomeie 3 coisas que você pode OUVIR' },
    { sense: 'Olfato', count: 2, instruction: 'Nomeie 2 coisas que você pode CHEIRAR' },
    { sense: 'Paladar', count: 1, instruction: 'Nomeie 1 coisa que você pode PROVAR' },
  ]
}

/**
 * Lista de emoções para identificação
 */
export const EMOTION_WHEEL = {
  primary: ['Alegria', 'Tristeza', 'Raiva', 'Medo', 'Surpresa', 'Nojo'],
  secondary: {
    'Alegria': ['Felicidade', 'Contentamento', 'Otimismo', 'Orgulho', 'Esperança', 'Alívio'],
    'Tristeza': ['Solidão', 'Melancolia', 'Desesperança', 'Decepção', 'Saudade', 'Culpa'],
    'Raiva': ['Frustração', 'Irritação', 'Ressentimento', 'Ciúme', 'Inveja', 'Indignação'],
    'Medo': ['Ansiedade', 'Preocupação', 'Pânico', 'Insegurança', 'Vulnerabilidade', 'Terror'],
    'Surpresa': ['Espanto', 'Choque', 'Confusão', 'Admiração', 'Perplexidade'],
    'Nojo': ['Aversão', 'Desprezo', 'Repugnância', 'Tédio']
  }
}
