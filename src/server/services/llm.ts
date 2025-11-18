import OpenAI from 'openai'
import { logger } from '../lib/logger'

interface LLMConfig {
  provider: 'openai' | 'lmstudio'
  apiKey?: string
  baseURL?: string
  model?: string
}

interface ConversationContext {
  conversationId: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
  }>
  userProfile?: {
    name: string
    assessmentHistory?: any[]
    preferences?: any
  }
}

export class LLMService {
  private client: OpenAI
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
    
    if (config.provider === 'openai') {
      this.client = new OpenAI({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      })
    } else if (config.provider === 'lmstudio') {
      this.client = new OpenAI({
        baseURL: config.baseURL || process.env.LMSTUDIO_URL,
        apiKey: 'lm-studio', // LM Studio doesn't require a real API key
      })
    } else {
      throw new Error(`Unsupported LLM provider: ${config.provider}`)
    }
  }

  async generateReply(context: ConversationContext, userMessage: string): Promise<{
    response: string
    tokensUsed: { input: number; output: number }
    metadata: any
  }> {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      const messages = this.buildMessages(context, userMessage)

      logger.info({ 
        conversationId: context.conversationId,
        provider: this.config.provider,
        messagesCount: messages.length 
      }, 'Generating LLM response')

      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Safety check
      this.validateResponse(response)

      return {
        response,
        tokensUsed: {
          input: completion.usage?.prompt_tokens || 0,
          output: completion.usage?.completion_tokens || 0,
        },
        metadata: {
          model: completion.model,
          finishReason: completion.choices[0]?.finish_reason,
          provider: this.config.provider,
        }
      }
    } catch (error) {
      logger.error({ error, conversationId: context.conversationId }, 'LLM generation failed')
      throw new Error('Failed to generate response')
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `Você é Clara, uma terapeuta virtual especializada em Terapia Cognitivo-Comportamental (TCC) e Terapia Dialética Comportamental (DBT).

PERSONALIDADE E ABORDAGEM:
- Seja empática, acolhedora e não-julgamental
- Use linguagem simples e acessível
- Demonstre interesse genuíno pelo bem-estar do usuário
- Mantenha um tom profissional mas caloroso

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

Responda com: "Percebo que você está passando por um momento muito difícil. É importante que procure ajuda profissional imediatamente. Você pode ligar para o CVV (188) ou ir ao hospital mais próximo. Lembre-se: você não está sozinho(a) e existe ajuda disponível."

FORMATO DE RESPOSTA:
- Sempre valide os sentimentos do usuário primeiro
- Ofereça insights ou perspectivas baseadas em TCC/DBT
- Sugira uma técnica ou exercício prático quando apropriado
- Termine com uma pergunta reflexiva ou encorajamento

Nome do usuário: ${context.userProfile?.name || 'Usuário'}`
  }

  private buildMessages(context: ConversationContext, userMessage: string): Array<{ role: 'system' | 'user' | 'assistant', content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      { role: 'system', content: this.buildSystemPrompt(context) }
    ]

    // Add conversation history (last 10 messages for context)
    const recentMessages = context.messages.slice(-10)
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage })

    return messages
  }

  private validateResponse(response: string): void {
    const dangerousPatterns = [
      /diagnóstico.*é/i,
      /você tem.*transtorno/i,
      /prescrevo/i,
      /tome.*medicamento/i,
      /não precisa.*médico/i,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(response)) {
        logger.warn({ response }, 'Potentially dangerous response detected')
        throw new Error('Response failed safety validation')
      }
    }
  }

  async summarizeConversation(messages: Array<{ content: string; timestamp: Date }>): Promise<string> {
    try {
      const conversationText = messages
        .map(msg => msg.content)
        .join('\n---\n')

      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Resuma esta conversa terapêutica de forma concisa, destacando: principais temas abordados, emoções expressas, insights importantes e progresso observado. Mantenha o foco clínico e preserve a confidencialidade.'
          },
          {
            role: 'user',
            content: `Conversa para resumir:\n\n${conversationText}`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      })

      return completion.choices[0]?.message?.content || 'Resumo não disponível'
    } catch (error) {
      logger.error({ error }, 'Failed to summarize conversation')
      return 'Erro ao gerar resumo'
    }
  }
}

// Factory function
export function createLLMService(): LLMService {
  const provider = (process.env.LLM_PROVIDER as 'openai' | 'lmstudio') || 'openai'
  
  return new LLMService({
    provider,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.LMSTUDIO_URL,
    model: provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.1-8b-instruct',
  })
}