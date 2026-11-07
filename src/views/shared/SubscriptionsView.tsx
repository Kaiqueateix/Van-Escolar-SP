import React, { useState } from 'react';
import { SubscriptionTier, SubscriptionContract } from '../../types';
import {
  Check,
  Star,
  Sparkles,
  Shield,
  Zap,
  Lock,
  CreditCard,
  FileText,
  AlertCircle,
  Building2,
  Calendar,
  XCircle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';

interface SubscriptionsViewProps {
  currentTier: SubscriptionTier;
  driverName?: string;
  driverEmail?: string;
  activeContract?: SubscriptionContract | null;
  onSelectTier: (tier: SubscriptionTier) => void;
  onSaveSubscriptionContract?: (contract: SubscriptionContract) => void;
  onCancelSubscription?: () => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  currentTier,
  driverName = 'João Batista',
  driverEmail = 'joao.batista@vanescolar.sp',
  activeContract,
  onSelectTier,
  onSaveSubscriptionContract,
  onCancelSubscription
}) => {
  // Step in subscription modal: 1 = contract review, 2 = payment card, 3 = confirmation
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);
  const [contractAccepted, setContractAccepted] = useState<boolean>(false);
  const [signerCpf, setSignerCpf] = useState<string>('18.490.231/0001-44');
  const [cardHolder, setCardHolder] = useState<string>(driverName);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [authorizeAutoRenewal, setAuthorizeAutoRenewal] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string>('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const getTierPrice = (tier: SubscriptionTier) => {
    if (tier === 'pro') return 24.99;
    if (tier === 'premium') return 44.99;
    return 0;
  };

  const handleStartSubscription = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      onSelectTier('free');
      return;
    }
    setSelectedTierForCheckout(tier);
    setCheckoutStep(1); // Start at contract review
  };

  const handleProceedToPayment = () => {
    if (!contractAccepted) {
      alert('Você precisa concordar e assinar eletronicamente o contrato para avançar.');
      return;
    }
    setCheckoutStep(2); // Go to card registration
  };

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert('Informe os 16 dígitos do cartão de crédito corporativo.');
      return;
    }
    if (!cardExpiry || !cardCvv) {
      alert('Preencha a validade e o CVV do cartão.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const tier = selectedTierForCheckout || 'pro';
      const contract: SubscriptionContract = {
        id: 'sub_cnt_' + Date.now().toString(36),
        transporterEmail: driverEmail,
        transporterName: driverName,
        transporterCpfCnpj: signerCpf,
        tier,
        monthlyPrice: getTierPrice(tier),
        cardHolder,
        cardLast4: cardNumber.slice(-4) || '8821',
        billingDay: new Date().getDate(),
        signedName: driverName,
        signedCpf: signerCpf,
        signedAt: new Date().toLocaleString('pt-BR'),
        status: 'ativo'
      };

      if (onSaveSubscriptionContract) {
        onSaveSubscriptionContract(contract);
      }
      onSelectTier(tier);
      setSelectedTierForCheckout(null);
      setSuccessNotice(`Plano ${tier.toUpperCase()} ativado com sucesso! Cobrança recorrente mensal autorizada.`);
      setTimeout(() => setSuccessNotice(''), 6000);
    }, 1500);
  };

  const handleConfirmCancellation = () => {
    if (onCancelSubscription) {
      onCancelSubscription();
    }
    onSelectTier('free');
    setIsCancelModalOpen(false);
    setSuccessNotice('Renovação automática cancelada. Seu plano voltará ao Gratuito ao final do ciclo.');
    setTimeout(() => setSuccessNotice(''), 6000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#ffc400]" />
          Planos de Assinatura para Transportadores
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Acesso a mais de 5 alunos, otimizador de rotas em tempo real, descontos em autopeças e destaque oficial
        </p>
      </div>

      {successNotice && (
        <div className="p-3 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 stroke-[3]" />
          {successNotice}
        </div>
      )}

      {/* SEPARAÇÃO CONTÁBIL E CORPORATIVA DA PLATAFORMA */}
      <div className="p-3.5 bg-linear-to-r from-[#10263b] to-[#1c3044] text-white rounded-2xl border border-[#2d4763] space-y-1.5 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-[#ffc400] font-black text-xs uppercase tracking-wide">
          <Building2 className="w-4 h-4" />
          Conta Corporativa da Plataforma (Destino das Assinaturas)
        </div>
        <p className="text-[11px] text-[#93a5b5] leading-relaxed">
          Os valores das assinaturas mensais são faturados diretamente para a empresa mantenedora: <b>Van Escolar SP Soluções Tecnológicas Ltda. (CNPJ 48.910.123/0001-90)</b>. Esta arrecadação é 100% segregada das mensalidades escolares pagas pelas famílias, as quais são repassadas integralmente aos motoristas credenciados.
        </p>
      </div>

      {/* ACTIVE SUBSCRIPTION MANAGEMENT (IF PRO OR PREMIUM) */}
      {currentTier !== 'free' && (
        <div className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border-2 border-[#1b8a52] shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#1b8a52] text-white rounded-xl font-bold">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Assinatura {currentTier.toUpperCase()} Ativa
                </span>
                <h4 className="font-black text-sm text-[#10263b] dark:text-white mt-0.5">
                  Renovação Automática Autorizada
                </h4>
              </div>
            </div>

            <span className="text-sm font-black text-[#1b8a52]">
              R$ {getTierPrice(currentTier).toFixed(2)}/mês
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5d6f80] dark:text-[#93a5b5] bg-[#f8fafc] dark:bg-[#0e1822] p-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <div>
              <b>Próxima Cobrança:</b> Todo dia 10 do mês
            </div>
            <div>
              <b>Cartão Vinculado:</b> Final 8821 (Crédito)
            </div>
            <div>
              <b>Tolerância Inadimplência:</b> 5 dias de carência
            </div>
            <div>
              <b>Alunos Permitidos:</b> Sem limites (Ilimitado)
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="text-[#c93c3c] hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancelar Renovação Automática
            </button>
          </div>
        </div>
      )}

      {/* 3 Tier Cards */}
      <div className="space-y-3">
        {/* PLANO GRATUITO */}
        <div
          className={`p-4 rounded-2xl border transition bg-white dark:bg-[#16232f] shadow-xs space-y-3 ${
            currentTier === 'free'
              ? 'border-[#0f7f8c] ring-2 ring-[#0f7f8c]/20'
              : 'border-[#d6dee6] dark:border-[#26384a]'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#5d6f80]">Plano Inicial</span>
              <h3 className="font-black text-base text-[#10263b] dark:text-white">Plano Gratuito</h3>
              <p className="text-xs text-[#5d6f80]">Para transportadores iniciantes (até 5 alunos)</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#10263b] dark:text-white">R$ 0</span>
              <span className="text-[10px] text-[#5d6f80] block">para sempre</span>
            </div>
          </div>

          <ul className="text-xs space-y-1.5 text-[#5d6f80] dark:text-[#93a5b5]">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Até 5 crianças cadastradas
            </li>
            <li className="flex items-center gap-2 text-red-500 font-medium">
              ✕ Sem acesso ao Otimizador de Rotas Inteligentes
            </li>
            <li className="flex items-center gap-2 text-red-500 font-medium">
              ✕ Não permite adicionar despesas da van
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Chat com famílias e contratos digitais
            </li>
          </ul>

          <button
            onClick={() => handleStartSubscription('free')}
            disabled={currentTier === 'free'}
            className="w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer border border-[#d6dee6] dark:border-[#26384a] text-[#5d6f80] hover:bg-[#eef2f5] dark:hover:bg-[#0e1822] disabled:opacity-50"
          >
            {currentTier === 'free' ? 'Plano Atual Ativo' : 'Mudar para Gratuito'}
          </button>
        </div>

        {/* PLANO PROFISSIONAL (PRO) */}
        <div
          className={`p-4 rounded-2xl border transition bg-white dark:bg-[#16232f] shadow-md space-y-3 relative overflow-hidden ${
            currentTier === 'pro'
              ? 'border-[#ffc400] ring-2 ring-[#ffc400]/30'
              : 'border-[#d6dee6] dark:border-[#26384a]'
          }`}
        >
          <div className="absolute top-0 right-0 bg-[#ffc400] text-[#10263b] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
            Recomendado
          </div>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#ffc400]">Mais Popular</span>
              <h3 className="font-black text-base text-[#10263b] dark:text-white">Plano Profissional</h3>
              <p className="text-xs text-[#5d6f80]">Para frotas médias de até 40 crianças</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-[#10263b] dark:text-white">R$ 24,99</span>
              <span className="text-[10px] text-[#5d6f80] block">/mês recorrente</span>
            </div>
          </div>

          <ul className="text-xs space-y-1.5 text-[#5d6f80] dark:text-[#93a5b5]">
            <li className="flex items-center gap-2 text-[#10263b] dark:text-white font-bold">
              <Check className="w-3.5 h-3.5 text-[#ffc400] stroke-[3]" /> Limite de até 40 crianças na van
            </li>
            <li className="flex items-center gap-2 text-[#10263b] dark:text-white font-bold">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Registro de despesas liberado (combustível, pneus, etc.)
            </li>
            <li className="flex items-center gap-2 text-red-500 font-medium">
              ✕ Sem acesso ao Otimizador de Rotas Inteligentes
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Contratos digitais e pagamentos automáticos
            </li>
          </ul>

          <button
            onClick={() => handleStartSubscription('pro')}
            className="w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer bg-[#ffc400] text-[#10263b] hover:brightness-105 shadow-xs"
          >
            {currentTier === 'pro' ? 'Plano Ativo' : 'Assinar Plano Profissional (R$ 24,99/mês)'}
          </button>
        </div>

        {/* PLANO PREMIUM */}
        <div
          className={`p-4 rounded-2xl border transition bg-white dark:bg-[#16232f] shadow-md space-y-3 ${
            currentTier === 'premium'
              ? 'border-[#9333ea] ring-2 ring-[#9333ea]/30'
              : 'border-[#d6dee6] dark:border-[#26384a]'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#9333ea]">Acesso Total</span>
              <h3 className="font-black text-base text-[#10263b] dark:text-white">Plano Premium</h3>
              <p className="text-xs text-[#5d6f80]">Acesso completo a todas as ferramentas</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-[#10263b] dark:text-white">R$ 44,99</span>
              <span className="text-[10px] text-[#5d6f80] block">/mês recorrente</span>
            </div>
          </div>

          <ul className="text-xs space-y-1.5 text-[#5d6f80] dark:text-[#93a5b5]">
            <li className="flex items-center gap-2 text-[#10263b] dark:text-white font-bold">
              <Check className="w-3.5 h-3.5 text-[#9333ea] stroke-[3]" /> Crianças ILIMITADAS na van
            </li>
            <li className="flex items-center gap-2 text-[#10263b] dark:text-white font-bold">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Otimizador de Rotas Inteligentes com IA liberado
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Registro completo de despesas e financeiro
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#9333ea]" /> Destaque no topo de todas as buscas escolares
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#1b8a52]" /> Suporte VIP 24h via WhatsApp
            </li>
          </ul>

          <button
            onClick={() => handleStartSubscription('premium')}
            className="w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer bg-[#9333ea] hover:bg-[#7e22ce] text-white shadow-xs"
          >
            {currentTier === 'premium' ? 'Plano Ativo' : 'Assinar Plano Premium (R$ 44,99/mês)'}
          </button>
        </div>
      </div>

      {/* 7-STEP RECURRING SUBSCRIPTION MODAL */}
      {selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#ffc400] uppercase tracking-wide">
                  Passo {checkoutStep} de 2 · Contrato & Pagamento
                </span>
                <h3 className="font-black text-base text-[#10263b] dark:text-white">
                  Assinatura Recorrente: Plano {selectedTierForCheckout.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTierForCheckout(null)}
                className="text-[#5d6f80] hover:text-black font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: CONTRATO DE PRESTAÇÃO DE SERVIÇOS DA PLATAFORMA */}
            {checkoutStep === 1 && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-[#10263b] dark:text-white">
                    <FileText className="w-4 h-4 text-[#ffc400]" />
                    Termos do Contrato de Assinatura Mensal
                  </div>
                  <div className="h-44 overflow-y-auto p-2.5 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] text-[11px] leading-relaxed space-y-2 text-[#5d6f80] dark:text-[#93a5b5]">
                    <p>
                      <b>CLÁUSULA 1ª - DO OBJETO:</b> A VAN ESCOLAR SP SOLUÇÕES TECNOLÓGICAS LTDA disponibiliza ao transportador subscritor o uso da plataforma em módulo profissional, liberando o cadastro irrestrito de alunos e o otimizador de itinerários.
                    </p>
                    <p>
                      <b>CLÁUSULA 2ª - DA RECORRÊNCIA E FATURAMENTO:</b> O valor mensal pactuado (R$ {getTierPrice(selectedTierForCheckout).toFixed(2)}) será cobrado de forma automática e recorrente a cada 30 dias no cartão de crédito cadastrado.
                    </p>
                    <p>
                      <b>CLÁUSULA 3ª - DA SEGREGAÇÃO FINANCEIRA:</b> O contratante declara ciência de que os pagamentos de assinatura constituem faturamento exclusivo da operadora do software, não se confundindo com as mensalidades pagas pelas famílias dos alunos, cujo repasse é efetuado diretamente na conta do motorista.
                    </p>
                    <p>
                      <b>CLÁUSULA 4ª - DO CANCELAMENTO:</b> O cancelamento da renovação automática poderá ser realizado a qualquer momento pelo transportador através do próprio aplicativo, sem incidência de fidelidade ou multas rescisórias.
                    </p>
                    <p>
                      <b>CLÁUSULA 5ª - DA TOLERÂNCIA DE INADIMPLÊNCIA:</b> Em caso de recusa de cobrança pela operadora de cartão, será concedido prazo de 5 (cinco) dias úteis para atualização dos dados de pagamento antes da suspensão das funcionalidades Pro.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={contractAccepted}
                      onChange={(e) => setContractAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#ffc400]"
                    />
                    <span>
                      Li integralmente o contrato de assinatura e concordo com a cobrança recorrente mensal de R$ {getTierPrice(selectedTierForCheckout).toFixed(2)}.
                    </span>
                  </label>

                  <div>
                    <label className="block text-[11px] text-[#5d6f80] mb-0.5">CPF ou CNPJ do Transportador:</label>
                    <input
                      type="text"
                      value={signerCpf}
                      onChange={(e) => setSignerCpf(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTierForCheckout(null)}
                    className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 cursor-pointer shadow-md"
                  >
                    Avançar para Pagamento
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CADASTRO DO CARTÃO EM PROVEDOR SEGURO */}
            {checkoutStep === 2 && (
              <form onSubmit={handleConfirmCheckout} className="space-y-3 text-xs">
                <div className="p-3 bg-[#1b8a52]/10 border border-[#1b8a52]/30 rounded-xl flex items-center justify-between text-xs text-[#1b8a52] font-bold">
                  <span>Assinatura {selectedTierForCheckout.toUpperCase()}: R$ {getTierPrice(selectedTierForCheckout).toFixed(2)} / mês</span>
                  <span className="flex items-center gap-1 text-[11px] text-[#5d6f80]">
                    <Lock className="w-3.5 h-3.5 text-[#1b8a52]" /> Tokenizado Seguro
                  </span>
                </div>

                <div>
                  <label className="block font-bold mb-1">Nome Gravado no Cartão</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="JOAO B OLIVEIRA"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Número do Cartão de Crédito</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(v);
                      }}
                      placeholder="4532 8920 1234 8821"
                      className="w-full p-2.5 pl-9 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
                      required
                    />
                    <CreditCard className="w-4 h-4 text-[#5d6f80] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                        setCardExpiry(v);
                      }}
                      placeholder="11/29"
                      className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Código CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="849"
                      className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[11px] text-[#5d6f80]">
                  <input
                    type="checkbox"
                    checked={authorizeAutoRenewal}
                    onChange={(e) => setAuthorizeAutoRenewal(e.target.checked)}
                    className="w-4 h-4 text-[#ffc400]"
                    required
                  />
                  <span>Autorizo o débito mensal recorrente nesta fatura de cartão de crédito.</span>
                </label>

                <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="py-2.5 px-4 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2.5 bg-[#1b8a52] hover:bg-[#167043] text-white font-black rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Validando Cartão...' : `Confirmar Assinatura (R$ ${getTierPrice(selectedTierForCheckout).toFixed(2)})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO DE CANCELAMENTO */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-sm w-full space-y-3 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs">
            <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#c93c3c]" />
              Deseja cancelar a renovação automática?
            </h3>
            <p className="text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
              Ao cancelar, você continuará com acesso aos benefícios Pro até o fim do período já pago. Após essa data, seu limite voltará a 5 crianças.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2 bg-[#e2e8f0] dark:bg-[#26384a] rounded-xl font-bold"
              >
                Manter Plano
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="flex-1 py-2 bg-[#c93c3c] text-white rounded-xl font-black"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
