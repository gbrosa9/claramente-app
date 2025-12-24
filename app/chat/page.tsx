"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Send, Volume2, VolumeX, Menu, X, Lightbulb, Heart, Flame, Brain, Plus, Home, ArrowLeft, AlertTriangle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ChatMessage from "@/components/chat-message"
import VoiceRecorder from "@/components/voice-recorder"
import { useSupabaseUser } from "@/lib/supabase/client"
import { useConversations } from "@/hooks/useConversations"
import { ConversationService, type ConversationMessage } from "@/lib/services/conversation-service"
import Image from "next/image"
import Link from "next/link"
import { ClaraLogo } from "@/components/ClaraLogo"
import { CrisisQuickPanel } from "@/components/patient/CrisisQuickPanel"

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
  const router = useRouter()
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
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [crisisOpen, setCrisisOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const navigateTo = useCallback((path: string) => {
    router.push(path)
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (!window.location.pathname.startsWith(path)) {
          window.location.href = path
        }
      }, 120)
    }
  }, [router])

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('clara_chat_voice_muted')
    if (stored) {
      setVoiceMuted(stored === 'true')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('clara_chat_voice_muted', voiceMuted ? 'true' : 'false')
  }, [voiceMuted])

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
      : `Oi, ${firstName}! Que bom te ver por aqui. Como você está se sentindo hoje? 💙`

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
        if (data.data?.shouldTriggerCrisis) {
          window.location.href = '/patient/crisis'
          return
        }

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

        // Generate audio for Clara's response (skip if only emojis)
        const textForTTS = data.data.response.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
        
        if (textForTTS.length > 2) {
          try {
            const audioResponse = await fetch('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: textForTTS,
                voice: 'female'
              })
            })

            const contentType = audioResponse.headers.get('Content-Type') || ''
            if (!audioResponse.ok || !contentType.includes('audio')) {
              throw new Error(`TTS response inválida. Status: ${audioResponse.status}, Content-Type: ${contentType}`)
            }

            const arrayBuffer = await audioResponse.arrayBuffer()
            if (arrayBuffer.byteLength < 100) {
              throw new Error(`TTS retornou áudio muito curto (${arrayBuffer.byteLength} bytes)`)
            }

            const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
            const audioUrl = URL.createObjectURL(audioBlob)
            
            // Update message with audio URL
            const messagesWithAudio = finalMessages.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, audioUrl }
                : msg
            )
            setMessages(messagesWithAudio)
            updateCurrentConversation(messagesWithAudio)
            
            if (!voiceMuted) {
              const audio = new Audio()
              audio.src = audioUrl
              audio.load()
              audio.play().catch(e => {
                console.log('Auto-play blocked:', e?.name || e)
              })
            }
          } catch (audioError) {
            console.error('Error generating audio:', audioError)
          }
        }
      } else {
        console.error('API returned error:', data)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data?.error || "Desculpe, ocorreu um erro. Tente novamente.",
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
          if (data.data?.shouldTriggerCrisis) {
            window.location.href = '/patient/crisis'
            return
          }

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
                voice: 'female'
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
              if (!voiceMuted) {
                const audio = new Audio(audioUrl)
                audio.play().catch(error => {
                  console.error('Error auto-playing audio:', error)
                })
              }
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f7f8ff] via-white to-[#f1f5ff] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-[15%] rounded-full bg-gradient-to-br from-purple-200/35 via-transparent to-sky-200/30 blur-3xl dark:from-purple-900/20 dark:to-sky-900/10" aria-hidden="true" />
      <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/75">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-start gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-purple-200/40 bg-white/90 text-purple-600 shadow-[0_16px_32px_rgba(79,70,229,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(79,70,229,0.16)] focus-visible:outline-none focus-visible:ring focus-visible:ring-purple-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-purple-200"
              aria-label={sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/40 to-purple-500/10 opacity-0 transition group-hover:opacity-100" />
              {sidebarOpen ? <X className="relative h-5 w-5" /> : <Menu className="relative h-5 w-5" />}
            </button>
            <div className="relative flex flex-1 flex-col gap-4 overflow-hidden rounded-[26px] border border-purple-200/50 bg-white/90 px-6 py-5 shadow-[0_24px_60px_rgba(79,70,229,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
              <div className="absolute inset-y-0 -left-16 hidden w-32 -skew-x-12 bg-gradient-to-r from-purple-200/30 via-purple-200/10 to-transparent blur-2xl lg:block" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-[0_12px_22px_rgba(79,70,229,0.25)]">
                  <ClaraLogo className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.48em] text-purple-600 dark:text-purple-300">
                  ClaraMENTE
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-black leading-tight text-slate-900 dark:text-white sm:text-2xl">
                  Olá, {getFirstName()}! Vamos conversar com Clara? 💬
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  Retome suas conversas, registre sentimentos e receba apoio guiado em tempo real.
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:w-auto">
            <Button
              size="sm"
              variant="ghost"
              className="gap-2 rounded-full border border-purple-200/50 bg-white/70 px-4 text-slate-600 transition hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              onClick={() => navigateTo("/")}
            >
              <Home className="h-4 w-4" />
              Início
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-2 rounded-full border border-rose-500 bg-rose-500 px-4 font-semibold shadow-[0_14px_30px_rgba(225,29,72,0.25)] transition hover:-translate-y-0.5 hover:bg-rose-600"
              onClick={() => setCrisisOpen(true)}
            >
              <AlertTriangle className="h-4 w-4" />
              Crise
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 rounded-full border-purple-200/60 bg-white/70 px-4 text-purple-600 transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-purple-200"
              onClick={() => navigateTo("/patient/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Button>
          </div>
        </div>
      </div>

        <CrisisQuickPanel open={crisisOpen} onClose={() => setCrisisOpen(false)} />

      <div className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-6 lg:flex-row">
          {/* Sidebar */}
          {sidebarOpen ? (
            <div
              className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: sidebarOpen ? 0 : -320 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed left-0 top-24 bottom-4 z-40 w-[18rem] overflow-y-auto rounded-3xl border border-white/50 bg-white/80 p-5 shadow-[0_24px_60px_rgba(79,70,229,0.12)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-[0_24px_60px_rgba(15,23,42,0.55)] lg:static lg:h-auto lg:w-80 lg:translate-x-0"
          >
            <div className="flex items-center justify-between pb-4 lg:pb-2">
              <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-300">Suas jornadas</p>
              <button
                type="button"
                className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-purple-600 transition hover:border-purple-200 hover:bg-purple-50 dark:text-purple-200 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                Fechar
              </button>
            </div>
            <div className="space-y-5">
              {/* New Conversation Button */}
              <Button
                onClick={() => createNewConversation()}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 py-5 text-base font-semibold shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:shadow-[0_24px_55px_rgba(79,70,229,0.4)]"
              >
                <Plus className="w-4 h-4" />
                <span className="ml-2">Nova Conversa</span>
              </Button>

              {/* Conversation History */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Conversas recentes
                </h3>
                {loadingConversations ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 rounded-2xl border border-white/60 bg-white/70 dark:border-slate-800/60 dark:bg-slate-900/50" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {allConversations.map((conversation: Conversation) => (
                      <motion.button
                        key={conversation.id}
                        whileHover={{ x: 4 }}
                        onClick={() => loadConversationMessages(conversation)}
                        className={`w-full text-left rounded-2xl border-2 p-3 transition-all ${
                          currentConversationId === conversation.id
                            ? "border-purple-500 bg-purple-50/80 shadow-inner dark:bg-purple-900/20"
                            : "border-transparent bg-white/80 shadow-sm hover:border-purple-200 dark:bg-slate-900/50"
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

            <div className="border-t border-white/60 pt-5 dark:border-slate-800/70">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Temas de conversa
              </h3>
              {themes.map((theme) => {
                const Icon = theme.icon
                return (
                  <motion.button
                    key={theme.id}
                    whileHover={{ x: 4 }}
                    onClick={() => selectTheme(theme)}
                    className={`w-full text-left rounded-2xl border-2 p-3 transition-all mb-2 ${
                      selectedTheme === theme.id
                        ? "border-purple-500 bg-purple-50/80 shadow-inner dark:bg-purple-900/20"
                        : "border-transparent bg-white/80 shadow-sm hover:border-purple-200 dark:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${theme.color} text-white shadow-inner`}>
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

            <div className="space-y-3 border-t border-white/60 pt-5 dark:border-slate-800/70">
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Recursos rápidos
              </h4>
              <Link href="/exercises">
                <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/60 bg-white/70 px-4 text-slate-600 transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50/80 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  Exercícios
                </Button>
              </Link>
              <Link href="/therapy">
                <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/60 bg-white/70 px-4 text-slate-600 transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50/80 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  Terapia TCC/DBT
                </Button>
              </Link>
              <Link href="/voice-call">
                <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/60 bg-white/70 px-4 text-slate-600 transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50/80 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  Chamada de Voz
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="relative flex-1 overflow-hidden rounded-[32px] border border-white/50 bg-white/85 shadow-[0_32px_65px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-[0_32px_65px_rgba(15,23,42,0.45)]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 border-b border-white/60 bg-gradient-to-br from-purple-50 via-white to-sky-50 px-6 py-8 text-center dark:border-slate-800/70 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-purple-950/40">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
              alt="Clara"
              width={150}
              height={150}
              className="rounded-[28px] border-4 border-white/70 shadow-[0_18px_40px_rgba(79,70,229,0.25)]"
            />
            <div className="space-y-2">
              <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-purple-600 shadow-sm backdrop-blur dark:bg-slate-900/60 dark:text-purple-200">
                Assistente emocional
              </span>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Clara está aqui para ajudar</p>
              {selectedTheme && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
                  Tema: {themes.find((t) => t.id === selectedTheme)?.title}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceMuted((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border-purple-200/70 bg-white/70 px-4 text-purple-600 transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-purple-200"
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {voiceMuted ? "Voz mutada" : "Voz ativada"}
            </Button>
            {voiceMuted && (
              <p className="text-xs text-slate-500 dark:text-slate-300">
                A voz da Clara está desativada para este chat.
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 backdrop-blur">
            {messages.length === 0 && !currentConversationId && (
              <div className="mt-8 rounded-3xl border border-dashed border-purple-200/70 bg-white/80 p-8 text-center text-slate-500 shadow-inner dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300">
                <p className="mb-2 text-lg font-semibold">Bem-vindo ao chat com Clara!</p>
                <p className="text-sm">Escolha um tema na barra lateral ou inicie uma nova conversa.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <ChatMessage message={message} />
                {message.role === "assistant" && (
                  <div className="ml-0 flex gap-2">
                    {message.audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.audioUrl!)}
                        className="h-auto rounded-full px-3 py-1 text-purple-600 transition hover:bg-purple-50/80 hover:text-purple-700"
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
          <div className="border-t border-white/60 bg-gradient-to-r from-white/85 via-white to-white/80 px-6 py-6 dark:border-slate-800/70 dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/70">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_rgba(79,70,229,0.12)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <VoiceRecorder
                  onTranscript={handleTranscript}
                  isListening={isListening}
                  setIsListening={setIsListening}
                />
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Compartilhe como você está se sentindo..."
                    disabled={isListening}
                    className="h-12 rounded-2xl border border-transparent bg-white/80 pl-4 pr-12 text-sm shadow-inner shadow-purple-200/30 focus:border-purple-400 focus:ring-0 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                  <MessageCircle className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 px-6 text-sm font-semibold shadow-[0_12px_30px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(79,70,229,0.4)] disabled:translate-y-0 disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-300">
                💡 Pressione <kbd className="rounded bg-slate-200 px-2 py-1 text-[0.7rem] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Enter</kbd> para enviar mais rápido
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
