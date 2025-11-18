"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight, ArrowLeft } from "lucide-react"

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPlans(data.plans)
          setCurrentSubscription(data.currentSubscription)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const handlePlanSelection = async (planId: string, planName: string) => {
    if (loading || currentSubscription?.plan_id === planId) return

    setLoading(planId)

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        throw new Error('Erro ao processar checkout')
      }

      const data = await response.json()
      
      if (data.url) {
        // Redirect to checkout or success page
        window.location.href = data.url
      } else {
        throw new Error('URL de checkout não encontrada')
      }
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar checkout. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }
  const userPlans = [
    {
      name: "Gratuito",
      price: "0",
      period: "/mês",
      description: "Perfeito para explorar",
      features: [
        "Primeira sessão com Clara",
        "Chat limitado (5 sessões/mês)",
        "Acesso a exercícios básicos",
        "Dashboard simples",
        "Suporte por email",
      ],
      cta: "Começar Agora",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "29,90",
      period: "/mês",
      description: "Para uso regular",
      features: [
        "Sessões ilimitadas com Clara",
        "Chat por voz em tempo real",
        "Todos os exercícios terapêuticos",
        "Dashboard avançado com progresso",
        "Relatórios mensais",
        "Suporte prioritário",
        "Chamadas de vídeo com avatar",
        "Exercícios personalizados",
      ],
      cta: "Assinar Agora",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "49,90",
      period: "/mês",
      description: "Máximo bem-estar",
      features: [
        "Tudo do plano Pro",
        "Suporte prioritário 24/7",
        "Acesso a psicólogos humanos",
        "Programas personalizados de TCC/DBT",
        "Relatórios detalhados com análise IA",
        "Integração com wearables",
        "Meditações guiadas exclusivas",
        "Comunidade privada de suporte",
      ],
      cta: "Assinar Agora",
      highlighted: false,
    },
  ]

  const enterprisePlans = [
    {
      name: "Startup",
      price: "Sob Consulta",
      period: "",
      description: "Para pequenas equipes",
      features: [
        "Até 50 usuários",
        "Dashboard administrativo",
        "Relatórios de bem-estar da equipe",
        "Integração com sistemas",
        "Customizações básicas",
        "Suporte técnico dedicado",
        "Treinamento inicial",
      ],
      cta: "Solicitar Demo",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "Customizado",
      period: "",
      description: "Solução completa",
      features: [
        "Usuários ilimitados",
        "Dashboard avançado com analytics",
        "Relatórios detalhados de ROI",
        "Integração completa de APIs",
        "Customizações avançadas",
        "Gerente de conta dedicado",
        "Programa de treinamento",
        "SLA garantido 99.9%",
      ],
      cta: "Falar com vendas",
      highlighted: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-lilac-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nossos Planos</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Individual Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Para Indivíduos</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Escolha o plano ideal para sua jornada de bem-estar mental. Comece gratuitamente ou aproveite nossos
              planos premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {(plans.length > 0 ? plans : [
              {
                id: "gratuito",
                name: "Gratuito",
                price: 0,
                period: "month",
                features: ["Primeira sessão com Clara", "Chat limitado (5 sessões/mês)", "Acesso a exercícios básicos", "Dashboard simples", "Suporte por email"],
              },
              {
                id: "pro", 
                name: "Pro",
                price: 29.90,
                period: "month",
                features: ["Sessões ilimitadas com Clara", "Chat por voz em tempo real", "Todos os exercícios terapêuticos", "Dashboard avançado com progresso", "Relatórios mensais", "Suporte prioritário", "Chamadas de vídeo com avatar", "Exercícios personalizados"],
              },
              {
                id: "premium",
                name: "Premium", 
                price: 49.90,
                period: "month",
                features: ["Tudo do plano Pro", "Suporte prioritário 24/7", "Acesso a psicólogos humanos", "Programas personalizados de TCC/DBT", "Relatórios detalhados com análise IA", "Integração com wearables", "Meditações guiadas exclusivas", "Comunidade privada de suporte"],
              }
            ]).map((plan, index) => {
              const isPopular = plan.id === "pro"
              const isCurrentPlan = currentSubscription?.plan_id === plan.id
              
              // Handle features - pode vir como array, string JSON ou objeto
              let features = []
              if (Array.isArray(plan.features)) {
                features = plan.features
              } else if (typeof plan.features === 'string') {
                try {
                  features = JSON.parse(plan.features)
                } catch (e) {
                  features = [plan.features]
                }
              } else if (typeof plan.features === 'object' && plan.features) {
                features = Object.values(plan.features)
              }
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    className={`relative h-full flex flex-col transition-all duration-300 ${
                      isPopular
                        ? "border-purple-500 border-2 shadow-2xl scale-105 md:scale-110"
                        : "border-purple-200 dark:border-purple-800"
                    } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Mais Popular
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Plano Atual
                        </span>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.description || (
                          plan.id === "gratuito" ? "Perfeito para explorar" : 
                          plan.id === "pro" ? "Para uso regular" : 
                          "Máximo bem-estar"
                        )}
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          R$ {plan.price.toFixed(2)}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          /{plan.period === "month" ? "mês" : "ano"}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full gap-2 ${
                          isPopular
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                        onClick={() => handlePlanSelection(plan.id, plan.name)}
                        disabled={loading === plan.id || isCurrentPlan}
                        aria-label={`Selecionar plano ${plan.name}`}
                      >
                        {loading === plan.id ? 'Processando...' :
                         isCurrentPlan ? 'Plano Atual' :
                         plan.id === "gratuito" ? 'Começar Agora' : 'Assinar Agora'}
                        {!isCurrentPlan && loading !== plan.id && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Enterprise Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Para Empresas</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Implemente ClaraMENTE na sua organização e melhore o bem-estar mental dos seus colaboradores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {enterprisePlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card
                  className={`relative h-full flex flex-col transition-all duration-300 ${
                    plan.highlighted
                      ? "border-purple-500 border-2 shadow-2xl"
                      : "border-purple-200 dark:border-purple-800"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Recomendado
                      </span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/contact">
                      <Button
                        className={`w-full gap-2 ${
                          plan.highlighted
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Todos os Planos Incluem</h3>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-slate-700 dark:text-slate-300">
              <li>✓ Criptografia de dados 100%</li>
              <li>✓ Privacidade garantida</li>
              <li>✓ Suporte por email</li>
              <li>✓ Interface intuitiva</li>
              <li>✓ Apps mobile</li>
              <li>✓ Sem taxas ocultas</li>
            </ul>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dúvidas sobre os planos?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar. Entre em contato conosco para mais informações.
          </p>
          <Link href="/contact">
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg">
              Fale Conosco
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
