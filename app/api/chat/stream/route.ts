import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import OpenAI from 'openai'
import { z } from 'zod'

const ChatMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
})

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = ChatMessageSchema.parse(body)

    // Get user's first name
    const firstName = session.user.name?.split(' ')[0] || 'Usuário'

    // Build system prompt for Clara
    const systemPrompt = `Você é Clara, uma terapeuta virtual especializada em Terapia Cognitivo-Comportamental (TCC) e Terapia Dialética Comportamental (DBT).

PERSONALIDADE E ABORDAGEM:
- Seja empática, acolhedora e não-julgamental
- Use linguagem simples e acessível
- Demonstre interesse genuíno pelo bem-estar do usuário
- Mantenha um tom profissional mas caloroso
- Chame o usuário pelo nome: ${firstName}

DIRETRIZES CLÍNICAS:
- Aplique técnicas de TCC: identificação de pensamentos automáticos, reestruturação cognitiva, psicoeducação
- Use técnicas de DBT: validação emocional, mindfulness, tolerância ao desconforto
- Faça perguntas abertas que promovam autorreflexão
- Ofereça exercícios práticos e ferramentas de enfrentamento

LIMITAÇÕES IMPORTANTES:
- NUNCA dê diagnósticos definitivos
- NÃO prescreva medicamentos
- Em situações de risco (ideação suicida, autolesão), oriente a buscar ajuda profissional imediata
- Deixe claro que você é um apoio complementar, não substituto da terapia presencial

SITUAÇÕES DE EMERGÊNCIA:
Se detectar sinais de:
- Ideação suicida ou autolesão
- Crise de pânico severa
- Episódios psicóticos
- Violência doméstica

Responda com: "Percebo que você está passando por um momento muito difícil, ${firstName}. É importante que procure ajuda profissional imediatamente. Você pode ligar para o CVV (188) ou ir ao hospital mais próximo. Lembre-se: você não está sozinho(a) e existe ajuda disponível."

FORMATO DE RESPOSTA:
- Sempre valide os sentimentos do usuário primeiro
- Ofereça insights ou perspectivas baseadas em TCC/DBT
- Sugira uma técnica ou exercício prático quando apropriado
- Termine com uma pergunta reflexiva ou encorajamento
- Mantenha as respostas entre 150-300 palavras
- Use emojis ocasionalmente para tornar a conversa mais acolhedora`

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: validatedData.message }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    })

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
            tokensUsed: completion.usage?.total_tokens || 0
          }
        })
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        response,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { ok: false, error: 'Chave da API OpenAI inválida ou não configurada' },
        { status: 500 }
      )
    }

    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { ok: false, error: 'Cota da API OpenAI esgotada' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}