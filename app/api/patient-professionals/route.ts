import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime = 'nodejs'

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
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Buscar profissionais vinculados
    const { data: links, error: linksError } = await supabase
      .from('patient_professionals')
      .select('*')
      .eq('patient_id', userId)

    if (linksError) {
      console.error('Erro ao buscar profissionais:', linksError)
      return NextResponse.json(
        { error: "Erro ao buscar profissionais" },
        { status: 500 }
      )
    }

    // Buscar dados dos profissionais
    const professionalsWithData = await Promise.all(
      (links || []).map(async (link) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', link.professional_id)
          .single()

        return {
          ...link,
          professional_name: profile?.full_name,
          professional_email: profile?.email
        }
      })
    )

    return NextResponse.json({
      success: true,
      professionals: professionalsWithData
    })

  } catch (error) {
    console.error('Erro na API de profissionais:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
