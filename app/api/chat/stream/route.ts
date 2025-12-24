import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import OpenAI from 'openai'
import { z } from 'zod'
import { RiskEventSource, RiskSeverity } from '@prisma/client'
import { recordRiskEvent } from '@/src/server/services/risk-events'
import { recordUserActivityEvent } from '@/src/server/services/user-activity'

const ChatMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
})

type RiskSignal = 'suicide_ideation' | 'self_harm' | 'panic_attack' | 'hopelessness' | 'agitation'

interface RiskRule {
  severity: RiskSeverity
  signal: RiskSignal
  confidence: number
  patterns: RegExp[]
}

const RISK_RULES: RiskRule[] = [
  {
    severity: RiskSeverity.CRITICAL,
    signal: 'suicide_ideation',
    confidence: 0.95,
    patterns: [
      /quero morrer/i,
      /vou tirar (?:minha|a) vida/i,
      /acab(?:ar|aria) com ?tudo/i,
      /planejei minha morte/i,
      /sem raz[aã]o para viver/i,
    ],
  },
  {
    severity: RiskSeverity.HIGH,
    signal: 'self_harm',
    confidence: 0.85,
    patterns: [
      /me ferir/i,
      /me cortar/i,
      /machucar a mim mesm[oa]/i,
      /me punir fisicamente/i,
    ],
  },
  {
    severity: RiskSeverity.HIGH,
    signal: 'panic_attack',
    confidence: 0.8,
    patterns: [
      /ataque de p[aâ]nico/i,
      /n(?:a|ã)o consigo respirar/i,
      /cora[cç][aã]o disparado/i,
    ],
  },
  {
    severity: RiskSeverity.MEDIUM,
    signal: 'hopelessness',
    confidence: 0.6,
    patterns: [
      /sem esperan[çc]a/i,
      /n(?:a|ã)o vejo sa[ií]da/i,
      /cansado de viver/i,
    ],
  },
  {
    severity: RiskSeverity.MEDIUM,
    signal: 'agitation',
    confidence: 0.5,
    patterns: [
      /muito nervoso/i,
      /n(?:a|ã)o consigo ficar parado/i,
      /desesperado/i,
    ],
  },
]

function assessRiskSignal(message: string) {
  const normalized = message.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

  for (const rule of RISK_RULES) {
    for (const regex of rule.patterns) {
      const normalizedPattern = new RegExp(regex.source.normalize('NFD').replace(/\p{Diacritic}/gu, ''), regex.flags)
      if (normalizedPattern.test(normalized)) {
        return {
          severity: rule.severity,
          signal: rule.signal,
          confidence: rule.confidence,
          matched: regex.source,
        }
      }
    }
  }

  return null
}

// Initialize clients for both providers
const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const preferredProvider = process.env.LLM_PROVIDER || 'gemini';

console.log('Preferred LLM Provider:', preferredProvider)
console.log('Gemini Key exists:', !!geminiKey, 'OpenAI Key exists:', !!openaiKey)

