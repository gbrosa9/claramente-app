"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-md"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Brain className="w-24 h-24 text-purple-600 mx-auto opacity-50" />
        </motion.div>

        <div>
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Página não encontrada</p>
          <p className="text-slate-600 dark:text-slate-300">
            Desculpe, não conseguimos encontrar o que você estava procurando.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              Voltar ao Início
            </Button>
          </Link>
          <Link href="/dashboard" className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50 dark:hover:bg-slate-800"
            >
              Ir ao Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
