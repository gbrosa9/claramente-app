"use client"

import { motion } from "framer-motion"
import { Heart, AlertCircle, Smile, Frown, Wind } from "lucide-react"

interface EmotionDetectorProps {
  emotion?: string
  intensity?: number
}

const emotionConfig: Record<string, { icon: any; color: string; label: string }> = {
  happiness: { icon: Smile, color: "text-yellow-500", label: "Alegria" },
  sadness: { icon: Frown, color: "text-blue-500", label: "Tristeza" },
  anxiety: { icon: AlertCircle, color: "text-orange-500", label: "Ansiedade" },
  calm: { icon: Wind, color: "text-teal-500", label: "Calma" },
  neutral: { icon: Heart, color: "text-purple-500", label: "Neutro" },
}

export default function EmotionDetector({ emotion = "neutral", intensity = 0.5 }: EmotionDetectorProps) {
  const config = emotionConfig[emotion] || emotionConfig.neutral
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </motion.div>
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{config.label}</p>
        <div className="flex gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1 w-1 rounded-full ${
                i < Math.round(intensity * 5)
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
