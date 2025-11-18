"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { 
  Users, 
  UserPlus, 
  Bell, 
  TrendingUp, 
  Calendar,
  Brain,
  Search,
  ArrowRight,
  ClipboardList,
  MessageSquare
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Stats {
  totalPatients: number
  activePatients: number
  unreadNotifications: number
  sessionsThisWeek: number
}

export default function ProfessionalDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    activePatients: 0,
    unreadNotifications: 0,
    sessionsThisWeek: 0
  })
  const [claimCode, setClaimCode] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Buscar profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData?.role !== 'professional') {
        // Não é profissional, redireciona para dashboard normal
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
      
      // Carregar dados
      await Promise.all([
        loadPatients(session.user.id),
        loadStats(session.user.id)
      ])
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async (userId: string) => {
    const { data, error } = await supabase
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
      .eq('professional_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      setPatients(data as any)
    }
  }

  const loadStats = async (userId: string) => {
    // Total de pacientes
    const { count: totalCount } = await supabase
      .from('patient_professionals')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', userId)

    // Pacientes ativos
    const { count: activeCount } = await supabase
      .from('patient_professionals')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', userId)
      .eq('status', 'active')

    // Notificações não lidas
    const { count: notifCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', userId)
      .eq('is_read', false)

    setStats({
      totalPatients: totalCount || 0,
      activePatients: activeCount || 0,
      unreadNotifications: notifCount || 0,
      sessionsThisWeek: 0 // TODO: implementar quando tiver sistema de sessões
    })
  }

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setClaimLoading(true)
    setClaimError("")
    setClaimSuccess(false)

    try {
      const response = await fetch('/api/follow-codes/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: claimCode.toUpperCase() })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setClaimSuccess(true)
        setClaimCode("")
        // Recarregar lista de pacientes
        if (user) {
          await loadPatients(user.id)
          await loadStats(user.id)
        }
      } else {
        setClaimError(data.error || 'Erro ao resgatar código')
      }
    } catch (error) {
      setClaimError('Erro de conexão. Tente novamente.')
    } finally {
      setClaimLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Dashboard Profissional
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Olá, {profile?.full_name || 'Profissional'}! Bem-vindo(a) ao seu painel de controle.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total de Pacientes
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalPatients}
                  </p>
                </div>
                <Users className="w-10 h-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Pacientes Ativos
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.activePatients}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Notificações
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.unreadNotifications}
                  </p>
                </div>
                <Bell className="w-10 h-10 text-orange-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Sessões (Semana)
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.sessionsThisWeek}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-cyan-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resgatar Código */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Adicionar Paciente
                </CardTitle>
                <CardDescription>
                  Insira o código compartilhado pelo paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClaimCode} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Ex: A3B5C7D9"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="text-center text-lg font-mono tracking-wider"
                  />
                  
                  {claimError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                      {claimError}
                    </div>
                  )}
                  
                  {claimSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
                      Paciente vinculado com sucesso!
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={claimLoading || claimCode.length !== 8}
                    className="w-full"
                  >
                    {claimLoading ? 'Resgatando...' : 'Resgatar Código'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Link href="/pro/notifications">
                    <Button variant="outline" className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      Ver Notificações
                      {stats.unreadNotifications > 0 && (
                        <span className="ml-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {stats.unreadNotifications}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pacientes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Pacientes Recentes
                    </CardTitle>
                    <CardDescription>
                      Seus pacientes vinculados mais recentemente
                    </CardDescription>
                  </div>
                  <Link href="/pro/patients">
                    <Button variant="outline" size="sm">
                      Ver Todos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      Nenhum paciente vinculado ainda
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Use um código de acompanhamento para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patients.map((patient) => (
                      <Link
                        key={patient.id}
                        href={`/pro/patients/${patient.patient_id}`}
                      >
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-semibold text-lg">
                            {patient.patient_profile?.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {patient.patient_profile?.full_name || 'Sem nome'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {patient.patient_profile?.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <ClipboardList className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/pro/patients">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Todos os Pacientes
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Ver lista completa e detalhes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pro/claim">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <UserPlus className="w-10 h-10 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Resgatar Código
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Adicionar novo paciente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pro/notifications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Bell className="w-10 h-10 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Notificações
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stats.unreadNotifications} não lidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
