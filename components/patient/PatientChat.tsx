"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  riskLevel?: RiskLevel
}

interface RiskResponse {
  message: string
  riskLevel: RiskLevel
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

interface PatientChatProps {
  onCriticalRisk: () => void
}

const RISK_PRIORITY: Record<RiskLevel, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4,
}

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: 'Baixo',
  MODERATE: 'Moderado',
  HIGH: 'Alto',
  CRITICAL: 'Crítico',
}

const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  LOW: 'border border-emerald-200 bg-emerald-50 text-emerald-600',
  MODERATE: 'border border-amber-200 bg-amber-50 text-amber-600',
  HIGH: 'border border-orange-200 bg-orange-50 text-orange-600',
  CRITICAL: 'border border-red-200 bg-red-50 text-red-600',
}

const ACTIVE_RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  LOW: 'border border-white/40 bg-white/20 text-white',
  MODERATE: 'border border-white/40 bg-white/20 text-white',
  HIGH: 'border border-white/40 bg-white/20 text-white',
  CRITICAL: 'border border-white/40 bg-white/20 text-white',
}

const MESSAGE_RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  LOW: 'mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700',
  MODERATE: 'mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700',
  HIGH: 'mt-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold text-orange-700',
  CRITICAL: 'mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold text-red-700',
}

function sanitizeRiskLevel(value: unknown): RiskLevel | undefined {
  if (value === 'LOW' || value === 'MODERATE' || value === 'HIGH' || value === 'CRITICAL') {
    return value
  }
  return undefined
}

function getHighestRiskLevel(messages: Message[]): RiskLevel | null {
  let highest: RiskLevel | null = null
  let score = 0

  for (const message of messages) {
    if (message.role === 'assistant' && message.riskLevel) {
      const current = RISK_PRIORITY[message.riskLevel]
      if (current > score) {
        highest = message.riskLevel
        score = current
      }
    }
  }

  return highest
}

function deriveConversationTitle(messages: Message[], fallback: string): string {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content?.trim()
  if (!firstUserMessage) return fallback

  return firstUserMessage.length > 48 ? `${firstUserMessage.slice(0, 48)}...` : firstUserMessage
}

