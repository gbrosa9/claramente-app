import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Verificar se é profissional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { error: "Apenas profissionais podem resgatar códigos" },
        { status: 403 }
      )
    }

    // Buscar código
    const { data: followCode, error: codeError } = await supabase
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
    const { data: existingLink } = await supabase
      .from('patient_professionals')
      .select('*')
      .eq('patient_id', followCode.patient_id)
      .eq('professional_id', userId)
      .single()

    if (existingLink) {
      // Reativar vínculo se existir
      const { error: updateError } = await supabase
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
      const { error: insertError } = await supabase
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
    const { error: updateCodeError } = await supabase
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
