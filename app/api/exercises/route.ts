import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Criar cliente Supabase
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
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Verificar autenticação (opcional para visualização de exercícios)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    let userId = null
    if (!sessionError && session?.user) {
      userId = session.user.id
    }

    // Buscar todos os exercícios ativos
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (exercisesError) {
      console.error('Erro ao buscar exercícios:', exercisesError)
      return NextResponse.json(
        { error: "Erro ao buscar exercícios" },
        { status: 500 }
      )
    }

    let userExercises = []

    // Se usuário logado, buscar progresso dos exercícios
    if (userId) {
      const { data: userExerciseData, error: userExerciseError } = await supabase
        .from('user_exercises')
        .select('*')
        .eq('user_id', userId)

      if (userExerciseError) {
        console.error('Erro ao buscar exercícios do usuário:', userExerciseError)
        // Continue sem erro, apenas não mostra progresso
      } else {
        userExercises = userExerciseData || []
      }
    }

    return NextResponse.json({
      success: true,
      exercises,
      userExercises
    })

  } catch (error) {
    console.error('Erro na API de exercícios:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}