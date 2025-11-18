"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, ArrowLeft, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erro ao enviar email de recuperação')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-purple-200 dark:border-purple-800 shadow-xl">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Email enviado!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <div className="pt-4">
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Não recebeu o email? Verifique sua pasta de spam ou{" "}
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  tente novamente
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center space-y-6"
          >
            <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                ClaraMENTE
              </span>
            </Link>

            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Esqueceu sua senha?</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Não se preocupe, isso acontece. Vamos te ajudar a recuperar o acesso à sua conta.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Receba um link seguro por email</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Defina uma nova senha</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Acesse sua conta novamente</span>
              </div>
            </div>

            {/* Avatar */}
            <div className="pt-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                alt="Clara"
                width={200}
                height={250}
                className="w-full max-w-xs opacity-80"
              />
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center"
          >
            <Card className="border-purple-200 dark:border-purple-800 shadow-xl w-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="p-2">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div>
                    <CardTitle>Recuperar Senha</CardTitle>
                    <CardDescription>
                      Digite seu email para receber o link de recuperação
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-purple-200 focus:border-purple-600 dark:border-purple-800"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Digite o email associado à sua conta
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6"
                  >
                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Lembrou sua senha?{" "}
                    <Link href="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                      Fazer login
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                      Criar conta
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}