import React, { useState } from 'react';
import { ExpenseRecord, PaymentRecord, Child, BankAccountInfo, TransferRecord, SubscriptionTier } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  Trash2,
  Calendar,
  Fuel,
  Wrench,
  Shield,
  FileCheck,
  Disc,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Gift,
  HelpCircle,
  CreditCard,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileText,
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';
import { PLATFORM_FEE_PERCENT, PixWebhookEvent } from '../../services/paymentGatewayService';

interface TransporterFinancialDashboardProps {
  transporterEmail: string;
  kids: Child[];
  payments: PaymentRecord[];
  transfers?: TransferRecord[];
  expenses: ExpenseRecord[];
  bankAccount?: BankAccountInfo;
  subscriptionTier?: SubscriptionTier;
  onUpgradeClick?: () => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onToggleChildPaid: (childIndex: number) => void;
  onSetChildPaymentStatus?: (childIndex: number, status: 'pago' | 'pendente' | 'abonado') => void;
  onProcessPixWebhook?: (event: PixWebhookEvent) => void;
}

export const TransporterFinancialDashboard: React.FC<TransporterFinancialDashboardProps> = ({
  transporterEmail,
  kids,
  payments,
  transfers = [],
  expenses,
  bankAccount = {
    accountHolder: 'João Batista de Oliveira',
    cpfCnpj: '18.490.231/0001-44',
    bankName: 'Banco do Brasil',
    accountType: 'corrente',
    agency: '1820-X',
    accountNumber: '40912-3',
    pixKeyType: 'cnpj',
    pixKey: '18.490.231/0001-44'
  },
  subscriptionTier = 'free',
  onUpgradeClick,
  onAddExpense,
  onDeleteExpense,
  onToggleChildPaid,
  onSetChildPaymentStatus,
  onProcessPixWebhook
}) => {
  // Month / Year Selector
  const [selectedMonth, setSelectedMonth] = useState<string>('11'); // Novembro
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Expense modal
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('Combustível');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDesc, setExpDesc] = useState<string>('');
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actionMenuKidIndex, setActionMenuKidIndex] = useState<number | null>(null);

  // Transfer Receipt Modal
  const [selectedReceiptTransfer, setSelectedReceiptTransfer] = useState<TransferRecord | null>(null);
  const [webhookSimNotice, setWebhookSimNotice] = useState<string>('');

  // Additional revenues (passeios, fretes avulsos)
  const charterRevenues = 450.00;
  const baseMonthlyPerChild = 420;
  const activeKidsCount = kids.length;

  const paidKids = kids.filter((k) => k.pg === 1 || k.paymentStatus === 'pago');
  const waivedKids = kids.filter((k) => k.pg === 2 || k.paymentStatus === 'abonado');
  const pendingKids = kids.filter((k) => (k.pg === 0 || k.paymentStatus === 'pendente') && k.pg !== 2);

  const grossMonthlyRevenue = paidKids.length * baseMonthlyPerChild;
  const totalGrossRevenue = grossMonthlyRevenue + charterRevenues;

  // Platform fee deduction (4.5%)
  const totalPlatformFees = Math.round((totalGrossRevenue * (PLATFORM_FEE_PERCENT / 100)) * 100) / 100;
  const netTransporterRevenue = Math.round((totalGrossRevenue - totalPlatformFees) * 100) / 100;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const estimatedNetProfit = netTransporterRevenue - totalExpenses;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(expAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor de despesa válido.');
      return;
    }

    onAddExpense({
      transporterEmail,
      category: expCategory,
      amount: val,
      date: expDate,
      description: expDesc.trim() || expCategory
    });

    setExpAmount('');
    setExpDesc('');
    setIsAddExpenseOpen(false);
  };

  const handleStatusChange = (index: number, status: 'pago' | 'pendente' | 'abonado') => {
    if (onSetChildPaymentStatus) {
      onSetChildPaymentStatus(index, status);
    } else {
      onToggleChildPaid(index);
    }
    setActionMenuKidIndex(null);
  };

  // Simulate Instant Webhook Pix event from Parent
  const handleTriggerSimulatedWebhook = () => {
    const unpaids = kids.filter(k => k.pg === 0);
    const targetKid = unpaids[0] || kids[0];
    const payerName = targetKid ? targetKid.r : 'Marta Almeida';

    const webhookEvent: PixWebhookEvent = {
      event: 'pix.received',
      txid: `txid_${Date.now().toString(36)}`,
      endToEndId: `E18236125${Date.now()}98214`,
      amount: baseMonthlyPerChild,
      payerName,
      payerEmail: 'marta.almeida@gmail.com',
      payerCpf: '349.201.884-12',
      receiverTransporterId: transporterEmail,
      receiverTransporterName: bankAccount.accountHolder,
      receiverTransporterEmail: transporterEmail,
      paidAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    if (onProcessPixWebhook) {
      onProcessPixWebhook(webhookEvent);
    }

    // Auto mark kid as paid
    const kidIndex = kids.findIndex(k => k.r === payerName || k.n === targetKid?.n);
    if (kidIndex >= 0 && onSetChildPaymentStatus) {
      onSetChildPaymentStatus(kidIndex, 'pago');
    }

    setWebhookSimNotice(
      `Webhook Banco Central processado! Recebido Pix de R$ ${baseMonthlyPerChild.toFixed(2)} de ${payerName}. Taxa da plataforma (4.5% = R$ 18,90) descontada e R$ 401,10 creditados na sua conta.`
    );
    setTimeout(() => setWebhookSimNotice(''), 7000);
  };

  const getCategoryIcon = (cat: ExpenseRecord['category']) => {
    switch (cat) {
      case 'Combustível':
        return <Fuel className="w-3.5 h-3.5 text-[#ffc400]" />;
      case 'Manutenção':
        return <Wrench className="w-3.5 h-3.5 text-[#0f7f8c]" />;
      case 'Seguro':
        return <Shield className="w-3.5 h-3.5 text-[#1b8a52]" />;
      case 'Licenciamento / DTP':
        return <FileCheck className="w-3.5 h-3.5 text-[#3b82f6]" />;
      case 'Pneus':
        return <Disc className="w-3.5 h-3.5 text-[#a855f7]" />;
      default:
        return <DollarSign className="w-3.5 h-3.5 text-[#5d6f80]" />;
    }
  };

  const MONTH_NAMES: Record<string, string> = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1b8a52]" />
            Gestão Financeira & Repasses Bancários
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Receitas, dedução de taxas da plataforma, repasses automáticos e DRE
          </p>
        </div>

        {/* Month / Year Picker */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#16232f] p-1 rounded-xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs text-xs font-bold">
          <Calendar className="w-4 h-4 text-[#ffc400] ml-1.5" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent py-1 px-1 font-bold text-[#10263b] dark:text-white focus:outline-hidden cursor-pointer"
          >
            {Object.entries(MONTH_NAMES).map(([val, name]) => (
              <option key={val} value={val} className="dark:bg-[#16232f]">
                {name}
              </option>
            ))}
          </select>
          <span className="text-[#5d6f80]">/</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent py-1 px-1 font-bold text-[#10263b] dark:text-white focus:outline-hidden cursor-pointer"
          >
            <option value="2025" className="dark:bg-[#16232f]">2025</option>
            <option value="2026" className="dark:bg-[#16232f]">2026</option>
            <option value="2027" className="dark:bg-[#16232f]">2027</option>
          </select>
        </div>
      </div>

      {webhookSimNotice && (
        <div className="p-3.5 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {webhookSimNotice}
        </div>
      )}

      {/* REPASSE E CONTA BANCÁRIA HERO CARD */}
      <div className="p-4 bg-linear-to-br from-[#10263b] to-[#1c3954] text-white rounded-2xl shadow-lg border border-[#2d4d6b] space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#1b8a52] text-white rounded-xl font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#ffc400] font-black uppercase tracking-wider block">
                Conta de Repasse Automático Cadastrada
              </span>
              <h3 className="font-black text-sm text-white">
                {bankAccount.bankName} · Chave Pix {bankAccount.pixKeyType.toUpperCase()}
              </h3>
              <p className="text-[11px] text-[#93a5b5]">
                Agência: {bankAccount.agency} · CC: {bankAccount.accountNumber} · Favorecido: {bankAccount.accountHolder}
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerSimulatedWebhook}
            className="px-2.5 py-1.5 bg-[#ffc400] hover:bg-[#e6b000] text-[#10263b] rounded-xl text-[10px] font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
            title="Simular notificação de pagamento Pix do Banco Central"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Testar Webhook Pix
          </button>
        </div>

        {/* Detailed Financial Breakdown (Gross -> Fee -> Net) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#264560] text-center text-xs">
          <div className="p-2 bg-[#162d42] rounded-xl">
            <span className="text-[10px] text-[#93a5b5] block">Valor Bruto Recebido</span>
            <span className="font-black text-sm text-white">
              R$ {totalGrossRevenue.toFixed(2)}
            </span>
          </div>

          <div className="p-2 bg-[#162d42] rounded-xl">
            <span className="text-[10px] text-[#ffc400] block">Taxa Plataforma ({PLATFORM_FEE_PERCENT}%)</span>
            <span className="font-black text-sm text-[#ffc400]">
              - R$ {totalPlatformFees.toFixed(2)}
            </span>
          </div>

          <div className="p-2 bg-[#162d42] rounded-xl border border-[#1b8a52]/50">
            <span className="text-[10px] text-[#1b8a52] block font-bold">Líquido Creditado</span>
            <span className="font-black text-sm text-[#1b8a52]">
              R$ {netTransporterRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
          <span className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] block">Receita Líquida</span>
          <span className="text-base font-black text-[#1b8a52]">
            R$ {netTransporterRevenue.toFixed(2)}
          </span>
          <div className="text-[10px] text-[#5d6f80] mt-0.5">
            {paidKids.length} de {activeKidsCount} alunos pagos
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
          <span className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] block">A Receber</span>
          <span className="text-base font-black text-[#c93c3c]">
            R$ {(pendingKids.length * baseMonthlyPerChild).toFixed(2)}
          </span>
          <div className="text-[10px] text-[#5d6f80] mt-0.5">
            {pendingKids.length} mensalidades pendentes
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
          <span className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] block">Despesas da Van</span>
          <span className="text-base font-black text-[#c93c3c]">
            R$ {totalExpenses.toFixed(2)}
          </span>
          <div className="text-[10px] text-[#5d6f80] mt-0.5">
            {expenses.length} lançamentos
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
          <span className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] block">Lucro Real Estimado</span>
          <span className={`text-base font-black ${estimatedNetProfit >= 0 ? 'text-[#1b8a52]' : 'text-[#c93c3c]'}`}>
            R$ {estimatedNetProfit.toFixed(2)}
          </span>
          <div className="text-[10px] text-[#5d6f80] mt-0.5">
            Líquido após combustível
          </div>
        </div>
      </div>

      {/* HISTÓRICO DE REPASSES BANCÁRIOS (TED / PIX COM COMPROVANTES) */}
      <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0f7f8c]" />
            Histórico de Repasses Automáticos da Plataforma
          </h3>
          <span className="text-xs text-[#5d6f80]">Banco Central</span>
        </div>

        <div className="space-y-2">
          {transfers.length === 0 ? (
            <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-center text-xs text-[#5d6f80]">
              Nenhum repasse realizado ainda neste mês.
            </div>
          ) : (
            transfers.map((trf) => (
              <div
                key={trf.id}
                className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#1b8a52]" />
                    Repasse Pix: R$ {trf.netAmount.toFixed(2)}
                    <span className="text-[10px] text-[#5d6f80] font-normal">
                      (Bruto: R$ {trf.grossAmount.toFixed(2)} · Taxa: -R$ {trf.platformFee.toFixed(2)})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                    Data: {trf.clearedAt} · Destino: {trf.bankAccount}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReceiptTransfer(trf)}
                  className="px-2.5 py-1.5 bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] font-black rounded-lg text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition"
                >
                  <FileText className="w-3 h-3" /> Comprovante
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* STUDENT FEES BREAKDOWN WITH "ABONAR" ACTION */}
      <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] p-4 shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-[#ffc400]" />
          Mensalidades dos Alunos & Baixa de Pagamento
        </h3>

        <div className="space-y-2">
          {kids.map((kid, idx) => {
            const isPaid = kid.pg === 1 || kid.paymentStatus === 'pago';
            const isWaived = kid.pg === 2 || kid.paymentStatus === 'abonado';

            return (
              <div
                key={kid.id || idx}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs ${
                  isPaid
                    ? 'bg-[#1b8a52]/10 border-[#1b8a52]/30 text-[#1b8a52]'
                    : isWaived
                    ? 'bg-[#0f7f8c]/10 border-[#0f7f8c]/30 text-[#0f7f8c]'
                    : 'bg-[#f8fafc] dark:bg-[#0e1822] border-[#e2e8f0] dark:border-[#26384a]'
                }`}
              >
                <div>
                  <div className="font-black text-sm text-[#10263b] dark:text-white">
                    {kid.n}
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
                    Responsável: {kid.r} ({kid.t}) · Vencimento dia {kid.pgAt || 10}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#10263b] dark:text-white">
                    R$ {kid.valor || baseMonthlyPerChild},00
                  </span>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuKidIndex(actionMenuKidIndex === idx ? null : idx)}
                      className="p-1.5 bg-[#eef2f5] dark:bg-[#26384a] rounded-lg text-[#10263b] dark:text-white cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {actionMenuKidIndex === idx && (
                      <div className="absolute right-0 top-8 z-30 bg-white dark:bg-[#16232f] border border-[#d6dee6] dark:border-[#26384a] rounded-xl shadow-xl p-1.5 space-y-1 w-44 animate-in fade-in">
                        <button
                          onClick={() => handleStatusChange(idx, 'pago')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-green-50 text-[#1b8a52] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Marcar como Pago
                        </button>

                        <button
                          onClick={() => handleStatusChange(idx, 'abonado')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50 text-[#0f7f8c] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5" /> Abonar Mensalidade
                        </button>

                        <button
                          onClick={() => handleStatusChange(idx, 'pendente')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-[#c93c3c] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> Marcar Pendente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPENSES MANAGEMENT */}
      <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-[#c93c3c]" />
              Despesas da Van & Manutenções ({expenses.length})
            </h3>
            {subscriptionTier === 'free' && (
              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                (Bloqueado no Plano Gratuito)
              </span>
            )}
          </div>
          {subscriptionTier === 'free' ? (
            <button
              onClick={onUpgradeClick}
              className="px-2.5 py-1 bg-[#ffc400] text-[#10263b] font-black rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:brightness-105"
            >
              🔒 Desbloquear (Pro/Premium)
            </button>
          ) : (
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-2.5 py-1 bg-[#10263b] text-[#ffc400] font-black rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5" /> Despesa
            </button>
          )}
        </div>

        {subscriptionTier === 'free' ? (
          <div className="p-3.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-dashed border-[#d6dee6] dark:border-[#26384a] text-center space-y-2">
            <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
              No <b>Plano Gratuito</b> não é permitido adicionar despesas. Faça upgrade para o <b>Plano Profissional (R$ 24,99/mês)</b> para até 40 alunos com despesas liberadas ou <b>Plano Premium (R$ 44,99/mês)</b> para acesso total com Otimizador de Rotas com IA!
            </p>
            {onUpgradeClick && (
              <button
                onClick={onUpgradeClick}
                className="py-1.5 px-4 bg-[#ffc400] text-[#10263b] font-black text-xs rounded-xl hover:brightness-105 transition cursor-pointer"
              >
                Fazer Upgrade
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#e2e8f0] dark:bg-[#26384a] rounded-lg">
                  {getCategoryIcon(exp.category)}
                </div>
                <div>
                  <div className="font-bold text-[#10263b] dark:text-white">
                    {exp.description}
                  </div>
                  <div className="text-[10px] text-[#5d6f80]">
                    {exp.category} · {exp.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#c93c3c]">
                  - R$ {exp.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDeleteExpense(exp.id)}
                  className="text-[#c93c3c] hover:bg-red-50 p-1.5 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Modal Comprovante de Repasse */}
      {selectedReceiptTransfer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-md w-full space-y-4 border border-[#d6dee6] dark:border-[#26384a] shadow-2xl text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
              <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b8a52]" />
                Comprovante Oficial de Repasse Bancário
              </h3>
              <button
                onClick={() => setSelectedReceiptTransfer(null)}
                className="text-[#5d6f80] hover:text-black cursor-pointer font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="font-mono bg-[#f8fafc] dark:bg-[#0e1822] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#26384a] text-[11px] leading-relaxed space-y-1">
              <div className="text-center font-bold pb-2 border-b border-gray-200 dark:border-gray-800">
                VAN ESCOLAR SP - PLATAFORMA DE TRANSPORTE ESCOLAR
                <div className="text-[9px] text-[#5d6f80]">SISTEMA HOMOLOGADO BANCO CENTRAL DO BRASIL</div>
              </div>
              <div className="pt-2"><b>Recibo de Repasse:</b> {selectedReceiptTransfer.receiptNumber}</div>
              <div><b>Autenticação BACEN:</b> {selectedReceiptTransfer.endToEndId}</div>
              <div><b>Data/Hora Liquidação:</b> {selectedReceiptTransfer.clearedAt}</div>
              <div className="pt-1"><b>Favorecido:</b> {selectedReceiptTransfer.transporterName}</div>
              <div><b>Conta Bancária:</b> {selectedReceiptTransfer.bankAccount}</div>
              <div><b>Chave Pix:</b> {selectedReceiptTransfer.pixKey}</div>
              <div className="pt-1 border-t border-gray-200 dark:border-gray-800">
                <b>Valor Bruto da Mensalidade:</b> R$ {selectedReceiptTransfer.grossAmount.toFixed(2)}
              </div>
              <div>
                <b>Taxa de Intermediação ({selectedReceiptTransfer.platformFeePercent}%):</b> - R$ {selectedReceiptTransfer.platformFee.toFixed(2)}
              </div>
              <div className="font-bold text-[#1b8a52] text-xs pt-1">
                VALOR LÍQUIDO CREDITADO: R$ {selectedReceiptTransfer.netAmount.toFixed(2)}
              </div>
              <div className="text-[9px] text-[#5d6f80] pt-2 text-center">
                Autenticado digitalmente. Válido para prestação de contas fiscais.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-[#10263b] text-[#ffc400] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
              >
                <Download className="w-3.5 h-3.5" /> Baixar / Imprimir PDF
              </button>
              <button
                onClick={() => setSelectedReceiptTransfer(null)}
                className="py-2.5 px-4 bg-[#e2e8f0] dark:bg-[#26384a] font-bold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Despesa */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-md w-full space-y-3 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs"
          >
            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
              Novo Lançamento de Despesa Operacional
            </h3>

            <div>
              <label className="block font-bold mb-1">Categoria</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as any)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              >
                <option value="Combustível">Combustível (Diesel S10)</option>
                <option value="Manutenção">Manutenção Mecânica</option>
                <option value="Seguro">Seguro APP / Veículo</option>
                <option value="Licenciamento / DTP">Taxas DTP / Vistoria Semestral</option>
                <option value="Pneus">Pneus e Alinhamento</option>
                <option value="Pedágio">Pedágios</option>
                <option value="Estacionamento">Estacionamento</option>
                <option value="Outros">Outras Despesas</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">Valor (R$) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 280,00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Data</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Abastecimento Posto BR Marginal"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="px-3 py-2 bg-[#e2e8f0] dark:bg-[#26384a] rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-[#c93c3c] text-white rounded-xl font-black cursor-pointer hover:brightness-110"
              >
                Salvar Despesa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
