"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Send, Mail, Phone, MapPin, CheckCircle, Building2, Users, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", type: "individual" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source: 'WEBSITE'
        })
      })

      const data = await response.json()

      if (data.ok) {
        setSubmitted(true)
        setFormData({ name: "", email: "", phone: "", message: "", type: "individual" })
      } else {
        setError(data.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-lilac-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">← Voltar</Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Entre em Contato</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Como Podemos Ajudar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Individual Contact */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Para Indivíduos</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tem dúvidas sobre como usar Clara ou precisa de suporte técnico?
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Suporte técnico 24/7
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Perguntas sobre recursos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Dúvidas sobre privacidade
                </li>
              </ul>
              <Button
                onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                Enviar Mensagem
              </Button>
            </div>

            {/* Corporate Contact */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl border-2 border-purple-500 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-bold">Para Empresas</h3>
              </div>
              <p className="text-purple-100 mb-6">Interessado em implementar ClaraMENTE na sua organização?</p>
              <ul className="space-y-3 text-sm text-purple-100 mb-8">
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Customizações avançadas
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Integração com sistemas
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Gestor de conta dedicado
                </li>
              </ul>
              <Button
                className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                onClick={() => {
                  const form = document.getElementById("contact-form") as HTMLFormElement
                  const typeSelect = form?.querySelector("select[name='type']") as HTMLSelectElement
                  if (typeSelect) typeSelect.value = "enterprise"
                  document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Solicitar Demonstração
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle>Envie uma Mensagem</CardTitle>
                <CardDescription>Responderemos em breve</CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mensagem Enviada!</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Obrigado por entrar em contato. Nossa equipe retornará em breve.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Enviar outra mensagem
                    </Button>
                  </motion.div>
                ) : (
                  <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Contato</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-purple-200 dark:border-purple-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="individual">Indivíduo</option>
                        <option value="enterprise">Empresa</option>
                        <option value="support">Suporte Técnico</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome</label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone (opcional)</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        className="border-purple-200 focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mensagem</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Sua mensagem..."
                        rows={6}
                        required
                        className="w-full px-3 py-2 border border-purple-200 dark:border-purple-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Send className="w-4 h-4" />
                      {loading ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-3">
                  <Mail className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Email</h4>
                    <p className="text-slate-600 dark:text-slate-400">contato@claramente.com.br</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Telefone</h4>
                    <p className="text-slate-600 dark:text-slate-400">+55 (11) 9999-9999</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Localização</h4>
                    <p className="text-slate-600 dark:text-slate-400">São Paulo, Brasil</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Horário de Atendimento</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>Segunda a Sexta: 08:00 - 18:00</li>
                  <li>Sábado: 09:00 - 13:00</li>
                  <li>Domingo: Fechado</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Perguntas Frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Como Clara funciona?",
                a: "Clara é uma IA que oferece suporte terapêutico usando técnicas de TCC e DBT com tecnologia segura e privada.",
              },
              {
                q: "Meus dados são privados?",
                a: "Sim, todos os dados são criptografados com máxima confidencialidade. Não compartilhamos informações pessoais.",
              },
              {
                q: "Quanto custa?",
                a: "ClaraMENTE oferece planos desde gratuito até premium com mais recursos. Veja nossa página de preços.",
              },
              {
                q: "Posso usar em celular?",
                a: "Sim, ClaraMENTE é totalmente responsiva e funciona como app instalável no celular.",
              },
              {
                q: "Como funcionam as empresas?",
                a: "Oferecemos planos corporativos customizados com relatórios de bem-estar dos colaboradores e suporte dedicado.",
              },
              {
                q: "Há período de teste?",
                a: "Sim! Todos os novos usuários têm acesso a uma primeira sessão gratuita com Clara.",
              },
            ].map((faq, i) => (
              <Card key={i} className="border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
