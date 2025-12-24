"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle, BarChart3, Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RiskSeriesItem {
  date: string
  panicCount: number
  detectionCount: number
  highCriticalCount: number
}

interface RiskSummaryResponse {
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
    series: RiskSeriesItem[]
    transparency: string
  }
  error?: string
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Sem atividade registrada</CardTitle>
        <CardDescription>
          O paciente ainda não acionou botões de crise nem houve detecções automáticas no período selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>Acompanhe periodicamente e incentive o uso do botão de apoio em momentos difíceis.</p>
      </CardContent>
    </Card>
  )
}

function MetricCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={cn('transition-all', highlight && 'border-destructive/50 bg-destructive/5')}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function formatDateLabel(date: string) {
  const dt = new Date(`${date}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(dt)
}

function SeriesTable({ series }: { series: RiskSeriesItem[] }) {
  if (!series.length) {
    return <EmptyState />
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="grid grid-cols-4 gap-2 border-b px-4 py-2 text-xs uppercase text-muted-foreground">
        <span>Dia</span>
        <span>Crisis</span>
        <span>Detecções</span>
        <span>Alto/Crit.</span>
      </div>
      <div className="divide-y">
        {series.map((item) => (
          <div key={item.date} className="grid grid-cols-4 gap-2 px-4 py-2 text-sm">
            <span>{formatDateLabel(item.date)}</span>
            <span>{item.panicCount}</span>
            <span>{item.detectionCount}</span>
            <span>{item.highCriticalCount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PatientRiskPage() {
  const params = useParams()
  const patientId = params?.patientId as string | undefined
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RiskSummaryResponse['data'] | null>(null)

  useEffect(() => {
    if (!patientId) {
      return
    }

    let isMounted = true

    async function fetchSummary() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/pro/patients/${patientId}/risk-summary?days=30`, {
          cache: 'no-store',
        })
        const payload: RiskSummaryResponse = await response.json()
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || 'Falha ao carregar métricas de risco.')
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
  }, [patientId])

  const hasData = Boolean(data && data.series.length)

  const last7Risk = useMemo(() => {
    if (!data) return null
    const { panic, detection, highCritical } = data.aggregates.last7Days
    return panic + detection + highCritical
  }, [data])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumo de risco</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento seguro sem expor mensagens ou conteúdos sensíveis do paciente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/pro/patients/${patientId ?? ''}`}>Voltar para paciente</Link>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center rounded-lg border bg-card py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando métricas de risco…
        </div>
      )}

      {error && !loading && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader className="flex flex-row items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle>Não foi possível carregar os dados</CardTitle>
              <CardDescription>{error}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {!loading && !error && data && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Crises registradas" value={data.totals.panic} highlight={data.totals.panic > 0} />
            <MetricCard label="Detecções automáticas" value={data.totals.detection} highlight={data.totals.detection > 0} />
            <MetricCard label="Eventos alto/crítico" value={data.totals.highCritical} highlight={data.totals.highCritical > 0} />
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Últimos 7 dias</CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertTriangle className={cn('h-5 w-5', last7Risk ? 'text-destructive' : 'text-muted-foreground')} />
                  {last7Risk ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" /> Série diária (últimos {data.aggregates.windowDays} dias)
              </CardTitle>
              <CardDescription>
                Contagem agregada por dia. Os dados não incluem mensagens, transcrições ou conteúdo textual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeriesTable series={data.series} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidade e transparência</CardTitle>
              <CardDescription>{data.transparency}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Apenas somatórios e tendências ficam disponíveis. O conteúdo das interações permanece exclusivo do paciente.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
