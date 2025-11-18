"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserMinus, ArrowLeft, AlertTriangle } from "lucide-react"

interface Professional {
  id: string
  professional_id: string
  status: string
  created_at: string
  professional_name: string
  professional_email: string
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      const response = await fetch('/api/patient-professionals')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfessionals(data.professionals)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (professionalId: string) => {
    setRemoving(professionalId)
    try {
      const response = await fetch('/api/patient-professionals/remove', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ professionalId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProfessionals(professionals.filter(p => p.professional_id !== professionalId))
        setShowConfirm(null)
      } else {
        alert(data.error || 'Erro ao remover profissional')
      }
    } catch (error) {
      console.error('Erro ao remover profissional:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setRemoving(null)
    }
  }

  const activeProfessionals = professionals.filter(p => p.status === 'active')

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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profissionais</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Carregando profissionais...</p>
            </CardContent>
          </Card>
        ) : activeProfessionals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Nenhum profissional vinculado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Você ainda não tem nenhum profissional acompanhando seu progresso
              </p>
              <Link href="/dashboard">
                <Button>
                  Voltar ao Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Profissionais Vinculados ({activeProfessionals.length})
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Estes profissionais têm acesso ao seu progresso
              </p>
            </div>

            {activeProfessionals.map((professional) => (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {professional.professional_name || 'Profissional'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {professional.professional_email}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            Vinculado em: {new Date(professional.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div>
                        {showConfirm === professional.professional_id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowConfirm(null)}
                              disabled={removing !== null}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemove(professional.professional_id)}
                              disabled={removing !== null}
                              aria-label="Confirmar remoção"
                              data-testid="remove-professional"
                            >
                              {removing === professional.professional_id ? 'Removendo...' : 'Confirmar'}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setShowConfirm(professional.professional_id)}
                            disabled={removing !== null}
                            aria-label="Remover profissional"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                    {showConfirm === professional.professional_id && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                            Tem certeza?
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            O profissional será notificado e não terá mais acesso ao seu progresso.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
