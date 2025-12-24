import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function POST() {
  try {
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
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {}
          },
        },
      }
    )

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 })
    }

    const now = new Date().toISOString()
    const sessionUser = session.user as Record<string, any>
    const userId = sessionUser.id as string
    const normalizedRole = String(sessionUser.role || sessionUser.user_metadata?.role || "user").toLowerCase()

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ last_seen_at: now })
      .eq("id", userId)
      .select("id, last_seen_at")
      .maybeSingle()

    if (updateError && updateError.code !== "PGRST116") {
      console.error("Não foi possível atualizar last_seen_at do usuário:", updateError)
      return NextResponse.json({ ok: false, error: "Erro ao registrar atividade." }, { status: 500 })
    }

    if (updatedProfile) {
      return NextResponse.json({ ok: true, lastSeenAt: updatedProfile.last_seen_at ?? now })
    }

    const defaultName =
      sessionUser.name ||
      sessionUser.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.email?.split("@")[0] ||
      "Usuário"

    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: defaultName,
        email: sessionUser.email ?? null,
        role: normalizedRole === "professional" ? "professional" : "user",
        last_seen_at: now,
      })
      .select("id, last_seen_at")
      .single()

    if (insertError) {
      console.error("Não foi possível criar perfil para registrar atividade:", insertError)
      return NextResponse.json({ ok: false, error: "Erro ao registrar atividade." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, lastSeenAt: insertedProfile.last_seen_at ?? now })
  } catch (error) {
    console.error("Erro ao registrar atividade do usuário:", error)
    return NextResponse.json({ ok: false, error: "Erro interno do servidor." }, { status: 500 })
  }
}
