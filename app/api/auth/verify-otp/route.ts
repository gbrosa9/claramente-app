import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAuthClient } from "@/lib/supabase/auth";

// ✅ Type local (compatível com supabase-js sem AuthOtpType exportado)
type AuthOtpType = "signup" | "recovery" | "magiclink" | "email_change" | "phone_change";

const VerifyOTPSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  token: z.string().min(6, "Código deve ter 6 dígitos").max(6, "Código deve ter 6 dígitos"),
  // ✅ Removi "email" (não é tipo OTP do Supabase) e deixei os mais comuns
  type: z.enum(["signup", "recovery", "email_change", "magiclink", "phone_change"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("=== Verify OTP API called ===");

    const body = await request.json();
    const parsedData = VerifyOTPSchema.parse(body);

    const cookieEmail = request.cookies.get("pendingSignupEmail")?.value;

    let decodedCookieEmail: string | undefined;

    if (cookieEmail) {
      try {
        decodedCookieEmail = decodeURIComponent(cookieEmail);
      } catch {
        decodedCookieEmail = cookieEmail;
      }
    }

    const resolvedEmail = parsedData.email ?? decodedCookieEmail;

    if (!resolvedEmail) {
      return NextResponse.json(
        { ok: false, error: "Email do cadastro não encontrado. Refaça o registro." },
        { status: 400 }
      );
    }

    const normalizedEmail = resolvedEmail.trim().toLowerCase();

    console.log("Verifying OTP for:", normalizedEmail);

    const supabase = createAuthClient();

    // ✅ Usa type enviado no body, senão assume signup
    const otpType: AuthOtpType = (parsedData.type ?? "signup") as AuthOtpType;

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: parsedData.token,
      type: otpType,
    });

    if (error) {
      console.error("OTP verification error:", error);

      const message = error.message || "Erro ao verificar código";

      if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
        return NextResponse.json(
          { ok: false, error: "Código inválido ou expirado. Solicite um novo código." },
          { status: 400 }
        );
      }

      return NextResponse.json({ ok: false, error: "Erro na verificação: " + message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ ok: false, error: "Falha na verificação do código" }, { status: 400 });
    }

    const response = NextResponse.json({
      ok: true,
      data: {
        user: data.user,
        session: data.session,
      },
      message: "Código verificado com sucesso! Sua conta foi confirmada.",
    });

    response.cookies.set("pendingSignupEmail", "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join(", ");
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    console.error("OTP verification failed:", error);
    return NextResponse.json({ ok: false, error: "Erro interno no servidor" }, { status: 500 });
  }
}
