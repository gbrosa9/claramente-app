"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCallbackClient({ initialSearchParams }: { initialSearchParams: Record<string, string | string[]> }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()

        const code = Array.isArray(initialSearchParams?.code) ? initialSearchParams.code[0] : initialSearchParams?.code
        const error = Array.isArray(initialSearchParams?.error) ? initialSearchParams.error[0] : initialSearchParams?.error
        const errorDescription = Array.isArray(initialSearchParams?.error_description) ? initialSearchParams.error_description[0] : initialSearchParams?.error_description

        if (error) {
          console.error('Auth callback error:', error, errorDescription)
          setStatus('error')
          setMessage(errorDescription || 'Erro na verificação do email')
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('Código de verificação não encontrado')
          return
        }

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Session exchange error:', exchangeError)
          setStatus('error')
          setMessage('Erro ao confirmar email: ' + exchangeError.message)
          return
        }

        if (data.user) {
          setStatus('success')
          setMessage('Email confirmado com sucesso! Redirecionando...')

          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Falha na autenticação')
        }
      } catch (err) {
        console.error('Callback handling error:', err)
        setStatus('error')
        setMessage('Erro inesperado durante a confirmação')
      }
    }

    handleAuthCallback()
  }, [initialSearchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">ClaraMENTE</span>
          </Link>
        </div>

        <Card className="border-purple-200 dark:border-purple-800 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {status === 'loading' && <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
              {status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
              {status === 'loading' && 'Verificando email...'}
              {status === 'success' && 'Email confirmado!'}
              {status === 'error' && 'Erro na confirmação'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Aguarde enquanto confirmamos seu email'}
              {status === 'success' && 'Sua conta foi ativada com sucesso'}
              {status === 'error' && 'Ocorreu um problema na confirmação'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className={`p-4 rounded-lg ${
              status === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
              status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
              'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                status === 'loading' ? 'text-blue-700 dark:text-blue-300' :
                status === 'success' ? 'text-green-700 dark:text-green-300' :
                'text-red-700 dark:text-red-300'
              }`}>
                {message}
              </p>
            </div>

            <div className="space-y-4">
              {status === 'success' && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">Tentar Novamente</Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">Fazer Login</Button>
                  </Link>
                </div>
              )}

              {status === 'loading' && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Este processo pode levar alguns segundos...</p>
              )}
            </div>

            {status === 'error' && (
              <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Precisa de ajuda?</h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Verifique se clicou no link mais recente</li>
                  <li>• O link pode ter expirado (válido por 24h)</li>
                  <li>• Tente fazer um novo registro</li>
                  <li>• Entre em contato: suporte@claramente.app</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
