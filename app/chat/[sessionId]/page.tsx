"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Mic, MicOff, Settings } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  session_id?: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [session, setSession] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = params.sessionId as string

  useEffect(() => {
    loadSessionAndMessages()
  }, [sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadSessionAndMessages = async () => {
    try {
      // Carregar sessão
      const sessionResponse = await fetch(`/api/chat/sessions/${sessionId}`)
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setSession(sessionData)
      }

      // Carregar mensagens
      const messagesResponse = await fetch(`/api/chat/sessions/${sessionId}/messages`)
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Erro ao carregar chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
      session_id: sessionId
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)

    try {
      // Salvar mensagem do usuário
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage.content,
          role: 'user'
        })
      })

      // Simular resposta do assistente (aqui você conectaria com OpenAI/Claude)
      const assistantResponse = generateAssistantResponse(userMessage.content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        session_id: sessionId
      }

      setMessages(prev => [...prev, assistantMessage])

      // Salvar resposta do assistente
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: assistantMessage.content,
          role: 'assistant'
        })
      })

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAssistantResponse = (userInput: string): string => {
    // Respostas inteligentes baseadas no input do usuário
    const input = userInput.toLowerCase()
    
    if (input.includes('ansiedade') || input.includes('ansioso') || input.includes('preocup')) {
      return `Entendo que você está lidando com ansiedade. É muito comum e você não está sozinho(a) nisso. 

Algumas técnicas que podem ajudar imediatamente:
• **Respiração 4-7-8**: Inspire por 4s, segure por 7s, expire por 8s
• **Grounding 5-4-3-2-1**: 5 coisas que vê, 4 que ouve, 3 que toca, 2 que cheira, 1 que saboreia
• **Mindfulness**: Foque no momento presente

Que tal tentarmos um exercício de respiração juntos? Posso te guiar por uma técnica simples que costuma ser muito eficaz.`
    }

    if (input.includes('triste') || input.includes('deprim') || input.includes('sozinho')) {
      return `Sinto muito que você esteja passando por esse momento difícil. Seus sentimentos são válidos e é corajoso de sua parte buscar apoio.

Lembre-se:
• É normal ter dias difíceis - isso não define quem você é
• Pequenos passos contam muito
• Você já mostrou força ao chegar até aqui

Que tal conversarmos sobre algo que costuma te dar prazer? Ou posso te sugerir algumas atividades pequenas que podem ajudar a melhorar o humor gradualmente.`
    }

    if (input.includes('dormir') || input.includes('sono') || input.includes('insônia')) {
      return `Problemas de sono podem impactar muito nosso bem-estar. Vamos trabalhar nisso juntos.

Algumas estratégias para melhor higiene do sono:
• **Routine noturna**: Desligue telas 1h antes de dormir
• **Ambiente**: Quarto escuro, fresco e silencioso
• **Relaxamento**: Técnicas de respiração ou meditação
• **Horários regulares**: Dormir e acordar no mesmo horário

Você gostaria que eu te guiasse por um exercício de relaxamento para preparar para o sono?`
    }

    if (input.includes('trabalho') || input.includes('stress') || input.includes('pressão')) {
      return `O estresse no trabalho é muito real e pode afetar toda nossa vida. É importante estabelecer limites saudáveis.

Estratégias de manejo:
• **Pausas regulares**: 5-10 min a cada hora
• **Priorização**: Técnica de matriz urgente/importante
• **Respiração consciente**: Especialmente antes de reuniões
• **Limites**: Separar vida pessoal e profissional

Que aspecto do trabalho tem sido mais desafiador para você? Posso ajudar com técnicas específicas.`
    }

    // Resposta padrão empática
    return `Obrigado por compartilhar isso comigo. Estou aqui para te apoiar nesse processo.

Como um assistente de saúde mental, posso te ajudar com:
• **Técnicas de respiração e mindfulness**
• **Estratégias para ansiedade e estresse**
• **Exercícios de autocompaixão**
• **Planejamento de autocuidado**
• **Identificação de padrões de pensamento**

Você gostaria de explorar alguma dessas áreas? Ou há algo específico com que posso te ajudar hoje?

*Lembre-se: Sou um assistente de IA e, embora possa oferecer técnicas e apoio, não substituo o acompanhamento de um profissional de saúde mental quando necessário.*`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz.')
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setNewMessage(prev => prev + transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">
                {session?.title || 'Chat de Apoio'}
              </h1>
              <p className="text-sm text-gray-500">
                Assistente de Saúde Mental IA
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Olá! Como posso te ajudar hoje?
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Estou aqui para oferecer apoio emocional e técnicas de bem-estar. 
                Sinta-se à vontade para compartilhar como está se sentindo.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">Digitando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
                data-testid="message-input"
              />
            </div>
            
            <button
              onClick={startVoiceRecognition}
              className={`p-3 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              disabled={isLoading}
              data-testid="voice-button"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              data-testid="send-button"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </div>
        </div>
      </div>
    </div>
  )
}

// Adicionar tipos para reconhecimento de voz
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}