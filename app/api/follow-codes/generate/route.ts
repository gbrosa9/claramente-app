import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/server/auth/config"
import { createAdminClient } from "@/lib/supabase/auth"

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

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente para liberar geração de código.')
      return NextResponse.json(
        { error: "Configuração ausente no servidor" },
        { status: 500 }
      )
    }

    const sessionUser = session.user as Record<string, any>
    const userId = sessionUser.id as string
    const normalizedRole = String(sessionUser.role || sessionUser.user_metadata?.role || '').toLowerCase()
    const adminClient = createAdminClient()

    // Verificar se é paciente (role = 'user')
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: "Erro ao buscar perfil do usuário" },
        { status: 500 }
      )
    }

    let resolvedRole = profile?.role

    if (!resolvedRole) {
      const defaultName =
        sessionUser.name ||
        sessionUser.full_name ||
        sessionUser.user_metadata?.name ||
        sessionUser.user_metadata?.full_name ||
        sessionUser.email?.split('@')[0] ||
        'Paciente'

      const { data: insertedProfile, error: insertProfileError } = await adminClient
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: defaultName,
            email: sessionUser.email ?? null,
            role: normalizedRole === 'user' ? 'user' : 'user',
          },
          { onConflict: 'id' }
        )
        .select('role')
        .single()

      if (insertProfileError) {
        return NextResponse.json(
          { error: "Erro ao criar perfil do usuário" },
          { status: 500 }
        )
      }

      resolvedRole = insertedProfile?.role ?? 'user'
    }

    if (normalizedRole !== 'user' && resolvedRole !== 'user') {
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
      const { data, error } = await adminClient
        .from('follow_codes')
        .select('code')
        .eq('code', code)
        .single()
      
      if (error?.code === 'PGRST116' || !data) {
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
    const { data: followCode, error: insertError } = await adminClient
      .from('follow_codes')
      .insert({
        code,
        patient_id: userId,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: "Erro ao gerar código de acompanhamento" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      code,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
