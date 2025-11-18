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

    // Buscar todos os planos ativos
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (plansError) {
      console.error('Erro ao buscar planos:', plansError)
      return NextResponse.json(
        { error: "Erro ao buscar planos" },
        { status: 500 }
      )
    }

    // Processar features para garantir formato correto
    const processedPlans = (plans || []).map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features) 
        : plan.features,
      // Adicionar descrição se não existir
      description: plan.description || (
        plan.id === "gratuito" ? "Perfeito para explorar" : 
        plan.id === "pro" ? "Para uso regular" : 
        plan.id === "premium" ? "Máximo bem-estar" : 
        "Plano disponível"
      )
    }))

    let currentSubscription = null

    // Verificar se usuário está logado para buscar assinatura atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (!sessionError && session?.user) {
      const userId = session.user.id
      
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (!subscriptionError && subscription) {
        currentSubscription = subscription
      }
    }

    return NextResponse.json({
      success: true,
      plans: processedPlans,
      currentSubscription
    })

  } catch (error) {
    console.error('Erro na API de planos:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}