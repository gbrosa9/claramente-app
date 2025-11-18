import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/server/auth/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { newEmail, password } = await request.json();

    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Validar se os campos foram preenchidos
    if (!newEmail || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    // Verificar se o novo email é diferente do atual
    if (newEmail === session.user.email) {
      return NextResponse.json({ error: 'O novo email deve ser diferente do atual' }, { status: 400 });
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Primeiro, verificar se a senha está correta
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 400 });
    }

    // Verificar se o novo email já está em uso (tentando fazer login)
    const { error: emailCheckError } = await supabase.auth.signInWithPassword({
      email: newEmail,
      password: 'dummy-password' // Apenas para verificar se o email existe
    });

    // Se não houver erro relacionado à senha, significa que o email já existe
    if (emailCheckError && !emailCheckError.message.includes('password')) {
      // Email não existe, podemos prosseguir
    } else if (!emailCheckError || emailCheckError.message.includes('password')) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
    }

    // Solicitar alteração de email (isso enviará um email de confirmação)
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (updateError) {
      console.error('Erro ao solicitar alteração de email:', updateError);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Email de confirmação enviado. Verifique sua caixa de entrada para confirmar a alteração.',
      success: true 
    });

  } catch (error) {
    console.error('Erro no endpoint de alteração de email:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}