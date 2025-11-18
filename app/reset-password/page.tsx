"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brain, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

export default function ResetPasswordPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokens, setTokens] = useState<{access_token: string, refresh_token: string} | null>(null)

  useEffect(() => {
    // Supabase sends tokens in hash fragment, not query params
    const extractTokensFromHash = () => {
      const hash = window.location.hash.substring(1) // Remove '#'
      const params = new URLSearchParams(hash)
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        error: params.get('error'),
        error_description: params.get('error_description')
      }
    }

    const { access_token, refresh_token, error: errorParam, error_description } = extractTokensFromHash()
    
    if (errorParam) {
      setError(error_description || 'Link inválido ou expirado')
      setValidating(false)
      return
    }

    if (!access_token || !refresh_token) {
      setError("Token de recuperação não encontrado na URL")
      setValidating(false)
      return
    }

    // Validate tokens by trying to set session
    const validateTokens = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase.auth.setSession({
          access_token: access_token,
          refresh_token: refresh_token
        })

        if (error || !data.user) {
          setError("Link inválido ou expirado")
        } else {
          setTokens({ access_token, refresh_token })
        }
      } catch (error) {
        setError("Erro ao validar link")
      } finally {
        setValidating(false)
      }
    }

    validateTokens()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      setLoading(false)
      return
    }

    if (!tokens) {
      setError("Tokens não encontrados")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          password: formData.password
        })
      })

      const data = await response.json()

      if (data.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=Senha redefinida com sucesso! Faça login com sua nova senha.')
        }, 3000)
      } else {
        setError(data.error || 'Erro ao redefinir senha')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Validando link de recuperação...
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Aguarde enquanto verificamos a validade do link.
          </p>
        </motion.div>
      </div>
    )
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
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Senha redefinida!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!tokens || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-red-200 dark:border-red-800 shadow-xl">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Link inválido
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {error || "Este link de recuperação é inválido ou expirou. Solicite um novo link."}
              </p>
              <div className="space-y-2">
                <Link href="/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                    Solicitar Novo Link
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Nova senha</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Defina uma nova senha segura para sua conta.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Mínimo de 8 caracteres</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Inclua letras e números</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Use uma senha única</span>
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
                <CardTitle>Redefinir Senha</CardTitle>
                <CardDescription>
                  Digite sua nova senha abaixo
                </CardDescription>
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
                    <label className="block text-sm font-medium mb-2">Nova Senha</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="border-purple-200 focus:border-purple-600 dark:border-purple-800 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirmar Nova Senha</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="border-purple-200 focus:border-purple-600 dark:border-purple-800 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6"
                  >
                    {loading ? "Redefinindo..." : "Redefinir Senha"}
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}