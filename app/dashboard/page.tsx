"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  Gift,
  ChevronDown,
  Flame,
  Wind,
  Heart,
  Bell,
  Users,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  
  // Modal states for account management
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Loading states for better UX
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Follow code states
  const [followCode, setFollowCode] = useState<string | null>(null)
  const [followCodeExpires, setFollowCodeExpires] = useState<string>('')
  const [generatingCode, setGeneratingCode] = useState(false)
  
  // Toast notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    show: boolean
  }>({
    type: 'success',
    message: '',
    show: false
  })

  // Sample data
  const [dashboardStats, setDashboardStats] = useState({
    currentStreak: 7,
    completedToday: 3,
    totalExercises: 24,
    weeklyGoal: 15,
    unlockedLevel: 2,
    todayProgress: 125
  })

  // Função para obter plano atual com fallback
  const getCurrentPlan = () => {
    if (currentSubscription && availablePlans.length > 0) {
      const plan = availablePlans.find(p => p.id === currentSubscription.plan_id)
      if (plan) {
        return {
          name: plan.name,
          price: `R$ ${plan.price.toFixed(2)}`,
          period: `/${plan.period === 'month' ? 'mês' : 'ano'}`,
          features: Array.isArray(plan.features) ? plan.features : 
                   typeof plan.features === 'string' ? JSON.parse(plan.features) : []
        }
      }
    }
    
    // Fallback para plano gratuito
    return {
      name: "Plano Gratuito",
      price: "R$ 0",
      period: "/mês", 
      features: [
        "5 conversas por dia",
        "Exercícios básicos",
        "Relatórios semanais"
      ]
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const getFirstName = () => {
    return session?.user?.name?.split(' ')[0] || 'Usuário'
  }

  // Utility function to show notifications
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, show: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  // Enhanced validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateName = (name: string) => {
    return name.trim().length >= 2 && name.trim().length <= 100
  }

  // Handlers
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      showNotification('error', 'Erro ao fazer logout')
    }
  }

  const handlePasswordChange = async () => {
    setPasswordLoading(true)
    
    try {
      // Validações
      if (!currentPassword.trim()) {
        showNotification('error', 'Digite sua senha atual')
        setPasswordLoading(false)
        return
      }

      if (!newPassword.trim()) {
        showNotification('error', 'Digite uma nova senha')
        setPasswordLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        showNotification('error', 'As senhas não coincidem')
        setPasswordLoading(false)
        return
      }
      
      if (!validatePassword(newPassword)) {
        showNotification('error', 'A nova senha deve ter pelo menos 6 caracteres')
        setPasswordLoading(false)
        return
      }

      if (currentPassword === newPassword) {
        showNotification('warning', 'A nova senha deve ser diferente da atual')
        setPasswordLoading(false)
        return
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showNotification('success', 'Senha alterada com sucesso!')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowPassword(false)
        setShowNewPassword(false)
      } else {
        showNotification('error', data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      showNotification('error', 'Erro de conexão. Tente novamente.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async () => {
    setEmailLoading(true)
    
    try {
      // Validações
      if (!newEmail.trim()) {
        showNotification('error', 'Digite o novo email')
        setEmailLoading(false)
        return
      }

      if (!emailPassword.trim()) {
        showNotification('error', 'Digite sua senha atual')
        setEmailLoading(false)
        return
      }

      if (!validateEmail(newEmail)) {
        showNotification('error', 'Digite um email válido')
        setEmailLoading(false)
        return
      }

      if (newEmail.toLowerCase() === session?.user?.email?.toLowerCase()) {
        showNotification('warning', 'O novo email deve ser diferente do atual')
        setEmailLoading(false)
        return
      }

      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newEmail.toLowerCase().trim(), password: emailPassword }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showNotification('success', data.message || 'Email de confirmação enviado! Verifique sua caixa de entrada.')
        setShowEmailModal(false)
        setNewEmail('')
        setEmailPassword('')
      } else {
        showNotification('error', data.error || 'Erro ao alterar email')
      }
    } catch (error) {
      showNotification('error', 'Erro de conexão. Tente novamente.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleNameChange = async () => {
    setNameLoading(true)
    
    try {
      if (!newName.trim()) {
        showNotification('error', 'Digite o novo nome')
        setNameLoading(false)
        return
      }

      if (!validateName(newName)) {
        showNotification('error', 'Nome deve ter entre 2 e 100 caracteres')
        setNameLoading(false)
        return
      }

      if (newName.trim() === session?.user?.name) {
        showNotification('warning', 'O novo nome deve ser diferente do atual')
        setNameLoading(false)
        return
      }

      const response = await fetch('/api/auth/change-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showNotification('success', 'Nome alterado com sucesso!')
        setShowNameModal(false)
        setNewName('')
        // Recarregar para atualizar a sessão
        setTimeout(() => window.location.reload(), 1000)
      } else {
        showNotification('error', data.error || 'Erro ao alterar nome')
      }
    } catch (error) {
      showNotification('error', 'Erro de conexão. Tente novamente.')
    } finally {
      setNameLoading(false)
    }
  }

  const handleAccountDelete = async () => {
    setDeleteLoading(true)
    
    try {
      if (deleteConfirmation !== 'EXCLUIR') {
        showNotification('error', 'Digite "EXCLUIR" para confirmar (em maiúsculas)')
        setDeleteLoading(false)
        return
      }
      
      if (!deletePassword.trim()) {
        showNotification('error', 'Digite sua senha para confirmar')
        setDeleteLoading(false)
        return
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword, confirmation: deleteConfirmation }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showNotification('success', 'Conta excluída com sucesso.')
        setTimeout(async () => {
          await signOut({ callbackUrl: "/" })
        }, 2000)
      } else {
        showNotification('error', data.error || 'Erro ao excluir conta')
      }
    } catch (error) {
      showNotification('error', 'Erro de conexão. Tente novamente.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePlanSelection = async (planId: string, planName: string) => {
    if (planId === 'free') {
      showNotification('info', 'Você já está no plano gratuito!')
      return
    }

    try {
      showNotification('info', 'Processando seleção de plano...')
      
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()
      
      if (response.ok && data.url) {
        showNotification('success', 'Redirecionando para o checkout...')
        setTimeout(() => {
          window.location.href = data.url
        }, 1000)
      } else {
        showNotification('error', data.error || 'Erro ao processar plano')
      }
    } catch (error) {
      showNotification('error', 'Erro de conexão. Tente novamente.')
    }
  }

  // Navigation helpers
  const handleTabClick = (tabId: string) => {
    if (tabId === 'overview') {
      setActiveTab(tabId)
    } else if (tabId === 'exercises') {
      router.push('/exercises')
    } else if (tabId === 'subscription') {
      router.push('/planos')
    } else if (tabId === 'account') {
      // Scroll to account section instead of navigating away
      setActiveTab(tabId)
      // Or optionally navigate to a dedicated account page:
      // router.push('/account')
    } else {
      setActiveTab(tabId)
    }
  }

  // Handle "Conversar with Clara" button
  const handleStartConversation = async () => {
    if (isStartingChat) return;
    
    setIsStartingChat(true)
    showNotification('info', 'Criando nova sessão...')
    
    try {
      // Criar nova sessão de chat
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Nova Conversa com Clara'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão')
      }

      const data = await response.json()
      
      if (data.success && data.sessionId) {
        showNotification('success', 'Sessão criada! Redirecionando...')
        router.push(`/chat/${data.sessionId}`)
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
      showNotification('error', 'Erro ao criar sessão. Tente novamente.')
    } finally {
      setIsStartingChat(false)
    }
  }

  // Handle exercise start
  const handleStartExercise = (exerciseId: number, exerciseName: string) => {
    showNotification('info', `Iniciando exercício: ${exerciseName}`)
    // You could implement exercise logic here
    setTimeout(() => {
      showNotification('success', `Exercício "${exerciseName}" concluído!`)
      // Update dashboard stats
      setDashboardStats(prev => ({
        ...prev,
        completedToday: prev.completedToday + 1,
        totalExercises: prev.totalExercises + 1
      }))
    }, 3000)
  }

  // Generate follow code
  const generateFollowCode = async () => {
    setGeneratingCode(true)
    try {
      const response = await fetch('/api/follow-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setFollowCode(data.code)
        setFollowCodeExpires(data.expiresAt)
        showNotification('success', 'Código gerado com sucesso!')
      } else {
        showNotification('error', data.error || 'Erro ao gerar código')
      }
    } catch (error) {
      console.error('Erro ao gerar código:', error)
      showNotification('error', 'Erro de conexão. Tente novamente.')
    } finally {
      setGeneratingCode(false)
    }
  }

  // Copy follow code
  const copyFollowCode = async () => {
    if (!followCode) return
    
    try {
      await navigator.clipboard.writeText(followCode)
      showNotification('success', 'Código copiado para a área de transferência!')
    } catch (error) {
      console.error('Erro ao copiar código:', error)
      showNotification('error', 'Erro ao copiar código')
    }
  }

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAvailablePlans(data.plans)
          setCurrentSubscription(data.currentSubscription)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  useEffect(() => {
    loadPlans()
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            className="fixed top-4 right-4 z-[60] max-w-md"
          >
            <div className={`p-4 rounded-xl shadow-2xl border ${
              notification.type === 'success' ? 'bg-white border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-white border-red-200 text-red-800' :
              notification.type === 'warning' ? 'bg-white border-amber-200 text-amber-800' :
              'bg-white border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {notification.type === 'info' && <Bell className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-sm font-medium flex-1">{notification.message}</p>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header Principal */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                {getGreeting()}, {getFirstName()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Bem-vindo ao seu painel de controle
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS - MODERNA E LIMPA */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4 scrollbar-hide">
            {[
              { id: "overview", label: "Visão Geral", icon: Activity },
              { id: "exercises", label: "Exercícios", icon: Zap },
              { id: "progress", label: "Progresso", icon: TrendingUp },
              { id: "insights", label: "Insights", icon: Brain },
              { id: "account", label: "Conta", icon: User },
              { id: "subscription", label: "Planos", icon: Star },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Navegar para ${tab.label}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
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
                    title: "Sequência",
                    value: `${dashboardStats.currentStreak}`,
                    unit: "dias",
                    icon: Flame,
                    trend: "+2 esta semana"
                  },
                  {
                    title: "Hoje",
                    value: `${dashboardStats.completedToday}`,
                    unit: "exercícios",
                    icon: CheckCircle,
                    trend: "Meta diária: 3"
                  },
                  {
                    title: "Total",
                    value: `${dashboardStats.totalExercises}`,
                    unit: "exercícios",
                    icon: Trophy,
                    trend: "+5 esta semana"
                  },
                  {
                    title: "Nível",
                    value: `${dashboardStats.unlockedLevel}`,
                    unit: "",
                    icon: Star,
                    trend: "Intermediário"
                  }
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <Card key={i} className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{stat.unit}</span>
                          </div>
                          <p className="text-xs text-gray-500">{stat.trend}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gray-900 dark:bg-white rounded-lg group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-6 h-6 text-white dark:text-gray-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Conversar com Clara</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">IA de bem-estar</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Inicie uma nova sessão de conversa para trabalhar seus sentimentos
                  </p>
                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                    onClick={handleStartConversation}
                    disabled={isStartingChat}
                    data-testid="start-chat"
                    aria-label="Começar nova conversa com Clara"
                  >
                    {isStartingChat ? 'Criando sessão...' : 'Começar Conversa'}
                  </Button>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => router.push('/exercises')}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Exercícios Rápidos</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Técnicas práticas</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Técnicas práticas para lidar com ansiedade e estresse
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/exercises');
                    }}
                    aria-label="Ver exercícios disponíveis"
                  >
                    Ver Exercícios
                  </Button>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Meta Semanal</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-medium">{dashboardStats.completedToday}/{dashboardStats.weeklyGoal}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((dashboardStats.completedToday / dashboardStats.weeklyGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardStats.weeklyGoal - dashboardStats.completedToday > 0 
                        ? `Faltam ${dashboardStats.weeklyGoal - dashboardStats.completedToday} exercícios para completar sua meta`
                        : "Meta semanal concluída!"
                      }
                    </p>
                  </div>
                </Card>
              </div>

              {/* Acompanhamento Profissional */}
              <div className="mt-8">
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Acompanhamento Profissional</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gere um código para seu profissional acompanhar seu progresso
                      </p>
                    </div>
                  </div>

                  {followCode ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            Código gerado:
                          </span>
                          <button
                            onClick={copyFollowCode}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            aria-label="Copiar código"
                            data-testid="copy-follow-code"
                          >
                            <Copy className="w-4 h-4 text-green-700 dark:text-green-300" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-2xl font-mono font-bold text-green-900 dark:text-green-100">
                            {followCode}
                          </code>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                          Válido até: {new Date(followCodeExpires).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={generateFollowCode}
                        disabled={generatingCode}
                        className="w-full"
                        aria-label="Gerar novo código"
                      >
                        {generatingCode ? 'Gerando...' : 'Gerar Novo Código'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={generateFollowCode}
                      disabled={generatingCode}
                      className="w-full"
                      aria-label="Gerar código de acompanhamento"
                      data-testid="generate-follow-code"
                    >
                      {generatingCode ? 'Gerando...' : 'Gerar Código de Acompanhamento'}
                    </Button>
                  )}

                  <div className="mt-4 text-center">
                    <Link href="/account/connections">
                      <Button variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Ver Profissionais Vinculados
                      </Button>
                    </Link>
                  </div>
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Exercícios de Bem-estar</h2>
                <p className="text-gray-600 dark:text-gray-400">Técnicas práticas para seu desenvolvimento pessoal</p>
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
                    icon: Wind
                  },
                  {
                    id: 2,
                    title: "Diálogo Interno Positivo",
                    description: "Exercício para reformular pensamentos negativos",
                    duration: "10 min", 
                    level: 1,
                    category: "Autoestima",
                    completed: true,
                    icon: MessageCircle
                  },
                  {
                    id: 3,
                    title: "Visualização Guiada",
                    description: "Técnica de relaxamento através da imaginação",
                    duration: "15 min",
                    level: 2,
                    category: "Estresse",
                    completed: false,
                    icon: Brain
                  },
                  {
                    id: 4,
                    title: "Gratidão Diária",
                    description: "Prática de reconhecimento de aspectos positivos",
                    duration: "7 min",
                    level: 2,
                    category: "Bem-estar",
                    completed: false,
                    icon: Heart
                  }
                ].map((exercise) => {
                  const Icon = exercise.icon
                  return (
                    <Card key={exercise.id} className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white dark:group-hover:text-gray-900" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              exercise.completed 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {exercise.completed ? 'Concluído' : 'Pendente'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{exercise.duration}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{exercise.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{exercise.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              {exercise.category}
                            </span>
                            <Button 
                              size="sm" 
                              variant={exercise.completed ? "outline" : "default"}
                              onClick={() => handleStartExercise(exercise.id, exercise.title)}
                              className="hover:scale-105 transition-transform"
                            >
                              {exercise.completed ? 'Revisar' : 'Começar'}
                            </Button>
                          </div>
                        </div>
                      </div>
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Seu Progresso</h2>
                <p className="text-gray-600 dark:text-gray-400">Acompanhe sua jornada de desenvolvimento</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Humor Semanal</h3>
                  </div>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line type="monotone" dataKey="mood" stroke="#374151" strokeWidth={2} dot={{ fill: '#374151', strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="energy" stroke="#9ca3af" strokeWidth={2} dot={{ fill: '#9ca3af', strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Conquistas</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: "Primeiro Passo", description: "Completou o primeiro exercício", icon: "🎯", unlocked: true },
                      { title: "Sequência de 7 dias", description: "Manteve consistência por uma semana", icon: "🔥", unlocked: true },
                      { title: "Explorador", description: "Testou 5 exercícios diferentes", icon: "🧭", unlocked: false },
                      { title: "Dedicação Total", description: "30 dias consecutivos", icon: "💎", unlocked: false },
                    ].map((achievement, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        achievement.unlocked 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                          {achievement.unlocked ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${achievement.unlocked ? 'text-green-900 dark:text-green-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${achievement.unlocked ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-500'}`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Insights Personalizados</h2>
                <p className="text-gray-600 dark:text-gray-400">Análises baseadas no seu progresso</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Padrões Identificados</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Horário Ideal</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">Você tem mais energia pela manhã. Considere fazer exercícios às 9h.</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Progresso Consistente</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">Sua sequência de 7 dias mostra dedicação. Continue assim!</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recomendações</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Próximo Exercício</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">Baseado no seu progresso, recomendamos "Visualização Guiada".</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Meta da Semana</h4>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">Você está a 2 exercícios de bater seu recorde pessoal!</p>
                    </div>
                  </div>
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Minha Conta</h2>
                <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais e preferências</p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Info */}
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Informações do Perfil</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 text-xl font-semibold">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{session?.user?.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/account/profile')}
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Editar Perfil
                    </Button>
                  </div>
                </Card>

                {/* Account Settings */}
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Configurações de Conta</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => setShowNameModal(true)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Alterar Nome</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Atualize seu nome de exibição</div>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => setShowEmailModal(true)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Alterar Email</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Modifique seu endereço de email</div>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Alterar Senha</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Atualize sua senha de acesso</div>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 text-left border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="font-medium text-red-600 dark:text-red-400">Excluir Conta</div>
                          <div className="text-sm text-red-500 dark:text-red-500">Remover permanentemente</div>
                        </div>
                      </div>
                    </Button>
                  </div>
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Planos e Assinatura</h2>
                <p className="text-gray-600 dark:text-gray-400">Escolha o plano ideal para sua jornada</p>
              </div>

              <div className="max-w-4xl mx-auto">
                {/* Current Plan */}
                <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Plano Atual</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{getCurrentPlan().name}</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getCurrentPlan().price}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{getCurrentPlan().period}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        {getCurrentPlan().features.map((feature: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                      ]
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
                      ]
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
                      ]
                    }
                  ].map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`p-6 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200 relative ${
                        plan.popular ? 'ring-2 ring-gray-900 dark:ring-white' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                            Mais Popular
                          </div>
                        </div>
                      )}
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Star className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                          <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900' 
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                        onClick={() => handlePlanSelection(plan.id, plan.name)}
                      >
                        {getCurrentPlan().name === plan.name ? 'Plano Atual' : 'Escolher Plano'}
                      </Button>
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
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowPasswordModal(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setShowPassword(false)
                    setShowNewPassword(false)
                  }}
                  disabled={passwordLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                >
                  {passwordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Alterando...
                    </div>
                  ) : (
                    'Alterar Senha'
                  )}
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
                  className={`w-full p-3 border rounded-lg ${
                    newEmail && !validateEmail(newEmail) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite o novo email"
                  disabled={emailLoading}
                />
                {newEmail && !validateEmail(newEmail) && (
                  <p className="text-red-500 text-xs mt-1">Digite um email válido</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Email atual: {session?.user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Senha Atual</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite sua senha"
                  disabled={emailLoading}
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-sm">
                  ℹ️ Um email de confirmação será enviado para o novo endereço.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowEmailModal(false)
                    setNewEmail('')
                    setEmailPassword('')
                  }}
                  disabled={emailLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleEmailChange}
                  disabled={emailLoading || !newEmail.trim() || !emailPassword.trim() || !validateEmail(newEmail)}
                >
                  {emailLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Alterar Email'
                  )}
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
                  className={`w-full p-3 border rounded-lg ${
                    newName && !validateName(newName) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu novo nome"
                  maxLength={100}
                  disabled={nameLoading}
                />
                {newName && !validateName(newName) && (
                  <p className="text-red-500 text-xs mt-1">Nome deve ter entre 2 e 100 caracteres</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Nome atual: {session?.user?.name}</p>
                <p className="text-xs text-slate-400 mt-1">{newName.length}/100 caracteres</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowNameModal(false)
                    setNewName('')
                  }}
                  disabled={nameLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleNameChange}
                  disabled={nameLoading || !newName.trim() || !validateName(newName)}
                >
                  {nameLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Alterando...
                    </div>
                  ) : (
                    'Alterar Nome'
                  )}
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
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">⚠️ ATENÇÃO: Ação irreversível!</h4>
                    <p className="text-sm text-red-700">
                      Esta ação não pode ser desfeita. Todos os seus dados, incluindo:
                    </p>
                    <ul className="text-xs text-red-600 mt-2 ml-4 space-y-1">
                      <li>• Conversas e histórico</li>
                      <li>• Progresso e estatísticas</li>
                      <li>• Configurações personalizadas</li>
                      <li>• Dados de assinatura</li>
                    </ul>
                    <p className="text-sm text-red-700 mt-2">
                      serão <strong>permanentemente removidos</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Digite <strong>"EXCLUIR"</strong> para confirmar (em maiúsculas)
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={`w-full p-3 border rounded-lg ${
                    deleteConfirmation && deleteConfirmation !== 'EXCLUIR' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite EXCLUIR"
                  disabled={deleteLoading}
                />
                {deleteConfirmation && deleteConfirmation !== 'EXCLUIR' && (
                  <p className="text-red-500 text-xs mt-1">Digite exatamente "EXCLUIR" em maiúsculas</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Digite sua senha para confirmar</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite sua senha"
                  disabled={deleteLoading}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                    setDeletePassword('')
                  }}
                  disabled={deleteLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={handleAccountDelete}
                  disabled={deleteLoading || deleteConfirmation !== 'EXCLUIR' || !deletePassword.trim()}
                >
                  {deleteLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Excluindo...
                    </div>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Excluir Conta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}