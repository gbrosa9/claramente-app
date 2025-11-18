"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessClient({ planId, userId }: { planId?: string; userId?: string }) {
  const router = useRouter()
  const [updating, setUpdating] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Simulate processing and update subscription status
    const updateSubscription = async () => {
      if (!planId || !userId) {
        setUpdating(false)
        return
      }

      try {
        const response = await fetch('/api/subscriptions/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId, userId }),
        })

        if (response.ok) {
          setSuccess(true)
        }
      } catch (error) {
        console.error('Erro ao ativar assinatura:', error)
      } finally {
        setUpdating(false)
      }
    }

    updateSubscription()
  }, [planId, userId])

  if (updating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processando pagamento...</h1>
          <p className="text-gray-600 dark:text-gray-400">Aguarde enquanto ativamos sua assinatura</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {success ? 'Pagamento Aprovado!' : 'Algo deu errado'}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {success
              ? 'Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos do seu plano.'
              : 'Ocorreu um erro ao processar seu pagamento. Tente novamente ou entre em contato conosco.'}
          </p>

          <div className="space-y-4">
            <Button onClick={() => router.push('/dashboard')} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {!success && (
              <Button onClick={() => router.push('/planos')} variant="outline" className="w-full">
                Tentar Novamente
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