export function PatientChat({ onCriticalRisk }: PatientChatProps) {
  const { data: session } = useSession()
  const storageKey = useMemo(
    () => (session?.user?.id ? `patient_chat_${session.user.id}` : 'patient_chat_anonymous'),
    [session?.user?.id]
  )

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        setConversations([])
        setActiveConversationId(null)
        return
      }

      const parsed = JSON.parse(raw) as Conversation[]
      if (!Array.isArray(parsed)) {
        setConversations([])
        setActiveConversationId(null)
        return
      }

      const normalized: Conversation[] = parsed.map((conversation): Conversation => {
        const now = new Date().toISOString()
        return {
          id: typeof conversation.id === 'string' ? conversation.id : crypto.randomUUID(),
          title:
            typeof conversation.title === 'string' && conversation.title.trim().length > 0
              ? conversation.title
              : 'Nova conversa',
          createdAt: typeof conversation.createdAt === 'string' ? conversation.createdAt : now,
          updatedAt: typeof conversation.updatedAt === 'string' ? conversation.updatedAt : now,
          messages: Array.isArray(conversation.messages)
            ? conversation.messages.map((message): Message => ({
                id: typeof message.id === 'string' ? message.id : crypto.randomUUID(),
                role: message?.role === 'assistant' ? 'assistant' : 'user',
                content: typeof message?.content === 'string' ? message.content : '',
                riskLevel: sanitizeRiskLevel(message?.riskLevel),
              }))
            : ([] as Message[]),
        }
      })

      setConversations(normalized)
      setActiveConversationId((previous) => {
        if (previous && normalized.some((conversation) => conversation.id === previous)) {
          return previous
        }
        return normalized[0]?.id ?? null
      })
    } catch (error) {
      console.error('Erro ao carregar histórico de conversas', error)
      setConversations([])
      setActiveConversationId(null)
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error('Erro ao salvar histórico de conversas', error)
    }
  }, [conversations, hydrated, storageKey])

  useEffect(() => {
    if (activeConversationId && conversations.some((conversation) => conversation.id === activeConversationId)) {
      return
    }
    if (conversations.length === 0) {
      setActiveConversationId(null)
    } else {
      setActiveConversationId(conversations[0].id)
    }
  }, [conversations, activeConversationId])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  )
  const messages = activeConversation?.messages ?? []

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, activeConversationId])

  const createConversation = useCallback(
    (title?: string) => {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const newConversation: Conversation = {
        id,
        title: title ?? 'Nova conversa',
        createdAt: now,
        updatedAt: now,
        messages: [],
      }

      setConversations((previous) => [newConversation, ...previous])
      setActiveConversationId(id)
      return id
    },
    []
  )

  const ensureActiveConversation = useCallback(() => {
    if (activeConversationId) return activeConversationId
    return createConversation()
  }, [activeConversationId, createConversation])

  const appendMessage = useCallback((conversationId: string, message: Message) => {
    setConversations((previous) => {
      const target = previous.find((conversation) => conversation.id === conversationId)
      if (!target) {
        console.warn('Conversa não encontrada para atualizar mensagens', conversationId)
        return previous
      }

      const updatedMessages = [...target.messages, message]
      const shouldRename = message.role === 'user' && !target.messages.some((existing) => existing.role === 'user')
      const now = new Date().toISOString()

      const updatedConversation: Conversation = {
        ...target,
        messages: updatedMessages,
        updatedAt: now,
        title: shouldRename ? deriveConversationTitle(updatedMessages, target.title) : target.title,
      }

      const remaining = previous.filter((conversation) => conversation.id !== conversationId)
      return [updatedConversation, ...remaining]
    })
  }, [])

  const handleStartNewConversation = useCallback(() => {
    setPendingConversationId(null)
    setLoading(false)
    setInput('')
    createConversation()
  }, [createConversation])

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
    setInput('')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return
    if (loading) return

    const conversationId = ensureActiveConversation()
    const sanitized = input.trim()
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: sanitized,
    }

    appendMessage(conversationId, userMessage)
    setInput('')
    setLoading(true)
    setPendingConversationId(conversationId)

    try {
      const response = await fetch('/api/chat/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sanitized }),
      })
      if (!response.ok) throw new Error('Falha ao enviar')
      const payload: RiskResponse = await response.json()
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: payload.message,
        riskLevel: payload.riskLevel,
      }
      appendMessage(conversationId, assistantMessage)
      if (payload.riskLevel === 'CRITICAL') {
        onCriticalRisk()
      }
    } catch (error) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Não consegui analisar sua mensagem, mas estou por aqui. Podemos tentar novamente?',
      }
      appendMessage(conversationId, assistantMessage)
    } finally {
      setLoading(false)
      setPendingConversationId(null)
    }
  }, [appendMessage, ensureActiveConversation, input, loading, onCriticalRisk])

  const isActiveConversationPending = loading && pendingConversationId === activeConversationId

  return (
    <div className="flex h-full flex-col rounded-[44px] border border-purple-100 bg-white/80 p-6 shadow-lg shadow-purple-200/40">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-purple-500">Chat com a Clara</p>
          <h3 className="text-2xl font-black text-slate-900">Como você está hoje?</h3>
        </div>
        <div className="text-xs text-slate-500">Análise automática de risco emocional</div>
      </div>
      {hydrated ? (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-purple-400">Histórico</span>
            <button
              type="button"
              onClick={handleStartNewConversation}
              className="flex items-center gap-1 rounded-full border border-dashed border-purple-300 bg-purple-50/60 px-3 py-1 text-[11px] font-semibold text-purple-600 transition hover:border-purple-400 hover:bg-purple-100"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Nova
            </button>
          </div>
          <div className="mt-2 flex max-h-24 flex-wrap items-center gap-2 overflow-y-auto pr-1">
            {conversations.length === 0 ? (
              <div className="rounded-full border border-dashed border-purple-200 bg-purple-50/70 px-3 py-1 text-[11px] text-purple-500">
                Nenhuma conversa ainda. Inicie uma nova sessão.
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId
                const risk = getHighestRiskLevel(conversation.messages)

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'border-purple-600 bg-purple-600 text-white shadow-sm shadow-purple-300/40'
                        : 'border-purple-100 bg-white/70 text-purple-600 shadow-inner shadow-purple-100/50 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <span className="max-w-[140px] truncate">{conversation.title}</span>
                    {risk ? (
                      <span
                        className={`rounded-full px-2 py-[2px] text-[10px] font-semibold ${
                          isActive ? ACTIVE_RISK_BADGE_CLASSES[risk] : RISK_BADGE_CLASSES[risk]
                        }`}
                      >
                        {RISK_LABELS[risk]}
                      </span>
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4 h-9 w-40 animate-pulse rounded-full bg-purple-100/60" />
      )}
      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-[36px] bg-white/70 p-4"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Conte com a Clara para organizar pensamentos, desabafar e receber sugestões baseadas em evidências.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-[32px] px-4 py-3 text-sm shadow-md ${
              message.role === 'user'
                ? 'ml-auto bg-purple-600 text-white shadow-purple-300/30'
                : 'bg-white text-slate-700 shadow-purple-200/40'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.role === 'assistant' && message.riskLevel ? (
              <span className={MESSAGE_RISK_BADGE_CLASSES[message.riskLevel]}>
                Risco {RISK_LABELS[message.riskLevel]}
              </span>
            ) : null}
          </div>
        ))}
        {isActiveConversationPending && (
          <div className="flex items-center gap-2 rounded-[32px] bg-white px-4 py-3 text-sm text-slate-500 shadow-inner">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analisando sua mensagem…
          </div>
        )}
      </div>
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Descreva como está se sentindo..."
          className="min-h-[120px] rounded-[32px] border-purple-100 bg-white/80 text-slate-700 placeholder:text-slate-400 focus-visible:ring-purple-400"
        />
        <Button
          type="submit"
          disabled={loading}
          className="self-end rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-300/40 hover:bg-purple-700 disabled:pointer-events-none disabled:opacity-60"
        >
          Enviar <Send className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
