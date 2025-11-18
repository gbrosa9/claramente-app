"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Users, Search, Filter, ArrowLeft, Calendar, MessageSquare, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Patient {
  id: string
  patient_id: string
  status: string
  created_at: string
  patient_profile: {
    full_name: string
    email: string
    avatar_url: string | null
  }
}

export default function PatientsListPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')

  useEffect(() => {
    loadPatients()
  }, [statusFilter])

  const loadPatients = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      let query = supabase
        .from('patient_professionals')
        .select(`
          id,
          patient_id,
          status,
          created_at,
          patient_profile:profiles!patient_professionals_patient_id_fkey(
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('professional_id', session.user.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (!error && data) {
        setPatients(data as any)
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true
    const name = patient.patient_profile?.full_name?.toLowerCase() || ''
    const email = patient.patient_profile?.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search) || email.includes(search)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pro/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Meus Pacientes
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie e acompanhe o progresso de seus pacientes
            </p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de Pacientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {patients.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pacientes Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {filteredPatients.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {searchTerm ? 'Resultados' : 'Visualizando'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum paciente vinculado'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchTerm 
                    ? 'Tente buscar com outros termos' 
                    : 'Use um código de acompanhamento para adicionar pacientes'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/pro/claim">
                    <Button>
                      Adicionar Primeiro Paciente
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/pro/patients/${patient.patient_id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="pt-6">
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                          {patient.patient_profile?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                            {patient.patient_profile?.full_name || 'Sem nome'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {patient.patient_profile?.email}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          patient.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div>
                          <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-600 dark:text-slate-400">0 sessões</p>
                        </div>
                        <div>
                          <MessageSquare className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-600 dark:text-slate-400">0 mensagens</p>
                        </div>
                        <div>
                          <TrendingUp className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-600 dark:text-slate-400">0% progresso</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
