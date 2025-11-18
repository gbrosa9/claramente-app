"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Settings, BarChart3, Activity, Shield, AlertTriangle, CheckCircle, Zap, Bell, User, LogOut, Calendar, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const systemMetrics = [
  { time: "00:00", users: 120, sessions: 145, errors: 2 },
  { time: "04:00", users: 89, sessions: 102, errors: 1 },
  { time: "08:00", users: 250, sessions: 320, errors: 3 },
  { time: "12:00", users: 380, sessions: 450, errors: 2 },
  { time: "16:00", users: 420, sessions: 520, errors: 4 },
  { time: "20:00", users: 350, sessions: 420, errors: 2 },
]

const errorTrendData = [
  { time: "00:00", errors: 2 },
  { time: "04:00", errors: 1 },
  { time: "08:00", errors: 3 },
  { time: "12:00", errors: 2 },
  { time: "16:00", errors: 4 },
  { time: "20:00", errors: 2 },
]

const adminStats = [
  { label: "Usuários Totais", value: "1,240", change: "+45", icon: Users, color: "from-purple-600 to-pink-600" },
  { label: "Profissionais", value: "45", change: "+2", icon: Shield, color: "from-blue-600 to-cyan-600" },
  { label: "Uptime", value: "99.8%", change: "-0.1%", icon: CheckCircle, color: "from-green-600 to-teal-600" },
  { label: "Taxa de Uso", value: "82%", change: "+5%", icon: Zap, color: "from-orange-600 to-red-600" },
]

export default function AdminPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")

  // Estados para componentes dinâmicos
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Sistema com alta demanda",
      message: "450+ usuários ativos simultaneamente",
      type: "warning",
      time: "5 min atrás"
    },
    {
      id: 2,
      title: "Backup realizado com sucesso",
      message: "Backup automático das 02:00h concluído",
      type: "success",
      time: "2 horas atrás"
    }
  ])
  
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Função para extrair o primeiro nome
  const getFirstName = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ')[0]
    }
    return 'Admin'
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {getGreeting()}, {getFirstName()}! 🛡️
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">ClaraMENTE - Painel Administrativo</p>
              </div>
            </Link>

            {/* Menu superior direito */}
            <div className="flex items-center gap-3">
              {/* Notificações */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
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
                        <h3 className="font-semibold text-slate-900 dark:text-white">Alertas do Sistema</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'
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

              {/* Menu do usuário */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                
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
                        <p className="font-semibold text-slate-900 dark:text-white">{getFirstName()}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Administrador</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{session?.user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Configurações Avançadas
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Relatórios do Sistema
                        </button>
                        <hr className="my-2 border-slate-200 dark:border-slate-700" />
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair do Sistema
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "overview", label: "Visão Geral", icon: BarChart3 },
              { id: "users", label: "Usuários", icon: Users },
              { id: "protocols", label: "Protocolos", icon: Activity },
              { id: "settings", label: "Configurações", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {adminStats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <Card key={i} className="border-purple-200 dark:border-purple-800 overflow-hidden">
                    <CardContent className="p-6">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        <p
                          className={`text-xs ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"} mt-2`}
                        >
                          {stat.change}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </motion.div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* System Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle>Usuários Ativos</CardTitle>
                    <CardDescription>Últimas 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={systemMetrics}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                          name="Usuários Ativos"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Error Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle>Erros do Sistema</CardTitle>
                    <CardDescription>Taxa de erro nas últimas 24h</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={errorTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="errors"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444" }}
                          name="Erros"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Activity Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>Eventos importantes do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Novo usuário criado",
                        user: "João Silva",
                        time: "2 min atrás",
                        icon: Users,
                        severity: "info",
                      },
                      {
                        action: "Protocolo atualizado",
                        user: "PHQ-9 v2.0",
                        time: "1 hora atrás",
                        icon: Activity,
                        severity: "info",
                      },
                      {
                        action: "Erro do sistema resolvido",
                        user: "API timeout",
                        time: "3 horas atrás",
                        icon: CheckCircle,
                        severity: "success",
                      },
                      {
                        action: "Aviso de carga alta",
                        user: "CPU 92%",
                        time: "5 horas atrás",
                        icon: AlertTriangle,
                        severity: "warning",
                      },
                    ].map((log, i) => {
                      const Icon = log.icon
                      return (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        >
                          <div
                            className={`p-2 rounded-lg ${log.severity === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" : log.severity === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}
                          >
                            <Icon
                              className={`w-4 h-4 ${log.severity === "warning" ? "text-yellow-600" : log.severity === "success" ? "text-green-600" : "text-blue-600"}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">{log.action}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{log.user}</p>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {log.time}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === "users" && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Input placeholder="Buscar usuário..." className="border-purple-200 flex-1" />
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Novo Usuário</Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Interface de gerenciamento de usuários. Controle permissões, roles e acesso à plataforma.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "protocols" && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>Gerenciar Protocolos Terapêuticos</CardTitle>
              <CardDescription>Configure escalas de avaliação e protocolos de tratamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["PHQ-9 (Depressão)", "GAD-7 (Ansiedade)", "Protocolo TCC", "Escalas de Bem-estar", "DASS-21"].map(
                (protocol, i) => (
                  <motion.div
                    key={protocol}
                    whileHover={{ x: 4 }}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{protocol}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm">
                        Versão
                      </Button>
                    </div>
                  </motion.div>
                ),
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Gerencie configurações gerais da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                  Manutenção do Sistema
                </label>
                <Button variant="outline">Agendar Manutenção</Button>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">Backups</label>
                <Button variant="outline">Executar Backup Agora</Button>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                  Logs e Monitoramento
                </label>
                <Button variant="outline">Visualizar Logs</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
