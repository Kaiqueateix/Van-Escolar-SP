import React, { useState } from 'react';
import { User, SubscriptionTier } from '../../types';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface TransporterReferralViewProps {
  user: User;
  subscriptionTier?: SubscriptionTier;
}

export const TransporterReferralView: React.FC<TransporterReferralViewProps> = ({
  user,
  subscriptionTier = 'free'
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const referralCode = user.referralCode || `FROTA-${user.n.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
  const referralLink = `${window.location.origin}?ref_transporter=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Fala amigo transportador! Estou usando o Van Escolar SP para fechar rotas, emitir contratos com assinatura digital e receber alunos da minha região. Cadastre sua van pelo meu link de indicação de motoristas parceiros: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Mock list of referred transporter colleagues
  const referredColleagues = [
    {
      name: 'Marcos Lima Pereira',
      vanPlate: 'BXZ-4821',
      date: '28/10/2026',
      status: 'pro_ativo', // Assinatura Profissional ativa
      reward: '1 Mês Grátis Concedido'
    },
    {
      name: 'Ricardo Silveira',
      vanPlate: 'EKM-9022',
      date: '02/11/2026',
      status: 'cadastro_gratis', // Ainda no plano free
      reward: 'Aguardando Assinatura Pro'
    }
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#ffc400]" />
          Programa Indique um Colega Transportador
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Indique amigos motoristas de van e ganhe 1 mês de mensalidade grátis da sua assinatura
        </p>
      </div>

      {/* Hero Reward Card */}
      <div className="bg-gradient-to-br from-[#10263b] to-[#16232f] text-white p-5 rounded-2xl border border-[#ffc400]/40 shadow-md space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#ffc400] text-[#10263b] rounded-xl font-black shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ffc400]">
              Recompensa Exclusiva para Transportadores
            </span>
            <h3 className="font-extrabold text-base">
              Ganhe 1 Mês Grátis de Assinatura Profissional
            </h3>
          </div>
        </div>

        {/* Regulatory conditions */}
        <div className="p-3 bg-white/10 rounded-xl text-xs leading-relaxed space-y-1.5 border border-white/10">
          <div className="font-bold text-[#ffc400] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Regra Oficial de Validação do Benefício:
          </div>
          <p className="text-[#cbd5e1] text-[11px]">
            O bônus de <b>1 próxima mensalidade 100% gratuita</b> na plataforma será liberado na sua conta assim que o transportador indicado concluir o cadastro no aplicativo e contratar a <b>Assinatura Profissional (Plano Pro ou Premium)</b>.
          </p>
        </div>

        {/* Code Container */}
        <div className="bg-[#0e1822] p-3.5 rounded-xl border border-[#26384a] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#93a5b5] font-bold">SEU CÓDIGO DE INDICAÇÃO:</div>
            <div className="text-lg font-black tracking-widest text-[#ffc400] font-mono">
              {referralCode}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#5d6f80] uppercase">Colegas Convidados</div>
          <div className="text-xl font-black text-[#10263b] dark:text-white mt-0.5">2</div>
          <div className="text-[10px] text-[#0f7f8c] font-bold">Motoristas de SP</div>
        </div>

        <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#5d6f80] uppercase">Planos Pro Ativados</div>
          <div className="text-xl font-black text-[#1b8a52] mt-0.5">1</div>
          <div className="text-[10px] text-[#1b8a52] font-bold">Assinatura confirmada</div>
        </div>

        <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#5d6f80] uppercase">Mensalidades Grátis</div>
          <div className="text-xl font-black text-[#ffc400] mt-0.5">1 Mês</div>
          <div className="text-[10px] text-[#5d6f80] font-bold">Aplicada na próxima fatura</div>
        </div>
      </div>

      {/* Referrals Tracking Table */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#ffc400]" />
          Acompanhamento dos Colegas Indicados
        </h3>

        <div className="space-y-2 text-xs">
          {referredColleagues.map((col, idx) => {
            const isApproved = col.status === 'pro_ativo';

            return (
              <div
                key={idx}
                className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between border border-[#d6dee6] dark:border-[#26384a]"
              >
                <div>
                  <div className="font-bold text-[#10263b] dark:text-white">
                    {col.name}
                  </div>
                  <div className="text-[11px] text-[#5d6f80]">
                    Placa: <b>{col.vanPlate}</b> · Indicado em: {col.date}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                    isApproved
                      ? 'bg-[#1b8a52] text-white'
                      : 'bg-[#ffc400] text-[#10263b]'
                  }`}>
                    {isApproved ? '✓ 1 MÊS GRÁTIS CONCEDIDO' : 'AGUARDANDO ASSINATURA PRO'}
                  </span>
                  <div className="text-[10px] text-[#5d6f80] mt-0.5">
                    {isApproved ? 'Bônus creditado na assinatura' : 'Requer plano Pro ativo para validar'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
