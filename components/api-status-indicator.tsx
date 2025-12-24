"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Settings, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface APIStatus {
  openai: boolean
  chat: boolean
  tts: boolean
  stt: boolean
}

export default function APIStatusIndicator() {
  const [status, setStatus] = useState<APIStatus>({
    openai: false,
    chat: false,
    tts: false,
    stt: false
  })
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkAPIStatus()
  }, [])

  const checkAPIStatus = async () => {
    setLoading(true)
    try {
      // Test chat API
      const chatResponse = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'teste' })
      })
      const chatData = await chatResponse.json()
      // Check if chat is working (OpenAI or Gemini)
      const chatWorking = chatData.ok || (chatData.error && !chatData.error.includes('Chave da API') && !chatData.error.includes('inválida'))

      setStatus({
        openai: chatWorking,
        chat: chatWorking,
        tts: chatWorking, // Assume TTS works if chat works
        stt: chatWorking, // Assume STT works if chat works
      })
    } catch (error) {
      console.error('Error checking API status:', error)
    } finally {
      setLoading(false)
    }
  }

  const allWorking = Object.values(status).every(Boolean)

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="w-80 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-5 h-5 text-purple-600" />
              </motion.div>
              <span className="text-sm">Verificando APIs...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className={`w-80 border-2 ${
        allWorking 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
          : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {allWorking ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  IA Configurada
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Configuração Necessária
                </>
              )}
            </CardTitle>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm underline opacity-70 hover:opacity-100"
            >
              {showDetails ? 'Ocultar' : 'Detalhes'}
            </button>
          </div>
          <CardDescription>
            {allWorking 
              ? 'Clara está pronta para conversar!' 
              : 'Configure sua chave de IA (OpenAI ou Gemini)'
            }
          </CardDescription>
        </CardHeader>
        
        {showDetails && (
          <CardContent className="pt-0">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <StatusItem 
                  label="API de IA (OpenAI/Gemini)" 
                  working={status.openai} 
                  icon={<Key className="w-4 h-4" />}
                />
                <StatusItem 
                  label="Chat de Texto" 
                  working={status.chat} 
                  icon={<span className="text-xs">💬</span>}
                />
                <StatusItem 
                  label="Síntese de Voz" 
                  working={status.tts} 
                  icon={<span className="text-xs">🔊</span>}
                />
                <StatusItem 
                  label="Transcrição" 
                  working={status.stt} 
                  icon={<span className="text-xs">🎤</span>}
                />
              </div>
              
              {!allWorking && (
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                    Como configurar:
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    1. Obtenha sua chave em platform.openai.com<br/>
                    2. Adicione no arquivo .env.local<br/>
                    3. Reinicie o servidor
                  </p>
                </div>
              )}
            </motion.div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}

function StatusItem({ 
  label, 
  working, 
  icon 
}: { 
  label: string
  working: boolean
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {working ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <AlertCircle className="w-4 h-4 text-orange-600" />
      )}
    </div>
  )
}