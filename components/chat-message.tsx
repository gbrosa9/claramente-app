"use client"

import { motion } from "framer-motion"
import { Card } from "./ui/card"
import { Heart, Flame, Brain, Lightbulb } from "lucide-react"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    emotion?: string
    // Optional audio URL when TTS is available
    audioUrl?: string
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  const emotionIcons: Record<string, any> = {
    anxiety: Flame,
    sadness: Heart,
    happiness: Lightbulb,
    calm: Brain,
  }

  const EmotionIcon = message.emotion ? emotionIcons[message.emotion] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
    >
      {!isUser && EmotionIcon && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="flex-shrink-0"
        >
          <EmotionIcon className="w-4 h-4 text-purple-600" />
        </motion.div>
      )}
      <Card
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
          isUser
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-purple-200 dark:border-purple-800 rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {/* Play assistant audio if available */}
        {!isUser && message.audioUrl && (
          <audio
            src={message.audioUrl}
            controls
            preload="auto"
            className="mt-2 w-full"
          />
        )}
        <span className={`text-xs mt-2 block ${isUser ? "text-white/70" : "text-slate-600 dark:text-slate-400"}`}>
          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </Card>
    </motion.div>
  )
}
