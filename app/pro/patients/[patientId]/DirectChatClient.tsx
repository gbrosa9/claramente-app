"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DirectChatClient({ patientId }: { patientId: string }) {
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
              Acesso às conversas desabilitado
            </CardTitle>
            <CardDescription>
              Para cumprir a LGPD e preservar a confidencialidade do paciente, profissionais não podem visualizar
              ou trocar mensagens dentro da plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Utilize os eventos de risco e os relatórios de acompanhamento para orientar seu trabalho clínico.
              Caso precise alinhar informações diretamente com o paciente, conduza essa comunicação pelos canais de
              atendimento que você já utiliza externamente.
            </p>
            <p className="text-xs text-slate-500">
              Se considerar que há necessidade de registrar novas evidências ou emergências, utilize o botão de
              acompanhamento na ficha do paciente ou registre uma ocorrência conforme os protocolos da sua clínica.
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
