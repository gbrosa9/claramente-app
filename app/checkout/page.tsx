"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CreditCard, Lock, ArrowLeft, Check, Shield, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Plan {
  id: string
  name: string
  description?: string
  price: number
  period: string
  features: string[]
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'pro'
  
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    loadPlan()
  }, [planId])

  const loadPlan = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const foundPlan = data.plans.find((p: any) => p.id === planId)
          if (foundPlan) {
            // Processar features se necessário
            let features = foundPlan.features
            if (typeof features === 'string') {
              features = JSON.parse(features)
            }
            setPlan({
              ...foundPlan,
              features,
              price: parseFloat(foundPlan.price)
            })
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
    }
  }

  // Fallback plan data
  const fallbackPlans: Record<string, Plan> = {
    pro: {
      id: "pro",
      name: "Pro", 
      description: "Para uso regular",
      price: 29.90,
      period: "month",
      features: [
        "Sessões ilimitadas com Clara",
        "Chat por voz em tempo real", 
        "Todos os exercícios terapêuticos",
        "Dashboard avançado com progresso",
        "Relatórios mensais",
        "Suporte prioritário"
      ]
    },
    premium: {
      id: "premium", 
      name: "Premium",
      description: "Máximo bem-estar",
      price: 99.90,
      period: "month",
      features: [
        "Tudo do plano Pro",
        "Suporte prioritário 24/7",
        "Sessões 1:1 com especialistas",
        "Análise avançada de progresso",
        "Relatórios personalizados",
        "API de integração"
      ]
    }
  }

  const selectedPlan = plan || fallbackPlans[planId] || fallbackPlans.pro
  const [paymentData, setPaymentData] = useState({
    email: '',
    fullName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cpf: '',
    billingAddress: {
      zipCode: '',
      street: '',
      number: '',
      city: '',
      state: ''
    }
  })
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1]
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }))
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-green-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Pagamento Confirmado!
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Bem-vindo ao plano {selectedPlan.name}! Sua conta foi ativada e você já pode acessar todos os recursos.
          </p>

          <div className="space-y-4">
            <Link href="/chat">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                Começar com Clara
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Ir para Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/planos">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Planos
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Finalizar Compra</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Plano {selectedPlan.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Cobrança mensal
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          R$ {selectedPlan.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          /{selectedPlan.period === 'month' ? 'mês' : 'ano'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                        Recursos inclusos:
                      </h4>
                      <ul className="space-y-2">
                        {selectedPlan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span className="text-slate-900 dark:text-white">Total</span>
                        <span className="text-purple-600 dark:text-purple-400">
                          R$ {selectedPlan.price.toFixed(2)}/{selectedPlan.period === 'month' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Próxima cobrança: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Pagamento Seguro
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-green-800 dark:text-green-200">
                      ✓ Criptografia SSL 256-bits
                    </p>
                    <p className="text-green-800 dark:text-green-200">
                      ✓ Dados protegidos pela LGPD
                    </p>
                    <p className="text-green-800 dark:text-green-200">
                      ✓ Cancele a qualquer momento
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Dados de Pagamento
                </CardTitle>
                <CardDescription>
                  Preencha os dados do seu cartão de crédito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Dados Pessoais
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={paymentData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nome Completo
                      </label>
                      <Input
                        type="text"
                        value={paymentData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        CPF
                      </label>
                      <Input
                        type="text"
                        value={paymentData.cpf}
                        onChange={(e) => handleChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Dados do Cartão
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número do Cartão
                      </label>
                      <Input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Validade
                        </label>
                        <Input
                          type="text"
                          value={paymentData.expiryDate}
                          onChange={(e) => handleChange('expiryDate', formatExpiryDate(e.target.value))}
                          placeholder="MM/AA"
                          maxLength={5}
                          required
                          className="border-purple-200 focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CVV
                        </label>
                        <Input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, ''))}
                          placeholder="000"
                          maxLength={4}
                          required
                          className="border-purple-200 focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Endereço de Cobrança
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CEP
                        </label>
                        <Input
                          type="text"
                          value={paymentData.billingAddress.zipCode}
                          onChange={(e) => handleChange('billingAddress.zipCode', e.target.value)}
                          placeholder="00000-000"
                          required
                          className="border-purple-200 focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número
                        </label>
                        <Input
                          type="text"
                          value={paymentData.billingAddress.number}
                          onChange={(e) => handleChange('billingAddress.number', e.target.value)}
                          placeholder="123"
                          required
                          className="border-purple-200 focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Rua
                      </label>
                      <Input
                        type="text"
                        value={paymentData.billingAddress.street}
                        onChange={(e) => handleChange('billingAddress.street', e.target.value)}
                        placeholder="Rua das Flores"
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cidade
                        </label>
                        <Input
                          type="text"
                          value={paymentData.billingAddress.city}
                          onChange={(e) => handleChange('billingAddress.city', e.target.value)}
                          placeholder="São Paulo"
                          required
                          className="border-purple-200 focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Estado
                        </label>
                        <Input
                          type="text"
                          value={paymentData.billingAddress.state}
                          onChange={(e) => handleChange('billingAddress.state', e.target.value)}
                          placeholder="SP"
                          maxLength={2}
                          required
                          className="border-purple-200 focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-6 text-lg font-semibold"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {loading ? 'Processando...' : `Pagar R$ ${selectedPlan.price.toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    Ao continuar, você aceita nossos{' '}
                    <Link href="/terms" className="text-purple-600 hover:underline">
                      Termos de Uso
                    </Link>{' '}
                    e{' '}
                    <Link href="/privacy" className="text-purple-600 hover:underline">
                      Política de Privacidade
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}