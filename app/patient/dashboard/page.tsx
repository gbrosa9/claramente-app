"use client"

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, ArrowRight, Flame, LogOut, MessageCircle, ShieldCheck, Sparkles, Trophy, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClaraLogo } from '@/components/ClaraLogo'
import { signOut, useSession } from 'next-auth/react'

interface DashboardGamification {
  xpTotal: number
  xpToday: number
  dailyGoal: number
  level: number
  streakDays: number
  bestStreak: number
  progress: {
    xpIntoLevel: number
    xpToNextLevel: number
    currentLevelFloor: number
    nextLevelFloor: number
  }
}

interface DashboardBadge {
  slug: string
  title: string
  description: string
  earned: boolean
}

interface DashboardTrack {
  category: string
  title: string
  completed: number
}

interface DashboardExerciseSession {
  id: string
  status: string
  startedAt: string
  completedAt?: string | null
  exercise: {
    id: string
    slug: string
    title: string
    category: string
    durationMinutes: number
    xpReward: number
    difficulty: number
  }
}

interface DashboardExerciseCard {
  id: string
  slug: string
  title: string
  category: string
  durationMinutes: number
  xpReward: number
  difficulty: number
}

interface DashboardSummaryResponse {
  ok: boolean
  data?: {
    periodDays: number
    activity: {
      chatMessages: number
      voiceCalls: number
      exercises: number
      panic: number
    }
    gamification: DashboardGamification
    continueSession: DashboardExerciseSession | null
    quickSessions: DashboardExerciseCard[]
    tracks: DashboardTrack[]
    badges: DashboardBadge[]
    totals: {
      exercisesCompleted: number
    }
  }
  error?: string
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  helper?: string
}

function StatCard({ icon, label, value, helper }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-purple-100 bg-white/80 px-6 py-5 shadow-sm shadow-purple-200/30">
      <span className="flex items-center gap-3 text-sm font-semibold text-purple-500">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          {icon}
        </span>
        {label}
      </span>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}

