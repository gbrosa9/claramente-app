import { NextRequest, NextResponse } from 'next/server'
import { requireOwnershipOrRole, getConversationUserId } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const routeParams = await context.params;
  try {
    const authResult = await requireOwnershipOrRole(
      getConversationUserId,
      'PROFESSIONAL',
      'ADMIN'
    )(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // End voice session
    await prisma.voiceSession.updateMany({
      where: {
        id: routeParams.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      }
    })

    return NextResponse.json({
      ok: true,
      data: { message: 'Voice session ended' }
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Failed to end voice session' },
      { status: 500 }
    )
  }
}