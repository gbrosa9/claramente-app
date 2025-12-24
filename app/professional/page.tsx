"use client";

import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, AlertOctagon, Lock, LogOut, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { ClaraLogo } from "@/components/ClaraLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PatientStatus = "online" | "offline";

interface PatientMetrics {
  id: string;
  name: string;
  status: PatientStatus;
  lastSeen: string;
  crises: number;
  alerts: number;
  critical: number;
}

interface PatientRiskDay {
  day: string;
  intensity: number;
}

const PATIENTS: PatientMetrics[] = [
  { id: "ana-silva", name: "Ana Silva", status: "online", lastSeen: "12 min atrás", crises: 4, alerts: 12, critical: 3 },
  { id: "joao-pedro", name: "João Pedro", status: "offline", lastSeen: "Ontem", crises: 0, alerts: 2, critical: 0 },
  { id: "maria-lima", name: "Maria Lima", status: "online", lastSeen: "5 min atrás", crises: 1, alerts: 6, critical: 1 },
  { id: "carlos-souza", name: "Carlos Souza", status: "offline", lastSeen: "2 dias atrás", crises: 2, alerts: 5, critical: 0 },
];

const RISK_HISTORY: Record<string, PatientRiskDay[]> = {
  "ana-silva": [
    { day: "Seg", intensity: 70 },
    { day: "Ter", intensity: 45 },
    { day: "Qua", intensity: 60 },
    { day: "Qui", intensity: 80 },
    { day: "Sex", intensity: 55 },
    { day: "Sáb", intensity: 30 },
    { day: "Dom", intensity: 40 },
  ],
  "joao-pedro": [
    { day: "Seg", intensity: 20 },
    { day: "Ter", intensity: 25 },
    { day: "Qua", intensity: 35 },
    { day: "Qui", intensity: 28 },
    { day: "Sex", intensity: 32 },
    { day: "Sáb", intensity: 24 },
    { day: "Dom", intensity: 18 },
  ],
  "maria-lima": [
    { day: "Seg", intensity: 50 },
    { day: "Ter", intensity: 65 },
    { day: "Qua", intensity: 70 },
    { day: "Qui", intensity: 60 },
    { day: "Sex", intensity: 55 },
    { day: "Sáb", intensity: 40 },
    { day: "Dom", intensity: 45 },
  ],
  "carlos-souza": [
    { day: "Seg", intensity: 35 },
    { day: "Ter", intensity: 30 },
    { day: "Qua", intensity: 25 },
    { day: "Qui", intensity: 20 },
    { day: "Sex", intensity: 28 },
    { day: "Sáb", intensity: 32 },
    { day: "Dom", intensity: 26 },
  ],
};

const PROTOCOL_TIPS = [
  "Responder em até 15 minutos a qualquer evento crítico registrado pela IA.",
  "Verificar rede de apoio e confirmar dados de contato de emergência.",
  "Planejar sessão síncrona para reavaliação em até 24 horas.",
  "Registrar intervenção e atualizar plano terapêutico após estabilização.",
];

