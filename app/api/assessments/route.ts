import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        publishedAt: { not: null }
      },
      select: {
        id: true,
        type: true,
        name: true,
        version: true,
        description: true,
        items: true,
        scoring: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      data: { assessments }
    })
  } catch (error) {
    logger.error({ error }, 'Failed to get assessments')
    return NextResponse.json(
      { ok: false, error: 'Failed to get assessments' },
      { status: 500 }
    )
  }
}