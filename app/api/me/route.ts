import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/src/server/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    return NextResponse.json({
      ok: true,
      data: { user }
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Failed to get user profile' },
      { status: 500 }
    )
  }
}