import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/server/auth/config"
import { createAdminClient } from "@/lib/supabase/auth"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Código é obrigatório" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente para liberar resgate de códigos.')
      return NextResponse.json(
        { error: "Configuração ausente no servidor" },
        { status: 500 }
      )
    }

    const sessionUser = session.user as Record<string, any>
    const userId = String(sessionUser.id)
    const normalizedRole = String(sessionUser.role ?? sessionUser.user_metadata?.role ?? '').toLowerCase()

    const adminClient = createAdminClient()

    // Verificar se é profissional
    let resolvedRole = normalizedRole

    if (!resolvedRole) {
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil do profissional:', profileError)
      }

      resolvedRole = String(profileData?.role ?? '').toLowerCase()
    }

    if (resolvedRole !== 'professional') {
      if (normalizedRole === 'professional' || !resolvedRole) {
        const { error: ensureRoleError } = await adminClient
          .from('profiles')
          .upsert({
            id: userId,
            full_name:
              sessionUser.name ??
              sessionUser.full_name ??
              sessionUser.user_metadata?.name ??
              sessionUser.user_metadata?.full_name ??
              sessionUser.email?.split('@')[0] ??
              'Profissional',
            email: sessionUser.email ?? null,
            role: 'professional',
          }, { onConflict: 'id' })
          .select('role')
          .single()

        if (ensureRoleError) {
          console.error('Erro ao garantir role profissional:', ensureRoleError)
        } else {
          resolvedRole = 'professional'
        }
      }
    }

    if (resolvedRole !== 'professional') {
      return NextResponse.json(
        { error: "Apenas profissionais podem resgatar códigos" },
        { status: 403 }
      )
    }

    // Buscar código
    const { data: followCode, error: codeError } = await adminClient
      .from('follow_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (codeError || !followCode) {
      return NextResponse.json(
        { error: "Código inválido ou não encontrado" },
        { status: 404 }
      )
    }

    // Verificar expiração
    const now = new Date()
    const expiresAt = new Date(followCode.expires_at)
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "Código expirado" },
        { status: 400 }
      )
    }

    // Verificar se já foi usado
    if (followCode.used_by) {
      return NextResponse.json(
        { error: "Código já foi utilizado" },
        { status: 400 }
      )
    }

    // Não permitir que paciente resgate seu próprio código
    if (followCode.patient_id === userId) {
      return NextResponse.json(
        { error: "Você não pode resgatar seu próprio código" },
        { status: 400 }
      )
    }

    // Criar/atualizar vínculo
    const { data: existingLink } = await adminClient
      .from('patient_professionals')
      .select('*')
      .eq('patient_id', followCode.patient_id)
      .eq('professional_id', userId)
      .single()

    if (existingLink) {
      // Reativar vínculo se existir
      const { error: updateError } = await adminClient
        .from('patient_professionals')
        .update({ status: 'active' })
        .eq('id', existingLink.id)

      if (updateError) {
        console.error('Erro ao atualizar vínculo:', updateError)
        return NextResponse.json(
          { error: "Erro ao vincular paciente" },
          { status: 500 }
        )
      }
    } else {
      // Criar novo vínculo
      const { error: insertError } = await adminClient
        .from('patient_professionals')
        .insert({
          patient_id: followCode.patient_id,
          professional_id: userId,
          status: 'active'
        })

      if (insertError) {
        console.error('Erro ao criar vínculo:', insertError)
        return NextResponse.json(
          { error: "Erro ao vincular paciente" },
          { status: 500 }
        )
      }
    }

    // Marcar código como usado
    const { error: updateCodeError } = await adminClient
      .from('follow_codes')
      .update({
        used_by: userId,
        used_at: new Date().toISOString()
      })
      .eq('code', code.toUpperCase())

    if (updateCodeError) {
      console.error('Erro ao atualizar código:', updateCodeError)
    }

    return NextResponse.json({
      success: true,
      patientId: followCode.patient_id
    })

  } catch (error) {
    console.error('Erro na API de resgate de código:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
