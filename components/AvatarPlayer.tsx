'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Play, Pause, Volume2, VolumeX, Loader2, Settings } from 'lucide-react'

// Tipos
interface VoicePreset {
  id: string
  name: string
  description: string
}

interface VoiceSettings {
  stability: number
  similarity_boost: number
  style: number
}

type EmotionType = 
  | 'neutral' | 'happy' | 'sad' | 'calm' | 'empathetic' 
  | 'caring' | 'supportive' | 'encouraging' | 'serious' 
  | 'peaceful' | 'hopeful' | 'thoughtful'

const EMOTIONS: { id: EmotionType; label: string }[] = [
  { id: 'neutral', label: 'Neutro' },
  { id: 'empathetic', label: 'Empático' },
  { id: 'calm', label: 'Calmo' },
  { id: 'caring', label: 'Carinhoso' },
  { id: 'supportive', label: 'Apoiador' },
  { id: 'encouraging', label: 'Encorajador' },
  { id: 'happy', label: 'Feliz' },
  { id: 'sad', label: 'Triste' },
  { id: 'serious', label: 'Sério' },
  { id: 'peaceful', label: 'Pacífico' },
  { id: 'hopeful', label: 'Esperançoso' },
  { id: 'thoughtful', label: 'Pensativo' },
]

const DEFAULT_VOICES: VoicePreset[] = [
  { id: 'clara', name: 'Clara', description: 'Voz da terapeuta Clara' },
  { id: 'bella', name: 'Bella', description: 'Voz feminina suave' },
  { id: 'rachel', name: 'Rachel', description: 'Voz feminina natural' },
  { id: 'domi', name: 'Domi', description: 'Voz feminina expressiva' },
  { id: 'amigavel', name: 'Amigável', description: 'Voz acessível' },
  { id: 'pt-BR-Wavenet-C', name: 'Google Wavenet C', description: 'Google TTS feminina' },
  { id: 'pt-BR-Wavenet-A', name: 'Google Wavenet A', description: 'Google TTS feminina 2' },
  { id: 'pt-BR-Neural2-A', name: 'Google Neural2 A', description: 'Google Neural feminina' },
]

const DEFAULT_TEXT = 'Olá! É um prazer te conhecer. Estou aqui para te ouvir e te apoiar. Como você está se sentindo hoje?'

