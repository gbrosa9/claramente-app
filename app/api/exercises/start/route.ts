import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { exerciseId } = await request.json()

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId é obrigatório" },
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

    // Verificar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Verificar se o exercício existe
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('id')
      .eq('id', exerciseId)
      .eq('is_active', true)
      .single()

    if (exerciseError || !exercise) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já existe um registro para este exercício
    const { data: existingUserExercise, error: checkError } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar exercício do usuário:', checkError)
      return NextResponse.json(
        { error: "Erro ao verificar exercício" },
        { status: 500 }
      )
    }

    if (!existingUserExercise) {
      // Criar novo registro como "in_progress"
      const { error: insertError } = await supabase
        .from('user_exercises')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erro ao criar exercício do usuário:', insertError)
        return NextResponse.json(
          { error: "Erro ao iniciar exercício" },
          { status: 500 }
        )
      }
    } else if (existingUserExercise.status === 'not_started') {
      // Atualizar para "in_progress"
      const { error: updateError } = await supabase
        .from('user_exercises')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)

      if (updateError) {
        console.error('Erro ao atualizar exercício do usuário:', updateError)
        return NextResponse.json(
          { error: "Erro ao iniciar exercício" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Exercício iniciado com sucesso"
    })

  } catch (error) {
    console.error('Erro na API de início de exercício:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}