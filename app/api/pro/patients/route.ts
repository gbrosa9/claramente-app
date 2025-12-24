import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/src/server/auth/middleware'
import { createAdminClient } from '@/lib/supabase/auth'

function normalizeStatus(value: string | null) {
  if (!value) {
    return 'active'
  }

  const normalized = value.toLowerCase()
  if (normalized === 'all') {
    return 'all'
  }

  if (normalized === 'inactive') {
    return 'inactive'
  }

  return 'active'
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    if (user.role !== 'PROFESSIONAL') {
      return NextResponse.json({ ok: false, error: 'Apenas profissionais podem acessar a lista de pacientes.' }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente para liberar o acompanhamento profissional.')
      return NextResponse.json({ ok: false, error: 'Configuração ausente no servidor.' }, { status: 500 })
    }

    const url = new URL(request.url)
    const statusFilter = normalizeStatus(url.searchParams.get('status'))

    const adminClient = createAdminClient()

    let query = adminClient
      .from('patient_professionals')
      .select(`
        id,
        patient_id,
        status,
        created_at,
        updated_at,
        patient_profile:profiles!patient_professionals_patient_id_fkey(
          full_name,
          email,
          avatar_url,
          last_seen_at
        )
      `)
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao carregar pacientes do profissional:', error)
      return NextResponse.json({ ok: false, error: 'Não foi possível carregar a lista de pacientes.' }, { status: 500 })
    }

    const rows = Array.isArray(data) ? data : []

    const enriched = await Promise.all(
      rows.map(async (row: any) => {
        const patientId = String(row.patient_id)
        const profile = row.patient_profile ?? null
        const lastSeenAt = profile?.last_seen_at ?? null
        let lastSignInAt: string | null = null

        try {
          const { data: authData, error: authError } = await adminClient.auth.admin.getUserById(patientId)

          if (!authError) {
            lastSignInAt = authData?.user?.last_sign_in_at ?? null
          } else {
            console.warn('Falha ao obter last_sign_in_at do paciente:', authError)
          }
        } catch (authLookupError) {
          console.warn('Erro ao consultar autenticação do paciente:', authLookupError)
        }

        const isOnline = lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() <= 5 * 60 * 1000 : false

        return {
          id: String(row.id),
          patientId,
          status: String(row.status),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          profile: {
            fullName: profile?.full_name ?? null,
            email: profile?.email ?? null,
            avatarUrl: profile?.avatar_url ?? null,
          },
          activity: {
            lastSeenAt,
            lastSignInAt,
            isOnline,
          },
        }
      })
    )

    return NextResponse.json({ ok: true, patients: enriched })
  } catch (error) {
    console.error('Erro ao listar pacientes do profissional:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
