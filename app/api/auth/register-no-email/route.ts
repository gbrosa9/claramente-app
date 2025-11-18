import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/auth'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  locale: z.string().default('pt-BR'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Register API (No Email) called ===')
    
    const body = await request.json()
    console.log('Request body:', { 
      name: body.name, 
      email: body.email, 
      locale: body.locale 
    })
    
    const validatedData = RegisterSchema.parse(body)
    console.log('Data validated successfully')
    
    // Use admin client to create user without email verification
    const supabaseAdmin = createAdminClient()

    // Create user with admin client and skip email confirmation for development
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      user_metadata: {
        name: validatedData.name,
        locale: validatedData.locale,
      },
      email_confirm: true // Auto-confirm for development
    })

    if (error) {
      console.error('Supabase registration error details:', {
        message: error.message,
        status: error.status,
        details: error
      })
      
      // Handle specific error cases
      if (error.message.includes('already been registered') || error.code === 'email_exists') {
        return NextResponse.json(
          { ok: false, error: 'Este email já está cadastrado. Tente fazer login ou use outro email.' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('weak password')) {
        return NextResponse.json(
          { ok: false, error: 'Senha muito fraca. Use pelo menos 8 caracteres.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { ok: false, error: `Erro no registro: ${error.message}` },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { ok: false, error: 'Falha ao criar usuário' },
        { status: 500 }
      )
    }

    // Log successful registration
    console.log('User registered successfully:', {
      userId: data.user.id,
      email: data.user.email,
      confirmed: data.user.email_confirmed_at ? true : false
    })

    // Return success response
    return NextResponse.json({
      ok: true,
      data: { 
        user: data.user,
        needsConfirmation: false, // Auto-confirmed for development
        message: 'Conta criada com sucesso! Você já pode fazer login.'
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

    console.error('Registration failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}