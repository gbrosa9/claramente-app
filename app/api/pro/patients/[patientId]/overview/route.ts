import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import { createAdminClient } from '@/lib/supabase/auth'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, context: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await context.params

    if (!patientId) {
      return NextResponse.json({ ok: false, error: 'Paciente não informado.' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente para liberar o acompanhamento profissional.')
      return NextResponse.json(
        { ok: false, error: 'Configuração ausente no servidor. Contate o suporte.' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const sessionUser = session.user as Record<string, any>
    const professionalId = String(sessionUser.id)
    let resolvedRole = String(sessionUser.role ?? sessionUser.user_metadata?.role ?? '').toLowerCase()

    const adminClient = createAdminClient()

    if (!resolvedRole) {
      const { data: professionalProfile, error: professionalProfileError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', professionalId)
        .maybeSingle()

      if (professionalProfileError && professionalProfileError.code !== 'PGRST116') {
        console.warn('Erro ao buscar perfil profissional:', professionalProfileError)
      }

      resolvedRole = String(professionalProfile?.role ?? '').toLowerCase()
    }

    if (resolvedRole !== 'professional') {
      const defaultName =
        sessionUser.name ??
        sessionUser.full_name ??
        sessionUser.user_metadata?.name ??
        sessionUser.user_metadata?.full_name ??
        sessionUser.email?.split('@')[0] ??
        'Profissional'

      const { error: upsertProfessionalError } = await adminClient
        .from('profiles')
        .upsert(
          {
            id: professionalId,
            full_name: defaultName,
            email: sessionUser.email ?? null,
            role: 'professional',
          },
          { onConflict: 'id' }
        )
        .select('role')
        .single()

      if (upsertProfessionalError) {
        console.error('Erro ao garantir role profissional:', upsertProfessionalError)
      } else {
        resolvedRole = 'professional'
      }
    }

    if (resolvedRole !== 'professional') {
      return NextResponse.json({ ok: false, error: 'Apenas profissionais podem acessar essas informações.' }, { status: 403 })
    }

    const { data: link } = await adminClient
      .from('patient_professionals')
      .select('id')
      .eq('patient_id', patientId)
      .eq('professional_id', professionalId)
      .eq('status', 'active')
      .maybeSingle()

    if (!link) {
      return NextResponse.json({ ok: false, error: 'Nenhum vínculo ativo com este paciente.' }, { status: 403 })
    }

    const { data: patientProfile, error: patientProfileError } = await adminClient
      .from('profiles')
      .select('id, full_name, email, created_at, updated_at, last_seen_at')
      .eq('id', patientId)
      .maybeSingle()

    if (patientProfileError) {
      console.error('Erro ao carregar perfil do paciente:', patientProfileError)
      return NextResponse.json({ ok: false, error: 'Erro ao carregar dados do paciente.' }, { status: 500 })
    }

    if (!patientProfile) {
      return NextResponse.json({ ok: false, error: 'Paciente não encontrado.' }, { status: 404 })
    }

    let lastSignInAt: string | null = null
    try {
      const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(patientId)
      if (!authUserError) {
        lastSignInAt = authUser?.user?.last_sign_in_at ?? null
      } else {
        console.warn('Erro ao buscar dados de autenticação do paciente:', authUserError)
      }
    } catch (error) {
      console.warn('Falha ao consultar autenticação do paciente:', error)
    }

    const lastSeenAt = patientProfile.last_seen_at ?? null
    const isOnline = lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() <= 5 * 60 * 1000 : false

    return NextResponse.json({
      ok: true,
      patient: {
        id: patientProfile.id,
        full_name: patientProfile.full_name,
        email: patientProfile.email,
        created_at: patientProfile.created_at,
        updated_at: patientProfile.updated_at,
      },
      patientActivity: {
        lastSeenAt,
        lastSignInAt,
        isOnline,
      },
    })
  } catch (error) {
    console.error('Erro ao carregar overview do paciente:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
