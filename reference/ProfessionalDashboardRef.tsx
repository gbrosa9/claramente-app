
import React, { useState } from 'react';
import { User, Search, Filter, ArrowRight, EyeOff, ClipboardList, ShieldCheck } from 'lucide-react';
import { Patient } from '../types';
import RiskSummary from './RiskSummary';

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ana Silva',
    lastActive: '12 min atrás',
    riskSummary: {
      crisisClicks30d: 4,
      autoDetections30d: 12,
      criticalEvents30d: 3,
      trend: [
        { date: 'Seg', value: 20 }, { date: 'Ter', value: 45 }, { date: 'Qua', value: 90 },
        { date: 'Qui', value: 75 }, { date: 'Sex', value: 60 }, { date: 'Sáb', value: 30 }, { date: 'Dom', value: 85 }
      ]
    }
  },
  {
    id: 'p2',
    name: 'João Pedro',
    lastActive: 'Ontem',
    riskSummary: {
      crisisClicks30d: 0,
      autoDetections30d: 2,
      criticalEvents30d: 0,
      trend: [
        { date: 'Seg', value: 10 }, { date: 'Ter', value: 15 }, { date: 'Qua', value: 12 },
        { date: 'Qui', value: 20 }, { date: 'Sex', value: 18 }, { date: 'Sáb', value: 10 }, { date: 'Dom', value: 5 }
      ]
    }
  }
];

const ProfessionalDashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (selectedPatient) {
    return (
      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-purple-50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
        <RiskSummary patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-sm mb-3">
            <ClipboardList size={18} />
            PAINEL DE GESTÃO CLÍNICA
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Monitoramento de Risco</h1>
          <p className="text-slate-500 font-medium max-w-lg">Alertas baseados em IA para suporte preventivo e seguro, sem violação de privacidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou ID..."
              className="bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-purple-600 transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-white rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-purple-600 hover:border-purple-100 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {MOCK_PATIENTS.map(patient => (
          <div 
            key={patient.id}
            onClick={() => setSelectedPatient(patient)}
            className="group bg-white p-8 rounded-[36px] border-2 border-transparent hover:border-purple-100 hover:shadow-xl hover:shadow-purple-100/30 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-50 rounded-[24px] flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">{patient.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Online</span>
                  <span className="opacity-30">|</span>
                  <span>Visto: {patient.lastActive}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 px-8 py-4 bg-slate-50/50 rounded-3xl border border-slate-100">
              <div className="text-center">
                <div className="text-xl font-black text-red-600">{patient.riskSummary.crisisClicks30d}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Crises</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-xl font-black text-amber-500">{patient.riskSummary.autoDetections30d}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alertas</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-xl font-black text-purple-600">{patient.riskSummary.criticalEvents30d}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Críticos</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                <EyeOff size={14} />
                MENSAGENS PRIVADAS
              </div>
              <button 
                className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all group-hover:translate-x-1"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 p-6 bg-purple-50 rounded-[24px] border border-purple-100 text-purple-600 font-bold text-sm">
        <ShieldCheck size={20} />
        Acesso restrito ao profissional. Todos os dados são protegidos por criptografia.
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
