import { NextResponse } from 'next/server'

const restrictedResponse = NextResponse.json(
  {
    ok: false,
    error: 'Acesso às conversas diretas foi desabilitado para profissionais em conformidade com a LGPD.',
  },
  { status: 403 }
)

export const runtime = 'nodejs'

export async function GET() {
  return restrictedResponse
}

export async function POST() {
  return restrictedResponse
}
