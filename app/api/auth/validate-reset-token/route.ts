import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

const ValidateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ValidateTokenSchema.parse(body)

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: validatedData.token,
        resetTokenExpiry: {
          gt: new Date()
        },
        deletedAt: null
      }
    })

    if (!user) {
      logger.warn({ token: validatedData.token }, 'Invalid or expired reset token')
      return NextResponse.json({
        valid: false,
        error: 'Token inválido ou expirado'
      })
    }

    logger.info({ userId: user.id }, 'Valid reset token verified')
    return NextResponse.json({
      valid: true
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: 'Token inválido' },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Failed to validate reset token')
    return NextResponse.json(
      { valid: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}