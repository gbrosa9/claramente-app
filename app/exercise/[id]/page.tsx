"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

export default function ExercisePage() {
  const router = useRouter()
  const params = useParams()
  const exerciseId = params.id as string
  
  const [exercise, setExercise] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccessfully, setSavedSuccessfully] = useState(false)

  useEffect(() => {
    loadExercise()
  }, [exerciseId])

  const loadExercise = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exercises/${exerciseId}`)
      
      if (!response.ok) {
        throw new Error('Exercício não encontrado')
      }

      const data = await response.json()
      
      if (data.success && data.exercise) {
        setExercise(data.exercise)
        setTimeLeft(data.exercise.duration * 60)
      } else {
        throw new Error('Exercício não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar exercício:', error)
      // Fallback to local data
      const fallbackExercises: Record<string, any> = {
        "box-breathing": {
          id: "box-breathing",
          title: "Respiração 4-4-4-4",
          description: "Técnica clássica de respiração caixa para acalmar o sistema nervoso",
          instructions: { steps: ["Inspire por 4 segundos", "Segure por 4 segundos", "Expire por 4 segundos", "Segure por 4 segundos", "Repita 8-10 vezes"] },
          duration: 5,
          benefits: ["Reduz ansiedade", "Melhora foco", "Acalma o sistema nervoso"],
        },
      }
      
      const fallbackExercise = fallbackExercises[exerciseId]
      if (fallbackExercise) {
        setExercise(fallbackExercise)
        setTimeLeft(fallbackExercise.duration * 60)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false)
            handleExerciseComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, timeLeft])

  const handleExerciseComplete = async () => {
    setCompleted(true)
    
    // Update user_exercises to in_progress first
    try {
      await fetch('/api/exercises/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId
        })
      })
    } catch (error) {
      console.error('Erro ao marcar exercício como iniciado:', error)
    }

    // Save progress
    await saveProgress()
  }

  const saveProgress = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/exercises/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId,
          payload: {
            completedAt: new Date().toISOString(),
            duration: exercise?.duration,
            method: 'timer'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar progresso')
      }

      setSavedSuccessfully(true)
      
      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        router.push('/exercises')
      }, 3000)
      
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
      alert('Erro ao salvar progresso. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Carregando exercício...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Exercício não encontrado</h1>
          <Button onClick={() => router.push('/exercises')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos exercícios
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/exercises')}
            className="text-white hover:bg-purple-700 mb-4"
            aria-label="Voltar para exercícios"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold">{exercise.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercise Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sobre este exercício</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{exercise.description}</p>

              {exercise.benefits && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Benefícios:</h3>
                  <ul className="space-y-1">
                    {exercise.benefits.map((benefit: string) => (
                      <li key={benefit} className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                        <CheckCircle className="w-4 h-4" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Como fazer</h2>
              <ol className="space-y-3">
                {(exercise.instructions?.steps || exercise.instructions || []).map((instruction: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Timer Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-8 text-white text-center"
            >
              <h3 className="text-lg font-semibold mb-4">Temporizador</h3>
              <motion.div
                animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
                className="text-6xl font-bold mb-8 font-mono"
              >
                {formatTime(timeLeft)}
              </motion.div>

              <div className="flex gap-3 mb-4">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={completed}
                  className="flex-1 bg-white text-purple-600 hover:bg-gray-100 font-semibold disabled:opacity-50"
                  aria-label={isPlaying ? "Pausar exercício" : "Iniciar exercício"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pausar" : "Iniciar"}
                </Button>
                <Button
                  onClick={() => {
                    setIsPlaying(false)
                    setTimeLeft(exercise.duration * 60)
                    setCompleted(false)
                    setSavedSuccessfully(false)
                  }}
                  className="flex-1 bg-white/20 text-white hover:bg-white/30 font-semibold"
                  aria-label="Reiniciar temporizador"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Manual Save Progress Button */}
              {!completed && !isPlaying && (
                <Button
                  onClick={saveProgress}
                  disabled={saving}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                  aria-label="Salvar progresso do exercício"
                  data-testid="save-progress"
                >
                  {saving ? 'Salvando...' : 'Salvar Progresso'}
                </Button>
              )}

              {completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mt-4 rounded-xl p-4 text-center ${
                    savedSuccessfully ? 'bg-green-500' : 'bg-green-600'
                  }`}
                >
                  <p className="font-bold text-lg">
                    {savedSuccessfully ? 'Progresso Salvo!' : 'Exercício Concluído!'}
                  </p>
                  <p className="text-sm text-green-100 mt-1">
                    {savedSuccessfully 
                      ? 'Redirecionando em alguns segundos...' 
                      : 'Continue praticando regularmente para melhores resultados'
                    }
                  </p>
                  {saving && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Dica Pro</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Pratique este exercício 2-3 vezes por dia para melhores resultados em longo prazo.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
