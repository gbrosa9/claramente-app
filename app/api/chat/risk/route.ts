import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL = 'gemini-1.5-flash'

const PROMPT = `Você é um classificador de risco emocional para a plataforma de saúde mental ClaraMENTE. Receberá a última mensagem do paciente e deve responder em JSON com as chaves "riskLevel" e "response". Os níveis disponíveis são LOW, MODERATE, HIGH e CRITICAL. Utilize o português brasileiro. Se identificar ideação suicida explícita, automutilação iminente ou perigo imediato, retorne CRITICAL com uma resposta empática, curta e que incentive a buscar ajuda.`

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada', riskLevel: 'LOW', message: 'Respire fundo, estou aqui.' },
        { status: 500 }
      )
    }

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: MODEL })
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            { text: `Mensagem do paciente: ${message}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    })

    const text = result.response.text() ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json({
      message: parsed.response ?? 'Estou aqui com você. Vamos respirar juntos?',
      riskLevel: parsed.riskLevel ?? 'LOW',
    })
  } catch (error) {
    return NextResponse.json({ message: 'Estou aqui com você. Podemos tentar novamente?', riskLevel: 'LOW' })
  }
}
