// @ts-nocheck
"use client"

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Flame,
  Heart,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Wind,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClaraLogo } from '@/components/ClaraLogo'
import { CrisisModal } from '@/components/patient/CrisisModal'
import { PatientChat } from '@/components/patient/PatientChat'

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
    <div className="group flex h-full flex-col rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-50 text-purple-600 transition-colors group-hover:bg-purple-50">
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</span>
      <span className="mt-4 text-3xl font-black text-slate-900">{value}</span>
      {helper ? <span className="mt-3 text-[11px] font-bold text-slate-500">{helper}</span> : null}
    </div>
  )
}

export default function PatientDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardSummaryResponse['data'] | null>(null)
  const [crisisOpen, setCrisisOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)

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
  const accentPalette = ['bg-blue-500', 'bg-purple-600', 'bg-emerald-500', 'bg-amber-500']

  return (
    <div className="relative min-h-screen bg-[#f6f1ff] text-slate-900">
      <div className="fixed bottom-16 right-6 z-30 md:right-12">
        <button
          type="button"
          onClick={() => setCrisisOpen(true)}
          className="group flex items-center gap-4 rounded-full border-2 border-white/20 bg-[#ef4444] px-10 py-6 font-black uppercase tracking-tight text-white shadow-[0_20px_40px_-10px_rgba(220,38,38,0.5)] transition-transform hover:scale-105 hover:bg-red-700 active:scale-95"
        >
          <AlertTriangle className="h-7 w-7 transition-transform group-hover:animate-bounce" />
          <span className="text-xl">Crise</span>
        </button>
      </div>

      <CrisisModal open={crisisOpen} onClose={() => setCrisisOpen(false)} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[48px] border border-purple-100 bg-white/90 px-6 py-5 shadow-sm shadow-purple-200/40 backdrop-blur">
          <div className="flex items-center gap-3">
            <ClaraLogo className="h-12 w-12 drop-shadow-[0_16px_32px_rgba(147,51,234,0.18)]" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-[0.28em] text-purple-500">ClaraMENTE</span>
              <span className="text-xs text-slate-500">A sua assistente terapeuta virtual</span>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Link href="/patient/dashboard" className="rounded-full bg-purple-100/60 px-4 py-2 text-purple-600">
              Área do Paciente
            </Link>
            <Link href="/professional" className="rounded-full px-4 py-2 hover:bg-purple-50">
              Portal Profissional
            </Link>
          </nav>
          <Button variant="outline" className="rounded-full border-purple-200 text-purple-600">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </header>

        <section className="relative grid gap-6 overflow-hidden rounded-[50px] border border-slate-100 bg-white px-8 py-10 shadow-2xl shadow-purple-200/60 md:grid-cols-2">
          <div className="absolute -left-20 top-10 hidden h-64 w-64 rounded-full bg-purple-200/30 blur-3xl md:block" aria-hidden="true" />
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
              <button
                type="button"
                onClick={() => setShowChat((previous) => !previous)}
                className="flex items-center gap-3 rounded-[24px] bg-[#9333ea] px-10 py-4 text-lg font-black text-white shadow-xl shadow-purple-200 transition-transform hover:scale-[1.01] hover:bg-[#7e22ce] active:scale-95"
              >
                <MessageCircle className="h-5 w-5" /> {showChat ? 'Fechar sessão' : 'Iniciar sessão'}
              </button>
              <Link
                href="/exercises"
                className="flex items-center gap-3 rounded-[24px] border-2 border-slate-200 bg-white px-10 py-4 text-lg font-black text-[#9333ea] transition hover:border-[#9333ea]"
              >
                <Wind className="h-5 w-5" /> Exercícios
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute right-6 top-6 hidden h-32 w-32 rounded-full bg-purple-200/40 blur-3xl md:block" aria-hidden="true" />
            <div className="relative w-full max-w-xl">
              <div className="absolute -right-12 top-12 hidden h- w-72 rounded-full bg-purple-300/25 blur-3xl md:block" aria-hidden="true" />
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                alt="Clara avatar oficial"
                width={460}
                height={460}
                className="relative z-10 w-full object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {showChat && (
          <div className="animate-in fade-in zoom-in duration-500">
            <PatientChat
              onCriticalRisk={() => {
                setCrisisOpen(true)
                setShowChat(false)
              }}
            />
          </div>
        )}

        <section className="grid gap-6 rounded-[40px] border border-slate-100 bg-white/90 p-6 shadow-lg shadow-purple-200/40 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Star className="h-6 w-6 text-amber-400" aria-hidden="true" />}
            label="Nível atual"
            value={`Nível ${level}`}
            helper={nextLevelInXp !== null ? `Próximo em ${nextLevelInXp} XP` : undefined}
          />
          <StatCard
            icon={<Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />}
            label="Sequência"
            value={`${streakDays} dias`}
            helper={recordStreak ? `Recorde: ${recordStreak}` : undefined}
          />
          <StatCard
            icon={<Trophy className="h-6 w-6 text-purple-500" aria-hidden="true" />}
            label="Conquistas"
            value={`${achievementsUnlocked}/${totalBadges}`}
            helper="Emblemas ganhos"
          />
          <StatCard
            icon={<Heart className="h-6 w-6 text-red-500" aria-hidden="true" />}
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
          <section className="rounded-[56px] border border-purple-100 bg-[#f5f3ff] p-12 shadow-inner shadow-purple-200/40">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-4xl font-black text-[#1e1b4b]">Recomendações</h2>
                <p className="mt-2 text-lg font-bold text-slate-500/80">Práticas rápidas para equilibrar o seu dia.</p>
              </div>
              <Link
                href="/exercises"
                className="flex items-center gap-3 text-lg font-black text-[#9333ea] transition-all hover:gap-4"
              >
                Ver tudo <ArrowRight className="h-6 w-6" />
              </Link>
            </div>

            {quickSessions.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {quickSessions.slice(0, 3).map((item, index) => {
                  const accent = accentPalette[index % accentPalette.length]
                  return (
                    <div
                      key={item.id}
                      className="relative flex h-full flex-col justify-between rounded-[44px] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-2xl"
                    >
                      <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-[44px] ${accent}`} aria-hidden="true" />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{item.category}</p>
                        <h3 className="mt-4 text-2xl font-black text-[#1e1b4b] transition-colors hover:text-[#9333ea]">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          {item.durationMinutes} min • {item.xpReward} XP • Dificuldade {item.difficulty}
                        </p>
                      </div>
                      <div className="mt-10 flex items-center justify-between">
                        <span className="rounded-full bg-slate-50 px-4 py-2 text-[11px] font-black text-slate-500">
                          Comece quando quiser
                        </span>
                        <Link
                          href={`/exercises/${item.slug}`}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 text-[#9333ea] transition-all hover:-translate-y-0.5 hover:bg-[#9333ea] hover:text-white hover:shadow-lg"
                          aria-label={`Iniciar ${item.title}`}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-10 rounded-[44px] border border-dashed border-purple-200 bg-white/70 p-10 text-sm text-slate-500">
                Ainda não temos recomendações rápidas. Explore a biblioteca para iniciar novas práticas.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}"use client"

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, ArrowRight, Dumbbell, Flame, LogOut, MessageCircle, ShieldCheck, Sparkles, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClaraLogo } from '@/components/ClaraLogo'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardSummaryResponse['data'] | null>(null)

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
              <span className="text-xs text-slate-500">A sua assistente terapeuta virtual</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <Link href="/patient/dashboard" className="rounded-full bg-purple-100/60 px-4 py-2 text-purple-600">
              Área do Paciente
            </Link>
            <Link href="/professional" className="rounded-full px-4 py-2 hover:bg-purple-50">
              Portal Profissional
            </Link>
          </nav>
          <Button variant="outline" className="rounded-full border-purple-200 text-purple-600">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </header>

        <section className="relative grid gap-6 overflow-hidden rounded-[36px] bg-gradient-to-r from-white via-white to-purple-50 px-8 py-8 shadow-2xl shadow-purple-200/70 ring-1 ring-purple-100 lg:grid-cols-2">
          <div className="absolute -top-32 left-1/3 hidden h-64 w-64 rounded-full bg-purple-200/30 blur-3xl lg:block" aria-hidden="true" />
          <div className="flex flex-col justify-center gap-5">
            <div className="w-fit rounded-full bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 px-4 py-[6px] text-[11px] font-semibold uppercase tracking-[0.35em] text-purple-600">
              Conversas confidenciais
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-slate-900 md:text-[3.4rem] md:leading-[1.05]">
              Sua jornada de{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">bem-estar</span>{' '}
              começa aqui
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              A Clara é sua assistente especializada. Conversas seguras, exercícios guiados e suporte emocional 24/7 baseado em evidências científicas.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-14 rounded-full bg-gradient-to-r from-[#9F4CF6] to-[#7C5CFF] px-9 text-base font-semibold text-white shadow-lg shadow-purple-400/50 transition hover:scale-[1.01] hover:from-[#8c3de4] hover:to-[#6b4ff0]"
              >
                <Link href="/chat" className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Iniciar sessão
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-14 rounded-full border border-purple-200 bg-white/80 px-9 text-base font-semibold text-purple-600 shadow-inner shadow-purple-200/40 transition hover:bg-purple-50"
              >
                <Link href="/exercises" className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" /> Exercícios
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute right-6 top-6 hidden h-32 w-32 rounded-full bg-purple-200/40 blur-3xl lg:block" aria-hidden="true" />
            <div className="relative w-full max-w-xl">
              <div className="absolute -right-16 top-16 hidden h-72 w-72 rounded-full bg-purple-300/25 blur-3xl lg:block" aria-hidden="true" />
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                alt="Clara avatar oficial"
                width={460}
                height={460}
                className="relative z-10 w-full object-contain"
                priority
              />
            </div>
          </div>
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
