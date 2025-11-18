import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuthClient } from '@/lib/supabase/auth'

const VerifyOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  token: z.string().min(6, 'Código deve ter 6 dígitos').max(6, 'Código deve ter 6 dígitos'),
  type: z.enum(['signup', 'recovery', 'email_change']).default('signup'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Verify OTP API called ===')
    
    const body = await request.json()
    const validatedData = VerifyOTPSchema.parse(body)
    
    console.log('Verifying OTP for:', validatedData.email)
    
    const supabase = createAuthClient()

    // Verify OTP token
    const { data, error } = await supabase.auth.verifyOtp({
      email: validatedData.email,
      token: validatedData.token,
      type: validatedData.type
    })

    if (error) {
      console.error('OTP verification error:', error)
      
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        return NextResponse.json(
          { ok: false, error: 'Código inválido ou expirado. Solicite um novo código.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { ok: false, error: 'Erro na verificação: ' + error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { ok: false, error: 'Falha na verificação do código' },
        { status: 400 }
      )
    }

    console.log('OTP verified successfully for user:', data.user.id)

    return NextResponse.json({
      ok: true,
      data: {
        user: data.user,
        session: data.session
      },
      message: 'Código verificado com sucesso! Sua conta foi confirmada.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    console.error('OTP verification failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}