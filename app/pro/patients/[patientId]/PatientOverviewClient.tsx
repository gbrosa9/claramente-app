"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Activity, Mail, Calendar, AlertTriangle, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OverviewResponse {
  ok: boolean
  error?: string
  patient: {
    id: string
    full_name: string | null
    email: string | null
    created_at: string
    updated_at: string
  }
  patientActivity?: {
    lastSeenAt: string | null
    lastSignInAt: string | null
    isOnline: boolean
  }
}

interface RiskSummaryResponse {
  ok: boolean
  error?: string
  data?: {
    totals: {
      panic: number
      detection: number
      highCritical: number
    }
    aggregates: {
      last7Days: {
        panic: number
        detection: number
        highCritical: number
      }
      windowDays: number
    }
    series: Array<{
      date: string
      panicCount: number
      detectionCount: number
      highCriticalCount: number
    }>
    transparency: string
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('pt-BR')
  } catch {
    return value
  }
}

function formatRelativeTime(value: string | null | undefined) {
  if (!value) return 'Sem registro'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return formatDate(value)
  }

  const diff = Date.now() - date.getTime()
  if (diff < 0) {
    return 'Agora'
  }

  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `há ${days} d`
  return formatDate(value)
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function PatientOverviewClient({ patientId }: { patientId: string }) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [risk, setRisk] = useState<RiskSummaryResponse['data'] | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      setLoading(true)
      setError('')

      try {
        const overviewResponse = await fetch(`/api/pro/patients/${patientId}/overview`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-store' },
        })

        const overviewPayload = (await overviewResponse.json()) as OverviewResponse

        if (!overviewResponse.ok || !overviewPayload.ok) {
          throw new Error(overviewPayload.error || 'Falha ao carregar paciente.')
        }

        let riskPayload: RiskSummaryResponse['data'] | null = null
        try {
          const riskResponse = await fetch(`/api/pro/patients/${patientId}/risk-summary`, {
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-store' },
          })
          const parsedRisk = (await riskResponse.json()) as RiskSummaryResponse
          if (riskResponse.ok && parsedRisk.ok) {
            riskPayload = parsedRisk.data ?? null
          } else {
            console.warn('Resumo de risco indisponível:', parsedRisk.error)
          }
        } catch (riskErr) {
          console.warn('Falha ao carregar resumo de risco do paciente:', riskErr)
        }

        setOverview(overviewPayload)
        setRisk(riskPayload)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError((err as Error).message || 'Erro de conexão. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [patientId])

  const handleRetry = () => {
    setOverview(null)
    setRisk(null)
    setError('')
    setLoading(true)

    void (async () => {
      try {
        const overviewResponse = await fetch(`/api/pro/patients/${patientId}/overview`, {
          headers: { 'Cache-Control': 'no-store' },
        })
        const overviewPayload = (await overviewResponse.json()) as OverviewResponse
        if (!overviewResponse.ok || !overviewPayload.ok) {
          throw new Error(overviewPayload.error || 'Falha ao carregar paciente.')
        }

        let riskPayload: RiskSummaryResponse['data'] | null = null
        try {
          const riskResponse = await fetch(`/api/pro/patients/${patientId}/risk-summary`, {
            headers: { 'Cache-Control': 'no-store' },
          })
          const parsedRisk = (await riskResponse.json()) as RiskSummaryResponse
          if (riskResponse.ok && parsedRisk.ok) {
            riskPayload = parsedRisk.data ?? null
          }
        } catch (riskErr) {
          console.warn('Falha ao carregar resumo de risco do paciente:', riskErr)
        }

        setOverview(overviewPayload)
        setRisk(riskPayload)
      } catch (err) {
        setError((err as Error).message || 'Erro de conexão. Tente novamente.')
      } finally {
        setLoading(false)
      }
    })()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Carregando informações do paciente...</p>
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Não foi possível carregar
            </CardTitle>
            <CardDescription>{error || 'Erro desconhecido.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              Tentar novamente
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/pro/dashboard')}>
              Voltar ao dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { patient, patientActivity } = overview
  const riskTotals = risk?.totals ?? { panic: 0, detection: 0, highCritical: 0 }
  const last7 = risk?.aggregates?.last7Days ?? { panic: 0, detection: 0, highCritical: 0 }
  const windowDays = risk?.aggregates?.windowDays ?? 30
  const timeline = (risk?.series ?? []).slice(-14).reverse()
  const lastActivityLabel = patientActivity?.isOnline
    ? 'Paciente online agora'
    : patientActivity?.lastSeenAt
    ? `Última atividade ${formatRelativeTime(patientActivity.lastSeenAt)}`
    : 'Sem registro de atividade recente'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/pro/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <span className="text-sm text-slate-500 dark:text-slate-400">ID: {patient.id}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center text-2xl font-semibold">
                {getInitials(patient.full_name)}
              </div>
              <div className="flex-1 space-y-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {patient.full_name || 'Paciente sem nome'}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {patient.email || 'Sem e-mail cadastrado'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Vinculado desde {formatDate(patient.created_at)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Última atualização {formatDate(patient.updated_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${patientActivity?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {lastActivityLabel}
                  </span>
                  {patientActivity?.lastSignInAt && (
                    <span>
                      Último login {formatRelativeTime(patientActivity.lastSignInAt)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Botões de pânico</p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{riskTotals.panic}</p>
                  <p className="text-[11px] text-slate-500">Últimos {windowDays} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Detecções automáticas</p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{riskTotals.detection}</p>
                  <p className="text-[11px] text-slate-500">Sinais identificados pela IA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Eventos críticos</p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{riskTotals.highCritical}</p>
                  <p className="text-[11px] text-slate-500">Sinalizaram risco extremo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo dos últimos 7 dias</CardTitle>
            <CardDescription>
              Monitoramento baseado em eventos de crise, sem expor conteúdo das conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs uppercase text-slate-500">Botões de pânico</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{last7.panic}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs uppercase text-slate-500">Detecções</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{last7.detection}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs uppercase text-slate-500">Críticos</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{last7.highCritical}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução recente</CardTitle>
            <CardDescription>
              Eventos agrupados por dia para facilitar a identificação de picos de risco.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.length === 0 && (
              <p className="text-sm text-slate-500">Sem registros de risco neste período.</p>
            )}
            {timeline.map((entry) => (
              <div key={entry.date} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-300">
                  <span>Pânico: {entry.panicCount}</span>
                  <span>Detecções: {entry.detectionCount}</span>
                  <span>Críticos: {entry.highCriticalCount}</span>
                </div>
              </div>
            ))}
            {risk?.transparency && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {risk.transparency}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
