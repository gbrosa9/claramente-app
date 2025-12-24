import { NextRequest, NextResponse } from 'next/server'
import { addDays, startOfDay } from 'date-fns'
import { requireAuth } from '@/src/server/auth/middleware'
import { MessageSender, RiskEventSource } from '@prisma/client'
import { prisma } from '@/src/server/db'
import { getPatientDashboardData } from '@/src/server/services/gamification'

function isPatientRole(role: string) {
  const normalized = role.toUpperCase()
  return normalized === 'USER' || normalized === 'PATIENT'
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    if (!isPatientRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Apenas pacientes podem acessar este resumo.' }, { status: 403 })
    }

    const url = new URL(request.url)
    const requestedDays = url.searchParams.get('days')
    const windowDays = Math.min(Math.max(Number(requestedDays) || 30, 1), 90)

    const today = startOfDay(new Date())
    const fromDate = addDays(today, -(windowDays - 1))

    const prismaAny = prisma as typeof prisma & {
      exerciseSession?: typeof prisma.exerciseSession
      message?: typeof prisma.message
      voiceSession?: typeof prisma.voiceSession
      riskEvent?: typeof prisma.riskEvent
    }

    const isPrismaConnectionIssue = (error: unknown) => {
      if (!error || typeof error !== 'object') {
        return false
      }

      const candidate = error as { code?: string; message?: string; name?: string }

      if (candidate.code === 'P1001' || candidate.code === 'P1008') {
        return true
      }

      if (candidate.name === 'PrismaClientInitializationError') {
        return true
      }

      if (typeof candidate.message === 'string') {
        const message = candidate.message.toLowerCase()
        return message.includes("can't reach database server") || message.includes('the database server was reached but')
      }

      return false
    }

    const safeCount = async <TArgs,>(
      delegate: { count: (args: TArgs) => Promise<number> } | undefined,
      args: TArgs
    ): Promise<number> => {
      if (!delegate?.count) {
        return 0
      }

      try {
        return await delegate.count(args)
      } catch (error) {
        if (isPrismaConnectionIssue(error)) {
          console.warn('Falling back to zero count because the database is unreachable.')
          return 0
        }

        throw error
      }
    }

    const exerciseCountPromise = safeCount(prismaAny.exerciseSession, {
      where: {
        userId: user.id,
        status: 'completed',
        completedAt: { gte: fromDate },
      },
    })

    const chatMessageCountPromise = safeCount(prismaAny.message, {
      where: {
        sender: MessageSender.USER,
        createdAt: { gte: fromDate },
        conversation: {
          userId: user.id,
        },
      },
    })

    const voiceCallCountPromise = safeCount(prismaAny.voiceSession, {
      where: {
        startedAt: { gte: fromDate },
        conversation: {
          userId: user.id,
        },
      },
    })

    const panicEventCountPromise = safeCount(prismaAny.riskEvent, {
      where: {
        patientId: user.id,
        source: RiskEventSource.PANIC_BUTTON,
        createdAt: { gte: fromDate },
      },
    })

    const [dashboard, chatMessages, voiceCalls, exercises, panicEvents] = await Promise.all([
      getPatientDashboardData(user.id),
      chatMessageCountPromise,
      voiceCallCountPromise,
      exerciseCountPromise,
      panicEventCountPromise,
    ])

    return NextResponse.json({
      ok: true,
      data: {
        periodDays: windowDays,
        activity: {
          chatMessages,
          voiceCalls,
          exercises,
          panic: panicEvents,
        },
        ...dashboard,
      },
    })
  } catch (error) {
    console.error('Erro ao carregar resumo do dashboard do paciente:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno ao carregar o dashboard.' }, { status: 500 })
  }
}
