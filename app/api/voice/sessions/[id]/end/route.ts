import { NextRequest, NextResponse } from 'next/server'
import { requireOwnershipOrRole, getConversationUserId } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        id: params.id,
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