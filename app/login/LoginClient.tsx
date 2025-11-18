"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import Image from "next/image"

export default function LoginClient({ initialSearchParams }: { initialSearchParams: Record<string, string | string[]> }) {
  const [userType, setUserType] = useState<"user" | "professional">("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const confirmed = Array.isArray(initialSearchParams?.confirmed) ? initialSearchParams.confirmed[0] : initialSearchParams?.confirmed
    const message = Array.isArray(initialSearchParams?.message) ? initialSearchParams.message[0] : initialSearchParams?.message

    if (confirmed === 'true') {
      setSuccessMessage('Email confirmado com sucesso! Agora você pode fazer login.')
    } else if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
  }, [initialSearchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        if (result.error.includes('Email not confirmed')) {
          setError(`Email não confirmado. Verifique sua caixa de entrada ou confirme seu email primeiro.`)
          setTimeout(() => {
            const queryParams = new URLSearchParams({ email })
            window.location.href = `/confirm-email?${queryParams.toString()}`
          }, 3000)
        } else {
          setError('Email ou senha incorretos')
        }
      } else if (result?.ok) {
        window.location.href = userType === "user" ? "/dashboard" : "/professional"
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const userTypeInfo = {
    user: {
      title: "Usuário",
      description: "Acesse suas sessões e progresso",
      features: ["Chat com Clara", "Exercícios personalizados", "Dashboard de progresso", "Chamadas de voz"],
    },
    professional: {
      title: "Profissional",
      description: "Acompanhe seus pacientes",
      features: ["Painel de pacientes", "Relatórios de progresso", "Gestão de casos", "Analytics"],
    },
  }

  const info = userTypeInfo[userType]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col justify-center space-y-6">
            <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">ClaraMENTE</span>
            </Link>

            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo de volta</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">Entre na sua jornada de bem-estar mental</p>
            </div>

            <div className="space-y-3">
              {info.features.map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-8">
              <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png" alt="Clara" width={200} height={250} className="w-full max-w-xs" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="border-purple-200 dark:border-purple-800 shadow-xl">
              <CardHeader>
                <CardTitle>{info.title}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Tipo de Conta</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ value: "user", label: "Usuário" }, { value: "professional", label: "Profissional" }].map((type) => (
                      <motion.button key={type.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setUserType(type.value as any)} className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${userType === type.value ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg" : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}>
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {successMessage && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-purple-200 focus:border-purple-600 dark:border-purple-800" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Senha</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="border-purple-200 focus:border-purple-600 dark:border-purple-800 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                      <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Lembrar-me</label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">Esqueceu a senha?</Link>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6">{loading ? "Entrando..." : "Entrar"}</Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">ou</span>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleGoogleLogin} variant="outline" className="w-full border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent">Continuar com Google</Button>
                </motion.div>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">Não tem uma conta? <Link href="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Criar conta gratuita</Link></p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
