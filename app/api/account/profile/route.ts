import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, phone, date_of_birth, location, bio, avatar_url } = body

    console.log('Dados recebidos:', body)

    // Validação básica
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome completo é obrigatório" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: "E-mail válido é obrigatório" },
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
    const trimmedName = full_name.trim()

    // Preparar dados para atualização
    const updateData = {
      full_name: trimmedName,
      email: email.trim(),
      phone: phone?.trim() || null,
      date_of_birth: date_of_birth || null,
      location: location?.trim() || null,
      bio: bio?.trim() || null,
      avatar_url: avatar_url?.trim() || null,
      updated_at: new Date().toISOString()
    }

    // Verificar se o perfil já existe
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('Perfil existente:', existingProfile, 'Erro:', profileError)

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', profileError)
      return NextResponse.json(
        { error: "Erro ao buscar perfil" },
        { status: 500 }
      )
    }

    let updatedProfile

    if (!existingProfile) {
      console.log('Criando novo perfil para usuário:', userId)
      // Criar novo perfil
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...updateData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('Novo perfil criado:', newProfile, 'Erro:', insertError)

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError)
        return NextResponse.json(
          { error: `Erro ao criar perfil: ${insertError.message}` },
          { status: 500 }
        )
      }

      updatedProfile = newProfile
    } else {
      console.log('Atualizando perfil existente:', userId)
      // Atualizar perfil existente
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      console.log('Perfil atualizado:', updated, 'Erro:', updateError)

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError)
        return NextResponse.json(
          { error: `Erro ao atualizar perfil: ${updateError.message}` },
          { status: 500 }
        )
      }

      updatedProfile = updated
    }

    console.log('Perfil final:', updatedProfile)

    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      id: updatedProfile.id,
      full_name: updatedProfile.full_name,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      date_of_birth: updatedProfile.date_of_birth,
      location: updatedProfile.location,
      bio: updatedProfile.bio,
      avatar_url: updatedProfile.avatar_url
    })

  } catch (error) {
    console.error('Erro na API de perfil:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

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

    // Verificar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', profileError)
      return NextResponse.json(
        { error: "Erro ao buscar perfil" },
        { status: 500 }
      )
    }

    // Se não existe perfil, retornar dados básicos do auth
    if (!profile) {
      return NextResponse.json({
        id: userId,
        full_name: session.user.user_metadata?.full_name || "",
        email: session.user.email || "",
        phone: null,
        date_of_birth: null,
        location: null,
        bio: null,
        avatar_url: null
      })
    }

    return NextResponse.json({
      id: profile.id,
      full_name: profile.full_name || "",
      email: profile.email || session.user.email || "",
      phone: profile.phone,
      date_of_birth: profile.date_of_birth,
      location: profile.location,
      bio: profile.bio,
      avatar_url: profile.avatar_url
    })

  } catch (error) {
    console.error('Erro na API de perfil (GET):', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}