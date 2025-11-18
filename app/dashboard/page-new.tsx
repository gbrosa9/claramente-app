"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  LogOut,
  MessageCircle,
  Settings,
  Zap,
  Trophy,
  Brain,
  Heart,
  Wind,
  Flame,
  Star,
  Lock,
  ChevronRight,
  Bell,
  User,
  Target,
  Activity,
  CheckCircle,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface DashboardStats {
  currentStreak: number
  messagesToday: number
  totalMessages: number
  userLevel: number
  completionRate: number
}

interface MoodData {
  date: string
  mood: number
}

interface ActivityData {
  day: string
  exercises: number
}

interface Achievement {
  milestone: string
  completed: boolean
  date: Date | null
}

interface TimeStats {
  totalTime: string
  weeklyMessages: number
  averageDaily: number
}

const exercisesAvailable = [
  {
    id: "breathing",
    name: "Respiração 4-7-8",
    description: "Técnica calmante para ansiedade",
    icon: Wind,
    color: "from-cyan-600 to-blue-600",
    duration: "5 min",
    level: 1,
    completed: 0,
    benefits: ["Reduz ansiedade", "Melhora foco"],
  },
  {
    id: "gratitude",
    name: "Diário de Gratidão",
    description: "Reflexão diária positiva",
    icon: Heart,
    color: "from-pink-600 to-red-600",
    duration: "8 min",
    level: 1,
    completed: 1,
    benefits: ["Aumenta bem-estar", "Melhora humor"],
  },
  {
    id: "mindfulness",
    name: "Atenção Plena",
    description: "Exercício de consciência presente",
    icon: Brain,
    color: "from-purple-600 to-pink-600",
    duration: "10 min",
    level: 2,
    completed: 0,
    benefits: ["Reduz stress", "Aumenta clareza"],
  },
  {
    id: "visualization",
    name: "Visualização Guiada",
    description: "Imagine um lugar seguro",
    icon: Trophy,
    color: "from-indigo-600 to-purple-600",
    duration: "12 min",
    level: 3,
    completed: 2,
    benefits: ["Reduz stress", "Melhora autoestima"],
  },
]

