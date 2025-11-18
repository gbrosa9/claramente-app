import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "planId e userId são obrigatórios" },
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

    // Verificar se o plano existe
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      )
    }

    // Desativar assinaturas existentes do usuário
    const { error: deactivateError } = await supabase
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
      .eq('status', 'active')

    if (deactivateError) {
      console.error('Erro ao desativar assinaturas existentes:', deactivateError)
    }

    // Criar ou ativar nova assinatura
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + (plan.period === 'year' ? 12 : 1))

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Erro ao criar assinatura:', subscriptionError)
      return NextResponse.json(
        { error: "Erro ao ativar assinatura" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Assinatura ativada com sucesso",
      subscription
    })

  } catch (error) {
    console.error('Erro na API de ativação:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}