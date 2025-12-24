"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Search, ArrowLeft, Calendar, UserPlus, CheckCircle, AlertCircle, AlertTriangle, Loader2, ClipboardList, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Patient {
  id: string
  patientId: string
  status: string
  createdAt: string
  updatedAt?: string | null
  profile: {
    fullName: string | null
    email: string | null
    avatarUrl: string | null
  }
  activity: {
    lastSeenAt: string | null
    lastSignInAt: string | null
    isOnline: boolean
  }
}

interface OverviewResponse {
  ok: boolean
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

interface RiskSummary {
  ok: boolean
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
    transparency: string
  }
  error?: string
}

export default function PatientsListPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [claimCode, setClaimCode] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimedPatientOverview, setClaimedPatientOverview] = useState<{ overview: OverviewResponse; risk: RiskSummary['data'] | null } | null>(null)
  const [claimedOverviewLoading, setClaimedOverviewLoading] = useState(false)
  const [claimedOverviewError, setClaimedOverviewError] = useState("")

  useEffect(() => {
    void loadPatients()
  }, [statusFilter])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pro/patients?status=${statusFilter}`, {
        headers: { 'Cache-Control': 'no-store' },
        credentials: 'include',
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.status === 403) {
        router.push('/dashboard')
        return
      }

      const payload = (await response.json()) as { ok: boolean; patients?: Patient[]; error?: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Não foi possível carregar os pacientes.')
      }

      setPatients(payload.patients ?? [])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setClaimError("")
    setClaimSuccess(false)
    setClaimLoading(true)
    setClaimedPatientOverview(null)
    setClaimedOverviewError("")

    try {
      const response = await fetch('/api/follow-codes/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: claimCode.toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setClaimCode("")
        await loadPatients()
        setClaimSuccess(true)
        await loadClaimedPatientOverview(data.patientId)
      } else {
        setClaimError(data.error || 'Não foi possível vincular o paciente.')
      }
    } catch (error) {
      console.error('Erro ao resgatar código:', error)
      setClaimError('Erro de conexão. Tente novamente.')
    } finally {
      setClaimLoading(false)
    }
  }

  const loadClaimedPatientOverview = async (patientId: string) => {
    setClaimedOverviewLoading(true)
    try {
      const [overviewResponse, riskResponse] = await Promise.all([
        fetch(`/api/pro/patients/${patientId}/overview`, {
          headers: { 'Cache-Control': 'no-store' },
          credentials: 'include',
        }),
        fetch(`/api/pro/patients/${patientId}/risk-summary`, {
          headers: { 'Cache-Control': 'no-store' },
          credentials: 'include',
        }),
      ])

      if (overviewResponse.status === 401 || riskResponse.status === 401) {
        setClaimedOverviewError('Sessão expirada. Faça login novamente.')
        router.replace('/login')
        return
      }

      if (overviewResponse.status === 403 || riskResponse.status === 403) {
        setClaimedOverviewError('Apenas profissionais podem visualizar este paciente.')
        return
      }

      const overviewPayload = (await overviewResponse.json()) as OverviewResponse & { error?: string }

      if (!overviewResponse.ok || !overviewPayload.ok) {
        throw new Error(overviewPayload.error || 'Não foi possível carregar os dados do paciente.')
      }

      let riskPayload: RiskSummary['data'] | null = null

      try {
        const parsedRisk = (await riskResponse.json()) as RiskSummary
        if (riskResponse.ok && parsedRisk.ok) {
          riskPayload = parsedRisk.data ?? null
        }
      } catch (riskParseError) {
        console.warn('Falha ao interpretar resumo de risco do paciente vinculado:', riskParseError)
      }

      setClaimedPatientOverview({ overview: overviewPayload, risk: riskPayload })
    } catch (error) {
      setClaimedOverviewError((error as Error).message || 'Erro ao buscar informações do paciente.')
    } finally {
      setClaimedOverviewLoading(false)
    }
  }

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

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true
    const name = patient.profile?.fullName?.toLowerCase() || ''
    const email = patient.profile?.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search) || email.includes(search)
  })

  const claimedOverview = claimedPatientOverview?.overview ?? null
  const claimedRisk = claimedPatientOverview?.risk ?? null
  const claimedRiskTotals = claimedRisk?.totals ?? { panic: 0, detection: 0, highCritical: 0 }
  const claimedRiskLast7 = claimedRisk?.aggregates?.last7Days ?? { panic: 0, detection: 0, highCritical: 0 }
  const claimedRiskWindowDays = claimedRisk?.aggregates?.windowDays ?? 30
  const claimedRiskTransparency = claimedRisk?.transparency ?? ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pro/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Meus Pacientes
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie e acompanhe o progresso de seus pacientes
            </p>
          </motion.div>
        </div>

        {/* Claim Code */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleClaimCode} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <UserPlus className="w-5 h-5" />
                    Adicionar paciente pelo código
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Peça para o paciente gerar o código único no painel dele e insira abaixo para acompanhar o progresso.
                  </p>
                  <Input
                    value={claimCode}
                    onChange={(event) => setClaimCode(event.target.value.toUpperCase())}
                    placeholder="EX: AB12CD34"
                    maxLength={8}
                    className="text-center text-lg font-mono tracking-widest uppercase"
                    aria-label="Código único do paciente"
                  />
                </div>
                <div className="w-full md:w-auto flex flex-col gap-3">
                  <Button type="submit" className="w-full md:w-44" disabled={claimLoading || claimCode.length !== 8}>
                    {claimLoading ? 'Vinculando...' : 'Adicionar Paciente'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-44"
                    onClick={() => router.push('/pro/claim')}
                  >
                    Preciso de ajuda
                  </Button>
                </div>
              </div>

              {claimError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  {claimError}
                </div>
              )}

              {claimSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  Paciente vinculado com sucesso! Veja o resumo logo abaixo.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {(claimedOverviewLoading || claimedPatientOverview || claimedOverviewError) && (
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Paciente vinculado agora
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Visualize rapidamente as principais informações antes de abrir o detalhe completo.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/pro/patients')}>
                  Atualizar lista
                </Button>
              </div>

              {claimedOverviewLoading && (
                <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Carregando dados do paciente...
                </div>
              )}

              {!claimedOverviewLoading && claimedOverviewError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  {claimedOverviewError}
                </div>
              )}

              {!claimedOverviewLoading && claimedOverview && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {claimedOverview.patient.full_name || 'Paciente sem nome'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {claimedOverview.patient.email || 'Sem e-mail cadastrado'}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Vinculado em {formatDateTime(claimedOverview.patient.created_at)} • Última atualização {formatDateTime(claimedOverview.patient.updated_at)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              claimedOverview.patientActivity?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {claimedOverview.patientActivity?.isOnline
                            ? 'Online agora'
                            : `Visto ${formatRelativeTime(claimedOverview.patientActivity?.lastSeenAt)}`}
                        </span>
                        {claimedOverview.patientActivity?.lastSignInAt && (
                          <span>
                            Último login {formatRelativeTime(claimedOverview.patientActivity.lastSignInAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/pro/patients/${claimedOverview.patient.id}`)}
                      >
                        Abrir painel completo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/pro/patients/${claimedOverview.patient.id}/risk`)}
                      >
                        Ver relatório de risco
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Botões de pânico</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                              {claimedRiskTotals.panic}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Últimos {claimedRiskWindowDays} dias
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Detecções automáticas</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                              {claimedRiskTotals.detection}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Sinais identificados pela IA
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Casos críticos</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                              {claimedRiskTotals.highCritical}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Necessitaram intervenção imediata
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6 space-y-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Resumo dos últimos 7 dias</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                          <p className="text-xs uppercase text-slate-500">Botões de pânico</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{claimedRiskLast7.panic}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                          <p className="text-xs uppercase text-slate-500">Detecções</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{claimedRiskLast7.detection}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                          <p className="text-xs uppercase text-slate-500">Críticos</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{claimedRiskLast7.highCritical}</p>
                        </div>
                      </div>
                      {claimedRiskTransparency && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {claimedRiskTransparency}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de Pacientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {patients.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pacientes Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {filteredPatients.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {searchTerm ? 'Resultados' : 'Visualizando'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum paciente vinculado'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchTerm 
                    ? 'Tente buscar com outros termos' 
                    : 'Use um código de acompanhamento para adicionar pacientes'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/pro/claim">
                    <Button>
                      Adicionar Primeiro Paciente
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/pro/patients/${patient.patientId}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="pt-6">
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                          {patient.profile?.fullName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                            {patient.profile?.fullName || 'Sem nome'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {patient.profile?.email || 'Sem e-mail cadastrado'}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  patient.activity?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {patient.activity?.isOnline
                                ? 'Online agora'
                                : `Visto ${formatRelativeTime(patient.activity?.lastSeenAt)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          patient.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                        <div>
                          <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-600 dark:text-slate-400">Vínculo</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-500">
                            {formatDateTime(patient.createdAt)}
                          </p>
                        </div>
                        <div>
                          <Activity className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-600 dark:text-slate-400">Últ. atividade</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-500">
                            {formatRelativeTime(patient.activity?.lastSeenAt)}
                          </p>
                        </div>
                      </div>

                      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                        Último login confirmado: {formatRelativeTime(patient.activity?.lastSignInAt)}
                      </p>

                      {/* Action Button */}
                      <Button variant="outline" className="w-full" size="sm">
                        Ver relatórios
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
