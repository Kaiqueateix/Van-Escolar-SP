import React, { useState } from 'react';
import { User } from '../../types';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ReferralProgramViewProps {
  user: User;
}

export const ReferralProgramView: React.FC<ReferralProgramViewProps> = ({ user }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const referralCode = user.referralCode || `VAN-${user.n.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Estou usando o Van Escolar SP para acompanhar o transporte escolar do meu filho em tempo real com motorista credenciado pela Prefeitura. Acesse pelo meu link e ganhe R$ 50 de desconto na primeira mensalidade: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
          Programa Indique & Ganhe
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Convide outros pais da sua escola e ganhe descontos na sua mensalidade
        </p>
      </div>

      {/* Hero Reward Card */}
      <div className="bg-gradient-to-br from-[#10263b] to-[#16232f] text-white p-5 rounded-2xl border border-[#26384a] shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#ffc400] text-[#10263b] rounded-xl font-bold">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ffc400]">
              Recompensas Acumuladas
            </span>
            <h3 className="font-extrabold text-base">R$ 50 de Desconto por Família Indicada</h3>
          </div>
        </div>

        <p className="text-xs text-[#93a5b5] leading-relaxed">
          Compartilhe seu código com famílias da mesma escola ou condomínio. Assim que a contratação for confirmada pelo transportador, o desconto é aplicado automaticamente na sua próxima fatura!
        </p>

        {/* Code Container */}
        <div className="bg-[#0e1822] p-3 rounded-xl border border-[#26384a] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#93a5b5] font-bold">SEU CÓDIGO EXCLUSIVO:</div>
            <div className="text-lg font-black tracking-widest text-[#ffc400] font-mono">
              {referralCode}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-[#16232f] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#5d6f80] uppercase">Amigos Convidados</div>
          <div className="text-lg font-black text-[#10263b] dark:text-white mt-0.5">3</div>
          <div className="text-[10px] text-[#0f7f8c] font-bold">Links clicados</div>
        </div>

        <div className="bg-white dark:bg-[#16232f] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#5d6f80] uppercase">Contratações Ativas</div>
          <div className="text-lg font-black text-[#1b8a52] mt-0.5">1</div>
          <div className="text-[10px] text-[#1b8a52] font-bold">Confirmada no app</div>
        </div>

        <div className="bg-white dark:bg-[#16232f] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#5d6f80] uppercase">Bônus Concedido</div>
          <div className="text-lg font-black text-[#ffc400] mt-0.5">R$ 50,00</div>
          <div className="text-[10px] text-[#5d6f80] font-bold">Aplicado na fatura</div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white">
          Famílias Indicadas por Você
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between border border-[#d6dee6] dark:border-[#26384a]">
            <div>
              <div className="font-bold text-[#10263b] dark:text-white">Juliana Mendes (Colégio São Luís)</div>
              <div className="text-[11px] text-[#5d6f80]">Contrato assinado com João Batista</div>
            </div>
            <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              BÔNUS APROVADO R$ 50
            </span>
          </div>

          <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between border border-[#d6dee6] dark:border-[#26384a]">
            <div>
              <div className="font-bold text-[#10263b] dark:text-white">Carlos Eduardo (EMEF Santa Rita)</div>
              <div className="text-[11px] text-[#5d6f80]">Em negociação de vagas</div>
            </div>
            <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-2 py-0.5 rounded-full">
              EM ANDAMENTO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
