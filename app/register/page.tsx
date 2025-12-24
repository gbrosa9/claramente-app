"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brain, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user" as "user" | "professional"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
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

    if (!acceptTerms) {
      setError("Você deve aceitar os termos de uso e política de privacidade para prosseguir")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.userType,
          locale: 'pt-BR'
        })
      })

      if (!response.ok) {
        // Se a resposta não for ok, tenta obter o erro do JSON
        try {
          const errorData = await response.json()
          setError(errorData.error || `Erro ${response.status}: ${response.statusText}`)
        } catch (parseError) {
          setError(`Erro ${response.status}: ${response.statusText}`)
        }
        return
      }

      const data = await response.json()

      if (data.ok) {
        // Verificar se precisa de confirmação de email
        if (data.data?.needsConfirmation) {
          try {
            document.cookie = `pendingSignupEmail=${encodeURIComponent(formData.email)}; Path=/; Max-Age=${60 * 15}; SameSite=Lax` + (process.env.NODE_ENV === 'production' ? '; Secure' : '')
            window.sessionStorage.setItem('pendingSignupEmail', formData.email)
          } catch (cookieError) {
            console.warn('Não foi possível armazenar email pendente de confirmação:', cookieError)
          }

          // Redirecionar para página de confirmação de email
          const queryParams = new URLSearchParams({
            email: formData.email
          })
          window.location.href = `/confirm-email?${queryParams.toString()}`
          return
        } else {
          // Usuário já confirmado, pode fazer login
          setSuccess(true)
          setTimeout(() => {
            router.push('/login?message=Conta criada com sucesso! Faça login para continuar.')
          }, 2000)
          return
        }
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError('Erro de conexão. Verifique sua internet e tente novamente. Detalhes: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const userTypeInfo = {
    user: {
      title: "Criar Conta - Usuário",
      description: "Acesse terapia personalizada com IA",
      features: ["Chat com Clara", "Exercícios personalizados", "Dashboard de progresso", "Chamadas de voz"],
    },
    professional: {
      title: "Criar Conta - Profissional",
      description: "Acompanhe seus pacientes",
      features: ["Painel de pacientes", "Relatórios de progresso", "Gestão de casos", "Analytics"],
    },
  }

  const info = userTypeInfo[formData.userType]

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          {needsEmailConfirmation ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Conta criada com sucesso!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Enviamos um email de confirmação para <strong>{formData.email}</strong>.
                Clique no link para ativar sua conta e fazer login.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Não recebeu o email?</strong> Verifique sua caixa de spam ou entre em contato conosco.
                </p>
              </div>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  Ir para Login
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Conta criada com sucesso!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Redirecionando para o dashboard...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </>
          )}
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
          {/* Left Side - Branding & Features */}
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Junte-se a nós</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">Comece sua jornada de bem-estar mental</p>
            </div>

            <div className="space-y-3">
              {info.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Avatar */}
            <div className="pt-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                alt="Clara"
                width={200}
                height={250}
                className="w-full max-w-xs"
              />
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-purple-200 dark:border-purple-800 shadow-xl">
              <CardHeader>
                <CardTitle>{info.title}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Tipo de Conta</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "user", label: "Usuário" },
                      { value: "professional", label: "Profissional" },
                    ].map((type) => (
                      <motion.button
                        key={type.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({ ...formData, userType: type.value as any })}
                        className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                          formData.userType === type.value
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Tipo de Conta</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: "user" })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.userType === "user"
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👤</div>
                          <div className="font-semibold text-sm">Paciente</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Busco apoio psicológico
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: "professional" })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.userType === "professional"
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👨‍⚕️</div>
                          <div className="font-semibold text-sm">Profissional</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Sou psicólogo(a)
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Completo</label>
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="border-purple-200 focus:border-purple-600 dark:border-purple-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="border-purple-200 focus:border-purple-600 dark:border-purple-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Senha</label>
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
                    <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
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

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed">
                      Declaro que tenho <strong>18 anos ou mais</strong> e aceito os{" "}
                      <Link href="/terms" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link href="/privacy" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                        Política de Privacidade
                      </Link>
                      . Estou ciente de que este é um serviço educacional e não substitui acompanhamento médico profissional.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6"
                  >
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
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
                  <Button
                    onClick={handleGoogleRegister}
                    variant="outline"
                    className="w-full border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                  >
                    Continuar com Google
                  </Button>
                </motion.div>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                    Fazer login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}