"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Download, X } from "lucide-react"
import { Button } from "./ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    })

    window.addEventListener("appinstalled", () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    })
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  if (!showPrompt) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Instalar ClaraMENTE</h3>
          </div>
          <button onClick={() => setShowPrompt(false)}>
            <X className="w-4 h-4 text-slate-500 hover:text-slate-700" />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Instale ClaraMENTE como app para acesso rápido e uso offline.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
            Instalar
          </Button>
          <Button onClick={() => setShowPrompt(false)} variant="outline" className="flex-1">
            Depois
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
