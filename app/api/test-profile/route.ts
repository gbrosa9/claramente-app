import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime = 'nodejs'

// Endpoint de teste para verificar se a coluna role existe
export async function GET(request: NextRequest) {
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
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        error: "Não autorizado",
        sessionError: sessionError?.message
      }, { status: 401 })
    }

    const userId = session.user.id

    // Tentar buscar profile com role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      success: true,
      userId,
      profile,
      profileError: profileError?.message,
      hasRole: profile ? 'role' in profile : false,
      roleValue: profile?.role || 'não definido'
    })

  } catch (error) {
    console.error('[Test Profile] Erro:', error)
    return NextResponse.json({
      error: "Erro interno",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