export default function PatientDashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardSummaryResponse['data'] | null>(null)
  const [recentConversations, setRecentConversations] = useState<
    Array<{
      id: string
      title: string
      updatedAt: string
      snippet: string
      riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null
    }>
  >([])
  const [conversationsHydrated, setConversationsHydrated] = useState(false)
  const normalizedRole = session?.user?.role ? String(session.user.role).toLowerCase() : null
  const isProfessional = normalizedRole === 'professional'

  const conversationStorageKey = useMemo(() => {
    if (session?.user?.id) {
      return `patient_chat_${session.user.id}`
    }
    return 'patient_chat_anonymous'
  }, [session?.user?.id])

  const computeRiskPriority = (risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null): number => {
    if (!risk) return 0
    switch (risk) {
      case 'LOW':
        return 1
      case 'MODERATE':
        return 2
      case 'HIGH':
        return 3
      case 'CRITICAL':
        return 4
      default:
        return 0
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(conversationStorageKey)
      if (!raw) {
        setRecentConversations([])
        return
      }

      const parsed = JSON.parse(raw) as Array<{
        id?: string
        title?: string
        updatedAt?: string
        messages?: Array<{ role?: string; content?: string; riskLevel?: string }>
      }> | null

      if (!Array.isArray(parsed)) {
        setRecentConversations([])
        return
      }

      const formatted = parsed
        .map((conversation) => {
          const id = typeof conversation.id === 'string' ? conversation.id : crypto.randomUUID()
          const title =
            typeof conversation.title === 'string' && conversation.title.trim().length > 0
              ? conversation.title
              : 'Conversa sem título'
          const updatedAt =
            typeof conversation.updatedAt === 'string' ? conversation.updatedAt : new Date().toISOString()
          const messages = Array.isArray(conversation.messages) ? conversation.messages : []
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined
          const snippet =
            typeof lastMessage?.content === 'string' && lastMessage.content.trim().length > 0
              ? lastMessage.content.trim()
              : 'Conversa iniciada'

          const riskLevelFromHistory = messages.reduce<
            'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null
          >((acc, message) => {
            if (typeof message.riskLevel !== 'string') return acc
            const normalized = message.riskLevel.toUpperCase()
            if (
              normalized === 'LOW' ||
              normalized === 'MODERATE' ||
              normalized === 'HIGH' ||
              normalized === 'CRITICAL'
            ) {
              return computeRiskPriority(acc) >= computeRiskPriority(normalized as any)
                ? acc
                : (normalized as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL')
            }
            return acc
          }, null)

          return {
            id,
            title,
            updatedAt,
            snippet,
            riskLevel: riskLevelFromHistory,
          }
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4)

      setRecentConversations(formatted)
    } catch (storageError) {
      console.error('Erro ao carregar histórico do chat para o painel', storageError)
      setRecentConversations([])
    } finally {
      setConversationsHydrated(true)
    }
  }, [conversationStorageKey])

  useEffect(() => {
    let isMounted = true

    async function fetchSummary() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/patient/dashboard/summary?days=30', { cache: 'no-store' })
        const payload: DashboardSummaryResponse = await response.json()
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || 'Falha ao carregar seu painel.')
        }
        if (isMounted) {
          setData(payload.data ?? null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro inesperado ao buscar dados.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSummary()

    return () => {
      isMounted = false
    }
  }, [])

  const achievementsUnlocked = useMemo(() => {
    if (!data?.badges) return 0
    return data.badges.filter((badge) => badge.earned).length
  }, [data])

  const totalBadges = data?.badges.length ?? 0
  const nextLevelInXp = data?.gamification?.progress.xpToNextLevel ?? null
  const streakDays = data?.gamification?.streakDays ?? 0
  const level = data?.gamification?.level ?? 1
  const recordStreak = data?.gamification?.bestStreak ?? 0
  const quickSessions = data?.quickSessions ?? []
  return (
    <div className="min-h-screen bg-[#f6f1ff] text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full bg-white/70 px-6 py-4 shadow-sm shadow-purple-200/40 ring-1 ring-purple-100 backdrop-blur">
          <div className="flex items-center gap-3">
            <ClaraLogo className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-[0.28em] text-purple-500">ClaraMENTE</span>
              <span className="text-xs text-slate-500">A sua terapeuta virtual</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <Link href="/patient/dashboard" className="rounded-full bg-purple-100/60 px-4 py-2 text-purple-600">
              Área do Paciente
            </Link>
            <Link
              href="/professional"
              onClick={(event) => {
                if (!isProfessional) {
                  event.preventDefault()
                }
              }}
              aria-disabled={!isProfessional}
              className={`rounded-full px-4 py-2 ${
                isProfessional ? 'hover:bg-purple-50' : 'cursor-not-allowed text-slate-400 opacity-60'
              }`}
            >
              Portal Profissional
            </Link>
          </nav>
          <Button
            variant="outline"
            className="rounded-full border-purple-200 text-purple-600"
            onClick={() => {
              void signOut({ callbackUrl: '/' })
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </header>

        <section className="relative grid min-h-[520px] gap-6 overflow-hidden rounded-[50px] border border-slate-100 bg-white px-8 py-6 shadow-2xl shadow-purple-200/60 md:grid-cols-2">
          <div className="absolute -left-20 top-10 hidden h-64 w-64 rounded-full bg-purple-200/30 blur-3xl md:block" aria-hidden="true" />

          {/* LADO ESQUERDO */}
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f5f3ff] px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#9333ea]">
              <Sparkles className="h-4 w-4" /> Conversas confidenciais
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#1e1b4b] md:text-[3.6rem] md:leading-[1.05]">
              Sua jornada de <span className="text-[#9333ea]">bem-estar</span> começa aqui
            </h1>

            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              A Clara é sua assistente especializada. Conversas seguras, exercícios guiados e suporte emocional 24/7 baseado em evidências científicas.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/chat"
                className="flex items-center gap-3 rounded-[24px] bg-[#9333ea] px-10 py-4 text-lg font-black text-white shadow-xl shadow-purple-200 transition-transform hover:scale-[1.01] hover:bg-[#7e22ce] active:scale-95"
              >
                <MessageCircle className="h-5 w-5" /> Iniciar sessão
              </Link>

              <Link
                href="/exercises"
                className="flex items-center gap-3 rounded-[24px] border-2 border-slate-200 bg-white px-10 py-4 text-lg font-black text-[#9333ea] transition hover:border-[#9333ea]"
              >
                <Wind className="h-5 w-5" /> Exercícios
              </Link>
            </div>
          </div>

          {/* LADO DIREITO (AVATAR) */}
          <div className="relative flex items-start justify-end">
            <div className="absolute right-6 top-6 hidden h-32 w-32 rounded-full bg-purple-200/40 blur-3xl md:block" aria-hidden="true" />
            <div className="absolute -right-16 top-16 hidden h-72 w-72 rounded-full bg-purple-300/25 blur-3xl md:block" aria-hidden="true" />

            {/* container controla corte e altura */}
            <div className="relative h-[380px] w-full md:h-[520px]">
              <Image
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                src="/images/patient-dashboard-hero-head.png"
                alt="Clara avatar oficial"
                className="object-cover object-right md:scale-[1.15] md:translate-x-6 scale-[1.05] translate-x-2"
                priority
              />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-purple-100 bg-white/95 p-6 shadow-lg shadow-purple-200/40">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Conversas recentes</h2>
              <p className="text-sm text-slate-500">Retome rapidamente suas sessões com a Clara.</p>
            </div>
            <Button asChild variant="ghost" className="gap-2 text-purple-600 hover:bg-purple-50">
              <Link href="/chat">
                Abrir chat <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {!conversationsHydrated ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={`conversation-skeleton-${item}`} className="h-24 animate-pulse rounded-3xl bg-purple-50/60" />
              ))}
            </div>
          ) : recentConversations.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-purple-200 bg-purple-50/40 p-6 text-sm text-slate-500">
              Você ainda não iniciou conversas por aqui. Visite o chat para começar uma sessão com a Clara.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex h-full flex-col justify-between rounded-[28px] border border-purple-100 bg-gradient-to-br from-white via-purple-50/60 to-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
                      {new Date(conversation.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">{conversation.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{conversation.snippet}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    {conversation.riskLevel ? (
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          conversation.riskLevel === 'CRITICAL'
                            ? 'bg-red-50 text-red-600'
                            : conversation.riskLevel === 'HIGH'
                              ? 'bg-orange-50 text-orange-600'
                              : conversation.riskLevel === 'MODERATE'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        Risco {conversation.riskLevel.toLowerCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Sem alertas</span>
                    )}
                    <Button asChild size="sm" className="rounded-full bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-700">
                      <Link href="/chat">Retomar</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-[32px] bg-white/90 p-6 shadow-lg shadow-purple-200/40 ring-1 ring-purple-100 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Sparkles className="h-5 w-5 text-purple-500" aria-hidden="true" />}
            label="Nível atual"
            value={`Nível ${level}`}
            helper={nextLevelInXp !== null ? `Próximo em ${nextLevelInXp} XP` : undefined}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-amber-500" aria-hidden="true" />}
            label="Sequência"
            value={`${streakDays} dias`}
            helper={recordStreak ? `Recorde: ${recordStreak}` : undefined}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-purple-500" aria-hidden="true" />}
            label="Conquistas"
            value={`${achievementsUnlocked}/${totalBadges}`}
            helper="Emblemas ganhos"
          />
          <StatCard
            icon={<ShieldCheck className="h-5 w-5 text-emerald-500" aria-hidden="true" />}
            label="Segurança"
            value="24/7"
            helper="Atendimento ativo"
          />
        </section>

        {loading && (
          <Card className="border border-purple-100 bg-white/90 text-slate-600 shadow-md shadow-purple-200/40">
            <CardContent className="flex items-center justify-center gap-2 py-10 text-sm">
              <Activity className="h-4 w-4 animate-spin text-purple-500" /> Carregando seu painel personalizado…
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className="border border-red-200 bg-red-50 text-red-700">
            <CardContent className="py-6 text-sm">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && data && (
          <div className="flex flex-col gap-8">
            <section className="rounded-[32px] border border-purple-100 bg-white/95 p-8 shadow-lg shadow-purple-200/40">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Recomendações</h2>
                  <p className="text-sm text-slate-500">Práticas rápidas para equilibrar o seu dia.</p>
                </div>
                <Button asChild variant="ghost" className="gap-2 text-purple-600 hover:bg-purple-50">
                  <Link href="/exercises">
                    Ver tudo <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {quickSessions.length > 0 ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {quickSessions.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-[28px] border border-purple-100 bg-gradient-to-br from-white via-purple-50/60 to-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
                        {item.category}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.durationMinutes} min • {item.xpReward} XP • Dificuldade {item.difficulty}
                      </p>
                      <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
                        <span>Comece quando quiser</span>
                        <Button
                          asChild
                          size="icon"
                          className="h-10 w-10 rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700"
                          variant="secondary"
                        >
                          <Link href={`/exercises/${item.slug}`} aria-label={`Iniciar ${item.title}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-3xl border border-dashed border-purple-200 bg-purple-50/40 p-8 text-sm text-slate-500">
                  Ainda não temos recomendações rápidas. Explore a biblioteca para iniciar novas práticas.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
