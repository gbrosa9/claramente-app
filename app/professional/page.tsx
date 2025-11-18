"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Download, Filter, Plus, TrendingUp, AlertCircle, CheckCircle2, Bell, User, LogOut, Settings, Activity, Calendar, Users, BarChart3, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const patientData = [
  {
    id: 1,
    name: "Ana Silva",
    status: "Progresso",
    lastSession: "2h ago",
    mood: 7.5,
    risk: "Low",
    diagnosis: "Ansiedade",
    protocol: "TCC",
  },
  {
    id: 2,
    name: "João Santos",
    status: "Ativo",
    lastSession: "1d ago",
    mood: 5.2,
    risk: "Medium",
    diagnosis: "Depressão",
    protocol: "DBT",
  },
  {
    id: 3,
    name: "Maria Oliveira",
    status: "Progresso",
    lastSession: "3h ago",
    mood: 8.1,
    risk: "Low",
    diagnosis: "Fobia Social",
    protocol: "TCC",
  },
  {
    id: 4,
    name: "Pedro Costa",
    status: "Preocupante",
    lastSession: "5d ago",
    mood: 3.8,
    risk: "High",
    diagnosis: "Depressão Severa",
    protocol: "Combinado",
  },
  {
    id: 5,
    name: "Carla Mendes",
    status: "Ativo",
    lastSession: "2d ago",
    mood: 6.3,
    risk: "Low",
    diagnosis: "Ansiedade Generalizada",
    protocol: "TCC",
  },
]

const outcomeData = [
  { week: "Sem 1", improved: 65, stable: 25, declined: 10 },
  { week: "Sem 2", improved: 72, stable: 20, declined: 8 },
  { week: "Sem 3", improved: 68, stable: 24, declined: 8 },
  { week: "Sem 4", improved: 75, stable: 18, declined: 7 },
]

const sessionTrendData = [
  { date: "Seg", sessions: 8, completed: 8, rating: 4.5 },
  { date: "Ter", sessions: 10, completed: 9, rating: 4.6 },
  { date: "Qua", sessions: 12, completed: 11, rating: 4.7 },
  { date: "Qui", sessions: 9, completed: 9, rating: 4.5 },
  { date: "Sex", sessions: 14, completed: 13, rating: 4.8 },
  { date: "Sab", sessions: 6, completed: 6, rating: 4.9 },
  { date: "Dom", sessions: 3, completed: 3, rating: 4.4 },
]

const treatmentMetrics = [
  { label: "Pacientes Ativos", value: "24", change: "+2", icon: TrendingUp, color: "from-purple-600 to-pink-600" },
  { label: "Taxa de Melhora", value: "72%", change: "+5%", icon: CheckCircle2, color: "from-green-600 to-teal-600" },
  { label: "Alertas Críticos", value: "3", change: "-1", icon: AlertCircle, color: "from-orange-600 to-red-600" },
  { label: "Protocolo Compliance", value: "94%", change: "+2%", icon: TrendingUp, color: "from-blue-600 to-cyan-600" },
]

export default function ProfessionalPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  // Estados para componentes dinâmicos
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Novo paciente registrado",
      message: "Ana Silva se cadastrou na plataforma",
      type: "info",
      time: "10 min atrás"
    },
    {
      id: 2,
      title: "Sessão crítica detectada",
      message: "João Santos precisa de atenção urgente",
      type: "warning",
      time: "1 hora atrás"
    }
  ])
  
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Função para extrair o primeiro nome
  const getFirstName = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ')[0]
    }
    return 'Profissional'
  }

  // Função para saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // Função de logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-lilac-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {getGreeting()}, Dr(a). {getFirstName()}! 👨‍⚕️
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Monitore pacientes e resultados de tratamento em tempo real
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notificações */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                
                {/* Dropdown de Notificações */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 z-50"
                    >
                      <div className="p-4 border-b border-purple-200 dark:border-purple-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notificações</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                                <span className="text-xs text-slate-500 dark:text-slate-500">{notif.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button variant="outline" className="gap-2 border-purple-200 dark:border-purple-800 bg-transparent">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button>

              {/* Menu do usuário */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowProfile(!showProfile)}
                  className="relative"
                >
                  <User className="w-5 h-5" />
                </Button>
                
                {/* Dropdown do Perfil */}
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 z-50"
                    >
                      <div className="p-4 border-b border-purple-200 dark:border-purple-700">
                        <p className="font-semibold text-slate-900 dark:text-white">Dr(a). {getFirstName()}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{session?.user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Configurações
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Relatórios
                        </button>
                        <hr className="my-2 border-slate-200 dark:border-slate-700" />
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 border-t border-purple-200 dark:border-purple-800 pt-4">
            {["dashboard", "pacientes", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab === "dashboard" ? "Dashboard" : tab === "pacientes" ? "Pacientes" : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <>
            {/* KPI Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {treatmentMetrics.map((metric, i) => {
                const Icon = metric.icon
                return (
                  <Card key={i} className="border-purple-200 dark:border-purple-800 overflow-hidden">
                    <CardContent className="p-6">
                      <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          {metric.change} vs última semana
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Treatment Outcomes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle>Resultados de Tratamento</CardTitle>
                    <CardDescription>Últimas 4 semanas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={outcomeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="week" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="improved" stackId="a" fill="#10b981" name="Melhorado" />
                        <Bar dataKey="stable" stackId="a" fill="#8b5cf6" name="Estável" />
                        <Bar dataKey="declined" stackId="a" fill="#ef4444" name="Declínio" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Risk Assessment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Avaliação de Risco</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">Alto Risco</p>
                      <p className="text-2xl font-bold text-red-600">1 paciente</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">Risco Médio</p>
                      <p className="text-2xl font-bold text-yellow-600">2 pacientes</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-200">Baixo Risco</p>
                      <p className="text-2xl font-bold text-green-600">21 pacientes</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Session Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle>Tendência de Sessões e Satisfação</CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sessionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Sessões Agendadas"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Sessões Completadas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === "pacientes" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Pacientes</CardTitle>
                    <CardDescription>Monitore o progresso individual</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Filter className="w-4 h-4" />
                    Filtrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-purple-200"
                  />
                </div>
                <div className="space-y-3">
                  {patientData.map((patient) => (
                    <motion.div
                      key={patient.id}
                      whileHover={{ x: 4 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{patient.name}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                              {patient.diagnosis}
                            </span>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {patient.protocol}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              Última sessão: {patient.lastSession}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{patient.mood}</p>
                          <div
                            className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 ${
                              patient.risk === "Low"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : patient.risk === "Medium"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {patient.risk === "Low"
                              ? "✓ Estável"
                              : patient.risk === "Medium"
                                ? "⚠ Atenção"
                                : "⚠ Crítico"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle>Análise de Efetividade Terapêutica</CardTitle>
                <CardDescription>Métricas de sucesso do tratamento</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">85%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Taxa de Remissão</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">4.7/5</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Satisfação Média</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Sessões Médias</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
