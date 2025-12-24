import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, context: { params: { patientId: string; conversationId: string } }) {
  try {
    const { patientId, conversationId } = context.params

    if (!patientId || !conversationId) {
      return NextResponse.json({ ok: false, error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável para habilitar acompanhamento profissional.')
      return NextResponse.json(
        { ok: false, error: 'Configuração ausente no servidor. Contate o suporte.' },
        { status: 500 }
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
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {}
          },
        },
      }
    )

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const professionalId = session.user.id

    const { data: professionalProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', professionalId)
      .single()

    if (!professionalProfile || professionalProfile.role !== 'professional') {
      return NextResponse.json({ ok: false, error: 'Apenas profissionais podem acessar essas informações.' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    const { data: link } = await adminClient
      .from('patient_professionals')
      .select('id, status')
      .eq('patient_id', patientId)
      .eq('professional_id', professionalId)
      .eq('status', 'active')
      .maybeSingle()

    if (!link) {
      return NextResponse.json({ ok: false, error: 'Nenhum vínculo ativo com este paciente.' }, { status: 403 })
    }

    const { data: conversation, error: conversationError } = await adminClient
      .from('chat_sessions')
      .select('id, title, created_at, updated_at, user_id')
      .eq('id', conversationId)
      .eq('user_id', patientId)
      .maybeSingle()

    if (conversationError || !conversation) {
      return NextResponse.json({ ok: false, error: 'Conversa não encontrada.' }, { status: 404 })
    }

    const { data: messages, error: messagesError } = await adminClient
      .from('messages')
      .select('id, role, content, created_at')
      .eq('session_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(400)

    if (messagesError) {
      console.error('Erro ao carregar mensagens:', messagesError)
      return NextResponse.json({ ok: false, error: 'Erro ao carregar mensagens.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, conversation, messages: messages ?? [] })
  } catch (error) {
    console.error('Erro ao carregar conversa do paciente:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
