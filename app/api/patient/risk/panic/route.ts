import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/src/server/auth/middleware'
import { RiskEventSource, RiskSeverity } from '@prisma/client'
import { recordRiskEvent } from '@/src/server/services/risk-events'
import { recordUserActivityEvent } from '@/src/server/services/user-activity'

const PanicBodySchema = z.object({
  severity: z.nativeEnum(RiskSeverity).optional(),
  visibleForProfessional: z.boolean().optional(),
})

function ensurePatientRole(role: string) {
  return role === 'USER' || role === 'PATIENT'
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    if (!ensurePatientRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Apenas pacientes podem registrar crises.' }, { status: 403 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const body = PanicBodySchema.parse(rawBody)

    const severity = body.severity ?? RiskSeverity.HIGH

    await recordRiskEvent({
      patientId: user.id,
      source: RiskEventSource.PANIC_BUTTON,
      severity,
      signal: 'panic_manual',
      meta: {
        trigger: 'patient_manual',
        severity,
      },
      visibleForProfessional: body.visibleForProfessional ?? true,
    })

    await recordUserActivityEvent({
      userId: user.id,
      eventType: 'panic_pressed',
      meta: {
        severity,
      },
    })

    return NextResponse.json({ ok: true, data: { registered: true } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao registrar evento de pânico:', error)
    return NextResponse.json({ ok: false, error: 'Erro ao registrar crise.' }, { status: 500 })
  }
}
