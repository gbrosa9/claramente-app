import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/server/auth/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { password, confirmation } = await request.json();

    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Validar se os campos foram preenchidos
    if (!password || !confirmation) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Validar confirmação
    if (confirmation !== 'EXCLUIR') {
      return NextResponse.json({ error: 'Confirmação inválida. Digite "EXCLUIR"' }, { status: 400 });
    }

    // Criar cliente Supabase com permissões administrativas
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Primeiro, verificar se a senha está correta
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 400 });
    }

    // Obter o ID do usuário
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userId = userData.user.id;

    // Excluir dados relacionados do usuário nas tabelas personalizadas
    // (você pode adicionar mais tabelas conforme necessário)
    try {
      // Exemplo: excluir conversas do usuário
      await supabase.from('conversations').delete().eq('user_id', userId);
      
      // Exemplo: excluir progresso do usuário
      await supabase.from('user_progress').delete().eq('user_id', userId);
      
      // Exemplo: excluir exercícios do usuário
      await supabase.from('user_exercises').delete().eq('user_id', userId);
      
      // Adicione outras tabelas conforme necessário
    } catch (deleteError) {
      console.error('Erro ao excluir dados relacionados:', deleteError);
      // Continue mesmo se houver erro na exclusão de dados relacionados
    }

    // Excluir o usuário da autenticação
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Erro ao excluir usuário:', deleteError);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Conta excluída com sucesso',
      success: true 
    });

  } catch (error) {
    console.error('Erro no endpoint de exclusão de conta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}