export default function ProfessionalPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(PATIENTS[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return PATIENTS;
    return PATIENTS.filter(
      (p) => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    );
  }, [query]);

  const selectedPatient =
    PATIENTS.find((p) => p.id === selectedId) ?? PATIENTS[0];

  const chartData = RISK_HISTORY[selectedPatient?.id ?? ""] ?? [];

  const aggregated = useMemo(() => {
    return PATIENTS.reduce(
      (acc, p) => {
        acc.crises += p.crises;
        acc.alerts += p.alerts;
        acc.critical += p.critical;
        return acc;
      },
      { crises: 0, alerts: 0, critical: 0 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f1ff] text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6 rounded-[48px] bg-white/90 p-10 shadow-2xl shadow-purple-200/60 ring-1 ring-purple-100 backdrop-blur">
          <div className="flex flex-wrap items-center gap-6">
            <ClaraLogo className="h-16 w-16 drop-shadow-[0_18px_36px_rgba(147,51,234,0.25)]" />
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.4em] text-purple-600">
                <ShieldCheck className="h-4 w-4" /> Painel de Gestão Clínica
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black text-slate-900 md:text-5xl">
                  Monitoramento de Risco
                </h1>
                {session?.user?.name && (
                  <span className="rounded-full bg-purple-50 px-4 py-1 text-sm font-semibold text-purple-600">
                    Dr(a). {session.user.name.split(" ")[0]}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Alertas baseados em IA para suporte preventivo e seguro, sem violação de privacidade.
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-purple-200 px-6 font-semibold text-purple-600"
                onClick={() => setMenuOpen((p) => !p)}
                aria-expanded={menuOpen}
                aria-controls="professional-menu"
              >
                Menu
              </Button>

              <Button
                className="rounded-full bg-purple-600 px-6 font-semibold text-white shadow-purple-300/40 hover:bg-purple-700"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                id="professional-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-4 rounded-[36px] bg-purple-50/70 p-6 text-sm text-slate-600"
              >
                <span className="flex items-center gap-2 font-semibold text-purple-700">
                  <Lock className="h-4 w-4" />
                  Acesso restrito ao profissional. Dados protegidos por criptografia.
                </span>
                <span className="flex items-center gap-2 font-semibold text-purple-700">
                  <AlertOctagon className="h-4 w-4" />
                  Conteúdo de mensagens indisponível: exibimos apenas métricas agregadas.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <section className="grid gap-6 rounded-[48px] bg-white/85 p-10 shadow-xl shadow-purple-200/50 ring-1 ring-purple-100 backdrop-blur lg:grid-cols-[0.95fr,1.05fr]">
          {/* Lista */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome ou ID..."
                  className="w-full rounded-[36px] border-purple-200 bg-purple-50/60 pl-12 text-sm text-slate-700 placeholder:text-purple-200 focus-visible:ring-purple-400"
                />
              </div>
              <Button
                variant="ghost"
                className="ml-4 rounded-full border border-purple-200 px-4 text-purple-600 shadow-sm hover:bg-purple-50"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar</span>
              </Button>
            </div>

            <div className="space-y-4">
              {filteredPatients.map((patient) => {
                const isSelected = patient.id === selectedPatient?.id;
                const initials = patient.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedId(patient.id)}
                    className={`w-full rounded-[40px] border px-6 py-5 text-left shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 ${
                      isSelected
                        ? "border-purple-400 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 text-slate-900 shadow-purple-200/70"
                        : "border-purple-100 bg-white text-slate-700 hover:border-purple-300 hover:shadow-purple-200/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-black text-purple-600">
                        {initials}
                      </div>

                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-black text-slate-900">{patient.name}</p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              patient.status === "online"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="inline-block h-2 w-2 rounded-full bg-current" />
                            {patient.status === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500">Visto: {patient.lastSeen}</p>
                      </div>

                      <div className="flex items-center gap-6 text-center text-sm font-black text-slate-600">
                        <MetricPill label="Crises" value={patient.crises} tone="text-red-500" />
                        <MetricPill label="Alertas" value={patient.alerts} tone="text-purple-500" />
                        <MetricPill label="Críticos" value={patient.critical} tone="text-amber-500" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel */}
          <div className="flex flex-col gap-6">
            <Card className="rounded-[40px] border-purple-100 bg-white/90 shadow-lg shadow-purple-200/50">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-black text-slate-900">
                  Intensidade emocional (7 dias)
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Dados analisados automaticamente sem acesso ao conteúdo das mensagens.
                </CardDescription>
              </CardHeader>

              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="intensity" radius={[24, 24, 16, 16]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[40px] border-purple-100 bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8 shadow-xl shadow-purple-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Protocolo de conduta</h2>
                  <span className="rounded-full bg-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-[0.35em] text-white">
                    Atualizado
                  </span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  {PROTOCOL_TIPS.map((tip, index) => (
                    <li key={tip} className="flex items-start gap-3">
                      <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <div className="grid gap-4 rounded-[36px] border border-purple-100 bg-white/80 p-6 shadow-lg shadow-purple-200/40 sm:grid-cols-3">
              <SummaryBadge label="Crises" value={aggregated.crises} tone="bg-red-100 text-red-600" />
              <SummaryBadge label="Alertas" value={aggregated.alerts} tone="bg-purple-100 text-purple-600" />
              <SummaryBadge label="Críticos" value={aggregated.critical} tone="bg-amber-100 text-amber-600" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <span className={`flex min-w-[88px] flex-col gap-1 rounded-full bg-purple-50 px-4 py-2 text-xs uppercase tracking-[0.3em] ${tone}`}>
      {label}
      <span className="text-lg font-black text-slate-900">{value}</span>
    </span>
  );
}

function SummaryBadge({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-[32px] px-5 py-4 text-center text-sm font-semibold ${tone}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-current/70">{label}</p>
      <p className="text-2xl font-black text-current/90">{value}</p>
    </div>
  );
}