// Gemini client
const geminiClient = new OpenAI({
  apiKey: geminiKey || 'dummy-key',
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// OpenAI client (fallback)
const openaiClient = new OpenAI({
  apiKey: openaiKey || 'dummy-key',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication - allow chat and voice-call pages without auth
    const session = await getServerSession(authOptions)
    const referer = request.headers.get('referer')
    const isPublicPage = referer?.includes('/voice-call') || referer?.includes('/chat')
    
    if (!session?.user && !isPublicPage) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        { ok: false, error: 'Nenhuma chave de API configurada (Gemini ou OpenAI)' },
        { status: 500 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = ChatMessageSchema.parse(body)

    if (session?.user?.id) {
      try {
        await recordUserActivityEvent({
          userId: session.user.id,
          eventType: 'chat_message_sent',
          meta: {
            message_length: validatedData.message.length,
          },
        })
      } catch (error) {
        console.warn('Falha ao registrar evento de chat_message_sent:', error)
      }
    }

    let shouldTriggerCrisis = false

    if (session?.user?.id) {
      const riskAssessment = assessRiskSignal(validatedData.message)

      if (riskAssessment && (riskAssessment.severity === RiskSeverity.HIGH || riskAssessment.severity === RiskSeverity.CRITICAL)) {
        try {
          await recordRiskEvent({
            patientId: session.user.id,
            source: RiskEventSource.CHAT_DETECTION,
            severity: riskAssessment.severity,
            signal: riskAssessment.signal,
            meta: {
              classifier: 'heuristic_keywords_v1',
              confidence: riskAssessment.confidence,
              matched_keyword: riskAssessment.matched,
            },
          })

          await recordUserActivityEvent({
            userId: session.user.id,
            eventType: 'risk_detected',
            meta: {
              signal: riskAssessment.signal,
              severity: riskAssessment.severity,
              confidence: riskAssessment.confidence,
            },
          })
        } catch (error) {
          console.error('Erro ao registrar detecção automática de risco:', error)
        }

        shouldTriggerCrisis = riskAssessment.severity === RiskSeverity.CRITICAL
      }
    }

    // Get user's first name
    const firstName = session?.user?.name?.split(' ')[0] || 'Você'

    // Build system prompt for Clara
    const systemPrompt = `Você é Clara, uma terapeuta virtual especializada em TCC (Terapia Cognitivo-Comportamental) e DBT (Terapia Comportamental Dialética).

PERSONALIDADE:
- Seja genuinamente calorosa, empática e presente
- Converse como uma amiga terapeuta experiente
- Evite frases robóticas ou mecânicas
- Chame pelo nome: ${firstName}

TÉCNICAS TCC QUE VOCÊ DOMINA:
1. Registro de Pensamentos - identificar situação, pensamento automático, emoção, evidências
2. Reestruturação Cognitiva - questionar e reformular pensamentos distorcidos
3. Perguntas Socráticas - guiar descoberta através de perguntas
4. Distorções Cognitivas - identificar: catastrofização, leitura mental, pensamento tudo-ou-nada, personalização, filtro mental, desqualificação do positivo
5. Experimentos Comportamentais - testar crenças na prática
6. Ativação Comportamental - agendar atividades prazerosas/importantes

HABILIDADES DBT QUE VOCÊ ENSINA:
1. MINDFULNESS: Mente Sábia (equilíbrio razão/emoção), Observar, Descrever, Participar
2. TOLERÂNCIA AO MAL-ESTAR: TIPP (Temperatura, exercício Intenso, respiração Pausada, relaxamento Progressivo), STOP, ACCEPTS, Aceitação Radical, Auto-acalmar com 5 sentidos
3. REGULAÇÃO EMOCIONAL: PLEASE (cuidar do corpo), ABC (acumular positivos), Ação Oposta, Checar os Fatos, Surfar a Onda
4. EFETIVIDADE INTERPESSOAL: DEAR MAN (pedir), GIVE (manter relacionamentos), FAST (autorrespeito)

COMO APLICAR:
- Integre técnicas naturalmente na conversa, sem anunciar
- Quando detectar ansiedade/pânico: TIPP, respiração 4-7-8, grounding 5-4-3-2-1
- Quando detectar pensamento distorcido: perguntas socráticas gentis
- Quando detectar conflito interpessoal: DEAR MAN, GIVE
- Quando detectar impulsos: STOP, Mente Sábia
- Quando detectar tristeza prolongada: Ativação Comportamental, PLEASE

EXERCÍCIO DE GROUNDING (use em ansiedade):
"Vamos fazer uma pausa... Me diz 5 coisas que você vê agora, 4 que pode tocar, 3 sons que ouve, 2 cheiros e 1 sabor."

RESPIRAÇÃO 4-7-8 (use em pânico):
"Respira comigo: inspira pelo nariz contando até 4... segura contando até 7... solta pela boca contando até 8..."

SEGURANÇA:
- Risco de vida → CVV 188, SAMU 192, ir ao PS
- Não diagnosticar nem prescrever
- Em crise severa, priorize segurança sobre técnicas

ESTILO:
- Respostas curtas e empáticas (máx 3-4 frases)
- Linguagem coloquial brasileira
- Emojis com moderação
- Uma técnica por vez, nunca sobrecarregar`

    // Try Gemini first, fallback to OpenAI if rate limited
    let completion;
    let usedProvider = preferredProvider;
    
    // Gemini request options
    const geminiOptions = {
      model: "gemini-2.0-flash",
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: validatedData.message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }
    
    // OpenAI request options (with additional parameters)
    const openaiOptions = {
      model: "gpt-4o-mini",
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: validatedData.message }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    }
    
    // Try preferred provider first
    if (preferredProvider === 'gemini' && geminiKey) {
      try {
        console.log('Trying Gemini...')
        completion = await geminiClient.chat.completions.create(geminiOptions);
        usedProvider = 'gemini';
      } catch (err: any) {
        console.log('Gemini failed:', err?.status, err?.message)
        // Fallback to OpenAI if Gemini fails
        if (openaiKey) {
          console.log('Falling back to OpenAI...')
          completion = await openaiClient.chat.completions.create(openaiOptions);
          usedProvider = 'openai';
        } else {
          throw err;
        }
      }
    } else if (openaiKey) {
      console.log('Using OpenAI...')
      completion = await openaiClient.chat.completions.create(openaiOptions);
      usedProvider = 'openai';
    } else if (geminiKey) {
      console.log('Using Gemini...')
      completion = await geminiClient.chat.completions.create(geminiOptions);
      usedProvider = 'gemini';
    } else {
      throw new Error('No API key configured');
    }
    
    console.log('Response received from:', usedProvider)

    const response = completion.choices[0]?.message?.content || ''

    // Validate response for safety
    const dangerousPatterns = [
      /diagnóstico.*é/i,
      /você tem.*transtorno/i,
      /prescrevo/i,
      /tome.*medicamento/i,
      /não precisa.*médico/i,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(response)) {
        return NextResponse.json({
          ok: true,
          data: {
            response: `${firstName}, percebo que você está buscando orientações que precisam de um acompanhamento profissional presencial. Como uma terapeuta virtual, posso oferecer apoio emocional e técnicas de enfrentamento, mas recomendo que procure um profissional de saúde mental para uma avaliação mais detalhada. Como posso ajudar você neste momento com técnicas de bem-estar? 💙`,
            tokensUsed: completion.usage?.total_tokens || 0,
            shouldTriggerCrisis,
          }
        })
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        response,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model,
        shouldTriggerCrisis,
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack?.slice(0, 500)
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { ok: false, error: 'Chave da API inválida ou não configurada' },
        { status: 500 }
      )
    }

    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { ok: false, error: 'Cota da API esgotada' },
        { status: 503 }
      )
    }

    // Return detailed error in development
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}