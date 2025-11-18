import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { exerciseId, payload } = await request.json()

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

    // Salvar progresso na tabela progress_tracking
    const { data: progressData, error: progressError } = await supabase
      .from('progress_tracking')
      .insert({
        user_id: userId,
        exercise_id: exerciseId,
        session_data: payload || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (progressError) {
      console.error('Erro ao salvar progresso:', progressError)
      return NextResponse.json(
        { error: "Erro ao salvar progresso" },
        { status: 500 }
      )
    }

    // Verificar se existe registro na user_exercises, se não existir, criar
    const { data: userExercise, error: userExerciseError } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .single()

    if (userExerciseError && userExerciseError.code !== 'PGRST116') {
      console.error('Erro ao buscar user_exercise:', userExerciseError)
      return NextResponse.json(
        { error: "Erro ao atualizar exercício do usuário" },
        { status: 500 }
      )
    }

    if (!userExercise) {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('user_exercises')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          status: 'done',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erro ao criar user_exercise:', insertError)
        return NextResponse.json(
          { error: "Erro ao criar exercício do usuário" },
          { status: 500 }
        )
      }
    } else {
      // Atualizar existente para 'done'
      const { error: updateError } = await supabase
        .from('user_exercises')
        .update({
          status: 'done',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)

      if (updateError) {
        console.error('Erro ao atualizar user_exercise:', updateError)
        return NextResponse.json(
          { error: "Erro ao atualizar exercício do usuário" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Progresso salvo com sucesso",
      data: progressData
    })

  } catch (error) {
    console.error('Erro na API de progresso:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}