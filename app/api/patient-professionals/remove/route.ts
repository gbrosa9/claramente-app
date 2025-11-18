import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest) {
  try {
    const { professionalId } = await request.json()

    if (!professionalId) {
      return NextResponse.json(
        { error: "ID do profissional é obrigatório" },
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

    // Buscar vínculo
    const { data: link, error: linkError } = await supabase
      .from('patient_professionals')
      .select('*')
      .eq('patient_id', userId)
      .eq('professional_id', professionalId)
      .eq('status', 'active')
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: "Vínculo não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar status do vínculo
    const { error: updateError } = await supabase
      .from('patient_professionals')
      .update({ status: 'removed_by_patient' })
      .eq('id', link.id)

    if (updateError) {
      console.error('Erro ao remover vínculo:', updateError)
      return NextResponse.json(
        { error: "Erro ao remover profissional" },
        { status: 500 }
      )
    }

    // Buscar nome do paciente para a notificação
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    // Criar notificação para o profissional
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: professionalId,
        type: 'patient_unlinked',
        payload: {
          patient_id: userId,
          patient_name: patientProfile?.full_name || 'Paciente'
        }
      })

    if (notificationError) {
      console.error('Erro ao criar notificação:', notificationError)
      // Não retornar erro, a remoção foi bem-sucedida
    }

    return NextResponse.json({
      success: true,
      message: "Profissional removido e notificado com sucesso"
    })

  } catch (error) {
    console.error('Erro na API de remoção de profissional:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
