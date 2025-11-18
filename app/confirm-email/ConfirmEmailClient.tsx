"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmEmailClient({ initialEmail }: { initialEmail?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      })

      if (error) {
        setError('Código inválido ou expirado. Tente novamente.')
        return
      }

      if (data.user) {
        setSuccess(true)
        setTimeout(() => router.push('/login?confirmed=true'), 2000)
      } else {
        setError('Erro na verificação. Tente novamente.')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email não informado')
      return
    }

    setResendLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (error) {
        setError('Erro ao reenviar email: ' + error.message)
      } else {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 3000)
      }
    } catch (err) {
      setError('Erro de conexão ao reenviar email')
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email confirmado com sucesso!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Sua conta foi ativada. Redirecionando para o login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </motion.div>
      </div>
    )
  }

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
              <Mail className="w-6 h-6 text-purple-600" />
              Confirme seu email
            </CardTitle>
            <CardDescription>Enviamos um código de verificação para seu email</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 dark:text-purple-300">Código enviado para:</p>
              <p className="font-semibold text-purple-800 dark:text-purple-200">{email || 'Seu email'}</p>
            </div>

            {resendSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 dark:text-green-400">Email reenviado com sucesso!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Código de verificação</label>
                <Input
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  className="border-purple-200 focus:border-purple-600 dark:border-purple-800 text-center text-lg font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verifique sua caixa de entrada e spam</p>
              </div>

              <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6">
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">ou</span>
                </div>
              </div>

              <Button onClick={handleResendEmail} disabled={resendLoading} variant="outline" className="w-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                {resendLoading ? 'Reenviando...' : 'Reenviar email'}
              </Button>

              <div className="text-center">
                <Link href="/register" className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao registro
                </Link>
              </div>
            </div>

            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Não recebeu o email?</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Verifique sua caixa de spam</li>
                <li>• O email pode demorar alguns minutos</li>
                <li>• Certifique-se de que o email está correto</li>
                <li>• Entre em contato: suporte@claramente.app</li>
              </ul>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
