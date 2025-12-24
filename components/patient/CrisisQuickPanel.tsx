"use client"

import { AlertTriangle, PhoneCall, X } from "lucide-react"

interface CrisisQuickPanelProps {
  open: boolean
  onClose: () => void
}

export function CrisisQuickPanel({ open, onClose }: CrisisQuickPanelProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-[0px_22px_45px_rgba(17,24,39,0.35)] dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fechar painel de crise"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 dark:bg-slate-800 dark:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-inner">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Você é importante para nós.</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
          Não passe por isso sozinho. Nossa rede de apoio está pronta para te segurar.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SupportOption
            label="Apoio emocional"
            title="Ligar CVV"
            number="188"
            href="tel:188"
            accent="from-[#B8CFFE] to-[#DAE7FF]"
          />
          <SupportOption
            label="Emergência"
            title="SAMU"
            number="192"
            href="tel:192"
            accent="from-[#FFD6D6] to-[#FFEAEA]"
          />
        </div>
        <a
          href="tel:190"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900"
        >
          <PhoneCall className="h-4 w-4" />
          Chamar Polícia Militar (190)
        </a>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Em perigo imediato, procure ajuda presencial ou acione os contatos acima.
        </p>
      </div>
    </div>
  )
}

interface SupportOptionProps {
  label: string
  title: string
  number: string
  href: string
  accent: string
}

function SupportOption({ label, title, number, href, accent }: SupportOptionProps) {
  return (
    <a
      href={href}
      className={`flex flex-col rounded-[24px] bg-gradient-to-br ${accent} p-4 text-left shadow-inner transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="mt-1 text-lg font-black text-slate-900">{title}</span>
      <span className="text-xl font-black text-slate-900">{number}</span>
    </a>
  )
}
