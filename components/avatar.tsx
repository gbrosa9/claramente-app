"use client"

import { motion } from "framer-motion"

interface AvatarProps {
  isActive?: boolean
}

export default function AvatarComponent({ isActive = true }: AvatarProps) {
  return (
    <motion.div
      animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.7 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      {/* 3D Avatar Placeholder */}
      <motion.div
        animate={isActive ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="relative w-24 h-24"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-20 h-20">
            {/* Simple avatar face */}
            <circle cx="50" cy="50" r="40" fill="white" opacity="0.1" />
            {/* Eyes */}
            <circle cx="40" cy="40" r="4" fill="white" />
            <circle cx="60" cy="40" r="4" fill="white" />
            {/* Mouth */}
            <path d="M 40 60 Q 50 70 60 60" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      {/* Name and Status */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clara</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{isActive ? "● Online" : "• Conectando..."}</p>
      </div>

      {/* Animated indicator */}
      {isActive && (
        <div className="flex gap-2">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            className="w-2 h-2 bg-purple-600 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
            className="w-2 h-2 bg-pink-600 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
            className="w-2 h-2 bg-purple-600 rounded-full"
          />
        </div>
      )}
    </motion.div>
  )
}
