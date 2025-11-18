"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, ArrowLeft, UserPlus } from "lucide-react"

export default function ClaimCodePage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [patientId, setPatientId] = useState("")

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/follow-codes/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPatientId(data.patientId)
        setSuccess(true)
      } else {
        setError(data.error || 'Erro ao resgatar código')
      }
    } catch (error) {
      console.error('Erro ao resgatar código:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Paciente Vinculado!</CardTitle>
              <CardDescription>
                Você agora pode acompanhar o progresso deste paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link href="/dashboard">
                  <Button className="w-full">
                    Ir para Dashboard
                  </Button>
                </Link>
                <Link href="/pro/claim">
                  <Button variant="outline" className="w-full">
                    Resgatar Outro Código
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resgatar Código</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Vincular Paciente</CardTitle>
              <CardDescription>
                Digite o código fornecido pelo paciente para começar a acompanhá-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClaim} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Código de Acompanhamento
                  </label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="EX: AB12CD34"
                    maxLength={8}
                    required
                    disabled={loading}
                    className="text-lg font-mono uppercase text-center"
                    aria-label="Digite o código de acompanhamento"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Digite o código de 8 caracteres fornecido pelo paciente
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Como funciona?
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• O paciente gera um código no dashboard dele</li>
                    <li>• Você digita o código aqui para se vincular</li>
                    <li>• Após vinculado, poderá acompanhar o progresso</li>
                    <li>• O código expira em 48 horas</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={loading || code.length < 8}
                  className="w-full"
                  aria-label="Resgatar código"
                  data-testid="claim-code"
                >
                  {loading ? 'Resgatando...' : 'Resgatar Código'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
