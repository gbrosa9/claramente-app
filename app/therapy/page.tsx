"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Lightbulb, Heart, Flame, ChevronRight, Clock, Play, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

interface TherapySession {
  id: string
  type: "TCC" | "DBT"
  title: string
  description: string
  duration: number
  icon: any
  techniques: string[]
  exercises: Exercise[]
}

interface Exercise {
  id: string
  title: string
  description: string
  type: 'input' | 'reflection'
}

interface Step {
  title: string
  content: string
  type: 'input' | 'reflection'
}

export default function TherapyPage() {
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [sessionProgress, setSessionProgress] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<string[]>([])

  const therapySessions: TherapySession[] = [
    {
      id: "anxiety-management",
      type: "TCC",
      title: "Gestão de Ansiedade",
      description: "Técnicas cognitivo-comportamentais para identificar e reestruturar pensamentos ansiosos",
      duration: 25,
      icon: Brain,
      techniques: ["Identificação de pensamentos automáticos", "Reestruturação cognitiva", "Técnicas de relaxamento"],
      exercises: [
        {
          id: "thought-record",
          title: "Registro de Pensamentos",
          description: "Identifique e questione pensamentos ansiosos",
          type: "input"
        },
        {
          id: "breathing-exercise",
          title: "Respiração Diafragmática",
          description: "Técnica de respiração para reduzir ansiedade física",
          type: "reflection"
        }
      ]
    },
    {
      id: "emotion-regulation",
      type: "DBT",
      title: "Regulação Emocional",
      description: "Habilidades DBT para tolerar e regular emoções intensas",
      duration: 30,
      icon: Heart,
      techniques: ["PLEASE skills", "Opposite Action", "TIPP"],
      exercises: [
        {
          id: "emotion-wheel",
          title: "Roda das Emoções",
          description: "Identifique e nomeie suas emoções atuais",
          type: "input"
        },
        {
          id: "distress-tolerance",
          title: "Tolerância ao Sofrimento",
          description: "Técnicas para atravessar crises emocionais",
          type: "reflection"
        }
      ]
    },
    {
      id: "mindfulness-practice",
      type: "DBT",
      title: "Prática de Mindfulness",
      description: "Desenvolver consciência plena e presença no momento atual",
      duration: 20,
      icon: Lightbulb,
      techniques: ["Observe", "Describe", "Participate", "Non-judgmentally"],
      exercises: [
        {
          id: "mindful-observation",
          title: "Observação Mindful",
          description: "Pratique observar sem julgar",
          type: "reflection"
        },
        {
          id: "body-scan",
          title: "Escaneamento Corporal",
          description: "Consciência das sensações corporais",
          type: "reflection"
        }
      ]
    },
    {
      id: "interpersonal-skills",
      type: "DBT",
      title: "Habilidades Interpessoais",
      description: "DEAR MAN e outras técnicas para comunicação eficaz",
      duration: 35,
      icon: Flame,
      techniques: ["DEAR MAN", "GIVE", "FAST"],
      exercises: [
        {
          id: "dear-man-practice",
          title: "Prática DEAR MAN",
          description: "Planeje uma conversa difícil usando DEAR MAN",
          type: "input"
        },
        {
          id: "boundary-setting",
          title: "Estabelecimento de Limites",
          description: "Como dizer não de forma respeitosa",
          type: "reflection"
        }
      ]
    }
  ]

  const getSessionSteps = (session: TherapySession): Step[] => {
    const baseSteps: Step[] = [
      {
        title: "Boas-vindas",
        content: `Bem-vinda à sessão de ${session.title}. Vamos trabalhar com técnicas ${session.type} para ${session.description.toLowerCase()}.`,
        type: "reflection"
      },
      {
        title: "Verificação Inicial",
        content: "Como você está se sentindo agora? Descreva brevemente seu estado emocional atual.",
        type: "input"
      }
    ]

    const exerciseSteps = session.exercises.map(exercise => ({
      title: exercise.title,
      content: exercise.description,
      type: exercise.type as 'input' | 'reflection'
    }))

    const closingStep: Step = {
      title: "Fechamento",
      content: "Que insights você teve durante esta sessão? Como pretende aplicar o que aprendeu?",
      type: "input"
    }

    return [...baseSteps, ...exerciseSteps, closingStep]
  }

  const startSession = (session: TherapySession) => {
    setSelectedSession(session)
    setCurrentStep(0)
    setSessionProgress(0)
    setUserInput("")
  }

  const nextStep = () => {
    if (!selectedSession) return
    
    const steps = getSessionSteps(selectedSession)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setSessionProgress(((currentStep + 1) / steps.length) * 100)
      setUserInput("")
    } else {
      completeSession()
    }
  }

  const completeSession = () => {
    if (selectedSession && !completedExercises.includes(selectedSession.id)) {
      setCompletedExercises([...completedExercises, selectedSession.id])
    }
    setSelectedSession(null)
    setCurrentStep(0)
    setSessionProgress(0)
  }

  const getCurrentStep = (): Step | null => {
    if (!selectedSession) return null
    const steps = getSessionSteps(selectedSession)
    return steps[currentStep] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sessões Terapêuticas</h1>
          <div className="w-16" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!selectedSession ? (
            /* Session Selection */
            <motion.div
              key="session-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Escolha sua Sessão Terapêutica
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Sessões estruturadas baseadas em TCC e DBT para trabalhar aspectos específicos da sua saúde mental
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {therapySessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <Card className="h-full border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-4">
                          <session.icon className="w-10 h-10 text-purple-600" />
                          <div className="flex items-center gap-2">
                            {completedExercises.includes(session.id) && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              session.type === 'TCC' 
                                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                                : 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                              {session.type}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{session.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{session.duration} min</span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {session.description}
                        </p>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Técnicas:</p>
                          <div className="flex flex-wrap gap-1">
                            {session.techniques.map((technique) => (
                              <span
                                key={technique}
                                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                              >
                                {technique}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => startSession(session)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 mt-4"
                        >
                          <Play className="w-4 h-4" />
                          Iniciar Sessão
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Active Session */
            <motion.div
              key="active-session"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                {/* Session Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedSession.title}
                    </h2>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedSession.type === 'TCC' 
                        ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                        : 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {selectedSession.type}
                    </span>
                  </div>
                  <Progress value={sessionProgress} className="h-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Passo {currentStep + 1} de {getSessionSteps(selectedSession).length}
                  </p>
                </div>

                {/* Current Step */}
                {(() => {
                  const step = getCurrentStep()
                  if (!step) return null

                  return (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                          {step.title}
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {step.content}
                          </p>
                        </div>
                      </div>

                      {step.type === 'input' && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Sua resposta:
                          </label>
                          <Textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Escreva sua reflexão aqui..."
                            className="min-h-[120px] resize-none"
                          />
                        </div>
                      )}

                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={() => setSelectedSession(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          Sair da Sessão
                        </Button>
                        <Button
                          onClick={nextStep}
                          disabled={step.type === 'input' && !userInput.trim()}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {currentStep === getSessionSteps(selectedSession).length - 1 ? 'Finalizar' : 'Próximo'}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}