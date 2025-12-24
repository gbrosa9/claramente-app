import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import { createAdminClient } from '@/lib/supabase/auth'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const sessionUser = session.user as Record<string, any>
    const professionalId = String(sessionUser.id)
    const metadataRole = String(sessionUser.role ?? sessionUser.user_metadata?.role ?? '').toLowerCase()

    if (metadataRole !== 'professional') {
      return NextResponse.json(
        { ok: false, error: 'Apenas profissionais podem acessar essas informações.' },
        { status: 403 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente para liberar o painel profissional.')
      return NextResponse.json(
        { ok: false, error: 'Configuração ausente no servidor. Contate o suporte.' },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient()

    const {
      data: profileData,
      error: profileError,
    } = await adminClient
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, created_at, updated_at, last_seen_at')
      .eq('id', professionalId)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Erro ao carregar perfil profissional:', profileError)
    }

    const defaultName =
      sessionUser.name ||
      sessionUser.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.email?.split('@')[0] ||
      'Profissional'

    let resolvedProfile = profileData

    if (!resolvedProfile) {
      const { data: insertedProfile, error: insertProfileError } = await adminClient
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
        .select('id, full_name, email, avatar_url, role, created_at, updated_at, last_seen_at')
        .single()

      if (insertProfileError) {
        console.error('Não foi possível criar perfil para o profissional:', insertProfileError)
      } else {
        resolvedProfile = insertedProfile
      }
    }

    if (resolvedProfile?.role !== 'professional') {
      const { data: updatedProfile, error: updateProfileError } = await adminClient
        .from('profiles')
        .update({ role: 'professional' })
        .eq('id', professionalId)
        .select('id, full_name, email, avatar_url, role, created_at, updated_at, last_seen_at')
        .single()

      if (updateProfileError) {
        console.error('Não foi possível garantir papel profissional para o perfil:', updateProfileError)
      } else if (updatedProfile) {
        resolvedProfile = updatedProfile
      }
    }

    const [patientsResponse, totalCountResponse, activeCountResponse, notificationsCountResponse] = await Promise.all([
      adminClient
        .from('patient_professionals')
        .select('id, patient_id, status, created_at')
        .eq('professional_id', professionalId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5),
      adminClient
        .from('patient_professionals')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', professionalId),
      adminClient
        .from('patient_professionals')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', professionalId)
        .eq('status', 'active'),
      adminClient
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', professionalId)
        .eq('is_read', false),
    ])

    if (patientsResponse.error) {
      console.error('Erro ao carregar pacientes recentes:', patientsResponse.error)
    }

    if (totalCountResponse.error) {
      console.error('Erro ao contar pacientes totais:', totalCountResponse.error)
    }

    if (activeCountResponse.error) {
      console.error('Erro ao contar pacientes ativos:', activeCountResponse.error)
    }

    if (notificationsCountResponse.error) {
      console.error('Erro ao contar notificações não lidas:', notificationsCountResponse.error)
    }

    const patients = patientsResponse.data ?? []
    const patientIds = patients.map((patient) => (patient as Record<string, any>).patient_id as string)
    let profilesById: Record<string, any> = {}

    if (patientIds.length > 0) {
      const { data: patientProfiles, error: patientProfilesError } = await adminClient
        .from('profiles')
        .select('id, full_name, email, avatar_url, last_seen_at')
        .in('id', patientIds)

      if (patientProfilesError) {
        console.warn('Erro ao carregar perfis de pacientes:', patientProfilesError)
      } else if (patientProfiles) {
        profilesById = patientProfiles.reduce<Record<string, any>>((acc, profile) => {
          acc[String(profile.id)] = profile
          return acc
        }, {})
      }
    }

    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const patientId = String((patient as Record<string, any>).patient_id)
        const profile = profilesById[patientId] ?? null
        let lastSignInAt: string | null = null

        try {
          const { data: userData, error: adminError } = await adminClient.auth.admin.getUserById(patientId)

          if (!adminError) {
            lastSignInAt = userData?.user?.last_sign_in_at ?? null
          } else {
            console.warn('Não foi possível obter last_sign_in_at do paciente:', adminError)
          }
        } catch (error) {
          console.warn('Falha ao consultar dados de autenticação do paciente:', error)
        }

        const lastSeenAt = profile?.last_seen_at ?? null
        const isOnline = lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() <= 5 * 60 * 1000 : false

        return {
          ...patient,
          patient_profile: {
            ...(profile ?? {}),
            last_seen_at: lastSeenAt,
            last_sign_in_at: lastSignInAt,
            is_online: isOnline,
          },
        }
      })
    )

    const stats = {
      totalPatients: totalCountResponse.count ?? 0,
      activePatients: activeCountResponse.count ?? 0,
      unreadNotifications: notificationsCountResponse.count ?? 0,
      sessionsThisWeek: 0,
    }

    return NextResponse.json({
      ok: true,
      profile: resolvedProfile ?? {
        id: professionalId,
        full_name: defaultName,
        email: sessionUser.email ?? null,
        avatar_url: resolvedProfile?.avatar_url ?? null,
        role: 'professional',
      },
      patients: enrichedPatients,
      stats,
    })
  } catch (error) {
    console.error('Erro ao carregar painel profissional:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
