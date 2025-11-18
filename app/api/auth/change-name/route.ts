import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/server/auth/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Validar se o nome foi fornecido
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 });
    }

    // Validar tamanho do nome
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Nome deve ter no máximo 100 caracteres' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar o usuário usando o email na tabela auth.users
    const { data: usersData, error: usersError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    // Se não conseguir buscar diretamente, vamos usar o método admin
    let userId = session.user.id;
    
    // Se não temos o ID na sessão, vamos buscar todos os usuários e filtrar
    if (!userId) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('Erro ao buscar usuários:', listError);
        return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
      }

      const user = users.find(u => u.email === session.user.email);
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      
      userId = user.id;
    }

    // Atualizar o nome do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          full_name: trimmedName,
          name: trimmedName
        }
      }
    );

    if (updateError) {
      console.error('Erro ao atualizar nome:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar nome' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Nome atualizado com sucesso',
      name: trimmedName
    });

  } catch (error) {
    console.error('Erro no endpoint de alteração de nome:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}