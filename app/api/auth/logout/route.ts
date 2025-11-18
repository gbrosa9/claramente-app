import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // In a JWT strategy, we don't need to do anything server-side for logout
    // The client will handle token removal
    
    return NextResponse.json({
      ok: true,
      data: { message: 'Logged out successfully' }
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}