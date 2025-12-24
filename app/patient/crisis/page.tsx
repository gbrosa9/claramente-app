"use client"

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Heart, PhoneCall, ShieldHalf, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CrisisSupportPage() {
  const [panicRequesting, setPanicRequesting] = useState(false)
  const [panicRegistered, setPanicRegistered] = useState(false)
  const [panicError, setPanicError] = useState<string | null>(null)
  const [breathingStep, setBreathingStep] = useState<'idle' | 'running' | 'done'>('idle')
  const [breathingCountdown, setBreathingCountdown] = useState(120)

  const handlePanicPress = async () => {
    setPanicRequesting(true)
    setPanicError(null)
    try {
      const response = await fetch('/api/patient/risk/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity: 'HIGH' }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Não foi possível registrar o evento de crise.')
      }
      setPanicRegistered(true)
    } catch (err) {
      setPanicError(err instanceof Error ? err.message : 'Falha ao registrar a crise.')
    } finally {
      setPanicRequesting(false)
    }
  }

  const startBreathing = () => {
    setBreathingStep('running')
    setBreathingCountdown(120)

    const interval = setInterval(() => {
      setBreathingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setBreathingStep('done')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const seconds = breathingCountdown % 60
  const minutes = Math.floor(breathingCountdown / 60)

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-white to-purple-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-3xl font-semibold text-rose-600">Estamos com você agora</h1>
          <p className="text-sm text-muted-foreground">
            Se você estiver em risco imediato, ligue para o SAMU 192 ou Polícia 190. Em caso de emergência,
            procure ajuda presencial imediatamente.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneCall className="h-5 w-5 text-rose-500" /> CVV 188
              </CardTitle>
              <CardDescription>Atendimento 24h gratuito e sigiloso.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="tel:188">Ligar agora</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldHalf className="h-5 w-5 text-emerald-500" /> SAMU 192
              </CardTitle>
              <CardDescription>Atendimento médico de urgência.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="tel:192">Chamar SAMU</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldHalf className="h-5 w-5 text-indigo-500" /> Polícia 190
              </CardTitle>
              <CardDescription>Risco iminente? Ligue agora.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="tel:190">Contato Polícia</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-rose-600">
              <AlertCircle className="h-5 w-5" /> Registrar que estou em crise
            </CardTitle>
            <CardDescription>
              Ao registrar, sua profissional verá apenas contagens e poderá ajustar o cuidado. Nenhuma mensagem é compartilhada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePanicPress}
              disabled={panicRequesting || panicRegistered}
            >
              {panicRequesting ? 'Registrando…' : panicRegistered ? 'Crise registrada' : 'Informar crise agora'}
            </Button>
            {panicError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {panicError}
              </div>
            )}
            {panicRegistered && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                Recebemos seu sinal. Lembre-se: você não está só. Use os contatos acima se precisar de suporte imediato.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
              <Wind className="h-5 w-5" /> Respiração guiada (2 minutos)
            </CardTitle>
            <CardDescription>
              Concentre-se em ciclos de 4s inspirando, 7s segurando, 8s expirando. Ajuste para o ritmo que se sentir melhor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {breathingStep === 'idle' && (
              <Button onClick={startBreathing} className="w-full" variant="secondary">
                Iniciar exercício de respiração
              </Button>
            )}
            {breathingStep !== 'idle' && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400 bg-white text-2xl font-semibold text-emerald-700">
                  {minutes.toString().padStart(1, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                {breathingStep === 'running' ? (
                  <p className="text-center text-sm text-emerald-700">
                    Inspire por 4 segundos, segure por 7, solte pelo nariz por 8. Repita até o tempo finalizar.
                  </p>
                ) : (
                  <p className="text-center text-sm text-emerald-700">
                    Excelente. Observe como seu corpo responde. Faça uma nova rodada se precisar.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-rose-500" /> Mensagem importante
            </CardTitle>
            <CardDescription>
              Se você corre algum risco agora, procure ajuda presencial. ClaraMENTE é um apoio complementar e não substitui serviços de emergência.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
