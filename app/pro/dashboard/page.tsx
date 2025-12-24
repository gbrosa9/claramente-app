"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { 
  Users, 
  UserPlus, 
  Bell, 
  TrendingUp, 
  Calendar,
  Brain,
  ArrowRight,
  ClipboardList,
  LogOut
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ClaraLogo } from "@/components/ClaraLogo"

interface Patient {
  id: string
  patient_id: string
  status: string
  created_at: string
  patient_profile: {
    full_name: string
    email: string
    avatar_url: string | null
    last_seen_at?: string | null
    last_sign_in_at?: string | null
    is_online?: boolean
  }
}

interface Stats {
  totalPatients: number
  activePatients: number
  unreadNotifications: number
  sessionsThisWeek: number
}

export default function ProfessionalDashboard() {
  const router = useRouter()
  const { data: authSession, status } = useSession()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    activePatients: 0,
    unreadNotifications: 0,
    sessionsThisWeek: 0
  })
  const [claimCode, setClaimCode] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
  const [showPortalView, setShowPortalView] = useState(false)

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) {
      return 'Sem registro'
    }

    try {
      return new Date(value).toLocaleString('pt-BR')
    } catch {
      return value
    }
  }

  const formatRelativeTime = (value: string | null | undefined) => {
    if (!value) {
      return 'Sem registro'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return formatDateTime(value)
    }

    const diff = Date.now() - date.getTime()

    if (diff < 0) {
      return 'Agora'
    }

    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) {
      return 'Agora'
    }
    if (minutes < 60) {
      return `há ${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `há ${hours} h`
    }
    const days = Math.floor(hours / 24)
    if (days < 7) {
      return `há ${days} d`
    }
    return formatDateTime(value)
  }

  useEffect(() => {
    if (status !== 'authenticated') {
      setInitialized(false)
    }
  }, [status])

  const handleSignOut = useCallback(async () => {
    try {
      setSigningOut(true)
      await signOut({ callbackUrl: '/login' })
    } catch (error) {
      console.error('Erro ao sair da conta:', error)
    } finally {
      setSigningOut(false)
    }
  }, [signOut])

  const fetchOverview = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true)
    }
    setDashboardError("")

    try {
      const response = await fetch('/api/pro/dashboard/overview', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-store' },
        credentials: 'include'
      })

      const payload = await response.json().catch(() => ({}))

      if (response.status === 401) {
        router.replace('/login')
        return
      }

      if (response.status === 403) {
        router.replace('/dashboard')
        return
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Não foi possível carregar o painel profissional.')
      }

      setProfile(payload.profile ?? null)
      setPatients(Array.isArray(payload.patients) ? payload.patients : [])
      setStats(payload.stats ?? {
        totalPatients: 0,
        activePatients: 0,
        unreadNotifications: 0,
        sessionsThisWeek: 0
      })
    } catch (error) {
      console.error('Erro ao carregar painel profissional:', error)
      setDashboardError((error as Error).message || 'Erro ao carregar painel profissional.')
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
    }
  }, [router])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status !== 'authenticated' || !authSession?.user) {
      router.replace('/login')
      return
    }

    const role = String(authSession.user.role || '').toLowerCase()

    if (role !== 'professional') {
      router.replace('/dashboard')
      return
    }

    if (initialized) {
      return
    }

    fetchOverview()
      .catch((error) => {
        console.error('Erro ao inicializar painel profissional:', error)
      })
      .finally(() => {
        setInitialized(true)
      })
  }, [status, authSession, router, initialized, fetchOverview])

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setClaimLoading(true)
    setClaimError("")
    setClaimSuccess(false)

    try {
      const response = await fetch('/api/follow-codes/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: claimCode.toUpperCase() })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setClaimSuccess(true)
        setClaimCode("")
        await fetchOverview({ silent: true })
      } else {
        setClaimError(data.error || 'Erro ao resgatar código')
      }
    } catch (error) {
      setClaimError('Erro de conexão. Tente novamente.')
    } finally {
      setClaimLoading(false)
    }
  }

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  const firstName = typeof profile?.full_name === 'string' && profile.full_name.trim().length > 0
    ? profile.full_name.split(' ')[0]
    : 'Profissional'
  const recentPatients = Array.isArray(patients) ? patients.slice(0, 4) : []

  if (!showPortalView) {
    return (
      <div className="min-h-screen bg-[#f6f1ff] text-slate-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-full bg-white/70 px-6 py-4 shadow-sm shadow-purple-200/40 ring-1 ring-purple-100 backdrop-blur">
            <div className="flex items-center gap-3">
              <ClaraLogo className="h-10 w-10" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold uppercase tracking-[0.28em] text-purple-500">ClaraMENTE</span>
                <span className="text-xs text-slate-500">Portal do Profissional</span>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
              <span className="rounded-full bg-purple-100/60 px-4 py-2 text-purple-600">Área do Profissional</span>
              <Button
                size="sm"
                className="flex items-center gap-2 rounded-full bg-purple-600 px-4 text-white shadow-sm transition hover:bg-purple-700"
                onClick={() => setShowPortalView(true)}
              >
                Portal Profissional
                <ArrowRight className="h-4 w-4" />
              </Button>
            </nav>
            <Button
              variant="outline"
              className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {signingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </header>

          {dashboardError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <span>{dashboardError}</span>
                <Button size="sm" variant="outline" onClick={() => fetchOverview()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : null}

          <section className="relative grid min-h-[420px] gap-6 overflow-hidden rounded-[40px] border border-purple-100 bg-white px-8 py-8 shadow-2xl shadow-purple-200/50 md:grid-cols-2">
            <div className="absolute -left-24 top-12 hidden h-60 w-60 rounded-full bg-purple-200/40 blur-3xl md:block" aria-hidden="true" />
            <div className="absolute -right-20 bottom-0 hidden h-72 w-72 rounded-full bg-purple-300/30 blur-3xl md:block" aria-hidden="true" />
            <div className="flex flex-col justify-center gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-100/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-600">
                <Brain className="h-4 w-4" />
                ClaraMENTE Pro
              </span>
              <h1 className="text-4xl font-black leading-tight text-[#1e1b4b] md:text-5xl">
                Olá, {firstName}! Centralize o cuidado dos seus pacientes.
              </h1>
              <p className="max-w-xl text-base text-slate-600 md:text-lg">
                Visualize métricas, organize acompanhamentos e acesse recursos clínicos em um único lugar.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="flex items-center gap-2 rounded-full bg-[#9333ea] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300 transition hover:bg-[#7e22ce]"
                  onClick={() => setShowPortalView(true)}
                >
                  Portal Profissional
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-purple-200 px-6 py-3 text-base font-semibold text-purple-600 hover:bg-purple-50"
                  onClick={() => handleNavigate('/pro/patients')}
                >
                  Ver pacientes
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-6 py-3 text-base font-semibold text-purple-600 hover:bg-purple-50"
                  onClick={() => handleNavigate('/pro/claim')}
                >
                  Adicionar paciente
                </Button>
              </div>
            </div>
            <div className="relative flex items-start justify-end">
              <div className="absolute right-6 top-6 hidden h-32 w-32 rounded-full bg-purple-200/40 blur-3xl md:block" aria-hidden="true" />
              <div className="relative h-[320px] w-full md:h-[460px]">
                <Image
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  src="/images/patient-dashboard-hero-head.png"
                  alt="Ilustração Clara para profissionais"
                  className="object-cover object-right md:translate-x-6 md:scale-[1.15]"
                  priority
                />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-purple-100 bg-white/95 p-6 shadow-lg shadow-purple-200/40">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Visão geral</h2>
                <p className="text-sm text-slate-500">Dados atualizados nas últimas sincronizações.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => fetchOverview()}>
                Atualizar
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="rounded-3xl border-purple-100 bg-gradient-to-br from-white via-purple-50/40 to-white">
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="text-sm text-slate-500">Total de pacientes</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.totalPatients.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-purple-500" />
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-purple-100 bg-gradient-to-br from-white via-green-50/40 to-white">
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="text-sm text-slate-500">Pacientes ativos</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.activePatients.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-purple-100 bg-gradient-to-br from-white via-blue-50/40 to-white">
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="text-sm text-slate-500">Sessões nesta semana</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.sessionsThisWeek.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-cyan-600" />
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-purple-100 bg-gradient-to-br from-white via-orange-50/40 to-white">
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="text-sm text-slate-500">Notificações pendentes</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.unreadNotifications.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Bell className="h-10 w-10 text-orange-500" />
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="rounded-[32px] border border-purple-100 bg-white/95 p-6 shadow-lg shadow-purple-200/40">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Pacientes recentes</h2>
                <p className="text-sm text-slate-500">Últimos vínculos e atividade.</p>
              </div>
              <Button asChild variant="ghost" className="gap-2 text-purple-600 hover:bg-purple-50">
                <Link href="/pro/patients">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {recentPatients.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-purple-200 bg-purple-50/40 p-6 text-sm text-slate-500">
                Vincule novos pacientes com o código de acompanhamento para começar a monitorá-los aqui.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {recentPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="rounded-3xl border-purple-100 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <CardContent className="flex flex-col gap-4 pt-6 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-lg font-semibold text-white">
                          {patient.patient_profile?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900">
                            {patient.patient_profile?.full_name || 'Sem nome'}
                          </h3>
                          <p className="text-sm text-slate-500">{patient.patient_profile?.email}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  patient.patient_profile?.is_online ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {patient.patient_profile?.is_online
                                ? 'Online agora'
                                : `Visto ${formatRelativeTime(patient.patient_profile?.last_seen_at)}`}
                            </span>
                            {patient.patient_profile?.last_sign_in_at ? (
                              <span>
                                Último login {formatRelativeTime(patient.patient_profile.last_sign_in_at)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="rounded-full bg-purple-600 px-4 text-white hover:bg-purple-700"
                          onClick={() => handleNavigate(`/pro/patients/${patient.patient_id}`)}
                        >
                          Ver ficha
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-purple-200 px-4 text-purple-600 hover:bg-purple-50"
                          onClick={() => handleNavigate(`/pro/patients/${patient.patient_id}/risk`)}
                        >
                          Acompanhamento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Link href="/pro/patients">
              <Card className="rounded-[28px] border-purple-100 bg-white/95 p-1 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center gap-4 rounded-[24px] bg-white/90 px-4 py-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Todos os pacientes</h3>
                    <p className="text-sm text-slate-500">Ficha completa e relatórios</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/pro/claim">
              <Card className="rounded-[28px] border-purple-100 bg-white/95 p-1 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center gap-4 rounded-[24px] bg-white/90 px-4 py-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Adicionar paciente</h3>
                    <p className="text-sm text-slate-500">Vincular com código de acompanhamento</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/pro/notifications">
              <Card className="rounded-[28px] border-purple-100 bg-white/95 p-1 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center gap-4 rounded-[24px] bg-white/90 px-4 py-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Notificações</h3>
                    <p className="text-sm text-slate-500">{stats.unreadNotifications} pendentes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:bg-purple-50"
            onClick={() => setShowPortalView(false)}
          >
            <ArrowRight className="h-4 w-4 -rotate-180" />
            Voltar à visão ClaraMENTE
          </Button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Dashboard Profissional
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Olá, {profile?.full_name || 'Profissional'}! Bem-vindo(a) ao seu painel de controle.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/pro/patients">
                  <Button size="sm" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Meus pacientes
                  </Button>
                </Link>
                <Link href="/pro/claim">
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Adicionar via código
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-2"
                  disabled={signingOut}
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  {signingOut ? 'Saindo...' : 'Sair'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {dashboardError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>{dashboardError}</span>
              <Button size="sm" variant="outline" onClick={() => fetchOverview()}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total de Pacientes
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalPatients}
                  </p>
                </div>
                <Users className="w-10 h-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Pacientes Ativos
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.activePatients}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Notificações
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.unreadNotifications}
                  </p>
                </div>
                <Bell className="w-10 h-10 text-orange-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Sessões (Semana)
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.sessionsThisWeek}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-cyan-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resgatar Código */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Adicionar Paciente
                </CardTitle>
                <CardDescription>
                  Insira o código compartilhado pelo paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClaimCode} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Ex: A3B5C7D9"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="text-center text-lg font-mono tracking-wider"
                  />
                  
                  {claimError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                      {claimError}
                    </div>
                  )}
                  
                  {claimSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
                      Paciente vinculado com sucesso!
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={claimLoading || claimCode.length !== 8}
                    className="w-full"
                  >
                    {claimLoading ? 'Resgatando...' : 'Resgatar Código'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Link href="/pro/notifications">
                    <Button variant="outline" className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      Ver Notificações
                      {stats.unreadNotifications > 0 && (
                        <span className="ml-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {stats.unreadNotifications}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pacientes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Pacientes Recentes
                    </CardTitle>
                    <CardDescription>
                      Seus pacientes vinculados mais recentemente
                    </CardDescription>
                  </div>
                  <Link href="/pro/patients">
                    <Button variant="outline" size="sm">
                      Ver Todos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      Nenhum paciente vinculado ainda
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Use um código de acompanhamento para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => router.push(`/pro/patients/${patient.patient_id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            router.push(`/pro/patients/${patient.patient_id}`)
                          }
                        }}
                        className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-semibold text-lg">
                          {patient.patient_profile?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {patient.patient_profile?.full_name || 'Sem nome'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {patient.patient_profile?.email}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  patient.patient_profile?.is_online ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {patient.patient_profile?.is_online
                                ? 'Online agora'
                                : `Visto ${formatRelativeTime(patient.patient_profile?.last_seen_at)}`}
                            </span>
                            {patient.patient_profile?.last_sign_in_at && (
                              <span>
                                Último login {formatRelativeTime(patient.patient_profile.last_sign_in_at)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={(event) => {
                              event.stopPropagation()
                              router.push(`/pro/patients/${patient.patient_id}/risk`)
                            }}
                          >
                            <ClipboardList className="w-4 h-4" />
                            <span className="hidden md:inline">Acompanhar</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/pro/patients">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Todos os Pacientes
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Ver lista completa e detalhes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pro/claim">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <UserPlus className="w-10 h-10 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Resgatar Código
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Adicionar novo paciente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pro/notifications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Bell className="w-10 h-10 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Notificações
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stats.unreadNotifications} não lidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
