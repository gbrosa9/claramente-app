import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const ResetPasswordSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().min(1, 'Refresh token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Reset password request received:', { 
      hasAccessToken: !!body.access_token, 
      hasRefreshToken: !!body.refresh_token 
    })
    
    const validatedData = ResetPasswordSchema.parse(body)

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Set the session with the tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: validatedData.access_token,
      refresh_token: validatedData.refresh_token
    })

    if (sessionError || !sessionData.user) {
      console.error('Session validation error:', sessionError)
      return NextResponse.json(
        { ok: false, error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.password
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { ok: false, error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    console.log('Password updated successfully for user:', sessionData.user.id)

    return NextResponse.json({
      ok: true,
      message: 'Senha redefinida com sucesso'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}