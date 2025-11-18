"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, Square, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  isListening: boolean
  setIsListening: (value: boolean) => void
}

export default function VoiceRecorder({ onTranscript, isListening, setIsListening }: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })

        try {
          // Create form data for API
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.wav')

          // Send to STT API
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          })

          const data = await response.json()

          if (data.ok) {
            onTranscript(data.data.text)
          } else {
            setError(data.error || 'Erro ao transcrever áudio')
            console.error('STT error:', data.error)
          }
        } catch (error) {
          console.error('Error transcribing audio:', error)
          setError('Erro ao processar áudio')
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Não foi possível acessar o microfone")
      setIsProcessing(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsListening(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
      {isListening ? (
        <>
          <motion.button
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
            onClick={stopRecording}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 blur animate-pulse" />
            <Button size="icon" className="bg-red-600 hover:bg-red-700 text-white relative">
              <Square className="w-5 h-5" />
            </Button>
          </motion.button>
          <span className="text-sm text-red-600 font-semibold">Gravando...</span>
        </>
      ) : (
        <Button
          size="icon"
          variant="outline"
          onClick={startRecording}
          disabled={isProcessing}
          className="border-purple-200 hover:bg-purple-50 bg-transparent dark:border-purple-800 dark:hover:bg-slate-800"
        >
          {isProcessing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}>
              <Mic className="w-5 h-5 text-purple-600" />
            </motion.div>
          ) : (
            <Mic className="w-5 h-5 text-purple-600" />
          )}
        </Button>
      )}
    </div>
  )
}
