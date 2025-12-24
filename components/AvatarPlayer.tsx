'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
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
          <Label htmlFor="text">Texto para falar</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite o texto que o avatar vai falar..."
            className="min-h-[100px]"
            maxLength={5000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {text.length}/5000 caracteres
          </p>
        </div>
        
        {/* Seletores de Voz e Emoção */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Voz</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a voz" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span>{voice.name}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Emoção</Label>
            <Select value={selectedEmotion} onValueChange={(v) => setSelectedEmotion(v as EmotionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a emoção" />
              </SelectTrigger>
              <SelectContent>
                {EMOTIONS.map((emotion) => (
                  <SelectItem key={emotion.id} value={emotion.id}>
                    {emotion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Estabilidade</Label>
                <span className="text-sm text-muted-foreground">{customSettings.stability.toFixed(2)}</span>
              </div>
              <Slider
                value={[customSettings.stability]}
                onValueChange={([v]) => setCustomSettings(s => ({ ...s, stability: v }))}
                min={0}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                Menor = mais expressivo, maior = mais estável
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Similaridade</Label>
                <span className="text-sm text-muted-foreground">{customSettings.similarity_boost.toFixed(2)}</span>
              </div>
              <Slider
                value={[customSettings.similarity_boost]}
                onValueChange={([v]) => setCustomSettings(s => ({ ...s, similarity_boost: v }))}
                min={0}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                Fidelidade à voz original
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Estilo</Label>
                <span className="text-sm text-muted-foreground">{customSettings.style.toFixed(2)}</span>
              </div>
              <Slider
                value={[customSettings.style]}
                onValueChange={([v]) => setCustomSettings(s => ({ ...s, style: v }))}
                min={0}
                max={1}
                step={0.05}
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