export default function AvatarPlayer() {
  // Estados
  const [text, setText] = useState(DEFAULT_TEXT)
  const [selectedVoice, setSelectedVoice] = useState('clara')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('empathetic')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [voices, setVoices] = useState<VoicePreset[]>(DEFAULT_VOICES)
  
  // Configurações avançadas
  const [customSettings, setCustomSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
  })
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  
  // Carrega vozes disponíveis ao montar
  useEffect(() => {
    fetchAvailableVoices()
    
    return () => {
      // Limpa URL do áudio ao desmontar
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
    }
  }, [])
  
  async function fetchAvailableVoices() {
    try {
      const response = await fetch('/api/avatar/tts')
      const data = await response.json()
      
      if (data.ok && data.voices) {
        const allVoices: VoicePreset[] = [
          ...data.voices.elevenlabs,
          ...data.voices.google.map((v: any) => ({
            id: v.id,
            name: v.name,
            description: v.description,
          })),
        ]
        if (allVoices.length > 0) {
          setVoices(allVoices)
        }
      }
    } catch (err) {
      console.warn('Não foi possível carregar vozes, usando padrão')
    }
  }
  
  async function handleGenerateAudio() {
    if (!text.trim()) {
      setError('Digite um texto para gerar o áudio')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    // Para áudio anterior
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    
    try {
      const response = await fetch('/api/avatar/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          emotion: selectedEmotion,
          customSettings: showSettings ? customSettings : undefined,
        }),
      })
      
      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Erro ao gerar áudio')
      }
      
      // Converte base64 para Blob e cria URL
      const audioBytes = atob(data.audio)
      const audioArray = new Uint8Array(audioBytes.length)
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i)
      }
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' })
      
      // Limpa URL anterior
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
      
      const audioUrl = URL.createObjectURL(audioBlob)
      audioUrlRef.current = audioUrl
      
      // Cria e reproduz áudio
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setError('Erro ao reproduzir áudio')
        setIsPlaying(false)
      }
      
      await audio.play()
      
    } catch (err: any) {
      console.error('Erro ao gerar TTS:', err)
      setError(err.message || 'Erro ao gerar áudio')
    } finally {
      setIsLoading(false)
    }
  }
  
  function handlePlayPause() {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }
  
  function handleStop() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Avatar TTS Player
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Texto */}
        <div className="space-y-2">
          <label htmlFor="avatar-text" className="text-sm font-medium text-foreground">
            Texto para falar
          </label>
          <Textarea
            id="avatar-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Digite o texto que o avatar vai falar..."
            className="min-h-[100px]"
            maxLength={5000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {text.length}/5000 caracteres
          </p>
        </div>

        {/* Seletores de Voz e Emoção */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="voice-select" className="text-sm font-medium text-foreground">
              Voz
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(event) => setSelectedVoice(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {voices.find((voice) => voice.id === selectedVoice)?.description ?? 'Selecione uma voz'}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="emotion-select" className="text-sm font-medium text-foreground">
              Emoção
            </label>
            <select
              id="emotion-select"
              value={selectedEmotion}
              onChange={(event) => setSelectedEmotion(event.target.value as EmotionType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {EMOTIONS.map((emotion) => (
                <option key={emotion.id} value={emotion.id}>
                  {emotion.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Botão de configurações avançadas */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? 'Ocultar' : 'Mostrar'} configurações avançadas
          </Button>
        </div>
        
        {/* Configurações avançadas */}
        {showSettings && (
          <div className="space-y-4 rounded-lg bg-muted p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="stability-slider" className="text-sm font-medium text-foreground">
                  Estabilidade
                </label>
                <span className="text-sm text-muted-foreground">{customSettings.stability.toFixed(2)}</span>
              </div>
              <input
                id="stability-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={customSettings.stability}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  setCustomSettings((settings) => ({ ...settings, stability: value }))
                }}
                className="w-full accent-purple-600"
              />
              <p className="text-xs text-muted-foreground">
                Menor = mais expressivo, maior = mais estável
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="similarity-slider" className="text-sm font-medium text-foreground">
                  Similaridade
                </label>
                <span className="text-sm text-muted-foreground">{customSettings.similarity_boost.toFixed(2)}</span>
              </div>
              <input
                id="similarity-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={customSettings.similarity_boost}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  setCustomSettings((settings) => ({ ...settings, similarity_boost: value }))
                }}
                className="w-full accent-purple-600"
              />
              <p className="text-xs text-muted-foreground">
                Fidelidade à voz original
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="style-slider" className="text-sm font-medium text-foreground">
                  Estilo
                </label>
                <span className="text-sm text-muted-foreground">{customSettings.style.toFixed(2)}</span>
              </div>
              <input
                id="style-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={customSettings.style}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  setCustomSettings((settings) => ({ ...settings, style: value }))
                }}
                className="w-full accent-purple-600"
              />
              <p className="text-xs text-muted-foreground">
                Intensidade do estilo da voz
              </p>
            </div>
          </div>
        )}
        
        {/* Erro */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Botões de controle */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateAudio}
            disabled={isLoading || !text.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Gerar e Reproduzir
              </>
            )}
          </Button>
          
          {audioRef.current && (
            <>
              <Button
                variant="outline"
                onClick={handlePlayPause}
                disabled={isLoading}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleStop}
                disabled={isLoading}
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        
        {/* Info da voz selecionada */}
        <div className="text-sm text-muted-foreground text-center">
          Voz: <strong>{voices.find(v => v.id === selectedVoice)?.name || selectedVoice}</strong>
          {' • '}
          Emoção: <strong>{EMOTIONS.find(e => e.id === selectedEmotion)?.label || selectedEmotion}</strong>
        </div>
      </CardContent>
    </Card>
  )
}
