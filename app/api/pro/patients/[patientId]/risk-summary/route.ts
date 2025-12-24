import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/src/server/auth/middleware'
import { createAdminClient } from '@/lib/supabase/auth'

const TRANSPARENCY_MESSAGE = 'Eventos de crise e detecções automáticas geram métricas para acompanhamento profissional, sem compartilhar o conteúdo das mensagens.'

function sumSeries(series: Array<{ date: string; panicCount: number; detectionCount: number; highCriticalCount: number }>, days: number) {
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))

  return series.reduce(
    (acc, item) => {
      const itemDate = new Date(`${item.date}T00:00:00Z`)
      if (itemDate < cutoff) {
        return acc
      }
      return {
        panic: acc.panic + item.panicCount,
        detection: acc.detection + item.detectionCount,
        highCritical: acc.highCritical + item.highCriticalCount,
      }
    },
    { panic: 0, detection: 0, highCritical: 0 }
  )
}

export async function GET(request: NextRequest, context: { params: Promise<{ patientId: string }> }) {
  try {
    const params = await context.params
    const patientId = params.patientId

    if (!patientId) {
      return NextResponse.json({ ok: false, error: 'Paciente não informado.' }, { status: 400 })
    }

    const url = new URL(request.url)
    const requestedDays = url.searchParams.get('days')
    const windowDays = Math.min(Math.max(Number(requestedDays) || 30, 1), 90)

    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    if (user.role !== 'PROFESSIONAL') {
      return NextResponse.json({ ok: false, error: 'Apenas profissionais podem acessar o resumo de risco.' }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente para liberar o acompanhamento profissional.')
      return NextResponse.json({ ok: false, error: 'Configuração ausente no servidor.' }, { status: 500 })
    }

    const adminClient = createAdminClient()

    const { data: link } = await adminClient
      .from('patient_professionals')
      .select('id, status')
      .eq('patient_id', patientId)
      .eq('professional_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!link) {
      return NextResponse.json({ ok: false, error: 'Nenhum vínculo ativo com este paciente.' }, { status: 403 })
    }

    const { data: rpcData, error: rpcError } = await adminClient.rpc('get_risk_summary', {
      pid: patientId,
      days: windowDays,
    })

    if (rpcError) {
      console.error('Erro ao executar get_risk_summary:', rpcError)
      return NextResponse.json({ ok: false, error: 'Erro ao carregar métricas.' }, { status: 500 })
    }

    const series = (rpcData ?? []).map((row) => {
      const dayValue = row.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row.day)
      return {
        date: dayValue,
        panicCount: row.panic_count,
        detectionCount: row.detection_count,
        highCriticalCount: row.high_critical_count,
      }
    })

    const totals = series.reduce(
      (acc, item) => ({
        panic: acc.panic + item.panicCount,
        detection: acc.detection + item.detectionCount,
        highCritical: acc.highCritical + item.highCriticalCount,
      }),
      { panic: 0, detection: 0, highCritical: 0 }
    )

    const summary7 = sumSeries(series, Math.min(7, windowDays))

    return NextResponse.json({
      ok: true,
      data: {
        totals,
        aggregates: {
          last7Days: summary7,
          windowDays,
        },
        series,
        transparency: TRANSPARENCY_MESSAGE,
      },
    })
  } catch (error) {
    console.error('Erro ao carregar resumo de risco:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
