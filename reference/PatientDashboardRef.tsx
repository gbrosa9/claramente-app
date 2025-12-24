
import React, { useState } from 'react';
import { Wind, MessageCircle, Heart, Star, Flame, Trophy, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import CrisisModal from './CrisisModal';
import ChatRoom from './ChatRoom';
import { Severity } from '../types';

const PatientDashboard: React.FC = () => {
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleCrisisClick = () => {
    setShowCrisisModal(true);
  };

  return (
    <div className="space-y-12 relative">
      {/* Botão de Crise Fixo */}
      <div className="fixed bottom-16 right-6 md:right-12 z-30">
        <button 
          onClick={handleCrisisClick}
          className="group flex items-center gap-4 px-10 py-6 bg-[#ef4444] hover:bg-red-700 text-white rounded-full shadow-[0_20px_40px_-10px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20"
        >
          <AlertTriangle size={28} className="group-hover:animate-bounce" />
          <span className="font-black text-xl tracking-tight uppercase">CRISE</span>
        </button>
      </div>

      {showCrisisModal && (
        <CrisisModal 
          onClose={() => setShowCrisisModal(false)}
          onAction={(action) => console.log(action)}
        />
      )}

      {/* Hero Section - Imagem grande preenchendo o espaço conforme solicitado */}
      <section className="bg-white rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-stretch min-h-[580px]">
        <div className="relative z-20 flex-1 p-12 md:p-20 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#f5f3ff] text-[#9333ea] rounded-full text-[11px] font-extrabold mb-10 tracking-[0.15em] uppercase w-fit">
            <Sparkles size={14} className="fill-[#9333ea]/20" />
            CONVERSAS CONFIDENCIAIS
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#1e1b4b] leading-[1.05] mb-8 tracking-tight">
            Sua jornada <br />
            de <span className="text-[#9333ea]">bem-estar</span> <br />
            começa aqui
          </h1>
          
          <p className="text-xl text-slate-500 max-w-md leading-relaxed mb-12 font-medium opacity-80">
            A Clara é sua assistente especializada. Conversas seguras, exercícios guiados e suporte emocional 24/7 baseado em evidências científicas.
          </p>
          
          <div className="flex flex-wrap gap-5">
            <button 
              onClick={() => setShowChat(!showChat)}
              className="px-10 py-5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-[24px] flex items-center gap-4 font-black text-lg transition-all shadow-xl shadow-purple-200 active:scale-95"
            >
              <MessageCircle size={22} />
              {showChat ? 'Fechar Sessão' : 'Iniciar Sessão'}
            </button>
            <button className="px-10 py-5 bg-white text-[#9333ea] border-2 border-slate-100 hover:border-[#9333ea] rounded-[24px] flex items-center gap-4 font-black text-lg transition-all active:scale-95">
              <Wind size={22} />
              Exercícios
            </button>
          </div>
        </div>

        {/* Imagem da Clara - Grande e preenchendo o espaço branco */}
        <div className="flex-1 relative hidden md:block overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-purple-50/40 via-transparent to-transparent z-0"></div>
          <img 
            src="https://raw.githubusercontent.com/google/generative-ai-docs/main/site/en/tutorials/clara_avatar.png" 
            alt="Clara" 
            className="absolute bottom-[-10%] right-[-10%] h-[120%] w-auto object-contain z-10 select-none pointer-events-none transform"
            style={{ 
              filter: 'drop-shadow(-30px 20px 50px rgba(147, 51, 234, 0.2))',
              transform: 'scale(1.1) translateX(5%)'
            }}
            onError={(e) => {
              e.currentTarget.src = "https://ui-avatars.com/api/?name=Clara&background=9333ea&color=fff&size=512";
            }}
          />
        </div>
      </section>

      {/* Chat Integrado */}
      {showChat && (
        <div className="animate-in fade-in zoom-in duration-500 bg-white rounded-[40px] shadow-2xl border border-purple-50 overflow-hidden">
          <ChatRoom 
            onCriticalRisk={() => { setShowCrisisModal(true); setShowChat(false); }} 
            onRegisterEvent={(sev) => console.log(sev)}
          />
        </div>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Star className="text-amber-400" />, label: 'Nível Atual', val: 'Nível 1', sub: 'Próximo em 50xp' },
          { icon: <Flame className="text-orange-500" />, label: 'Sequência', val: '0 Dias', sub: 'Mantenha o hábito' },
          { icon: <Trophy className="text-purple-600" />, label: 'Conquistas', val: '0/12', sub: 'Emblemas ganhos' },
          { icon: <Heart className="text-red-500" />, label: 'Segurança', val: '24/7', sub: 'Atendimento Ativo' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
            <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center mb-6 group-hover:bg-purple-50 transition-colors">
              {stat.icon}
            </div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
            <div className="text-3xl font-black text-[#1e1b4b] tracking-tight">{stat.val}</div>
            <div className="text-[11px] text-slate-500 mt-3 font-bold">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Recomendações */}
      <section className="bg-[#f5f3ff] rounded-[56px] p-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-[#1e1b4b] mb-3">Recomendações</h2>
            <p className="text-lg text-slate-500 font-bold opacity-70">Práticas rápidas para equilibrar o seu dia.</p>
          </div>
          <button className="flex items-center gap-3 text-[#9333ea] font-black text-lg hover:gap-5 transition-all">
            Ver Tudo <ArrowRight size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Alívio de Ansiedade', type: 'Respiração', time: '2 min', color: 'bg-blue-500' },
            { title: 'Mindfulness Guiado', type: 'Meditação', time: '5 min', color: 'bg-purple-600' },
            { title: 'Escrita Terapêutica', type: 'Diário', time: '3 min', color: 'bg-emerald-500' }
          ].map((card, i) => (
            <div key={i} className="bg-white p-10 rounded-[44px] shadow-sm hover:shadow-2xl hover:translate-y-[-6px] transition-all cursor-pointer group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${card.color}`}></div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{card.type}</div>
              <h3 className="text-2xl font-black mb-12 text-[#1e1b4b] group-hover:text-[#9333ea] transition-colors">{card.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full">{card.time}</span>
                <div className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-[#9333ea] group-hover:bg-[#9333ea] group-hover:text-white group-hover:border-[#9333ea] transition-all">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
