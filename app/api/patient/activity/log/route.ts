import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/src/server/auth/middleware'
import { recordUserActivityEvent } from '@/src/server/services/user-activity'

const ALLOWED_EVENTS = new Set([
  'voice_call_started',
  'voice_call_ended',
  'exercise_completed',
])

function isPatientRole(role: string) {
  const normalized = role.toUpperCase()
  return normalized === 'USER' || normalized === 'PATIENT'
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    if (!isPatientRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Apenas pacientes podem registrar eventos.' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)

    if (!body || typeof body.eventType !== 'string') {
      return NextResponse.json({ ok: false, error: 'Evento inválido.' }, { status: 400 })
    }

    if (!ALLOWED_EVENTS.has(body.eventType)) {
      return NextResponse.json({ ok: false, error: 'Evento não permitido.' }, { status: 400 })
    }

    await recordUserActivityEvent({
      userId: user.id,
      eventType: body.eventType,
      meta: typeof body.meta === 'object' ? body.meta : undefined,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro ao registrar evento de atividade do paciente:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno ao registrar evento.' }, { status: 500 })
  }
}
