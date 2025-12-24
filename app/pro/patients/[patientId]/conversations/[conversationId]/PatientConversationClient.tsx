"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PatientConversationClient({
  patientId,
  conversationId,
}: {
  patientId: string
  conversationId: string
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/pro/patients/${patientId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o paciente
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-purple-600" />
              Conversas indisponíveis para profissionais
            </CardTitle>
            <CardDescription>
              Este conteúdo é protegido para preservar a confidencialidade das interações do paciente com a Clara.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              O histórico de mensagens do chat terapêutico é acessível apenas para o próprio paciente. Os
              profissionais vinculados recebem indicadores objetivos — como eventos críticos, botões de pânico e
              alertas de risco — sem expor o conteúdo das conversas individuais.
            </p>
            <p>
              Utilize os relatórios e métricas disponíveis no painel profissional para acompanhar a evolução do
              paciente. Caso necessite de informações adicionais, combine canais seguros de comunicação diretamente
              com o paciente, seguindo as normas da sua prática clínica.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => router.push('/pro/dashboard')} variant="outline">
            Voltar ao dashboard profissional
          </Button>
        </div>
      </div>
    </div>
  )
}
