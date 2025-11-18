import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuthClient } from '@/lib/supabase/auth'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Forgot Password API called ===')
    
    const body = await request.json()
    console.log('Request body:', { email: body.email })
    
    const validatedData = ForgotPasswordSchema.parse(body)
    console.log('Data validated successfully')

    // Create Supabase client
    const supabase = createAuthClient()

    // Send password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password`
    })

    if (error) {
      console.error('Supabase password reset error:', error)
      
      // Don't expose specific errors to prevent email enumeration
      return NextResponse.json({
        ok: true,
        message: 'Se uma conta com esse email existe, um link de recuperação foi enviado.'
      })
    }

    console.log('Password reset email requested successfully')

    return NextResponse.json({
      ok: true,
      message: 'Se uma conta com esse email existe, um link de recuperação foi enviado.',
      data: {
        emailSent: true
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    console.error('Forgot password failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}