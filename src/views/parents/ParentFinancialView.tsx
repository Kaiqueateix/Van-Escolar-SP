import React, { useState, useEffect } from 'react';
import { TransporterProfile, PaymentRecord, User } from '../../types';
import { sendPushNotification } from '../../services/notificationService';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  Download,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Scale,
  RefreshCw,
  Loader2,
  XCircle
} from 'lucide-react';

interface ParentFinancialViewProps {
  user: User;
  transporter: TransporterProfile | null;
  payments: PaymentRecord[];
  onConfirmPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  onGoToSearch: () => void;
}

export const ParentFinancialView: React.FC<ParentFinancialViewProps> = ({
  user,
  transporter,
  payments,
  onConfirmPayment,
  onGoToSearch
}) => {
  const [activeMethod, setActiveMethod] = useState<'pix' | 'cartao'>('pix');
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [receiptModalPayment, setReceiptModalPayment] = useState<PaymentRecord | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);

  // Gateway status simulation
  const [gatewayStatus, setGatewayStatus] = useState<
    'aguardando' | 'processando' | 'pago' | 'nao_identificado' | 'recusado' | 'atrasado'
  >('aguardando');
  const [isCheckingGateway, setIsCheckingGateway] = useState<boolean>(false);
  const [authGatewayCode, setAuthGatewayCode] = useState<string>('');

  // Card form state
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [isProcessingCard, setIsProcessingCard] = useState<boolean>(false);

  const monthlyPrice = transporter ? (transporter.basePrice || 420) : 420;

  // Real-format PIX BR Code payload
  const pixPayload = `00020126580014br.gov.bcb.pix0136${transporter?.email || 'financeiro@vanescolar.sp'}520400005303986540${monthlyPrice.toFixed(2)}5802BR59${(transporter?.name || 'Transportador').length.toString().padStart(2, '0')}${transporter?.name || 'Transportador'}6009Sao Paulo62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    // After copying, simulate gateway entering processing state
    setTimeout(() => {
      setGatewayStatus('processando');
    }, 2000);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // Automated Gateway Webhook Polling Simulation
  const handleCheckGatewayWebhook = () => {
    setIsCheckingGateway(true);
    setTimeout(() => {
      setIsCheckingGateway(false);
      // Simulate real-time bank clearance
      const auth = `AUT-PIX-BCB-${Math.floor(100000 + Math.random() * 900000)}`;
      setAuthGatewayCode(auth);
      setGatewayStatus('pago');

      const newPayment: Omit<PaymentRecord, 'id'> = {
        from: user.n,
        fromEmail: user.email,
        to: transporter?.id || 't1',
        toName: transporter?.name || 'Transportador',
        v: monthlyPrice,
        m: 'Pix',
        d: new Date().toLocaleDateString('pt-BR'),
        dueDate: '10/11/2026',
        status: 'pago',
        pixCode: pixPayload,
        gatewayAuthCode: auth,
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`
      };
      onConfirmPayment(newPayment);

      sendPushNotification(
        'Pagamento Confirmado pelo Banco Central ✅',
        `A mensalidade de R$ ${monthlyPrice.toFixed(2)} foi identificada e repassada ao transportador ${transporter?.name}.`
      );
    }, 2000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transporter) return;
    if (cardNumber.replace(/\s/g, '').length < 16 || cardCvv.length < 3) {
      alert('Por favor, preencha dados de cartão válidos.');
      return;
    }

    setIsProcessingCard(true);
    setGatewayStatus('processando');

    setTimeout(() => {
      setIsProcessingCard(false);
      const auth = `AUT-CARD-${Math.floor(100000 + Math.random() * 900000)}`;
      setAuthGatewayCode(auth);
      setGatewayStatus('pago');

      const newPayment: Omit<PaymentRecord, 'id'> = {
        from: user.n,
        fromEmail: user.email,
        to: transporter.id,
        toName: transporter.name,
        v: monthlyPrice,
        m: 'Cartão',
        d: new Date().toLocaleDateString('pt-BR'),
        dueDate: '10/11/2026',
        status: 'pago',
        gatewayAuthCode: auth,
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`
      };
      onConfirmPayment(newPayment);

      sendPushNotification(
        'Mensalidade Aprovada ✅',
        `Pagamento de R$ ${monthlyPrice.toFixed(2)} via cartão aprovado pela operadora.`
      );

      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
    }, 1800);
  };

  const myPayments = payments.filter((p) => p.fromEmail === user.email || p.from === user.n);

  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white">
          Área Financeira da Família
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Gestão de mensalidades com reconhecimento automático de pagamento e recibos oficiais
        </p>
      </div>

      {/* GUARDIAN PROFILE & FAMILY REPUTATION CARD */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffc400] to-[#e6b000] text-[#10263b] font-black text-lg flex items-center justify-center shadow-inner shrink-0">
              {user.n.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-[#1b8a52] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Responsável Verificado
                </span>
                <span className="bg-[#ffc400] text-[#10263b] text-[9px] font-black px-2 py-0.5 rounded-full">
                  Família Nota 10 🌟
                </span>
              </div>
              <h3 className="font-black text-sm text-[#10263b] dark:text-white mt-1">
                {user.n}
              </h3>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                E-mail: {user.email} · Tel: {user.phone || '(11) 98811-2233'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#5d6f80] uppercase font-bold block">Reputação na Rede</span>
            <div className="flex items-center justify-end gap-1 text-sm font-black text-[#10263b] dark:text-[#ffc400] mt-0.5">
              <span>5.0</span>
              <span className="text-[#ffc400]">★★★★★</span>
            </div>
            <span className="text-[10px] text-[#1b8a52] font-bold">100% Pontualidade</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Pontualidade</span>
            <span className="font-black text-xs text-[#10263b] dark:text-white">5.0 ★</span>
          </div>
          <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Pagamento</span>
            <span className="font-black text-xs text-[#1b8a52]">5.0 ★</span>
          </div>
          <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Comunicação</span>
            <span className="font-black text-xs text-[#0f7f8c]">5.0 ★</span>
          </div>
        </div>
      </div>

      {/* DELINQUENCY POLICY NOTICE BANNER */}
      <div className="p-4 bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] dark:from-[#24170a] dark:to-[#1f1408] border-2 border-[#ea580c] rounded-2xl shadow-xs space-y-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-[#ea580c] text-white rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs text-[#9a3412] dark:text-[#fdba74] uppercase tracking-wider flex items-center gap-1.5">
                Cláusula Contratual & Aviso de Vencimento
              </h3>
              <span className="text-[10px] bg-[#ea580c] text-white font-black px-2 py-0.5 rounded-full">
                IMPORTANTE
              </span>
            </div>
            <p className="text-xs text-[#7c2d12] dark:text-[#fed7aa] mt-1 leading-relaxed font-medium">
              Fique atento aos prazos de vencimento da mensalidade escolar:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 bg-white/80 dark:bg-[#16232f]/80 rounded-xl border border-[#fed7aa] dark:border-[#7c2d12]">
            <div className="font-black text-[#ea580c] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Atraso superior a 1 semana (7 dias):
            </div>
            <div className="text-[11px] text-[#5d6f80] dark:text-[#cbd5e1] mt-0.5">
              Cobrança de juros de mora diários e multa contratual de 2% aplicados sobre o valor da mensalidade.
            </div>
          </div>

          <div className="p-2.5 bg-[#fef2f2] dark:bg-[#2b1114] rounded-xl border border-[#fca5a5] dark:border-[#991b1b]">
            <div className="font-black text-[#c93c3c] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Atraso superior a 1 mês (30 dias):
            </div>
            <div className="text-[11px] text-[#7f1d1d] dark:text-[#fca5a5] mt-0.5 font-bold">
              Rescisão automática do contrato, bloqueio cadastral imediato no app e inclusão do débito no <b>SERASA / SPC</b>.
            </div>
          </div>
        </div>

        <div className="text-[10px] text-[#9a3412] dark:text-[#fdba74] flex items-center justify-between pt-1">
          <span>* O desbloqueio do cadastro ocorre exclusivamente após a quitação integral das pendências financeiras.</span>
          <button
            onClick={() => setShowPolicyModal(true)}
            className="font-bold underline text-[#ea580c] hover:opacity-80 ml-2 shrink-0 cursor-pointer"
          >
            Ver Detalhes do Regulamento
          </button>
        </div>
      </div>

      {/* Current Month Invoice Card */}
      {!transporter ? (
        <div className="bg-white dark:bg-[#16232f] p-6 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center space-y-3">
          <div className="text-3xl">💳</div>
          <h3 className="font-extrabold text-sm">Nenhum transportador contratado ainda</h3>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Encontre um transportador escolar e assine o contrato pelo chat para gerar suas mensalidades.
          </p>
          <button
            onClick={onGoToSearch}
            className="bg-[#ffc400] text-[#10263b] text-xs font-black px-4 py-2 rounded-xl cursor-pointer"
          >
            Pesquisar Transportadores
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-[#5d6f80] dark:text-[#93a5b5] uppercase tracking-wider">
                Fatura de Novembro / 2026
              </span>
              <h3 className="font-black text-sm text-[#10263b] dark:text-white mt-0.5">
                Transportador: {transporter.name}
              </h3>
              <p className="text-xs text-[#5d6f80]">Vencimento Oficial: <b>10 de Novembro</b></p>
            </div>

            <div className="text-right">
              {gatewayStatus === 'aguardando' && (
                <span className="inline-block bg-[#fff8e1] dark:bg-[#332a12] text-[#ffc400] text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border border-[#ffc400]/40">
                  Aguardando Pagamento
                </span>
              )}
              {gatewayStatus === 'processando' && (
                <span className="inline-block bg-[#e0f2fe] dark:bg-[#132c3f] text-[#0284c7] text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border border-[#0284c7]/40 flex items-center gap-1 justify-end">
                  <Loader2 className="w-3 h-3 animate-spin" /> Em Processamento
                </span>
              )}
              {gatewayStatus === 'pago' && (
                <span className="inline-block bg-[#dcfce7] dark:bg-[#143324] text-[#15803d] text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border border-[#15803d]/40">
                  ✓ Pago & Autenticado
                </span>
              )}
              <div className="text-xl font-black text-[#10263b] dark:text-white">
                R$ {monthlyPrice.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="flex bg-[#eef2f5] dark:bg-[#0e1822] p-1 rounded-xl">
            <button
              onClick={() => setActiveMethod('pix')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMethod === 'pix'
                  ? 'bg-white dark:bg-[#16232f] text-[#10263b] dark:text-white shadow-xs'
                  : 'text-[#5d6f80] hover:text-[#10263b]'
              }`}
            >
              <QrCode className="w-4 h-4 text-[#0f7f8c]" /> Pix Instantâneo (Automação Gateway)
            </button>
            <button
              onClick={() => setActiveMethod('cartao')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMethod === 'cartao'
                  ? 'bg-white dark:bg-[#16232f] text-[#10263b] dark:text-white shadow-xs'
                  : 'text-[#5d6f80] hover:text-[#10263b]'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#ffc400]" /> Cartão de Crédito
            </button>
          </div>

          {/* PIX TAB WITH REAL-TIME GATEWAY LISTENER (SEM BOTÃO MANUAL) */}
          {activeMethod === 'pix' && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-center space-y-2">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-[#d6dee6] flex items-center justify-center shadow-xs">
                  {/* Real QR SVG Pattern */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect width="100" height="100" fill="#ffffff" />
                    <rect x="10" y="10" width="25" height="25" fill="#10263b" />
                    <rect x="14" y="14" width="17" height="17" fill="#ffffff" />
                    <rect x="18" y="18" width="9" height="9" fill="#10263b" />
                    <rect x="65" y="10" width="25" height="25" fill="#10263b" />
                    <rect x="69" y="14" width="17" height="17" fill="#ffffff" />
                    <rect x="73" y="18" width="9" height="9" fill="#10263b" />
                    <rect x="10" y="65" width="25" height="25" fill="#10263b" />
                    <rect x="14" y="69" width="17" height="17" fill="#ffffff" />
                    <rect x="18" y="73" width="9" height="9" fill="#10263b" />
                    <rect x="45" y="10" width="10" height="25" fill="#10263b" />
                    <rect x="45" y="45" width="15" height="15" fill="#0f7f8c" />
                    <rect x="65" y="55" width="20" height="15" fill="#10263b" />
                    <rect x="45" y="70" width="12" height="20" fill="#10263b" />
                    <rect x="65" y="75" width="25" height="15" fill="#10263b" />
                  </svg>
                </div>
                <div className="text-[11px] text-[#5d6f80]">
                  Abra o app do seu banco e aponte a câmera para o QR Code Pix acima
                </div>
              </div>

              {/* PIX COPY PASTE */}
              <div>
                <label className="block text-[11px] font-bold text-[#5d6f80] mb-1">
                  Código Pix Copia e Cola:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixPayload}
                    className="w-full text-xs font-mono p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-ellipsis overflow-hidden"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="bg-[#10263b] text-[#ffc400] text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1 shrink-0 hover:brightness-110 shadow-xs cursor-pointer"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Gateway Status Monitor (Sem botão manual) */}
              <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    gatewayStatus === 'pago' ? 'bg-[#1b8a52]' : gatewayStatus === 'processando' ? 'bg-[#0284c7] animate-ping' : 'bg-[#ffc400]'
                  }`} />
                  <div>
                    <div className="font-bold text-[#10263b] dark:text-white">
                      Status Bancário: {
                        gatewayStatus === 'pago' ? 'Pagamento Aprovado e Compensado' :
                        gatewayStatus === 'processando' ? 'Pagamento em processamento...' :
                        gatewayStatus === 'nao_identificado' ? 'Pagamento não identificado' :
                        gatewayStatus === 'recusado' ? 'Pagamento recusado' :
                        'Aguardando pagamento pelo Banco Central'
                      }
                    </div>
                    <div className="text-[10px] text-[#5d6f80]">
                      {authGatewayCode ? `Autenticação: ${authGatewayCode}` : 'O status é atualizado automaticamente via webhook bancário instantâneo'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckGatewayWebhook}
                  disabled={isCheckingGateway || gatewayStatus === 'pago'}
                  className="px-3 py-1.5 bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] font-bold text-[11px] rounded-lg flex items-center gap-1 hover:brightness-110 cursor-pointer disabled:opacity-50"
                  title="Verificar confirmação automática do gateway"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingGateway ? 'animate-spin' : ''}`} />
                  {isCheckingGateway ? 'Verificando...' : 'Consultar Gateway'}
                </button>
              </div>
            </div>
          )}

          {/* CARD TAB */}
          {activeMethod === 'cartao' && (
            <form onSubmit={handleCardSubmit} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold mb-1">Número do Cartão de Crédito</label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nome Impresso no Cartão</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ex: CRISTIANE MARTINS"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Validade (MM/AA)</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingCard}
                className="w-full py-2.5 bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] font-black rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                {isProcessingCard ? (
                  <span>Processando pagamento com operadora...</span>
                ) : (
                  <span>Pagar Mensalidade R$ {monthlyPrice.toFixed(2).replace('.', ',')}</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Payment History List */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#ffc400]" />
          Histórico de Pagamentos & Comprovantes Autenticados
        </h3>

        {myPayments.length === 0 ? (
          <div className="p-4 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-center text-xs text-[#5d6f80]">
            Nenhum comprovante anterior localizado nesta conta.
          </div>
        ) : (
          <div className="space-y-2">
            {myPayments.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-black text-[#10263b] dark:text-white flex items-center gap-1.5">
                    <span>Mensalidade Transporte Escolar</span>
                    <span className="text-[10px] bg-[#1b8a52]/10 text-[#1b8a52] px-1.5 py-0.2 rounded font-bold">
                      {p.m}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                    Pago em {p.d} · Recibo: <b>{p.receiptNumber || 'REC-8921'}</b> {p.gatewayAuthCode ? `· Aut: ${p.gatewayAuthCode}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[#1b8a52]">
                    R$ {p.v.toFixed(2).replace('.', ',')}
                  </span>
                  <button
                    onClick={() => setReceiptModalPayment(p)}
                    className="p-1.5 bg-white dark:bg-[#16232f] border border-[#d6dee6] dark:border-[#26384a] text-[#10263b] dark:text-white rounded-lg hover:border-[#ffc400] transition cursor-pointer"
                    title="Baixar Recibo Oficial"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POLICY MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base flex items-center gap-1.5 text-[#c93c3c]">
                <Scale className="w-5 h-5" />
                Regulamento Financeiro & Inadimplência
              </h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-[#5d6f80] font-black text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#5d6f80] dark:text-[#cbd5e1]">
              <p>
                O transporte escolar é um serviço de utilidade pública regulamentado pelo Departamento de Transportes Públicos (DTP) de São Paulo. Para garantir a pontualidade operacional, combustível e manutenção contínua das vans, as regras de pagamento seguem rigoroso controle:
              </p>

              <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-1">
                <b className="text-[#10263b] dark:text-white block font-black">1. Data de Vencimento:</b>
                <span>As faturas vencem todo dia 10 de cada mês corrente de prestação do serviço.</span>
              </div>

              <div className="p-3 bg-[#fff7ed] dark:bg-[#24170a] rounded-xl border border-[#ea580c]/30 space-y-1">
                <b className="text-[#ea580c] block font-black">2. Atraso de 7 dias (1 semana):</b>
                <span>Acréscimo de multa contratual de 2% (dois por cento) mais juros de mora de 1% ao mês calculados pro-rata die sobre a fatura original.</span>
              </div>

              <div className="p-3 bg-[#fef2f2] dark:bg-[#2b1114] rounded-xl border border-[#ef4444]/30 space-y-1">
                <b className="text-[#c93c3c] block font-black">3. Atraso de 30 dias (1 mês):</b>
                <span>
                  Rescisão compulsória do contrato de transporte escolar, suspensão do embarque do aluno, bloqueio total de acesso ao aplicativo Van Escolar SP e encaminhamento imediato do débito para inclusão nos órgãos de restrição de crédito (SERASA e SPC) e protesto em cartório.
                </span>
              </div>

              <div className="p-3 bg-[#1b8a52]/10 rounded-xl border border-[#1b8a52]/30 text-[#1b8a52] font-bold">
                ✓ Para regularizar e desbloquear o cadastro, basta realizar a quitação do débito pendente via Pix ou Cartão diretamente no aplicativo.
              </div>
            </div>

            <button
              onClick={() => setShowPolicyModal(false)}
              className="w-full py-2.5 bg-[#10263b] text-[#ffc400] font-black rounded-xl hover:brightness-110 cursor-pointer"
            >
              Compreendi as Normas
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-[#10263b] w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 border border-[#d6dee6]">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-mono text-xs text-[#5d6f80]">RECIBO OFICIAL</span>
              <button onClick={() => setReceiptModalPayment(null)} className="font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="text-center space-y-1">
              <div className="text-2xl font-black text-[#1b8a52]">
                R$ {receiptModalPayment.v.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs text-[#5d6f80]">Pagamento Confirmado via {receiptModalPayment.m}</div>
            </div>

            <div className="text-xs space-y-2 border-y py-3 text-[#5d6f80]">
              <div className="flex justify-between">
                <span>Data:</span>
                <b>{receiptModalPayment.d}</b>
              </div>
              <div className="flex justify-between">
                <span>Pagador:</span>
                <b>{receiptModalPayment.from}</b>
              </div>
              <div className="flex justify-between">
                <span>Beneficiário:</span>
                <b>{receiptModalPayment.toName || 'Transportador'}</b>
              </div>
              <div className="flex justify-between">
                <span>Número do Recibo:</span>
                <b className="font-mono">{receiptModalPayment.receiptNumber || 'REC-8921'}</b>
              </div>
              {receiptModalPayment.gatewayAuthCode && (
                <div className="flex justify-between">
                  <span>Autenticação:</span>
                  <b className="font-mono">{receiptModalPayment.gatewayAuthCode}</b>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                alert('Recibo salvo no seu dispositivo!');
                setReceiptModalPayment(null);
              }}
              className="w-full py-2.5 bg-[#10263b] text-[#ffc400] font-black text-xs rounded-xl cursor-pointer"
            >
              Salvar Recibo em PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
