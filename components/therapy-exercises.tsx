'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getBreathingExercise, getGroundingExercise, EMOTION_WHEEL } from '@/lib/dbt-techniques'

// =====================
// RESPIRAÇÃO 4-7-8
// =====================

export function BreathingExercise({ onComplete }: { onComplete?: () => void }) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [cycle, setCycle] = useState(0)
  const totalCycles = 4

  const phases = getBreathingExercise()

  const runPhase = useCallback(() => {
    if (currentPhase >= phases.length) {
      if (cycle < totalCycles - 1) {
        setCycle(c => c + 1)
        setCurrentPhase(0)
      } else {
        setIsRunning(false)
        onComplete?.()
      }
      return
    }

    const phase = phases[currentPhase]
    const duration = phase.duration
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const phaseProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(phaseProgress)

      if (elapsed >= duration) {
        clearInterval(interval)
        setCurrentPhase(p => p + 1)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [currentPhase, cycle, phases, onComplete])

  useEffect(() => {
    if (isRunning) {
      return runPhase()
    }
  }, [isRunning, currentPhase, cycle, runPhase])

  const start = () => {
    setIsRunning(true)
    setCurrentPhase(0)
    setCycle(0)
    setProgress(0)
  }

  const stop = () => {
    setIsRunning(false)
    setCurrentPhase(0)
    setProgress(0)
  }

  const phaseColors = {
    0: 'from-blue-400 to-blue-600', // Inspirar
    1: 'from-purple-400 to-purple-600', // Segurar
    2: 'from-green-400 to-green-600', // Expirar
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🌬️</span>
          Respiração 4-7-8
        </CardTitle>
        <CardDescription>
          Técnica de respiração para acalmar o sistema nervoso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isRunning ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Inspire por 4 segundos, segure por 7, expire por 8.
              <br />
              Faremos {totalCycles} ciclos completos.
            </p>
            <Button onClick={start} size="lg" className="w-full">
              Iniciar Exercício
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Ciclo {cycle + 1} de {totalCycles}
              </p>
              <div className={`text-3xl font-bold bg-gradient-to-r ${phaseColors[currentPhase as keyof typeof phaseColors]} bg-clip-text text-transparent`}>
                {phases[currentPhase]?.phase || 'Completo!'}
              </div>
            </div>
            
            <div className="relative">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r ${phaseColors[currentPhase as keyof typeof phaseColors]} opacity-20 animate-pulse`} 
                   style={{ 
                     transform: `scale(${0.8 + (progress / 100) * 0.4})`,
                     transition: 'transform 0.1s ease-out'
                   }} 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">
                  {currentPhase === 0 ? '😮‍💨' : currentPhase === 1 ? '😌' : '😮'}
                </span>
              </div>
            </div>

            <Progress value={progress} className="h-2" />
            
            <Button onClick={stop} variant="outline" className="w-full">
              Parar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================
// GROUNDING 5-4-3-2-1
// =====================

export function GroundingExercise({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [answers, setAnswers] = useState<string[][]>([[], [], [], [], []])
  const [currentInput, setCurrentInput] = useState('')
  
  const steps = getGroundingExercise()

  const start = () => setCurrentStep(0)

  const addAnswer = () => {
    if (!currentInput.trim()) return
    
    const newAnswers = [...answers]
    newAnswers[currentStep] = [...newAnswers[currentStep], currentInput.trim()]
    setAnswers(newAnswers)
    setCurrentInput('')
    
    if (newAnswers[currentStep].length >= steps[currentStep].count) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(s => s + 1)
      } else {
        setCurrentStep(-2) // Completed
        onComplete?.()
      }
    }
  }

  const reset = () => {
    setCurrentStep(-1)
    setAnswers([[], [], [], [], []])
    setCurrentInput('')
  }

  const senseEmojis = ['👁️', '✋', '👂', '👃', '👅']

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          Grounding 5-4-3-2-1
        </CardTitle>
        <CardDescription>
          Técnica de ancoragem para momentos de ansiedade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === -1 && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Vamos usar seus 5 sentidos para te trazer de volta ao presente.
            </p>
            <Button onClick={start} size="lg" className="w-full">
              Começar
            </Button>
          </div>
        )}

        {currentStep >= 0 && currentStep < steps.length && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    i < currentStep
                      ? 'bg-green-500 text-white'
                      : i === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {senseEmojis[i]}
                </div>
              ))}
            </div>

            <div className="text-center py-4">
              <p className="text-2xl font-bold mb-2">{steps[currentStep].instruction}</p>
              <p className="text-muted-foreground">
                {answers[currentStep].length} de {steps[currentStep].count}
              </p>
            </div>

            {answers[currentStep].length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {answers[currentStep].map((answer, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                    {answer}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAnswer()}
                placeholder={`Digite algo que você ${steps[currentStep].sense.toLowerCase()}...`}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <Button onClick={addAnswer}>Adicionar</Button>
            </div>
          </div>
        )}

        {currentStep === -2 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold">Ótimo trabalho!</h3>
            <p className="text-muted-foreground">
              Você se reconectou com o momento presente usando seus 5 sentidos.
            </p>
            <div className="text-sm text-left bg-muted p-4 rounded-lg space-y-2">
              {steps.map((step, i) => (
                <div key={i}>
                  <span className="font-medium">{senseEmojis[i]} {step.sense}:</span>{' '}
                  {answers[i].join(', ')}
                </div>
              ))}
            </div>
            <Button onClick={reset} variant="outline" className="w-full">
              Fazer Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================
// IDENTIFICADOR DE EMOÇÕES
// =====================

export function EmotionIdentifier({ onSelect }: { onSelect?: (emotion: string) => void }) {
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null)
  const [selectedSecondary, setSelectedSecondary] = useState<string | null>(null)

  const handlePrimarySelect = (emotion: string) => {
    setSelectedPrimary(emotion)
    setSelectedSecondary(null)
  }

  const handleSecondarySelect = (emotion: string) => {
    setSelectedSecondary(emotion)
    onSelect?.(emotion)
  }

  const primaryEmojis: Record<string, string> = {
    'Alegria': '😊',
    'Tristeza': '😢',
    'Raiva': '😠',
    'Medo': '😰',
    'Surpresa': '😮',
    'Nojo': '🤢'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          Como você está se sentindo?
        </CardTitle>
        <CardDescription>
          Identificar emoções é o primeiro passo para regulá-las
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Emoção principal:</p>
          <div className="grid grid-cols-3 gap-2">
            {EMOTION_WHEEL.primary.map((emotion) => (
              <Button
                key={emotion}
                variant={selectedPrimary === emotion ? 'default' : 'outline'}
                className="flex flex-col h-auto py-3"
                onClick={() => handlePrimarySelect(emotion)}
              >
                <span className="text-2xl mb-1">{primaryEmojis[emotion]}</span>
                <span className="text-xs">{emotion}</span>
              </Button>
            ))}
          </div>
        </div>

        {selectedPrimary && (
          <div>
            <p className="text-sm font-medium mb-2">Mais especificamente:</p>
            <div className="flex flex-wrap gap-2">
              {EMOTION_WHEEL.secondary[selectedPrimary as keyof typeof EMOTION_WHEEL.secondary]?.map((emotion) => (
                <Button
                  key={emotion}
                  variant={selectedSecondary === emotion ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSecondarySelect(emotion)}
                >
                  {emotion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedSecondary && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-lg">
              Você está sentindo <strong>{selectedSecondary}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              E está tudo bem sentir isso. 💙
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================
// STOP SKILL
// =====================

export function StopSkill({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(-1)
  
  const steps = [
    { letter: 'S', title: 'Stop (Pare)', instruction: 'Congele. Não faça nada. Apenas pare.', emoji: '🛑', duration: 5 },
    { letter: 'T', title: 'Take a step back', instruction: 'Dê um passo atrás mentalmente. Respire.', emoji: '👣', duration: 10 },
    { letter: 'O', title: 'Observe', instruction: 'O que está acontecendo? O que você sente?', emoji: '👀', duration: 15 },
    { letter: 'P', title: 'Proceed mindfully', instruction: 'Agora sim, aja com consciência.', emoji: '🎯', duration: 5 },
  ]

  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      setTimer(steps[currentStep].duration)
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(interval)
            if (currentStep < steps.length - 1) {
              setCurrentStep(s => s + 1)
            } else {
              setCurrentStep(-2)
              onComplete?.()
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🛑</span>
          Habilidade STOP
        </CardTitle>
        <CardDescription>
          Use quando sentir impulso de agir sem pensar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === -1 && (
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-2 text-3xl font-bold">
              {steps.map(s => (
                <span key={s.letter} className="text-primary">{s.letter}</span>
              ))}
            </div>
            <p className="text-muted-foreground">
              Guia de 35 segundos para pausar antes de agir impulsivamente.
            </p>
            <Button onClick={() => setCurrentStep(0)} size="lg" className="w-full">
              Iniciar STOP
            </Button>
          </div>
        )}

        {currentStep >= 0 && currentStep < steps.length && (
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-2">
              {steps.map((s, i) => (
                <span 
                  key={s.letter} 
                  className={`text-3xl font-bold ${i <= currentStep ? 'text-primary' : 'text-muted'}`}
                >
                  {s.letter}
                </span>
              ))}
            </div>
            
            <div className="text-6xl">{steps[currentStep].emoji}</div>
            
            <div>
              <h3 className="text-xl font-bold">{steps[currentStep].title}</h3>
              <p className="text-muted-foreground mt-2">{steps[currentStep].instruction}</p>
            </div>
            
            <div className="text-4xl font-mono text-primary">{timer}s</div>
          </div>
        )}

        {currentStep === -2 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold">Você conseguiu!</h3>
            <p className="text-muted-foreground">
              Você pausou, observou e agora pode agir com consciência.
            </p>
            <Button onClick={() => setCurrentStep(-1)} variant="outline" className="w-full">
              Fazer Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================
// REGISTRO DE PENSAMENTO (TCC)
// =====================

interface ThoughtRecordEntry {
  situation: string
  thought: string
  emotion: string
  intensity: number
  evidence_for: string
  evidence_against: string
  balanced_thought: string
  new_intensity: number
}

export function ThoughtRecordExercise({ onComplete }: { onComplete?: (record: ThoughtRecordEntry) => void }) {
  const [step, setStep] = useState(0)
  const [record, setRecord] = useState<ThoughtRecordEntry>({
    situation: '',
    thought: '',
    emotion: '',
    intensity: 50,
    evidence_for: '',
    evidence_against: '',
    balanced_thought: '',
    new_intensity: 50
  })

  const steps = [
    { field: 'situation', label: 'Situação', question: 'O que aconteceu? Descreva a situação brevemente.' },
    { field: 'thought', label: 'Pensamento', question: 'Qual pensamento passou pela sua cabeça?' },
    { field: 'emotion', label: 'Emoção', question: 'O que você sentiu? (ex: ansiedade, tristeza, raiva)' },
    { field: 'intensity', label: 'Intensidade', question: 'Quão intensa foi essa emoção? (0-100)' },
    { field: 'evidence_for', label: 'Evidências a favor', question: 'Quais fatos apoiam esse pensamento?' },
    { field: 'evidence_against', label: 'Evidências contra', question: 'Quais fatos contradizem esse pensamento?' },
    { field: 'balanced_thought', label: 'Pensamento equilibrado', question: 'Considerando as evidências, qual seria uma forma mais equilibrada de ver isso?' },
    { field: 'new_intensity', label: 'Nova intensidade', question: 'Como você se sente agora? (0-100)' },
  ]

  const currentStep = steps[step]
  const isIntensityStep = currentStep?.field === 'intensity' || currentStep?.field === 'new_intensity'

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      onComplete?.(record)
      setStep(steps.length) // Show summary
    }
  }

  const updateRecord = (field: string, value: string | number) => {
    setRecord(r => ({ ...r, [field]: value }))
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Registro de Pensamento
        </CardTitle>
        <CardDescription>
          Técnica TCC para questionar pensamentos automáticos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step < steps.length && (
          <>
            <Progress value={(step / steps.length) * 100} className="h-2" />
            
            <div className="space-y-4">
              <p className="font-medium">{currentStep.question}</p>
              
              {isIntensityStep ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={record[currentStep.field as keyof ThoughtRecordEntry] as number}
                    onChange={(e) => updateRecord(currentStep.field, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0 - Nenhuma</span>
                    <span className="font-bold text-primary">
                      {record[currentStep.field as keyof ThoughtRecordEntry]}
                    </span>
                    <span>100 - Máxima</span>
                  </div>
                </div>
              ) : (
                <textarea
                  value={record[currentStep.field as keyof ThoughtRecordEntry] as string}
                  onChange={(e) => updateRecord(currentStep.field, e.target.value)}
                  placeholder="Digite aqui..."
                  className="w-full p-3 border rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                  Voltar
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={!isIntensityStep && !record[currentStep.field as keyof ThoughtRecordEntry]}
              >
                {step === steps.length - 1 ? 'Finalizar' : 'Próximo'}
              </Button>
            </div>
          </>
        )}

        {step >= steps.length && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Registro Completo!</h3>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
              <div>
                <span className="font-medium">📍 Situação:</span> {record.situation}
              </div>
              <div>
                <span className="font-medium">💭 Pensamento:</span> {record.thought}
              </div>
              <div>
                <span className="font-medium">❤️ Emoção:</span> {record.emotion} ({record.intensity}%)
              </div>
              <div>
                <span className="font-medium">✓ Evidências a favor:</span> {record.evidence_for}
              </div>
              <div>
                <span className="font-medium">✗ Evidências contra:</span> {record.evidence_against}
              </div>
              <div className="bg-primary/10 p-3 rounded">
                <span className="font-medium">⚖️ Pensamento equilibrado:</span> {record.balanced_thought}
              </div>
              <div className="text-center">
                <span className="font-medium">Intensidade: </span>
                <span className="text-red-500">{record.intensity}%</span>
                <span> → </span>
                <span className="text-green-500">{record.new_intensity}%</span>
                {record.new_intensity < record.intensity && (
                  <span className="ml-2">✨ Redução de {record.intensity - record.new_intensity}%!</span>
                )}
              </div>
            </div>

            <Button onClick={() => setStep(0)} variant="outline" className="w-full">
              Fazer Novo Registro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Export all exercises
export const TherapyExercises = {
  BreathingExercise,
  GroundingExercise,
  EmotionIdentifier,
  StopSkill,
  ThoughtRecordExercise
}
