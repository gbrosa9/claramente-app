import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/server/auth/config';

// Para demonstração, vou usar uma estrutura simples
// Em produção, você instalaria: npm install stripe
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { planId, planName } = await request.json();

    // Validar dados
    if (!planId || !planName) {
      return NextResponse.json({ error: 'Dados do plano obrigatórios' }, { status: 400 });
    }

    // Mapear planos para preços (você configuraria esses IDs no Stripe)
    const planPrices: Record<string, { priceId: string; amount: number }> = {
      'premium': { priceId: 'price_premium_monthly', amount: 2990 }, // R$ 29,90
      'familia': { priceId: 'price_familia_monthly', amount: 4990 }   // R$ 49,90
    };

    const planData = planPrices[planId];
    if (!planData) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Por enquanto, vou simular a criação da sessão do Stripe
    // Em produção, você usaria:
    /*
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      payment_method_types: ['card'],
      line_items: [{
        price: planData.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: planId,
        planName: planName
      }
    });

    return NextResponse.json({ 
      success: true,
      checkoutUrl: checkoutSession.url 
    });
    */

    // Simulação para demonstração
    console.log(`Usuário ${session.user.email} selecionou o plano ${planName} (${planId})`);
    
    return NextResponse.json({ 
      success: true,
      message: `Plano ${planName} selecionado! Em produção, você seria redirecionado para o checkout do Stripe.`,
      // Para demonstração, vou simular um redirect para o dashboard com sucesso
      checkoutUrl: `/dashboard?demo_checkout=true&plan=${planId}`
    });

  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}