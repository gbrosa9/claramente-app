import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exerciseId } = await params

    if (!exerciseId) {
      return NextResponse.json(
        { error: "ID do exercício é obrigatório" },
        { status: 400 }
      )
    }

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

    // Buscar o exercício específico
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .eq('is_active', true)
      .single()

    if (exerciseError || !exercise) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se usuário está logado para buscar progresso
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    let userExercise = null

    if (!sessionError && session?.user) {
      const userId = session.user.id
      
      const { data: userExerciseData, error: userExerciseError } = await supabase
        .from('user_exercises')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single()

      if (!userExerciseError && userExerciseData) {
        userExercise = userExerciseData
      }
    }

    return NextResponse.json({
      success: true,
      exercise,
      userExercise,
      benefits: [
        "Reduz ansiedade",
        "Melhora foco", 
        "Promove bem-estar"
      ] // Default benefits - you can customize per exercise
    })

  } catch (error) {
    console.error('Erro na API de exercício individual:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}