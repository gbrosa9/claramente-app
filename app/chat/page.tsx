"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Send, Volume2, Menu, X, Lightbulb, Heart, Flame, Brain, Plus, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ChatMessage from "@/components/chat-message"
import VoiceRecorder from "@/components/voice-recorder"
import APIStatusIndicator from "@/components/api-status-indicator"
import { useSupabaseUser } from "@/lib/supabase/client"
import { useConversations } from "@/hooks/useConversations"
import { ConversationService, type ConversationMessage } from "@/lib/services/conversation-service"
import Image from "next/image"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  emotion?: string
  audioUrl?: string
}

interface ConversationTheme {
  id: string
  title: string
  description: string
  icon: any
  color: string
  initialMessage: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  lastMessageAt: Date
  createdAt: Date
  theme?: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const { user: supabaseUser } = useSupabaseUser()
  const { 
    conversations: supabaseConversations, 
    loading: supabaseLoading, 
    createConversation, 
    updateConversation,
    migrateLocalConversations 
  } = useConversations()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [localConversations, setLocalConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Combinar conversas do Supabase e localStorage
  const allConversations = useMemo(() => {
    if (supabaseUser) {
      // Converter conversas do Supabase para formato local
      return supabaseConversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: conv.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          emotion: 'neutral'
        })),
        lastMessageAt: new Date(conv.updated_at),
        createdAt: new Date(conv.created_at),
        theme: undefined
      })) as Conversation[]
    }
    return localConversations
  }, [supabaseUser, supabaseConversations, localConversations])

  const themes: ConversationTheme[] = [
    {
      id: "anxiety",
      title: "Ansiedade",
      description: "Trabalhe com pensamentos ansiosos",
      icon: Flame,
      color: "from-red-600 to-orange-600",
      initialMessage:
        "Vejo que você quer trabalhar com ansiedade. Vamos explorar seus pensamentos e sentimentos. O que está causando ansiedade agora?",
    },
    {
      id: "relationships",
      title: "Relacionamentos",
      description: "Explore dinâmicas relacionais",
      icon: Heart,
      color: "from-pink-600 to-rose-600",
      initialMessage:
        "Relacionamentos são complexos. Gostaria de conversar sobre algo específico? Posso ajudar com comunicação, limites ou entendimento emocional.",
    },
    {
      id: "self-esteem",
      title: "Autoestima",
      description: "Fortaleça a confiança em si",
      icon: Lightbulb,
      color: "from-yellow-600 to-orange-600",
      initialMessage:
        "Sua autoestima é importante. Vamos trabalhar em crenças limitantes e reconhecer suas forças. Como você se vê?",
    },
    {
      id: "stress",
      title: "Estresse",
      description: "Gerencie o estresse efetivamente",
      icon: Brain,
      color: "from-blue-600 to-cyan-600",
      initialMessage:
        "Entendo que o estresse está afetando você. Vamos identificar as fontes e desenvolver estratégias de enfrentamento juntos.",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load conversations from localStorage (fallback)
  const loadLocalConversations = () => {
    try {
      const saved = localStorage.getItem(`conversations_${session?.user?.email}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setLocalConversations(parsed.map((conv: any) => ({
          ...conv,
          lastMessageAt: new Date(conv.lastMessageAt),
          createdAt: new Date(conv.createdAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })))
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  // Save conversations to localStorage (fallback)
  const saveLocalConversations = (newConversations: Conversation[]) => {
    try {
      localStorage.setItem(`conversations_${session?.user?.email}`, JSON.stringify(newConversations))
    } catch (error) {
      console.error('Error saving conversations:', error)
    }
  }

  // Initialize with welcome message or load conversations
  useEffect(() => {
    if (session?.user) {
      if (!supabaseUser) {
        // Fallback to localStorage if not using Supabase
        loadLocalConversations()
      }
      
      if (allConversations.length === 0 && !currentConversationId) {
        createNewConversation('Primeira conversa')
      }
    }
  }, [session, supabaseUser, allConversations])

  // Migrate local conversations to Supabase when user logs in
  useEffect(() => {
    if (supabaseUser && session?.user) {
      migrateLocalConversations()
    }
  }, [supabaseUser, session])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversationMessages = (conversation: Conversation) => {
    setMessages(conversation.messages || [])
    setCurrentConversationId(conversation.id)
    setSelectedTheme(conversation.theme || null)
  }

  const createNewConversation = async (title?: string, theme?: ConversationTheme) => {
    const firstName = getFirstName()
    const newId = Date.now().toString()
    const welcomeMessage = theme 
      ? theme.initialMessage 
      : `Olá, ${firstName}! Eu sou Clara, sua terapeuta virtual. Estou aqui para ouvir e acompanhar você com compreensão genuína. Como você está se sentindo hoje? 💙`

    const initialMessage: Message = {
      id: "welcome-" + newId,
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
      emotion: "calm",
    }

    const newConversation: Conversation = {
      id: newId,
      title: title || (theme ? `Conversa sobre ${theme.title}` : 'Nova conversa'),
      messages: [initialMessage],
      lastMessageAt: new Date(),
      createdAt: new Date(),
      theme: theme?.id,
    }

    // Save to Supabase if user is authenticated, otherwise localStorage
    if (supabaseUser) {
      const supabaseMessages: ConversationMessage[] = [initialMessage].map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
      
      await createConversation(supabaseMessages, newConversation.title)
    } else {
      const updatedConversations = [newConversation, ...localConversations]
      setLocalConversations(updatedConversations)
      saveLocalConversations(updatedConversations)
    }
    
    setCurrentConversationId(newId)
    setMessages([initialMessage])
    setSelectedTheme(theme?.id || null)
    setSidebarOpen(false)
  }

  const updateCurrentConversation = async (newMessages: Message[]) => {
    if (supabaseUser) {
      // Update in Supabase
      if (currentConversationId) {
        const supabaseMessages: ConversationMessage[] = newMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }))
        
        await updateConversation(currentConversationId, supabaseMessages)
      }
    } else {
      // Update in localStorage
      const updatedConversations = localConversations.map((conv: Conversation) => 
        conv.id === currentConversationId 
          ? { ...conv, messages: newMessages, lastMessageAt: new Date() }
          : conv
      )
      setLocalConversations(updatedConversations)
      saveLocalConversations(updatedConversations)
    }
  }

  const detectEmotion = (text: string): string => {
    const emotionalWords: Record<string, string> = {
      triste: "sadness",
      ansioso: "anxiety",
      preocupado: "anxiety",
      feliz: "happiness",
      alegre: "happiness",
      calmo: "calm",
      relaxado: "calm",
    }

    for (const [word, emotion] of Object.entries(emotionalWords)) {
      if (text.toLowerCase().includes(word)) return emotion
    }
    return "neutral"
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const emotion = detectEmotion(input)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      emotion,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    updateCurrentConversation(newMessages)
    
    const messageText = input
    setInput("")
    setIsLoading(true)

    try {
      // Send to new chat API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      })

      const data = await response.json()

      if (data.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
          emotion: "calm",
        }

        const finalMessages = [...newMessages, assistantMessage]
        setMessages(finalMessages)
        updateCurrentConversation(finalMessages)

        // Generate audio for Clara's response
        try {
          const audioResponse = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: data.data.response,
              voice: 'nova' // Warm, caring voice
            })
          })

          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            
            // Update message with audio URL
            const messagesWithAudio = finalMessages.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, audioUrl }
                : msg
            )
            setMessages(messagesWithAudio)
            updateCurrentConversation(messagesWithAudio)
          }
        } catch (audioError) {
          console.error('Error generating audio:', audioError)
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente.",
          timestamp: new Date(),
          emotion: "neutral",
        }
        const finalMessages = [...newMessages, errorMessage]
        setMessages(finalMessages)
        updateCurrentConversation(finalMessages)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, não consegui processar sua mensagem. Verifique sua conexão e tente novamente.",
        timestamp: new Date(),
        emotion: "neutral",
      }
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      updateCurrentConversation(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para lidar com teclas pressionadas no input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectTheme = (theme: ConversationTheme) => {
    createNewConversation(`Conversa sobre ${theme.title}`, theme)
  }

  const handleTranscript = async (text: string) => {
    setInput(text)
    
    // Auto-send voice transcriptions
    if (text.trim()) {
      const emotion = detectEmotion(text)

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
        emotion,
      }

      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      updateCurrentConversation(newMessages)
      setIsLoading(true)

      try {
        // Send to chat API
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        })

        const data = await response.json()

        if (data.ok) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.data.response,
            timestamp: new Date(),
            emotion: "calm",
          }

          const finalMessages = [...newMessages, assistantMessage]
          setMessages(finalMessages)
          updateCurrentConversation(finalMessages)

          // Generate audio response automatically for voice conversations
          try {
            const audioResponse = await fetch('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: data.data.response,
                voice: 'nova'
              })
            })

            if (audioResponse.ok) {
              const audioBlob = await audioResponse.blob()
              const audioUrl = URL.createObjectURL(audioBlob)
              
              // Update message with audio URL and auto-play
              const messagesWithAudio = finalMessages.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, audioUrl }
                  : msg
              )
              setMessages(messagesWithAudio)
              updateCurrentConversation(messagesWithAudio)

              // Auto-play the response
              const audio = new Audio(audioUrl)
              audio.play().catch(error => {
                console.error('Error auto-playing audio:', error)
              })
            }
          } catch (audioError) {
            console.error('Error generating audio:', audioError)
          }
        } else {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Desculpe, ocorreu um erro. Tente novamente.",
            timestamp: new Date(),
            emotion: "neutral",
          }
          const finalMessages = [...newMessages, errorMessage]
          setMessages(finalMessages)
          updateCurrentConversation(finalMessages)
        }
      } catch (error) {
        console.error('Error processing voice message:', error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Desculpe, não consegui processar sua mensagem de voz.",
          timestamp: new Date(),
          emotion: "neutral",
        }
        const finalMessages = [...newMessages, errorMessage]
        setMessages(finalMessages)
        updateCurrentConversation(finalMessages)
      } finally {
        setIsLoading(false)
        setInput("") // Clear input after processing
      }
    }
  }

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "pt-BR"
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play().catch(error => {
      console.error('Error playing audio:', error)
    })
  }

  // Função para extrair o primeiro nome
  const getFirstName = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ')[0]
    }
    return 'Usuário'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              Olá, {getFirstName()}! Vamos conversar com Clara? 💬
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Painel
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 top-[65px] bottom-0 w-80 bg-gradient-to-b from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700 z-20 overflow-y-auto"
        >
          <div className="p-4 space-y-4">
            {/* New Conversation Button */}
            <Button
              onClick={() => createNewConversation()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conversa
            </Button>

            {/* Conversation History */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Conversas Recentes</h3>
              {loadingConversations ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allConversations.map((conversation: Conversation) => (
                    <motion.button
                      key={conversation.id}
                      whileHover={{ x: 4 }}
                      onClick={() => loadConversationMessages(conversation)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        currentConversationId === conversation.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-slate-700 hover:border-purple-300"
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {conversation.messages.length} mensagens
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(conversation.lastMessageAt).toLocaleDateString('pt-BR')}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Temas de Conversa</h3>
              {themes.map((theme) => {
                const Icon = theme.icon
                return (
                  <motion.button
                    key={theme.id}
                    whileHover={{ x: 4 }}
                    onClick={() => selectTheme(theme)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all mb-2 ${
                      selectedTheme === theme.id
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-slate-700 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-br ${theme.color} rounded-lg text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{theme.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{theme.description}</p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Recursos Rápidos</h4>
              <Link href="/exercises">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Exercícios
                </Button>
              </Link>
              <Link href="/therapy">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Terapia TCC/DBT
                </Button>
              </Link>
              <Link href="/voice-call">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Chamada de Voz
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Avatar Section */}
          <div className="bg-gradient-to-b from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-800 p-6 flex flex-col items-center gap-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
              alt="Clara"
              width={150}
              height={150}
              className="rounded-full shadow-lg"
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Clara está aqui para ajudar</p>
              {selectedTheme && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tema: {themes.find((t) => t.id === selectedTheme)?.title}
                </p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !currentConversationId && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p className="text-lg mb-4">Bem-vindo ao chat com Clara!</p>
                <p>Escolha um tema na barra lateral ou inicie uma nova conversa.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ChatMessage message={message} />
                {message.role === "assistant" && (
                  <div className="mt-2 ml-0 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakMessage(message.content)}
                      className="text-purple-600 hover:text-purple-700 p-0 h-auto"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Síntese de Voz
                    </Button>
                    {message.audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.audioUrl!)}
                        className="text-purple-600 hover:text-purple-700 p-0 h-auto"
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Áudio Original
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" />
                  <div
                    className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <div className="flex gap-3">
              <VoiceRecorder
                onTranscript={handleTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem e pressione Enter para enviar..."
                disabled={isListening}
                className="border-gray-200 focus:border-purple-600 dark:border-slate-800 dark:focus:border-purple-600"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Dica: Pressione <kbd className="px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded text-xs">Enter</kbd> para enviar rapidamente sua mensagem
            </p>
          </div>
        </div>
      </div>

      {/* API Status Indicator */}
      <APIStatusIndicator />
    </div>
  )
}
