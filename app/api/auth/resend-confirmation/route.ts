import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuthClient } from '@/lib/supabase/auth'

const ResendSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Resend Confirmation API called ===')
    
    const body = await request.json()
    const validatedData = ResendSchema.parse(body)
    
    const supabase = createAuthClient()

    // Resend confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: validatedData.email,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Resend confirmation error:', error)
      return NextResponse.json(
        { ok: false, error: 'Erro ao reenviar email: ' + error.message },
        { status: 400 }
      )
    }

    console.log('Confirmation email resent to:', validatedData.email)

    return NextResponse.json({
      ok: true,
      message: 'Email de confirmação reenviado! Verifique sua caixa de entrada.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    console.error('Resend failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}