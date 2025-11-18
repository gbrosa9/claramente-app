"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, Mic, MicOff, Video, VideoOff, PhoneOff, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface LipSyncFrame {
  mouth: "closed" | "open" | "aaa" | "eee"
  duration: number
}

export default function VoiceCallPage() {
  const [callActive, setCallActive] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [speakerEnabled, setSpeakerEnabled] = useState(true)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [userTranscript, setUserTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [connecting, setConnecting] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [lipSyncFrame, setLipSyncFrame] = useState<LipSyncFrame>({ mouth: "closed", duration: 0 })
  const callDurationRef = useRef(0)
  const [callDuration, setCallDuration] = useState("00:00")

  // Animation function for lip-sync
  const animateLipSync = async (text: string) => {
    setAiSpeaking(true)

    // Simular animação de fala com lip-sync
    const mouthSequence: Array<LipSyncFrame> = []
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char.match(/[aáãâä]/)) {
        mouthSequence.push({ mouth: "aaa", duration: 100 })
      } else if (char.match(/[eéèê]/)) {
        mouthSequence.push({ mouth: "eee", duration: 100 })
      } else if (char.match(/[oóòô]/)) {
        mouthSequence.push({ mouth: "open", duration: 100 })
      } else if (char === " ") {
        mouthSequence.push({ mouth: "closed", duration: 150 })
      } else {
        mouthSequence.push({ mouth: "open", duration: 80 })
      }
    }

    // Reproduzir animação de lip-sync
    for (const frame of mouthSequence) {
      setLipSyncFrame(frame)
      await new Promise((resolve) => setTimeout(resolve, frame.duration))
    }

    setLipSyncFrame({ mouth: "closed", duration: 0 })
    setAiSpeaking(false)
  }

  // Fallback speech function
  const speakTextFallback = (text: string) => {
    if ('speechSynthesis' in window && speakerEnabled) {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "pt-BR"
      utterance.rate = 0.85
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
      const voices = speechSynthesis.getVoices()
      const bestVoice = voices.find(voice => 
        voice.lang === 'pt-BR' && voice.name.toLowerCase().includes('fem')
      ) || voices.find(voice => 
        voice.lang.includes('pt-BR')
      ) || voices.find(voice => 
        voice.lang.includes('pt')
      )
      
      if (bestVoice) {
        utterance.voice = bestVoice
      }
      
      utterance.onstart = () => setAiSpeaking(true)
      utterance.onend = () => setAiSpeaking(false)
      utterance.onerror = () => setAiSpeaking(false)
      
      speechSynthesis.speak(utterance)
    }
  }

  // Generate fallback response
  const generateFallbackResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase()
    let response = ""
    
    if (message.includes("ansiedade") || message.includes("ansiosa") || message.includes("nervosa")) {
      response = "Entendo que você está sentindo ansiedade. Vamos usar uma técnica de respiração. Inspire por 4 segundos, segure por 4, expire por 6. Repita comigo. Lembre-se: este sentimento é temporário e você tem controle."
    } else if (message.includes("triste") || message.includes("deprimida") || message.includes("down")) {
      response = "Percebo que você está passando por um momento difícil. Na TCC, aprendemos que nossos pensamentos influenciam nossos sentimentos. Que pensamentos estão passando pela sua mente agora? Vamos identificá-los juntas."
    } else if (message.includes("raiva") || message.includes("irritada") || message.includes("brava")) {
      response = "A raiva é uma emoção válida. Na DBT, temos a técnica TIPP - Temperatura, Exercício Intenso, Respiração Pausada e Relaxamento Muscular. Vamos tentar respirar profundamente primeiro. Conte para mim o que aconteceu."
    } else if (message.includes("estresse") || message.includes("pressão") || message.includes("sobregregada")) {
      response = "O estresse pode ser avassalador. Vamos usar mindfulness agora. Observe três coisas que você pode ver, duas que pode ouvir, e uma que pode tocar. Isso vai te ajudar a se ancorar no presente."
    } else {
      response = "Estou aqui para te ouvir e apoiar. Como terapeuta especialista em DBT e TCC, posso te ajudar com técnicas específicas. Me conte mais sobre como você está se sentindo - sem julgamentos, apenas com acolhimento."
    }
    
    setAiResponse(response)
    animateLipSync(response)
    speakTextFallback(response)
  }

  // Send user message to API
  const sendUserMessage = async (message: string) => {
    if (!message.trim()) return
    
    setUserTranscript("")
    
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      })
      
      const data = await response.json()
      
      if (data.ok) {
        const claraResponse = data.data.response
        setAiResponse(claraResponse)
        animateLipSync(claraResponse)
        
        try {
          const audioResponse = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: claraResponse,
              voice: 'nova'
            })
          })

          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            
            const audio = new Audio(audioUrl)
            audio.onplay = () => setAiSpeaking(true)
            audio.onended = () => setAiSpeaking(false)
            audio.onerror = () => setAiSpeaking(false)
            
            if (speakerEnabled) {
              audio.play().catch(error => {
                console.error('Error playing audio:', error)
                speakTextFallback(claraResponse)
              })
            }
          } else {
            speakTextFallback(claraResponse)
          }
        } catch (audioError) {
          console.error('Error generating audio:', audioError)
          speakTextFallback(claraResponse)
        }
      } else {
        generateFallbackResponse(message)
      }
    } catch (error) {
      console.error('Error sending user message:', error)
      generateFallbackResponse(message)
    }
  }

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && !recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "pt-BR"

        recognitionRef.current.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setUserTranscript(transcript)
          
          // Send message when user stops speaking
          if (event.results[event.resultIndex].isFinal && transcript.trim()) {
            sendUserMessage(transcript.trim())
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.log('Speech recognition error:', event.error)
          if (event.error === 'no-speech') {
            if (callActive && micEnabled) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start()
                } catch (e) {
                  console.log('Recognition restart failed:', e)
                }
              }, 1000)
            }
          }
        }

        recognitionRef.current.onend = () => {
          if (callActive && micEnabled) {
            setTimeout(() => {
              try {
                recognitionRef.current?.start()
              } catch (e) {
                console.log('Recognition restart failed:', e)
              }
            }, 500)
          }
        }
      } else {
        console.log('Speech recognition not supported in this browser')
      }
    }
  }, [callActive, micEnabled])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callActive) {
      interval = setInterval(() => {
        callDurationRef.current++
        const minutes = Math.floor(callDurationRef.current / 60)
        const seconds = callDurationRef.current % 60
        setCallDuration(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callActive])

  const startFallbackSession = () => {
    const welcomeMessage = "Olá! Sou Clara, sua terapeuta especializada em TCC e DBT. Bem-vindo à nossa sessão de voz! Como você está se sentindo hoje? Estou aqui para te ouvir e te apoiar com técnicas terapêuticas personalizadas."
    
    setTimeout(() => {
      setAiResponse(welcomeMessage)
      animateLipSync(welcomeMessage)
      speakTextFallback(welcomeMessage)
    }, 1000)
  }

  const startCall = async () => {
    setConnecting(true)
    setUserTranscript("")
    setAiResponse("")
    
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.log('Speech recognition already running or not available')
        }
      }

      setCallActive(true)
      callDurationRef.current = 0

      const welcomeMessage = "Olá Clara! Iniciando uma chamada de voz para terapia."
      
      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: welcomeMessage })
        })
        
        const data = await response.json()
        
        if (data.ok) {
          const claraResponse = data.data.response
          setAiResponse(claraResponse)
          animateLipSync(claraResponse)
          
          setTimeout(async () => {
            try {
              const audioResponse = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: claraResponse,
                  voice: 'nova'
                })
              })

              if (audioResponse.ok) {
                const audioBlob = await audioResponse.blob()
                const audioUrl = URL.createObjectURL(audioBlob)
                
                const audio = new Audio(audioUrl)
                audio.onplay = () => setAiSpeaking(true)
                audio.onended = () => setAiSpeaking(false)
                audio.onerror = () => setAiSpeaking(false)
                
                if (speakerEnabled) {
                  audio.play().catch(error => {
                    console.error('Error playing audio:', error)
                    speakTextFallback(claraResponse)
                  })
                }
              } else {
                speakTextFallback(claraResponse)
              }
            } catch (audioError) {
              console.error('Error generating audio:', audioError)
              speakTextFallback(claraResponse)
            }
          }, 1000)
        } else {
          startFallbackSession()
        }
      } catch (apiError) {
        console.log('API not available, using fallback response')
        startFallbackSession()
      }
    } catch (error) {
      console.error('Error starting call:', error)
      startFallbackSession()
    } finally {
      setConnecting(false)
    }
  }

  const endCall = () => {
    setCallActive(false)
    setConnecting(false)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Error stopping recognition:', error)
      }
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    
    setUserTranscript("")
    setAiResponse("")
    setAiSpeaking(false)
    callDurationRef.current = 0
    setCallDuration("00:00")
  }

  const getMouthEmoji = () => {
    switch (lipSyncFrame.mouth) {
      case "open":
        return "O"
      case "aaa":
        return "A"
      case "eee":
        return "E"
      default:
        return "・"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/")}
          className="hover:bg-purple-100 dark:hover:bg-slate-800"
        >
          ← Voltar
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-12"
      >
        {!callActive ? (
          <>
            <div className="text-center space-y-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Chamada com Clara
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Conecte-se com a IA Clara para uma sessão terapêutica personalizada com voz em tempo real
              </p>

              <div className="flex justify-center py-8">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                  alt="Clara Avatar"
                  width={250}
                  height={300}
                  className="max-w-xs drop-shadow-lg"
                />
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-purple-900 dark:text-purple-100">Clara está pronta para conversar</p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Clique abaixo para iniciar uma chamada. Você pode usar voz e conversar em tempo real.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  onClick={startCall}
                  disabled={connecting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 rounded-full text-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className={`w-5 h-5 ${connecting ? 'animate-pulse' : ''}`} />
                  {connecting ? 'Conectando...' : 'Iniciar Chamada'}
                </Button>
              </div>

              {connecting && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 text-purple-600">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Preparando chamada com Clara...</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Duração da chamada</p>
                <p className="text-4xl font-bold text-purple-600">{callDuration}</p>
              </div>

              <div className="flex justify-center relative">
                <motion.div
                  className="relative"
                  animate={{ scale: aiSpeaking ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%204%20de%20nov.%20de%202025%2C%2002_00_43-3MDMMTr4Rb3zIyANnzS3AAa2nWxUyf.png"
                    alt="Clara Avatar"
                    width={200}
                    height={250}
                    className="max-w-xs drop-shadow-lg"
                  />

                  {aiSpeaking && (
                    <motion.div
                      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-2xl font-bold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {getMouthEmoji()}
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="space-y-4">
                {aiResponse && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <p className="text-sm text-purple-900 dark:text-purple-200 font-semibold mb-2">Clara:</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-purple-800 dark:text-purple-100"
                    >
                      {aiResponse}
                    </motion.p>
                  </div>
                )}

                {userTranscript && (
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                    <p className="text-sm text-cyan-900 dark:text-cyan-200 font-semibold mb-2">Você:</p>
                    <p className="text-cyan-800 dark:text-cyan-100">{userTranscript}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 pt-8 border-t border-gray-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    const newMicState = !micEnabled
                    setMicEnabled(newMicState)
                    
                    if (recognitionRef.current) {
                      if (newMicState) {
                        try {
                          recognitionRef.current.start()
                        } catch (error) {
                          console.log('Recognition already running or error starting:', error)
                        }
                      } else {
                        try {
                          recognitionRef.current.stop()
                        } catch (error) {
                          console.log('Error stopping recognition:', error)
                        }
                        setUserTranscript("")
                      }
                    }
                  }}
                  className={`p-4 rounded-full transition-colors relative ${
                    micEnabled
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-slate-500"
                  }`}
                >
                  {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  {micEnabled && userTranscript && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                    />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`p-4 rounded-full transition-colors ${
                    videoEnabled
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-slate-500"
                  }`}
                >
                  {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSpeakerEnabled(!speakerEnabled)}
                  className={`p-4 rounded-full transition-colors ${
                    speakerEnabled
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-slate-500"
                  }`}
                >
                  <Volume2 className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={endCall}
                  className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <PhoneOff className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
