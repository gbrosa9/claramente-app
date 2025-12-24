"use client"

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Phone, Activity, ShieldAlert, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CrisisModalProps {
  open: boolean
  onClose: () => void
}

export function CrisisModal({ open, onClose }: CrisisModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-[48px] border border-white/20 bg-white p-10 text-slate-900 shadow-2xl shadow-purple-200/60">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-6 top-6 text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          Fechar
        </button>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.35em] text-red-600">
              <ShieldAlert className="h-4 w-4" /> Crise
            </div>
            <h2 className="text-3xl font-black text-slate-900">Estamos aqui com você</h2>
            <p className="text-sm text-slate-500">
              Escolha uma das opções de suporte imediato ou pratique uma respiração guiada para estabilizar o momento.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SupportButton href="tel:188" icon={Phone} label="CVV" description="Centro de Valorização da Vida" tone="from-red-400 to-red-500" />
            <SupportButton href="tel:192" icon={Activity} label="SAMU" description="Serviço de Emergência" tone="from-orange-400 to-orange-500" />
            <SupportButton href="tel:190" icon={ShieldAlert} label="Polícia" description="Contato imediato" tone="from-purple-500 to-purple-600" />
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('clara:breathing-exercise'))}
              className="h-full rounded-[36px] bg-gradient-to-r from-emerald-400 to-emerald-500 py-6 text-lg font-semibold shadow-lg shadow-emerald-200/50"
            >
              <Wind className="mr-2 h-5 w-5" /> Exercício de respiração
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

interface SupportButtonProps {
  href: string
  icon: typeof Phone
  label: string
  description: string
  tone: string
}

function SupportButton({ href, icon: Icon, label, description, tone }: SupportButtonProps) {
  return (
    <a
      href={href}
      className={`flex h-full flex-col justify-between rounded-[36px] bg-gradient-to-r ${tone} p-6 text-white shadow-xl shadow-purple-200/40 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500`}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
      <div>
        <p className="text-xl font-black">{label}</p>
        <p className="text-sm font-medium text-white/70">{description}</p>
      </div>
    </a>
  )
}