const streakData = [
  { day: "Seg", exercises: 2 },
  { day: "Ter", exercises: 3 },
  { day: "Qua", exercises: 1 },
  { day: "Qui", exercises: 2 },
  { day: "Sex", exercises: 3 },
  { day: "Sab", exercises: 2 },
  { day: "Dom", exercises: 3 },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("exercises")
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats
    weeklyMood: MoodData[]
    weeklyActivity: ActivityData[]
    achievements: Achievement[]
    timeStats: TimeStats
  } | null>(null)

  // Estados para componentes dinâmicos
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nova sessão disponível",
      message: "Exercício de respiração recomendado",
      type: "info",
      time: "5 min atrás"
    },
    {
      id: 2,
      title: "Parabéns! Meta atingida",
      message: "Você completou 5 exercícios esta semana",
      type: "success",
      time: "1 hora atrás"
    }
  ])
  
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (data.ok) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use real data or fallback to defaults
  const stats = dashboardData?.stats || {
    currentStreak: 0,
    messagesToday: 0,
    totalMessages: 0,
    userLevel: 1,
    completionRate: 0
  }
  
  const moodData = dashboardData?.weeklyMood || []
  const weeklyActivity = dashboardData?.weeklyActivity || streakData
  const achievements = dashboardData?.achievements || []
  const timeStats = dashboardData?.timeStats || {
    totalTime: "0h 0m",
    weeklyMessages: 0,
    averageDaily: 0
  }

  const totalExercises = stats.totalMessages
  const currentStreak = stats.currentStreak
  const completedToday = stats.messagesToday
  const unlockedLevel = stats.userLevel

  // Função para extrair o primeiro nome
  const getFirstName = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ')[0]
    }
    return 'Usuário'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              {getGreeting()}, {getFirstName()}! 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Acompanhe seu progresso e bem-estar</p>
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
                              notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
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

            <Link href="/chat">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700">
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
            </Link>

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
                      <p className="font-semibold text-slate-900 dark:text-white">{getFirstName()}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{session?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Configurações
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Histórico
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
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {[
                { 
                  label: "Sequência", 
                  value: `${currentStreak}`, 
                  unit: "dias", 
                  icon: Flame, 
                  color: "from-orange-600 to-red-600"
                },
                { 
                  label: "Hoje", 
                  value: `${completedToday}`, 
                  unit: "exercícios", 
                  icon: Zap, 
                  color: "from-yellow-600 to-orange-600"
                },
                { 
                  label: "Esta Semana", 
                  value: `${totalExercises}`, 
                  unit: "interações", 
                  icon: Trophy, 
                  color: "from-purple-600 to-pink-600"
                },
                { 
                  label: "Nível", 
                  value: `${unlockedLevel}`, 
                  unit: "progresso", 
                  icon: Star, 
                  color: "from-cyan-600 to-blue-600"
                },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="border-purple-200 dark:border-purple-800 overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">{stat.unit}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        Meta Semanal
                      </CardTitle>
                      <CardDescription>Progresso para seus objetivos</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{Math.min(85, (completedToday + currentStreak) * 10)}%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Concluído</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(85, (completedToday + currentStreak) * 10)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 h-3 rounded-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">Chat Diário</p>
                      </div>
                      <div>
                        <Activity className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">Exercícios</p>
                      </div>
                      <div>
                        <Award className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">Reflexões</p>
                      </div>
                      <div>
                        <Target className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">Bem-estar</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle>Atividade Esta Semana</CardTitle>
                  <CardDescription>Interações diárias com Clara</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="exercises" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-slate-700">
              {[
                { id: "exercises", label: "Exercícios" },
                { id: "progress", label: "Progresso" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-purple-600 border-purple-600"
                      : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "exercises" && (
              <div className="space-y-6">
                {/* Level info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-300 dark:border-purple-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nível {unlockedLevel}</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {unlockedLevel >= 3
                          ? "Avançado - Técnicas avançadas de regulação emocional"
                          : unlockedLevel >= 2
                            ? "Intermediário - Combine técnicas de atenção plena"
                            : "Iniciante - Domine técnicas básicas de respiração"}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </motion.div>

                {/* Exercise grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exercisesAvailable.map((exercise, idx) => {
                    const Icon = exercise.icon
                    const isLocked = exercise.level > unlockedLevel
                    return (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        whileHover={{ scale: isLocked ? 1 : 1.02 }}
                        className={isLocked ? "opacity-60" : ""}
                      >
                        <Card className="border-purple-200 dark:border-purple-800 h-full">
                          <CardContent className="p-6">
                            <div className={`p-4 rounded-lg bg-gradient-to-br ${exercise.color} mb-4`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{exercise.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{exercise.description}</p>

                            <div className="flex items-center justify-between mb-4">
                              <span className="text-slate-600 dark:text-slate-400">⏱ {exercise.duration}</span>
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-semibold">
                                Nível {exercise.level}
                              </span>
                            </div>

                            {!isLocked && (
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Benefícios:</p>
                                <div className="flex flex-wrap gap-1">
                                  {exercise.benefits.map((benefit, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded text-xs"
                                    >
                                      {benefit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => window.location.href = '/chat'}
                              className={`w-full ${
                                isLocked
                                  ? "bg-gray-300 dark:bg-slate-700 text-gray-600 dark:text-slate-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                              }`}
                              disabled={isLocked}
                            >
                              {isLocked ? (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Desbloqueie no Nível {exercise.level}
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Começar
                                  <ChevronRight className="w-4 h-4 ml-auto" />
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
                  <CardHeader>
                    <CardTitle>Suas Conquistas</CardTitle>
                    <CardDescription>Milestones que você desbloqueou</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { milestone: "Primeira Sessão", completed: true },
                        { milestone: "5 Conversas Completas", completed: false },
                        { milestone: "Sequência de 7 Dias", completed: false },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              item.completed
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-400"
                            }`}
                          >
                            {item.completed ? <CheckCircle className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{item.milestone}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.completed ? "Concluído!" : "Em progresso..."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}