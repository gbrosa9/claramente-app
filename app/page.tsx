"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Lock, Clock, Zap, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import PWAInstall from "@/components/pwa-install"
import OfflineIndicator from "@/components/offline-indicator"
import Image from "next/image"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <PWAInstall />
      <OfflineIndicator />

      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ⓒ</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              ClaraMENTE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/contact"
              className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 font-medium text-sm transition-colors"
            >
              Fale Conosco
            </Link>
            <Link
              href="/planos"
              className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 font-medium text-sm transition-colors"
            >
              Planos
            </Link>
            <Link
              href="/resources"
              className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 font-medium text-sm transition-colors"
            >
              Recursos
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full">
                Registrar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
              <span className="text-sm text-purple-600 dark:text-purple-300 font-medium">Primeira sessão gratuita</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Content */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Sua jornada de{" "}
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  bem-estar mental
                </span>{" "}
                começa aqui
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Clara é sua assistente de IA especializada em terapia cognitivo-comportamental e
                dialética-comportamental. Conversas confidenciais, exercícios de respiração e ansiedade, chamadas de voz
                com avatar em tempo real, e ferramentas baseadas em evidência científica.
              </p>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sempre disponível</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidencial</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">TCC+DBT</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Baseado em evidência</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/chat">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg rounded-full font-semibold w-full sm:w-auto">
                    Iniciar Sessão Gratuita
                  </Button>
                </Link>
                <Link href="/voice-call">
                  <Button
                    variant="outline"
                    className="px-8 py-6 text-lg rounded-full font-semibold border-2 border-purple-300 dark:border-slate-600 bg-transparent hover:bg-purple-50 dark:hover:bg-slate-800 w-full sm:w-auto"
                  >
                    Chamada de Voz
                  </Button>
                </Link>
              </div>

              {/* Checkmarks */}
              <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold">✓</span>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Sem compromisso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold">✓</span>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Início imediato</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold">✓</span>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Cancele quando quiser</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Avatar */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                  alt="Clara - ClaraMENTE Avatar"
                  width={400}
                  height={500}
                  priority
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-20 border-t border-gray-200 dark:border-slate-800"
        >
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Por que escolher ClaraMENTE?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Tecnologia avançada e abordagem humana para seu bem-estar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Apoio Empático */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-8 rounded-2xl border border-purple-200 dark:border-purple-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Apoio Empático</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Clara entende suas emoções e oferece apoio personalizado com base em TCC e DBT
              </p>
            </motion.div>

            {/* 100% Confidencial */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/10 p-8 rounded-2xl border border-cyan-200 dark:border-cyan-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">100% Confidencial</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Suas conversas são privadas e seguras com criptografia de ponta a ponta
              </p>
            </motion.div>

            {/* Disponível 24/7 */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-8 rounded-2xl border border-purple-200 dark:border-purple-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Disponível 24/7</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Clara está sempre lá quando você precisa de apoio, a qualquer hora do dia
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          id="benefits"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-20 border-t border-gray-200 dark:border-slate-800"
        >
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Benefícios do ClaraMENTE
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: TrendingUp,
                title: "Redução de Ansiedade",
                desc: "Técnicas científicas de respiração e relaxamento",
              },
              { icon: Heart, title: "Melhor Saúde Mental", desc: "Monitoramento contínuo do seu bem-estar emocional" },
              {
                icon: Zap,
                title: "Exercícios Interativos",
                desc: "Respiração, mindfulness e técnicas de enfrentamento",
              },
              { icon: Users, title: "Comunidade Segura", desc: "Conecte-se com pessoas em jornada similar (em breve)" },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex gap-4 p-6 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 mt-20 py-8 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 ClaraMENTE. Desenvolvido com cuidado para sua saúde mental.</p>
        </div>
      </footer>
    </div>
  )
}
