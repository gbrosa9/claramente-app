import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuthClient } from '@/lib/supabase/auth'

const RequestOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  type: z.enum(['signup', 'magiclink', 'recovery']).default('signup'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Request OTP API called ===')
    
    const body = await request.json()
    const validatedData = RequestOTPSchema.parse(body)
    
    console.log('Requesting OTP for:', validatedData.email, 'type:', validatedData.type)
    
    const supabase = createAuthClient()

    let response

    if (validatedData.type === 'magiclink') {
      // Send magic link for passwordless login
      response = await supabase.auth.signInWithOtp({
        email: validatedData.email,
        options: {
          emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`
        }
      })
    } else {
      // Send OTP for signup/recovery
      response = await supabase.auth.signInWithOtp({
        email: validatedData.email,
        options: {
          emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`
        }
      })
    }

    if (response.error) {
      console.error('OTP request error:', response.error)
      
      if (response.error.message.includes('rate limit')) {
        return NextResponse.json(
          { ok: false, error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { ok: false, error: 'Erro ao enviar código: ' + response.error.message },
        { status: 400 }
      )
    }

    console.log('OTP sent successfully to:', validatedData.email)

    return NextResponse.json({
      ok: true,
      message: 'Código enviado! Verifique seu email.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    console.error('OTP request failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}