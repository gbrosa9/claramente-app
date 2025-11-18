"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Wind, Heart, Flame, Clock, ChevronRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Exercise {
  id: string
  title: string
  description: string
  icon: any
  duration: number
  difficulty: "Iniciante" | "Intermediário" | "Avançado"
  category: "Respiração" | "Ansiedade" | "Mindfulness" | "DBT"
  completed?: boolean
}

// Icon mapping
const iconMap: Record<string, any> = {
  'box-breathing': Wind,
  'progressive-relaxation': Heart,
  '4-7-8-breathing': Wind,
  'mindfulness-meditation': Flame,
  'grounding-5-4-3-2-1': Heart,
  'dbt-distress-tolerance': Flame,
  'body-scan': Flame,
  'cognitive-defusion': Heart,
}

export default function ExercisesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [userExercises, setUserExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ["Todos", "Respiração", "Ansiedade", "Mindfulness", "DBT"]

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      setLoading(true)
      
      // Fetch exercises from Supabase
      const response = await fetch('/api/exercises')
      if (!response.ok) {
        throw new Error('Erro ao carregar exercícios')
      }

      const data = await response.json()
      
      if (data.success && data.exercises) {
        const exercisesWithIcons = data.exercises.map((exercise: any) => ({
          ...exercise,
          icon: iconMap[exercise.id] || Wind,
          completed: data.userExercises?.some((ue: any) => 
            ue.exercise_id === exercise.id && ue.status === 'done'
          ) || false
        }))
        
        setExercises(exercisesWithIcons)
        setUserExercises(data.userExercises || [])
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error)
      // Fallback to local data if API fails
      setExercises([
        {
          id: "box-breathing",
          title: "Respiração 4-4-4-4",
          description: "Técnica clássica de respiração caixa para acalmar o sistema nervoso",
          icon: Wind,
          duration: 5,
          difficulty: "Iniciante",
          category: "Respiração",
          completed: false,
        },
        // Add other fallback exercises...
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExerciseClick = (exerciseId: string) => {
    router.push(`/exercises/${exerciseId}`)
  }

  const filteredExercises =
    selectedCategory === "Todos" ? exercises : exercises.filter((e) => e.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/dashboard")}
            className="text-white hover:bg-purple-700 mb-6"
          >
            ← Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">Biblioteca de Exercícios</h1>
          <p className="text-purple-100">Escolha exercícios baseados em TCC e DBT para seu bem-estar</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:border-purple-600"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Exercises Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg p-6"
              >
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </motion.div>
            ))
          ) : (
            filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleExerciseClick(exercise.id)}
              >
                <div className="p-6 space-y-4">
                  {/* Icon and Header */}
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${exercise.completed ? 'bg-green-600' : 'bg-gradient-to-br from-purple-600 to-purple-700'} rounded-lg flex items-center justify-center`}>
                      {exercise.completed ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <exercise.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {exercise.difficulty}
                      </span>
                      {exercise.completed && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-semibold">
                          Concluído
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{exercise.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{exercise.description}</p>
                  </div>

                  {/* Footer with Duration and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{exercise.duration} min</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExerciseClick(exercise.id)
                      }}
                      aria-label={`Fazer exercício ${exercise.title}`}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900"
                    >
                      {exercise.completed ? 'Refazer' : 'Fazer'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  )
}
