"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  LogOut,
  MessageCircle,
  Zap,
  Trophy,
  Brain,
  Star,
  User,
  Target,
  Activity,
  CheckCircle,
  Award,
  CreditCard,
  Shield,
  Mail,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  Camera,
  Crown,
  Gift,
  ChevronDown,
  Flame,
  Wind,
  Heart,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  
  // Modal states for account management
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Sample data
  const [dashboardStats, setDashboardStats] = useState({
    currentStreak: 7,
    completedToday: 3,
    totalExercises: 24,
    weeklyGoal: 15,
    unlockedLevel: 2,
    todayProgress: 125
  })

  const [currentPlan, setCurrentPlan] = useState({
    name: "Plano Gratuito",
    price: "R$ 0",
    period: "/mês",
    features: [
      "5 conversas por dia",
      "Exercícios básicos",
      "Relatórios semanais"
    ]
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const getFirstName = () => {
    return session?.user?.name?.split(' ')[0] || 'Usuário'
  }

  // Handlers
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem')
      return
    }
    
    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('Senha alterada com sucesso!')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      alert('Erro ao alterar senha')
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail || !emailPassword) {
      alert('Preencha todos os campos')
      return
    }

    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert(data.message || 'Email de confirmação enviado!')
        setShowEmailModal(false)
        setNewEmail('')
        setEmailPassword('')
      } else {
        alert(data.error || 'Erro ao alterar email')
      }
    } catch (error) {
      alert('Erro ao alterar email')
    }
  }

  const handleNameChange = async () => {
    if (!newName || newName.trim().length < 2) {
      alert('Nome deve ter pelo menos 2 caracteres')
      return
    }

    try {
      const response = await fetch('/api/auth/change-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('Nome alterado com sucesso!')
        setShowNameModal(false)
        setNewName('')
        window.location.reload()
      } else {
        alert(data.error || 'Erro ao alterar nome')
      }
    } catch (error) {
      alert('Erro ao alterar nome')
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      alert('Selecione uma imagem')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await fetch('/api/auth/change-avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('Foto alterada com sucesso!')
        setShowAvatarModal(false)
        setSelectedFile(null)
        window.location.reload()
      } else {
        alert(data.error || 'Erro ao alterar foto')
      }
    } catch (error) {
      alert('Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleAccountDelete = async () => {
    if (deleteConfirmation !== 'EXCLUIR') {
      alert('Digite "EXCLUIR" para confirmar')
      return
    }
    
    if (!deletePassword) {
      alert('Digite sua senha para confirmar')
      return
    }

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword, confirmation: deleteConfirmation }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('Conta excluída com sucesso.')
        await signOut({ callbackUrl: "/" })
      } else {
        alert(data.error || 'Erro ao excluir conta')
      }
    } catch (error) {
      alert('Erro ao excluir conta')
    }
  }

  const handlePlanSelection = async (planId: string, planName: string) => {
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, planName }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          alert(data.message || 'Plano selecionado com sucesso!')
        }
      } else {
        alert(data.error || 'Erro ao processar plano')
      }
    } catch (error) {
      alert('Erro na seleção de plano')
    }
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-900">
      {/* Header Principal */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                {getGreeting()}, {getFirstName()}! 👋
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                Bem-vindo ao seu painel de controle personalizado
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS - DESTACADA NO TOPO */}
      <div className="bg-gradient-to-r from-purple-500/10 via-white to-cyan-500/10 dark:from-purple-900/30 dark:via-slate-800/50 dark:to-cyan-900/30 border-b border-purple-200 dark:border-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">
            🎯 Navegue pelas suas funcionalidades
          </h2>
          <div className="flex flex-wrap justify-center gap-6 overflow-x-auto">
            {[
              { id: "overview", label: "📊 Visão Geral", icon: Activity, color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
              { id: "exercises", label: "⚡ Exercícios", icon: Zap, color: "from-yellow-500 to-orange-500", bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
              { id: "progress", label: "📈 Progresso", icon: TrendingUp, color: "from-green-500 to-green-600", bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
              { id: "insights", label: "🧠 Insights", icon: Brain, color: "from-purple-500 to-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
              { id: "account", label: "👤 Minha Conta", icon: User, color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
              { id: "subscription", label: "⭐ Planos", icon: Star, color: "from-amber-500 to-yellow-500", bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-4 px-10 py-6 text-lg font-bold rounded-2xl transition-all duration-300 whitespace-nowrap min-w-fit border-2 shadow-xl ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl shadow-purple-500/40 scale-110 border-white/30`
                      : `${tab.bg} ${tab.text} hover:scale-105 border-transparent hover:shadow-xl hover:shadow-purple-500/10`
                  }`}
                  whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-current'}`} />
                  <span className="font-bold text-lg">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white/10 rounded-2xl border-2 border-white/20"
                      initial={false}
                      transition={{ type: "spring", duration: 0.7, bounce: 0.3 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Sequência Atual",
                    value: `${dashboardStats.currentStreak}`,
                    unit: "dias",
                    icon: Flame,
                    color: "from-orange-500 to-red-500"
                  },
                  {
                    title: "Hoje",
                    value: `${dashboardStats.completedToday}`,
                    unit: "exercícios",
                    icon: CheckCircle,
                    color: "from-green-500 to-emerald-500"
                  },
                  {
                    title: "Total",
                    value: `${dashboardStats.totalExercises}`,
                    unit: "exercícios",
                    icon: Trophy,
                    color: "from-purple-500 to-purple-600"
                  },
                  {
                    title: "Nível",
                    value: `${dashboardStats.unlockedLevel}`,
                    unit: "desbloqueado",
                    icon: Star,
                    color: "from-yellow-400 to-yellow-500"
                  }
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <Card key={i} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0">
                        <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                              <p className="text-3xl font-bold">{stat.value} <span className="text-base font-normal">{stat.unit}</span></p>
                            </div>
                            <Icon className="w-10 h-10 text-white/80" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                        <MessageCircle className="w-7 h-7 text-purple-600" />
                      </div>
                      <CardTitle className="text-xl">Conversar com Clara</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      Inicie uma nova sessão de conversa para trabalhar seus sentimentos
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Começar Conversa
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("exercises")}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                        <Zap className="w-7 h-7 text-cyan-600" />
                      </div>
                      <CardTitle className="text-xl">Exercícios Rápidos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      Técnicas práticas para lidar com ansiedade e estresse
                    </p>
                    <Button variant="outline" className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                      Ver Exercícios
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Target className="w-7 h-7 text-green-600" />
                      </div>
                      <CardTitle className="text-xl">Meta Semanal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Progresso</span>
                        <span className="font-medium">{dashboardStats.completedToday}/{dashboardStats.weeklyGoal}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((dashboardStats.completedToday / dashboardStats.weeklyGoal) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dashboardStats.weeklyGoal - dashboardStats.completedToday > 0 
                          ? `Faltam ${dashboardStats.weeklyGoal - dashboardStats.completedToday} exercícios para completar sua meta`
                          : "🎉 Meta semanal concluída!"
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "exercises" && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">⚡ Exercícios de Bem-estar</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Técnicas práticas para seu desenvolvimento pessoal</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: "Respiração Consciente",
                    description: "Técnica de respiração profunda para reduzir ansiedade",
                    duration: "5 min",
                    level: 1,
                    category: "Ansiedade",
                    completed: true,
                    icon: Wind,
                    color: "from-blue-400 to-blue-600"
                  },
                  {
                    id: 2,
                    title: "Diálogo Interno Positivo",
                    description: "Exercício para reformular pensamentos negativos",
                    duration: "10 min", 
                    level: 1,
                    category: "Autoestima",
                    completed: true,
                    icon: MessageCircle,
                    color: "from-green-400 to-green-600"
                  },
                  {
                    id: 3,
                    title: "Visualização Guiada",
                    description: "Técnica de relaxamento através da imaginação",
                    duration: "15 min",
                    level: 2,
                    category: "Estresse",
                    completed: false,
                    icon: Brain,
                    color: "from-purple-400 to-purple-600"
                  },
                  {
                    id: 4,
                    title: "Gratidão Diária",
                    description: "Prática de reconhecimento de aspectos positivos",
                    duration: "7 min",
                    level: 2,
                    category: "Bem-estar",
                    completed: false,
                    icon: Heart,
                    color: "from-pink-400 to-pink-600"
                  }
                ].map((exercise) => {
                  const Icon = exercise.icon
                  return (
                    <Card key={exercise.id} className="border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 bg-gradient-to-r ${exercise.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${exercise.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {exercise.completed ? '✓ Concluído' : 'Pendente'}
                          </span>
                          <span className="text-xs text-slate-500">{exercise.duration}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{exercise.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{exercise.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">{exercise.category}</span>
                          <Button size="sm" variant={exercise.completed ? "outline" : "default"}>
                            {exercise.completed ? 'Revisar' : 'Começar'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "progress" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">📈 Seu Progresso</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Acompanhe sua jornada de desenvolvimento</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl">Humor Semanal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { name: 'Seg', mood: 7, energy: 6 },
                          { name: 'Ter', mood: 6, energy: 7 },
                          { name: 'Qua', mood: 8, energy: 8 },
                          { name: 'Qui', mood: 7, energy: 6 },
                          { name: 'Sex', mood: 9, energy: 9 },
                          { name: 'Sáb', mood: 8, energy: 8 },
                          { name: 'Dom', mood: 7, energy: 7 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} />
                          <Line type="monotone" dataKey="energy" stroke="#06b6d4" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl">Conquistas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { title: "Primeiro Passo", description: "Completou o primeiro exercício", icon: "🎯", unlocked: true },
                        { title: "Sequência de 7 dias", description: "Manteve consistência por uma semana", icon: "🔥", unlocked: true },
                        { title: "Explorador", description: "Testou 5 exercícios diferentes", icon: "🧭", unlocked: false },
                        { title: "Dedicação Total", description: "30 dias consecutivos", icon: "💎", unlocked: false },
                      ].map((achievement, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${achievement.unlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${achievement.unlocked ? 'text-green-800' : 'text-gray-600'}`}>{achievement.title}</h4>
                            <p className={`text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-500'}`}>{achievement.description}</p>
                          </div>
                          {achievement.unlocked ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">🧠 Insights Personalizados</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Análises baseadas no seu progresso</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-600" />
                      Padrões Identificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Horário Ideal</h4>
                      <p className="text-blue-600 text-sm">Você tem mais energia pela manhã. Considere fazer exercícios às 9h.</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Progresso Consistente</h4>
                      <p className="text-green-600 text-sm">Sua sequência de 7 dias mostra dedicação. Continue assim!</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Target className="w-6 h-6 text-green-600" />
                      Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Próximo Exercício</h4>
                      <p className="text-purple-600 text-sm">Baseado no seu progresso, recomendamos "Visualização Guiada".</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Meta da Semana</h4>
                      <p className="text-yellow-600 text-sm">Você está a 2 exercícios de bater seu recorde pessoal!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">👤 Minha Conta</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Gerencie suas informações pessoais e preferências</p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Info */}
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="w-6 h-6 text-purple-600" />
                      Informações do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{session?.user?.name}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{session?.user?.email}</p>
                      </div>
                      <Button variant="outline" onClick={() => setShowAvatarModal(true)}>
                        <Camera className="w-4 h-4 mr-2" />
                        Alterar Foto
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="w-6 h-6 text-green-600" />
                      Configurações de Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => setShowNameModal(true)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-600" />
                          <div className="text-left">
                            <div className="font-semibold">Alterar Nome</div>
                            <div className="text-sm text-slate-600">Atualize seu nome de exibição</div>
                          </div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => setShowEmailModal(true)}
                      >
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-green-600" />
                          <div className="text-left">
                            <div className="font-semibold">Alterar Email</div>
                            <div className="text-sm text-slate-600">Modifique seu endereço de email</div>
                          </div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-purple-600" />
                          <div className="text-left">
                            <div className="font-semibold">Alterar Senha</div>
                            <div className="text-sm text-slate-600">Atualize sua senha de acesso</div>
                          </div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div className="text-left">
                            <div className="font-semibold">Excluir Conta</div>
                            <div className="text-sm text-red-500">Remover permanentemente</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "subscription" && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">⭐ Planos e Assinatura</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Escolha o plano ideal para sua jornada</p>
              </div>

              <div className="max-w-4xl mx-auto">
                {/* Current Plan */}
                <Card className="border-purple-200 dark:border-purple-800 mb-8">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                      Plano Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPlan.name}</h3>
                        <p className="text-3xl font-bold text-purple-600">{currentPlan.price}<span className="text-base font-normal text-slate-600">{currentPlan.period}</span></p>
                      </div>
                      <div className="text-right">
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {currentPlan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: "free",
                      name: "Gratuito",
                      price: "R$ 0",
                      period: "/mês",
                      popular: false,
                      features: [
                        "5 conversas por dia",
                        "Exercícios básicos",
                        "Relatórios semanais"
                      ],
                      color: "from-gray-400 to-gray-600"
                    },
                    {
                      id: "premium",
                      name: "Premium",
                      price: "R$ 19,90",
                      period: "/mês",
                      popular: true,
                      features: [
                        "Conversas ilimitadas",
                        "Todos os exercícios",
                        "Relatórios detalhados",
                        "Suporte prioritário",
                        "Análises avançadas"
                      ],
                      color: "from-purple-500 to-purple-600"
                    },
                    {
                      id: "pro",
                      name: "Professional",
                      price: "R$ 39,90",
                      period: "/mês",
                      popular: false,
                      features: [
                        "Tudo do Premium",
                        "Sessões com psicólogos",
                        "Planos personalizados",
                        "Acesso prioritário",
                        "Consultoria 1:1"
                      ],
                      color: "from-amber-500 to-yellow-500"
                    }
                  ].map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`border-2 transition-all duration-300 hover:shadow-lg relative ${
                        plan.popular ? 'border-purple-500 shadow-lg' : 'border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Mais Popular
                          </div>
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                          {plan.popular ? <Crown className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <div>
                          <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                          <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                          onClick={() => handlePlanSelection(plan.id, plan.name)}
                        >
                          {currentPlan.name === plan.name ? 'Plano Atual' : 'Escolher Plano'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg pr-10"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg pr-10"
                    placeholder="Digite a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Confirme a nova senha"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handlePasswordChange}>
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Alterar Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Novo Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite o novo email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Senha Atual</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite sua senha"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmailModal(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleEmailChange}>
                  Alterar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Name Change Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Alterar Nome</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Novo Nome</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite seu novo nome"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowNameModal(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleNameChange}>
                  Alterar Nome
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Alterar Foto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selecione uma imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAvatarModal(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleAvatarUpload} disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Alterar Foto'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Excluir Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.</p>
              <div>
                <label className="block text-sm font-medium mb-2">Digite "EXCLUIR" para confirmar</label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite EXCLUIR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite sua senha"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleAccountDelete}>
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}