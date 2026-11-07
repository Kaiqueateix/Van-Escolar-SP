import React, { useState } from 'react';
import { PRDTestingView } from './PRDTestingView';
import {
  User,
  TransporterProfile,
  ReportTicket,
  AuditLogItem,
  ContractProposal,
  VerifiedReview,
  ParentReviewByTransporter,
  ServicePartnerItem,
  PartnerPromotion,
  NewStudentOpportunity,
  FreelanceDriver
} from '../../types';
import {
  ShieldCheck,
  UserCheck,
  Users,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  Ban,
  Search,
  DollarSign,
  TrendingUp,
  History,
  Lock,
  Tag,
  Handshake,
  Star,
  Plus,
  Trash2,
  Eye,
  Check,
  Building2,
  Calendar,
  Layers,
  Download,
  AlertCircle,
  MessageSquare,
  FileCode
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentAdmin: User;
  users: User[];
  transporters: TransporterProfile[];
  reports: ReportTicket[];
  auditLogs: AuditLogItem[];
  contracts: ContractProposal[];
  reviews: VerifiedReview[];
  parentReviews: ParentReviewByTransporter[];
  servicePartners: ServicePartnerItem[];
  partnerPromotions: PartnerPromotion[];
  opportunities?: NewStudentOpportunity[];
  freelanceDrivers?: FreelanceDriver[];
  onApproveTransporter: (transporterId: string) => void;
  onRejectTransporter: (transporterId: string, reason: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onApproveReview: (reviewId: string) => void;
  onRejectReview: (reviewId: string) => void;
  onApproveParentReview: (reviewId: string) => void;
  onRejectParentReview: (reviewId: string) => void;
  onAddPromotion: (promo: Omit<PartnerPromotion, 'id'>) => void;
  onTogglePromotionActive: (promoId: string) => void;
  onDeletePromotion: (promoId: string) => void;
  onAddPartner: (partner: Omit<ServicePartnerItem, 'id'>) => void;
  onDeletePartner: (partnerId: string) => void;
  onApproveOpportunity?: (oppId: string) => void;
  onRejectOpportunity?: (oppId: string, reason: string) => void;
  onAddFreelanceDriver?: (driver: FreelanceDriver) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentAdmin,
  users,
  transporters,
  reports,
  auditLogs,
  contracts,
  reviews,
  parentReviews,
  servicePartners,
  partnerPromotions,
  opportunities = [],
  freelanceDrivers = [],
  onApproveTransporter,
  onRejectTransporter,
  onToggleUserStatus,
  onApproveReview,
  onRejectReview,
  onApproveParentReview,
  onRejectParentReview,
  onAddPromotion,
  onTogglePromotionActive,
  onDeletePromotion,
  onAddPartner,
  onDeletePartner,
  onApproveOpportunity,
  onRejectOpportunity,
  onAddFreelanceDriver
}) => {
  // Official 7 sections
  const [activeTab, setActiveTab] = useState<'painel' | 'verificacao' | 'usuarios' | 'denuncias' | 'controle' | 'parceiros' | 'prd_qa'>('painel');

  // Search and selection
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [contractSearchQuery, setContractSearchQuery] = useState<string>('');
  const [selectedContract, setSelectedContract] = useState<ContractProposal | null>(null);

  // Rejection modal for drivers
  const [rejectDriverId, setRejectDriverId] = useState<string | null>(null);
  const [driverRejectReason, setDriverRejectReason] = useState<string>('');

  // Rejection modal for opportunity requests
  const [rejectOppId, setRejectOppId] = useState<string | null>(null);
  const [oppRejectReason, setOppRejectReason] = useState<string>('');

  // Partner Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState<boolean>(false);
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerCategory, setPartnerCategory] = useState<ServicePartnerItem['category']>('auto_pecas');
  const [partnerSpecialty, setPartnerSpecialty] = useState<string>('');
  const [partnerRegion, setPartnerRegion] = useState<string>('Zona Sul');
  const [partnerAddress, setPartnerAddress] = useState<string>('');
  const [partnerPhone, setPartnerPhone] = useState<string>('');
  const [partnerDeal, setPartnerDeal] = useState<string>('');

  // Promo Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [promoTitle, setPromoTitle] = useState<string>('');
  const [promoPartnerName, setPromoPartnerName] = useState<string>('');
  const [promoCategory, setPromoCategory] = useState<PartnerPromotion['category']>('auto_pecas');
  const [promoBadge, setPromoBadge] = useState<string>('20% OFF');
  const [promoDesc, setPromoDesc] = useState<string>('');
  const [promoCoupon, setPromoCoupon] = useState<string>('VANSP20');

  // Metrics calculation
  const parentsCount = users.filter((u) => u.role === 'c').length;
  const driversCount = users.filter((u) => u.role === 't').length;
  const verifiedDriversCount = transporters.filter((t) => t.isVerified).length;
  const pendingDrivers = transporters.filter((t) => !t.isVerified || t.verification.status === 'pendente');
  const activeContractsCount = contracts.filter((c) => c.status === 'assinado_ativo').length;
  const pendingOppsCount = opportunities.filter((o) => o.status === 'aguardando_analise').length;

  const pendingVanReviews = reviews.filter((r) => r.status === 'pendente_moderacao');
  const pendingParentReviews = parentReviews.filter((r) => r.status === 'pendente_moderacao');
  const totalPendingReviews = pendingVanReviews.length + pendingParentReviews.length;
  const totalReportsCount = reports.filter((r) => r.status === 'pendente' || r.status === 'em_analise').length;

  // Platform revenue estimation: Pro/Premium driver subscriptions
  const platformMonthlyRevenue = transporters.reduce((sum, t) => {
    if (t.subscriptionTier === 'premium') return sum + 119.00;
    if (t.subscriptionTier === 'pro') return sum + 59.90;
    return sum;
  }, 0);

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return u.n.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const filteredContracts = contracts.filter((c) => {
    if (!contractSearchQuery.trim()) return true;
    const q = contractSearchQuery.toLowerCase();
    return (
      c.parentName.toLowerCase().includes(q) ||
      c.transporterName.toLowerCase().includes(q) ||
      c.childName.toLowerCase().includes(q) ||
      c.schoolName.toLowerCase().includes(q)
    );
  });

  const handleConfirmDriverReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectDriverId || !driverRejectReason.trim()) {
      alert('A justificativa é obrigatória para reprovar a verificação.');
      return;
    }
    onRejectTransporter(rejectDriverId, driverRejectReason.trim());
    setRejectDriverId(null);
    setDriverRejectReason('');
  };

  const handleConfirmOppReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectOppId || !oppRejectReason.trim()) {
      alert('A justificativa é obrigatória para devolver a solicitação.');
      return;
    }
    if (onRejectOpportunity) {
      onRejectOpportunity(rejectOppId, oppRejectReason.trim());
    }
    setRejectOppId(null);
    setOppRejectReason('');
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerPhone.trim()) {
      alert('Preencha o nome do parceiro e telefone.');
      return;
    }
    onAddPartner({
      name: partnerName.trim(),
      category: partnerCategory,
      region: partnerRegion,
      specialty: partnerSpecialty.trim() || 'Serviços especializados',
      address: partnerAddress.trim() || 'São Paulo - SP',
      phone: partnerPhone.trim(),
      rating: 4.9,
      discountDeal: partnerDeal.trim() || undefined,
      isVerifiedPartner: true
    });
    setPartnerName('');
    setPartnerSpecialty('');
    setPartnerAddress('');
    setPartnerPhone('');
    setPartnerDeal('');
    setIsPartnerModalOpen(false);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoPartnerName.trim()) {
      alert('Preencha o título e o parceiro.');
      return;
    }
    onAddPromotion({
      partnerName: promoPartnerName.trim(),
      category: promoCategory,
      title: promoTitle.trim(),
      discountBadge: promoBadge.trim() || 'Desconto',
      description: promoDesc.trim(),
      couponCode: promoCoupon.trim() || undefined,
      contactPhone: '(11) 98888-2222',
      validUntil: '31/12/2026',
      active: true,
      isActive: true
    });
    setPromoTitle('');
    setPromoPartnerName('');
    setPromoDesc('');
    setIsPromoModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0f7f8c]" />
            Órgão Regulador DTP SP · Central de Controle
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Painel Oficial: 6 seções administrativas de fiscalização, contratos e aprovações
          </p>
        </div>

        <span className="bg-[#0f7f8c] text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs self-start sm:self-auto">
          DTP / Prefeitura SP Ativo
        </span>
      </div>

      {/* 6 Official Admin Tabs */}
      <div className="flex bg-white dark:bg-[#16232f] p-1.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-xs font-bold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('painel')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'painel'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          PAINEL
        </button>

        <button
          onClick={() => setActiveTab('verificacao')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'verificacao'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          VERIFICAÇÃO
          {pendingDrivers.length > 0 && (
            <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-1.5 rounded-full">
              {pendingDrivers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          USUÁRIOS ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('denuncias')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'denuncias'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          DENÚNCIAS & MODERAÇÃO
          {(totalReportsCount > 0 || totalPendingReviews > 0) && (
            <span className="bg-[#c93c3c] text-white text-[10px] font-black px-1.5 rounded-full">
              {totalReportsCount + totalPendingReviews}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('controle')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'controle'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          CONTROLE DE CONTRATOS & VAGAS
          {pendingOppsCount > 0 && (
            <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-1.5 rounded-full">
              {pendingOppsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('parceiros')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'parceiros'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <Handshake className="w-3.5 h-3.5" />
          PARCEIROS & FREELANCERS
        </button>

        <button
          onClick={() => setActiveTab('prd_qa')}
          className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'prd_qa'
              ? 'bg-[#10263b] text-[#ffc400] shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-[#ffc400]" />
          PRD & TESTES QA
        </button>
      </div>

      {/* ========================================================
          1. ABA PAINEL
          ======================================================== */}
      {activeTab === 'painel' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Big KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
              <span className="text-[10px] font-bold text-[#5d6f80] uppercase">Responsáveis Cadastrados</span>
              <div className="text-2xl font-black text-[#10263b] dark:text-white mt-1">
                {parentsCount}
              </div>
              <span className="text-[11px] text-[#1b8a52] font-bold">👨‍👩‍👧 Famílias ativas</span>
            </div>

            <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
              <span className="text-[10px] font-bold text-[#5d6f80] uppercase">Motoristas Escolares</span>
              <div className="text-2xl font-black text-[#10263b] dark:text-white mt-1">
                {driversCount}
              </div>
              <span className="text-[11px] text-[#0f7f8c] font-bold">
                {verifiedDriversCount} com selo DTP
              </span>
            </div>

            <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
              <span className="text-[10px] font-bold text-[#5d6f80] uppercase">Contratos Ativos</span>
              <div className="text-2xl font-black text-[#10263b] dark:text-white mt-1">
                {activeContractsCount}
              </div>
              <span className="text-[11px] text-[#1b8a52] font-bold">Assinados digitalmente</span>
            </div>

            <div className="bg-white dark:bg-[#16232f] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
              <span className="text-[10px] font-bold text-[#5d6f80] uppercase">Receita da Plataforma</span>
              <div className="text-2xl font-black text-[#ffc400] mt-1">
                R$ {platformMonthlyRevenue.toFixed(2)}
              </div>
              <span className="text-[11px] text-[#5d6f80]">Assinaturas Pro/Premium</span>
            </div>
          </div>

          {/* Quick Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#f0f9ff] dark:bg-[#12283a] p-4 rounded-2xl border border-[#bae6fd] dark:border-[#1e4564] space-y-1">
              <span className="text-[10px] font-bold text-[#0284c7] uppercase">Aguardando Verificação</span>
              <div className="text-xl font-black text-[#0369a1] dark:text-[#7dd3fc]">
                {pendingDrivers.length} motoristas pendentes
              </div>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                Alvarás e vistorias semestrais aguardando homologação do fiscal.
              </p>
            </div>

            <div className="bg-[#fefce8] dark:bg-[#2b2713] p-4 rounded-2xl border border-[#fef08a] dark:border-[#52491a] space-y-1">
              <span className="text-[10px] font-bold text-[#ca8a04] uppercase">Solicitações de Vagas</span>
              <div className="text-xl font-black text-[#a16207] dark:text-[#fde047]">
                {pendingOppsCount} aguardando análise
              </div>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                Pedidos de transporte feitos por pais que requerem aprovação prévia.
              </p>
            </div>

            <div className="bg-[#fef2f2] dark:bg-[#331818] p-4 rounded-2xl border border-[#fecaca] dark:border-[#5c2424] space-y-1">
              <span className="text-[10px] font-bold text-[#dc2626] uppercase">Denúncias & Moderação</span>
              <div className="text-xl font-black text-[#b91c1c] dark:text-[#f87171]">
                {totalReportsCount + totalPendingReviews} itens para avaliar
              </div>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                Auditoria de denúncias de má conduta e moderação de avaliações.
              </p>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-2">
            <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4" /> Registro de Auditoria e Conformidade DTP
            </h3>
            <div className="space-y-1.5 text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl flex items-center justify-between border border-[#e2e8f0] dark:border-[#1e293b]">
                  <div>
                    <span className="font-bold text-[#10263b] dark:text-white mr-2">[{log.action}]</span>
                    <span className="text-[#5d6f80] dark:text-[#93a5b5]">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-[#93a5b5] shrink-0 font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. ABA VERIFICAÇÃO (APROVAÇÃO COM JUSTIFICATIVA OBRIGATÓRIA)
          ======================================================== */}
      {activeTab === 'verificacao' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
              Análise de Credenciamento e Documentação do Condutor
            </h3>
            <span className="text-xs font-bold text-[#0f7f8c]">
              {pendingDrivers.length} aguardando deferimento
            </span>
          </div>

          {pendingDrivers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-xs text-[#5d6f80]">
              ✓ Todos os transportadores cadastrados estão em conformidade e verificados pelo DTP SP.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDrivers.map((t) => (
                <div key={t.id} className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={t.photoUrl} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-[#ffc400]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-[#10263b] dark:text-white">{t.name}</h4>
                          <span className="bg-[#fff8e1] dark:bg-[#332a12] text-[#ffc400] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#ffc400]/40">
                            Status: {t.verification.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                          {t.email} · {t.phone} · Veículo: <b>{t.vanModel} ({t.vanYear})</b> - Placa: <b>{t.vanPlate}</b>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveTransporter(t.id)}
                        className="bg-[#1b8a52] hover:bg-[#167043] text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Aprovar e Emitir Selo DTP
                      </button>

                      <button
                        onClick={() => setRejectDriverId(t.id)}
                        className="bg-[#c93c3c] hover:bg-[#a63030] text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reprovar com Justificativa
                      </button>
                    </div>
                  </div>

                  {/* Document and Photos Review Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e2e8f0] dark:border-[#26384a] text-xs">
                    <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
                      <span className="text-[10px] text-[#5d6f80] font-bold uppercase">CNH Profissional</span>
                      <div className="font-bold text-[#10263b] dark:text-white">
                        {t.verification.cnhCategory || 'Cat. D com EAR'}
                      </div>
                      <span className="text-[10px] text-[#1b8a52] font-bold">Curso Escolar Ativo</span>
                    </div>

                    <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
                      <span className="text-[10px] text-[#5d6f80] font-bold uppercase">Alvará DTP</span>
                      <div className="font-bold text-[#10263b] dark:text-white">
                        {t.verification.dtpNumber || 'DTP-SP 89.204'}
                      </div>
                      <span className="text-[10px] text-[#0f7f8c] font-bold">Vistoria semestral em dia</span>
                    </div>

                    <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
                      <span className="text-[10px] text-[#5d6f80] font-bold uppercase">QR Code Prefeitura</span>
                      <div className="font-bold text-[#1b8a52]">Autenticado online</div>
                      <span className="text-[10px] text-[#5d6f80]">Validação digital</span>
                    </div>

                    <div className="p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
                      <span className="text-[10px] text-[#5d6f80] font-bold uppercase">Fotos do Veículo</span>
                      <div className="font-bold text-[#ffc400]">
                        {t.vanPhotos?.length || 4} fotos anexadas
                      </div>
                      <span className="text-[10px] text-[#5d6f80]">Faixa amarela e tacógrafo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Justificativa de Reprovação de Motorista */}
          {rejectDriverId && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleConfirmDriverReject} className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-md w-full space-y-3 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs">
                <h3 className="font-black text-sm text-[#c93c3c] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Justificativa Obrigatória de Reprovação
                </h3>
                <p className="text-[#5d6f80] dark:text-[#93a5b5]">
                  Informe ao condutor o motivo exato pelo qual o credenciamento foi indeferido (ex: alvará vencido, laudo de vistoria ilegível, seguro APP não anexado):
                </p>

                <textarea
                  required
                  rows={4}
                  placeholder="Ex: A foto do certificado de vistoria semestral está com a data ilegível. Favor reenviar cópia nítida do documento emitido pelo Detran/DTP."
                  value={driverRejectReason}
                  onChange={(e) => setDriverRejectReason(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setRejectDriverId(null); setDriverRejectReason(''); }}
                    className="px-3 py-2 bg-[#e2e8f0] dark:bg-[#26384a] text-[#5d6f80] dark:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#c93c3c] text-white rounded-xl font-black cursor-pointer hover:brightness-110"
                  >
                    Confirmar Reprovação com Justificativa
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. ABA USUÁRIOS (GERENCIAMENTO, BLOQUEIO & HISTÓRICO)
          ======================================================== */}
      {activeTab === 'usuarios' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
              Gestão de Contas: Responsáveis e Motoristas
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#5d6f80] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar usuário por nome ou email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#16232f] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-[#0e1822] text-[#5d6f80] dark:text-[#93a5b5] font-black uppercase text-[10px] border-b border-[#e2e8f0] dark:border-[#26384a]">
                  <tr>
                    <th className="p-3">Usuário</th>
                    <th className="p-3">Perfil</th>
                    <th className="p-3">CPF/CNPJ</th>
                    <th className="p-3">Data Cadastro</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações Regulatórias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#26384a]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#0e1822]">
                      <td className="p-3">
                        <div className="font-black text-[#10263b] dark:text-white">{u.n}</div>
                        <div className="text-[11px] text-[#5d6f80]">{u.email}</div>
                      </td>
                      <td className="p-3">
                        {u.role === 'c' && <span className="bg-[#e3f2fd] text-[#1976d2] px-2 py-0.5 rounded font-black text-[10px]">Pai/Responsável</span>}
                        {u.role === 't' && <span className="bg-[#fff8e1] text-[#b45309] px-2 py-0.5 rounded font-black text-[10px]">Motorista Escolar</span>}
                        {u.role === 'a' && <span className="bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded font-black text-[10px]">Admin DTP</span>}
                      </td>
                      <td className="p-3 text-[#5d6f80]">
                        {u.cpfCnpj || 'Não informado'}
                      </td>
                      <td className="p-3 text-[#5d6f80]">
                        {u.createdAt}
                      </td>
                      <td className="p-3">
                        {u.status === 'ativo' && (
                          <span className="text-[#1b8a52] font-black flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Ativo
                          </span>
                        )}
                        {u.status === 'suspenso' && (
                          <span className="text-[#c93c3c] font-black flex items-center gap-1">
                            <Ban className="w-3 h-3" /> Suspenso DTP
                          </span>
                        )}
                        {u.status === 'bloqueado_serasa' && (
                          <span className="text-[#b91c1c] font-black flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado / Serasa
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {u.role !== 'a' && (
                          <button
                            onClick={() => onToggleUserStatus(u.id)}
                            className={`px-2.5 py-1 rounded-lg font-black text-[11px] cursor-pointer ${
                              u.status === 'ativo'
                                ? 'bg-[#fef2f2] text-[#c93c3c] border border-[#fecaca] hover:bg-[#fee2e2]'
                                : 'bg-[#f0fdf4] text-[#1b8a52] border border-[#bbf7d0] hover:bg-[#dcfce7]'
                            }`}
                          >
                            {u.status === 'ativo' ? 'Bloquear Conta' : 'Desbloquear Conta'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. ABA DENÚNCIAS & MODERAÇÃO
          ======================================================== */}
      {activeTab === 'denuncias' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Section 1: Denúncias Reportadas */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
            <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#c93c3c]" />
              Denúncias Reportadas por Responsáveis ou Condutores ({reports.length})
            </h3>

            {reports.length === 0 ? (
              <p className="text-xs text-[#5d6f80]">Nenhuma denúncia pendente de apuração no momento.</p>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 bg-[#fef2f2] dark:bg-[#2b1616] rounded-xl border border-[#fecaca] dark:border-[#5c2424] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-[#c93c3c]">
                        Motivo: {r.reason} · Alvo: {r.transporterName}
                      </div>
                      <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                        {r.details}
                      </p>
                      <span className="text-[10px] text-[#93a5b5]">
                        Aberta por {r.reporterName} ({r.reporterEmail}) em {r.createdAt}
                      </span>
                    </div>

                    <span className="text-[10px] font-black bg-[#c93c3c] text-white px-2 py-0.5 rounded">
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Moderação Prévia de Avaliações */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#ffc400]" />
                  Moderação Prévia de Avaliações (Filtro Obrigatório DTP)
                </h3>
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                  Todas as avaliações de pais para motoristas e de motoristas para pais passam pelo crivo do admin antes de serem públicas.
                </p>
              </div>

              <span className="text-xs font-black text-[#c93c3c]">
                {totalPendingReviews} pendentes
              </span>
            </div>

            {totalPendingReviews === 0 ? (
              <p className="text-xs text-[#1b8a52] font-bold">✓ Não há avaliações aguardando moderação.</p>
            ) : (
              <div className="space-y-2.5">
                {/* Avaliações de pais para motoristas */}
                {pendingVanReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5">
                        <span className="text-[#ffc400]">★ {rev.rating}/5</span>
                        <span>{rev.parentName} avaliou {rev.transporterId}</span>
                      </div>
                      <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] italic mt-0.5">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onApproveReview(rev.id)}
                        className="bg-[#1b8a52] hover:bg-[#167043] text-white px-2.5 py-1 rounded-lg font-black text-xs cursor-pointer"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => onRejectReview(rev.id)}
                        className="bg-[#c93c3c] hover:bg-[#a63030] text-white px-2.5 py-1 rounded-lg font-black text-xs cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                ))}

                {/* Avaliações de motoristas para responsáveis */}
                {pendingParentReviews.map((prev) => (
                  <div key={prev.id} className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5">
                        <span className="text-[#0f7f8c] font-black">[Motorista → Pai]</span>
                        <span>{prev.transporterName} avaliou a família de {prev.parentName}</span>
                      </div>
                      <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] italic mt-0.5">
                        "{prev.comment}" (Pontualidade: {prev.punctualityRating}★ · Pagamento: {prev.paymentRating}★)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onApproveParentReview(prev.id)}
                        className="bg-[#1b8a52] hover:bg-[#167043] text-white px-2.5 py-1 rounded-lg font-black text-xs cursor-pointer"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => onRejectParentReview(prev.id)}
                        className="bg-[#c93c3c] hover:bg-[#a63030] text-white px-2.5 py-1 rounded-lg font-black text-xs cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          5. ABA CONTROLE DE CONTRATOS & SOLICITAÇÕES DE VAGAS
          ======================================================== */}
      {activeTab === 'controle' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Sub-section: Moderação de Solicitações Públicas de Vagas */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#ffc400]" />
                  Aprovação de Solicitações de Vagas dos Responsáveis ({opportunities.length})
                </h3>
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                  Publicações enviadas por pais: o DTP analisa antes de abrir oportunidade aos motoristas.
                </p>
              </div>

              <span className="text-xs font-black text-[#ffc400]">
                {pendingOppsCount} aguardando análise
              </span>
            </div>

            {opportunities.length === 0 ? (
              <p className="text-xs text-[#5d6f80]">Nenhuma solicitação no momento.</p>
            ) : (
              <div className="space-y-2.5">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-3.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#10263b] dark:text-white">{opp.childName}</span>
                        <span className="text-[10px] bg-[#e2e8f0] dark:bg-[#26384a] px-1.5 py-0.5 rounded font-bold">
                          {opp.desiredSchedule}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          opp.status === 'aprovada' || opp.status === 'aberta'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : opp.status === 'reprovada'
                            ? 'bg-[#fee2e2] text-[#b91c1c]'
                            : 'bg-[#fef9c3] text-[#854d0e]'
                        }`}>
                          {opp.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-1">
                        Escola: <b>{opp.school}</b> · Bairro: {opp.neighborhood} ({opp.region}) · Série: {opp.grade || 'Fundamental'}
                      </p>
                      <p className="text-[11px] text-[#5d6f80]">
                        Solicitante: {opp.parentName} ({opp.parentPhone}) · Obs: {opp.notes || 'Sem observações'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opp.status !== 'aprovada' && opp.status !== 'aberta' && (
                        <button
                          onClick={() => onApproveOpportunity && onApproveOpportunity(opp.id)}
                          className="bg-[#1b8a52] hover:bg-[#167043] text-white px-3 py-1.5 rounded-lg font-black text-xs cursor-pointer"
                        >
                          Aprovar para Frotistas
                        </button>
                      )}
                      {opp.status !== 'reprovada' && (
                        <button
                          onClick={() => setRejectOppId(opp.id)}
                          className="bg-[#c93c3c] hover:bg-[#a63030] text-white px-3 py-1.5 rounded-lg font-black text-xs cursor-pointer"
                        >
                          Devolver para Correção
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-section: Gestão Completa de Todos os Contratos Digitais */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0f7f8c]" />
                  Repositório Geral de Contratos da Plataforma ({contracts.length})
                </h3>
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                  Acesso aos termos jurídicos, assinaturas eletrônicas com CPF/IP e histórico
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#5d6f80] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filtrar por aluno, pai ou van..."
                  value={contractSearchQuery}
                  onChange={(e) => setContractSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredContracts.map((c) => (
                <div key={c.id} className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#10263b] dark:text-white">{c.childName}</span>
                      <span className="text-[10px] bg-[#e2e8f0] dark:bg-[#26384a] px-1.5 py-0.5 rounded font-bold">
                        R$ {c.agreedMonthlyValue.toFixed(2)}/mês
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        c.status === 'assinado_ativo'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : c.status === 'cancelado'
                          ? 'bg-[#fee2e2] text-[#b91c1c]'
                          : 'bg-[#fef9c3] text-[#854d0e]'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                      Condutor: <b>{c.transporterName}</b> · Contratante: <b>{c.parentName}</b> ({c.parentCpf || 'CPF registrado'})
                    </p>
                    <p className="text-[10px] text-[#5d6f80]">
                      Escola: {c.schoolName} · Período: {c.period} · Vencimento: Dia {c.paymentDueDay || 10}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedContract(c)}
                      className="bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:brightness-110"
                    >
                      <Eye className="w-3.5 h-3.5" /> Visualizar Termos Completos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Visualização de Contrato Completo */}
          {selectedContract && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#16232f] rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-[#26384a] pb-2">
                  <h3 className="font-black text-base text-[#10263b] dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#ffc400]" />
                    Contrato Digital de Transporte Escolar #{selectedContract.id}
                  </h3>
                  <button
                    onClick={() => setSelectedContract(null)}
                    className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-base cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] space-y-1">
                  <div><strong>Contratado (Motorista):</strong> {selectedContract.transporterName} ({selectedContract.transporterEmail})</div>
                  <div><strong>Contratante (Responsável):</strong> {selectedContract.parentName} ({selectedContract.parentEmail}) - CPF: {selectedContract.parentCpf || '349.201.884-12'}</div>
                  <div><strong>Aluno Beneficiário:</strong> {selectedContract.childName} - {selectedContract.schoolName}</div>
                  <div><strong>Valor Mensal:</strong> R$ {selectedContract.agreedMonthlyValue.toFixed(2)} com vencimento no dia {selectedContract.paymentDueDay || 10}</div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase">
                    Cláusulas Pactuadas (Modelo SmartVan & DTP):
                  </h4>
                  <div className="space-y-1.5 p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-[11px] leading-relaxed max-h-60 overflow-y-auto">
                    {selectedContract.clauses?.map((cl, i) => (
                      <p key={i} className="text-[#334155] dark:text-[#cbd5e1]">{cl}</p>
                    ))}
                  </div>
                </div>

                {selectedContract.parentSignature && (
                  <div className="p-3 bg-[#f0fdf4] dark:bg-[#142d1f] rounded-xl border border-[#bbf7d0] dark:border-[#1e5436] space-y-0.5">
                    <div className="font-black text-[#15803d]">✓ Assinado Digitalmente pelo Responsável</div>
                    <div className="text-[11px] text-[#166534]">
                      Nome: <b>{selectedContract.parentSignature.signedName}</b> | CPF: {selectedContract.parentSignature.parentCpf}
                    </div>
                    <div className="text-[10px] text-[#4ade80]">
                      Data/Hora: {selectedContract.parentSignature.signedAt} | IP: {selectedContract.parentSignature.ipAddress || '189.102.45.19'}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0] dark:border-[#26384a]">
                  <button
                    onClick={() => { window.print(); }}
                    className="px-3.5 py-2 bg-[#ffc400] text-[#10263b] font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar / Imprimir Cópia DTP
                  </button>
                  <button
                    onClick={() => setSelectedContract(null)}
                    className="px-3.5 py-2 bg-[#e2e8f0] dark:bg-[#26384a] text-[#5d6f80] dark:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Justificativa de Reprovação de Solicitação de Vaga */}
          {rejectOppId && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleConfirmOppReject} className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-md w-full space-y-3 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs">
                <h3 className="font-black text-sm text-[#c93c3c] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Devolver Solicitação para Correção
                </h3>
                <p className="text-[#5d6f80] dark:text-[#93a5b5]">
                  Informe ao responsável o motivo da recusa para que ele possa corrigir o endereço, horário ou dados da criança:
                </p>

                <textarea
                  required
                  rows={4}
                  placeholder="Ex: Endereço de embarque fora do perímetro escolar informado ou série/horário não condizente com a escola selecionada."
                  value={oppRejectReason}
                  onChange={(e) => setOppRejectReason(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setRejectOppId(null); setOppRejectReason(''); }}
                    className="px-3 py-2 bg-[#e2e8f0] dark:bg-[#26384a] text-[#5d6f80] dark:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#c93c3c] text-white rounded-xl font-black cursor-pointer hover:brightness-110"
                  >
                    Confirmar e Notificar Responsável
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          6. ABA PARCEIROS & MOTORISTAS FREELANCERS
          ======================================================== */}
      {activeTab === 'parceiros' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Section: Motoristas Freelancers */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ffc400]" />
                  Motoristas Freelancers Credenciados para Cobertura de Rotas
                </h3>
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                  Motoristas habilitados pelo DTP para substituição temporária de frotistas em caso de doença ou férias.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {freelanceDrivers.map((fl) => (
                <div key={fl.id} className="p-3.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] space-y-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={fl.photoUrl} alt={fl.name} className="w-10 h-10 rounded-full object-cover border border-[#ffc400]" />
                    <div>
                      <div className="font-black text-sm text-[#10263b] dark:text-white">{fl.name}</div>
                      <div className="text-[11px] text-[#ffc400] font-bold">"{fl.nickname}"</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] space-y-0.5">
                    <div>Registro: <b>{fl.dtpRegistration}</b></div>
                    <div>Região: <b>{fl.region}</b> · Exp: {fl.experienceYears} anos</div>
                    <div>Diária: <b>R$ {fl.dailyRate.toFixed(2)}</b></div>
                  </div>
                  <a
                    href={`https://wa.me/${fl.whatsapp}?text=${encodeURIComponent(`Olá ${fl.nickname}, vi seu contato no Painel DTP da Van Escolar SP!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#25D366] text-white font-black rounded-xl text-center flex items-center justify-center gap-1 text-[11px] hover:brightness-105"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chamar no WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Parceiros de Serviços & Promoções */}
          <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-[#0f7f8c]" />
                  Empresas Parceiras Credenciadas ({servicePartners.length})
                </h3>
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                  Oficinas mecânicas, funileiros, autopeças, tapeçarias e locadoras parceiras.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsPartnerModalOpen(true)}
                  className="bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Novo Parceiro
                </button>
                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  className="bg-[#ffc400] text-[#10263b] text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" /> + Nova Promoção
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {servicePartners.map((p) => (
                <div key={p.id} className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-black text-sm text-[#10263b] dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-[#0f7f8c] font-bold uppercase">{p.category} · {p.region}</div>
                    <div className="text-[11px] text-[#5d6f80]">{p.specialty}</div>
                    <div className="text-[10px] text-[#ffc400] font-bold mt-0.5">{p.discountDeal || 'Condições especiais'}</div>
                  </div>

                  <button
                    onClick={() => onDeletePartner(p.id)}
                    className="text-[#c93c3c] hover:bg-red-50 p-2 rounded-lg cursor-pointer"
                    title="Excluir parceiro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Adicionar Parceiro */}
          {isPartnerModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleSavePartner} className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-md w-full space-y-3 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs">
                <h3 className="font-black text-sm text-[#10263b] dark:text-white">Cadastrar Nova Empresa Parceira</h3>
                <div>
                  <label className="block font-bold mb-1">Nome do Estabelecimento *</label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">Categoria</label>
                    <select
                      value={partnerCategory}
                      onChange={(e) => setPartnerCategory(e.target.value as any)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    >
                      <option value="mecanicos">Mecânico Diesel</option>
                      <option value="funileiro">Funilaria & Pintura</option>
                      <option value="tapeceiros">Tapeçaria</option>
                      <option value="auto_pecas">Auto Peças</option>
                      <option value="vans_locacao">Locação de Vans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Região</label>
                    <select
                      value={partnerRegion}
                      onChange={(e) => setPartnerRegion(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    >
                      <option>Zona Sul</option>
                      <option>Zona Norte</option>
                      <option>Zona Leste</option>
                      <option>Zona Oeste</option>
                      <option>Centro</option>
                      <option>Osasco / Grande SP</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Benefício ou Desconto para Frotistas</label>
                  <input
                    type="text"
                    placeholder="Ex: 15% de desconto em peças e mão de obra"
                    value={partnerDeal}
                    onChange={(e) => setPartnerDeal(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPartnerModalOpen(false)}
                    className="px-3 py-2 bg-[#e2e8f0] dark:bg-[#26384a] rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#1b8a52] text-white rounded-xl font-black cursor-pointer"
                  >
                    Salvar Parceiro
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Nova Promoção */}
          {isPromoModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleSavePromo} className="bg-white dark:bg-[#16232f] rounded-2xl p-5 max-w-md w-full space-y-3 border border-[#d6dee6] dark:border-[#26384a] shadow-xl text-xs">
                <h3 className="font-black text-sm text-[#10263b] dark:text-white">Criar Promoção para Assinantes Pro/Premium</h3>
                <div>
                  <label className="block font-bold mb-1">Título da Oferta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Troca de pastilhas com 25% de desconto"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Nome da Loja Parceira *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Distribuidora Van Peças SP"
                    value={promoPartnerName}
                    onChange={(e) => setPromoPartnerName(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">Selo de Desconto</label>
                    <input
                      type="text"
                      value={promoBadge}
                      onChange={(e) => setPromoBadge(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Código do Cupom</label>
                    <input
                      type="text"
                      value={promoCoupon}
                      onChange={(e) => setPromoCoupon(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Regras e Descrição</label>
                  <textarea
                    rows={3}
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    placeholder="Válido mediante apresentação da credencial de assinante Pro/Premium da Van Escolar SP."
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPromoModalOpen(false)}
                    className="px-3 py-2 bg-[#e2e8f0] dark:bg-[#26384a] rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#ffc400] text-[#10263b] rounded-xl font-black cursor-pointer"
                  >
                    Publicar Promoção
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          7. ABA PRD & TESTES QA (SUÍTE AUTOMATIZADA)
          ======================================================== */}
      {activeTab === 'prd_qa' && (
        <PRDTestingView />
      )}
    </div>
  );
};
