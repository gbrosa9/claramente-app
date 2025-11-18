import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime = 'nodejs'

// Gera código alfanumérico de 8 caracteres (sem ambiguidades)
function generateCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Remove 0,O,1,I
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[Follow Code] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionError: sessionError?.message
    })

    if (sessionError || !session?.user) {
      console.error('[Follow Code] Auth error:', sessionError)
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Verificar se é paciente (role = 'user')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    console.log('[Follow Code] Profile check:', {
      userId,
      profile,
      profileError: profileError?.message
    })

    if (profileError) {
      console.error('[Follow Code] Profile fetch error:', profileError)
      return NextResponse.json(
        { error: "Erro ao buscar perfil do usuário" },
        { status: 500 }
      )
    }

    if (profile?.role !== 'user') {
      console.log('[Follow Code] Invalid role:', profile?.role)
      return NextResponse.json(
        { error: "Apenas pacientes podem gerar códigos de acompanhamento" },
        { status: 403 }
      )
    }

    // Gerar código único
    let code = generateCode()
    let attempts = 0
    let codeExists = true

    while (codeExists && attempts < 10) {
      const { data } = await supabase
        .from('follow_codes')
        .select('code')
        .eq('code', code)
        .single()
      
      if (!data) {
        codeExists = false
      } else {
        code = generateCode()
        attempts++
      }
    }

    if (codeExists) {
      return NextResponse.json(
        { error: "Erro ao gerar código único. Tente novamente." },
        { status: 500 }
      )
    }

    // Calcular expiração (48 horas)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    // Inserir código
    const { data: followCode, error: insertError } = await supabase
      .from('follow_codes')
      .insert({
        code,
        patient_id: userId,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Follow Code] Insert error:', insertError)
      return NextResponse.json(
        { error: "Erro ao gerar código de acompanhamento" },
        { status: 500 }
      )
    }

    console.log('[Follow Code] Code generated successfully:', {
      code,
      userId,
      expiresAt: expiresAt.toISOString()
    })

    return NextResponse.json({
      success: true,
      code,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Erro na API de geração de código:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
