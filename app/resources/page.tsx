"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Play, Clock, Heart, Wind, Leaf, Zap, Pause, RotateCcw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Exercise {
  id: string
  icon: any
  title: string
  duration: string
  category: string
  description: string
  benefits: string[]
  steps: string[]
  type: 'breathing' | 'meditation' | 'grounding' | 'relaxation' | 'visualization'
}

export default function ResourcesPage() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [isExerciseRunning, setIsExerciseRunning] = useState(false)
  const [exerciseStep, setExerciseStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [breathingPhase, setBreathingPhase] = useState('inhale')
  const [completedExercises, setCompletedExercises] = useState<string[]>([])

  const exercises: Exercise[] = [
    {
      id: "breathing-4-4-4-4",
      icon: Wind,
      title: "Respiração 4-4-4-4",
      duration: "5 min",
      category: "Iniciante",
      description: "Técnica clássica de respiração caixa para acalmar o sistema nervoso",
      benefits: ["Reduz ansiedade", "Melhora foco", "Acalma sistema nervoso"],
      steps: [
        "Sente-se confortavelmente com as costas retas",
        "Inspire pelo nariz contando até 4",
        "Segure a respiração contando até 4", 
        "Expire pela boca contando até 4",
        "Pause por 4 segundos",
        "Repita o ciclo por 5 minutos"
      ],
      type: 'breathing'
    },
    {
      id: "progressive-relaxation",
      icon: Heart,
      title: "Relaxamento Progressivo",
      duration: "10 min",
      category: "Intermediário",
      description: "Tense e solte grupos musculares para reduzir tensão",
      benefits: ["Reduz tensão muscular", "Melhora sono", "Diminui estresse"],
      steps: [
        "Deite-se confortavelmente",
        "Comece pelos pés - tense por 5 segundos",
        "Solte completamente e observe o relaxamento",
        "Suba para panturrilhas, coxas, abdômen",
        "Continue com braços, ombros, pescoço",
        "Termine com músculos faciais"
      ],
      type: 'relaxation'
    },
    {
      id: "breathing-4-7-8",
      icon: Wind,
      title: "Respiração 4-7-8",
      duration: "8 min",
      category: "Avançado",
      description: "Técnica avançada para ansiedade e insônia",
      benefits: ["Combate insônia", "Reduz ansiedade severa", "Ativa relaxamento"],
      steps: [
        "Prepare-se em posição confortável",
        "Inspire pelo nariz contando até 4",
        "Segure a respiração contando até 7", 
        "Expire pela boca contando até 8",
        "Repita o ciclo 4 vezes inicialmente",
        "Aumente gradualmente com a prática"
      ],
      type: 'breathing'
    },
    {
      id: "mindfulness-meditation",
      icon: Leaf,
      title: "Meditação Mindfulness",
      duration: "15 min",
      category: "Intermediário",
      description: "Observe seus pensamentos sem julgamento",
      benefits: ["Aumenta autoconsciência", "Reduz rumination", "Melhora regulação emocional"],
      steps: [
        "Sente-se em posição confortável",
        "Feche os olhos suavemente",
        "Observe sua respiração natural",
        "Note pensamentos que surgem",
        "Não julgue, apenas observe",
        "Retorne gentilmente à respiração"
      ],
      type: 'meditation'
    },
    {
      id: "grounding-5-4-3-2-1",
      icon: Zap,
      title: "Técnica 5-4-3-2-1",
      duration: "5 min",
      category: "Iniciante",
      description: "Ancoragem através dos 5 sentidos para crises de ansiedade",
      benefits: ["Alívio de crises", "Reorienta para o presente", "Reduz dissociação"],
      steps: [
        "Olhe ao redor e nomeie 5 coisas que vê",
        "Toque e nomeie 4 coisas que sente",
        "Escute e nomeie 3 sons ao redor",
        "Cheire e nomeie 2 aromas",
        "Prove e nomeie 1 sabor na boca"
      ],
      type: 'grounding'
    },
    {
      id: "dbt-distress-tolerance",
      icon: Zap,
      title: "Tolerância ao Sofrimento (DBT)",
      duration: "12 min",
      category: "Avançado",
      description: "Técnicas de sobrevivência para crises emocionais",
      benefits: ["Gerencia crises", "Desenvolve tolerância", "Previne comportamentos impulsivos"],
      steps: [
        "Identifique a emoção intensa",
        "Use TIPP: Temperatura (água fria no rosto)",
        "Exercício intenso (polichinelos)",
        "Respiração pausada (expire mais longo)",
        "Relaxamento muscular progressivo",
        "Aceite a emoção sem lutar contra ela"
      ],
      type: 'grounding'
    },
    {
      id: "body-scan",
      icon: Heart,
      title: "Varredura do Corpo",
      duration: "20 min",
      category: "Intermediário",
      description: "Consciência corporal plena",
      benefits: ["Aumenta autoconsciência", "Reduz tensão", "Melhora conexão corpo-mente"],
      steps: [
        "Deite-se confortavelmente",
        "Comece pela parte superior da cabeça",
        "Mova a atenção lentamente pelo corpo",
        "Observe sensações sem tentar mudá-las",
        "Continue até os dedos dos pés",
        "Termine com consciência do corpo todo"
      ],
      type: 'meditation'
    },
    {
      id: "cognitive-defusion",
      icon: Leaf,
      title: "Defusão Cognitiva (TCC)",
      duration: "8 min",
      category: "Intermediário",
      description: "Separe-se de pensamentos negativos automáticos",
      benefits: ["Reduz impacto de pensamentos negativos", "Aumenta flexibilidade mental", "Melhora regulação emocional"],
      steps: [
        "Identifique o pensamento negativo",
        "Diga: 'Estou tendo o pensamento de que...'",
        "Observe o pensamento como uma nuvem passando",
        "Pergunte: 'Este pensamento é útil agora?'",
        "Escolha conscientemente como responder",
        "Redirecione para ação baseada em valores"
      ],
      type: 'meditation'
    }
  ]

  const categories = ["Todos", "Iniciante", "Intermediário", "Avançado"]
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const filteredExercises =
    selectedCategory === "Todos" ? exercises : exercises.filter((ex) => ex.category === selectedCategory)

  // Timer para exercícios
  useEffect(() => {
    if (timeRemaining > 0 && isExerciseRunning) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && isExerciseRunning) {
      // Exercício completado
      completeExercise()
    }
  }, [timeRemaining, isExerciseRunning])

  // Lógica de respiração para diferentes exercícios
  useEffect(() => {
    if (isExerciseRunning && (selectedExercise === "breathing-4-7-8" || selectedExercise === "breathing-4-4-4-4")) {
      let breathingInterval: NodeJS.Timeout
      
      if (selectedExercise === "breathing-4-7-8") {
        breathingInterval = setInterval(() => {
          setBreathingPhase(prev => {
            switch(prev) {
              case 'inhale': return 'hold'
              case 'hold': return 'exhale'
              case 'exhale': return 'inhale'
              default: return 'inhale'
            }
          })
        }, breathingPhase === 'inhale' ? 4000 : breathingPhase === 'hold' ? 7000 : 8000)
      } else if (selectedExercise === "breathing-4-4-4-4") {
        breathingInterval = setInterval(() => {
          setBreathingPhase(prev => {
            switch(prev) {
              case 'inhale': return 'hold'
              case 'hold': return 'exhale'
              case 'exhale': return 'pause'
              case 'pause': return 'inhale'
              default: return 'inhale'
            }
          })
        }, 4000) // Todos os tempos são 4 segundos na respiração caixa
      }
      
      return () => clearInterval(breathingInterval)
    }
  }, [isExerciseRunning, selectedExercise, breathingPhase])

  // Auto-progress para exercícios de meditação
  useEffect(() => {
    if (isExerciseRunning && (selectedExercise === "mindfulness-meditation" || selectedExercise === "body-scan")) {
      const progressInterval = setInterval(() => {
        setExerciseStep(prev => {
          const exercise = exercises.find(ex => ex.id === selectedExercise)
          if (!exercise) return prev
          return (prev + 1) % exercise.steps.length
        })
      }, 30000) // Muda a cada 30 segundos para meditação
      
      return () => clearInterval(progressInterval)
    }
  }, [isExerciseRunning, selectedExercise])

  const startExercise = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise) return

    setSelectedExercise(exerciseId)
    setIsExerciseRunning(true)
    setExerciseStep(0)
    setBreathingPhase('inhale')
    
    // Define duração baseada no exercício específico
    switch(exercise.id) {
      case 'breathing-4-4-4-4':
        setTimeRemaining(300) // 5 minutos
        break
      case 'progressive-relaxation':
        setTimeRemaining(600) // 10 minutos
        break
      case 'breathing-4-7-8':
        setTimeRemaining(480) // 8 minutos
        break
      case 'mindfulness-meditation':
        setTimeRemaining(900) // 15 minutos
        break
      case 'grounding-5-4-3-2-1':
        setTimeRemaining(300) // 5 minutos
        break
      case 'dbt-distress-tolerance':
        setTimeRemaining(720) // 12 minutos
        break
      case 'body-scan':
        setTimeRemaining(1200) // 20 minutos
        break
      case 'cognitive-defusion':
        setTimeRemaining(480) // 8 minutos
        break
      default:
        setTimeRemaining(300) // 5 minutos padrão
    }
  }

  const pauseExercise = () => {
    setIsExerciseRunning(!isExerciseRunning)
  }

  const resetExercise = () => {
    setIsExerciseRunning(false)
    setExerciseStep(0)
    setBreathingPhase('inhale')
    
    // Reset timer baseado no exercício
    const exercise = exercises.find(ex => ex.id === selectedExercise)
    if (exercise) {
      switch(exercise.id) {
        case 'breathing-4-4-4-4':
          setTimeRemaining(300)
          break
        case 'progressive-relaxation':
          setTimeRemaining(600)
          break
        case 'breathing-4-7-8':
          setTimeRemaining(480)
          break
        case 'mindfulness-meditation':
          setTimeRemaining(900)
          break
        case 'grounding-5-4-3-2-1':
          setTimeRemaining(300)
          break
        case 'dbt-distress-tolerance':
          setTimeRemaining(720)
          break
        case 'body-scan':
          setTimeRemaining(1200)
          break
        case 'cognitive-defusion':
          setTimeRemaining(480)
          break
        default:
          setTimeRemaining(300)
      }
    }
  }

  const completeExercise = () => {
    setIsExerciseRunning(false)
    if (selectedExercise && !completedExercises.includes(selectedExercise)) {
      setCompletedExercises([...completedExercises, selectedExercise])
    }
  }

  const nextStep = () => {
    const exercise = exercises.find(ex => ex.id === selectedExercise)
    if (exercise && exerciseStep < exercise.steps.length - 1) {
      setExerciseStep(exerciseStep + 1)
    }
  }

  const getExerciseContent = () => {
    const exercise = exercises.find(ex => ex.id === selectedExercise)
    if (!exercise) return null

    switch(exercise.id) {
      case 'breathing-4-4-4-4':
        return (
          <div className="text-center">
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-lg border-4 border-purple-600"
              animate={{
                scale: breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'hold' ? 1.2 : breathingPhase === 'exhale' ? 1 : 1
              }}
              transition={{ duration: 4 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                <Wind className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold mb-4">Respiração Caixa 4-4-4-4</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
              {breathingPhase === 'inhale' ? 'Inspire (4s)' : 
               breathingPhase === 'hold' ? 'Segure (4s)' : 
               breathingPhase === 'exhale' ? 'Expire (4s)' : 'Pause (4s)'}
            </p>
            <p className="text-sm text-slate-500">Siga o quadrado e mantenha o ritmo constante</p>
          </div>
        )

      case 'breathing-4-7-8':
        return (
          <div className="text-center">
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-purple-600"
              animate={{
                scale: breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'hold' ? 1.3 : 1
              }}
              transition={{ duration: breathingPhase === 'inhale' ? 4 : breathingPhase === 'hold' ? 0 : 8 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <Wind className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold mb-4">Respiração 4-7-8</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
              {breathingPhase === 'inhale' ? 'Inspire pelo nariz (4s)' : 
               breathingPhase === 'hold' ? 'Segure a respiração (7s)' : 'Expire pela boca (8s)'}
            </p>
            <p className="text-sm text-slate-500">Técnica avançada para relaxamento profundo</p>
          </div>
        )

      case 'progressive-relaxation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-bold mb-4">Relaxamento Progressivo</h3>
              <div className="text-lg p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="font-semibold mb-2">Etapa {exerciseStep + 1}: {exercise.steps[exerciseStep]}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tense o músculo por 5 segundos, depois solte completamente
                </p>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full" disabled={exerciseStep >= exercise.steps.length - 1}>
              Próximo Grupo Muscular
            </Button>
          </div>
        )

      case 'grounding-5-4-3-2-1':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">Ancoragem 5-4-3-2-1</h3>
              <div className="text-lg p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <p className="font-semibold mb-2">Etapa {exerciseStep + 1}</p>
                <p>{exercise.steps[exerciseStep]}</p>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full" disabled={exerciseStep >= exercise.steps.length - 1}>
              Próximo Sentido
            </Button>
          </div>
        )

      case 'dbt-distress-tolerance':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">Tolerância ao Sofrimento (DBT)</h3>
              <div className="text-lg p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="font-semibold mb-2">TIPP - Etapa {exerciseStep + 1}</p>
                <p>{exercise.steps[exerciseStep]}</p>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full" disabled={exerciseStep >= exercise.steps.length - 1}>
              Próxima Técnica
            </Button>
          </div>
        )

      case 'body-scan':
        return (
          <div className="text-center space-y-6">
            <motion.div
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold">Varredura do Corpo</h3>
            <div className="text-lg p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="mb-4">Observe as sensações sem tentar mudá-las</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Foco atual: {exercise.steps[Math.floor(exerciseStep) % exercise.steps.length]}
              </p>
            </div>
          </div>
        )

      case 'cognitive-defusion':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Leaf className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">Defusão Cognitiva (TCC)</h3>
              <div className="text-lg p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="font-semibold mb-2">Passo {exerciseStep + 1}</p>
                <p>{exercise.steps[exerciseStep]}</p>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full" disabled={exerciseStep >= exercise.steps.length - 1}>
              Próximo Passo
            </Button>
          </div>
        )

      case 'mindfulness-meditation':
        return (
          <div className="text-center space-y-6">
            <motion.div
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Leaf className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold">Mindfulness</h3>
            <div className="text-lg p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="mb-4">Respire naturalmente e observe seus pensamentos</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Orientação: {exercise.steps[Math.floor(exerciseStep) % exercise.steps.length]}
              </p>
            </div>
          </div>
        )

      default:
        return <div>Exercício em desenvolvimento...</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">← Voltar</Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recursos & Exercícios</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Exercícios Terapêuticos</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Técnicas práticas baseadas em TCC e DBT para melhorar seu bem-estar mental
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "border-purple-200 text-slate-700 dark:text-slate-300"
              }`}
            >
              {cat}
            </Button>
          ))}
        </motion.div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, i) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <Card className="h-full border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <exercise.icon className="w-8 h-8 text-purple-600" />
                    <div className="flex items-center gap-2">
                      {completedExercises.includes(exercise.id) && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <span className="text-xs font-semibold text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 px-2 py-1 rounded-full">
                        {exercise.category}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{exercise.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{exercise.duration}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{exercise.description}</p>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Benefícios:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <Button
                    onClick={() => startExercise(exercise.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 mt-4"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Exercício
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Exercise Running Modal */}
        <AnimatePresence>
          {selectedExercise && isExerciseRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl"
              >
                {(() => {
                  const exercise = exercises.find((ex) => ex.id === selectedExercise)!
                  return (
                    <>
                      {/* Header */}
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {exercise.title}
                        </h2>
                        <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <Progress value={(300 - timeRemaining) / 300 * 100} className="mt-4" />
                      </div>

                      {/* Exercise Content */}
                      <div className="mb-8">
                        {getExerciseContent()}
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2">
                        <Button
                          onClick={pauseExercise}
                          variant="outline"
                          className="flex-1"
                        >
                          {isExerciseRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={resetExercise}
                          variant="outline"
                          className="flex-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setSelectedExercise(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          Fechar
                        </Button>
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
