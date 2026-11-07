import React, { useState } from 'react';
import { Child, User, SubscriptionTier, ParentReviewByTransporter } from '../../types';
import { SCHOOLS } from '../../constants';
import { ParentProfileModal } from '../../components/ParentProfileModal';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  UserCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  School,
  HeartPulse,
  Lock,
  Star,
  Award,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileSignature,
  FileText,
  DollarSign,
  Download,
  Printer,
  X,
  User as UserIcon
} from 'lucide-react';

interface StudentsManagementViewProps {
  kids: Child[];
  currentUser?: User;
  subscriptionTier?: SubscriptionTier;
  parentReviews?: ParentReviewByTransporter[];
  onAddChild: (child: Child) => void;
  onDeleteChild: (index: number) => void;
  onUpdateChildAttendance?: (index: number, field: 'checkedInMorning' | 'checkedInSchool' | 'checkedInAfternoon' | 'checkedInDelivered') => void;
  onTogglePresence: (index: number, isPresent: boolean) => void;
  onRateParent?: (review: Omit<ParentReviewByTransporter, 'id' | 'createdAt' | 'status'>) => void;
  onUpgradeClick?: () => void;
  onOpenChatWithParent?: (parentEmail: string, parentName: string) => void;
}

export const StudentsManagementView: React.FC<StudentsManagementViewProps> = ({
  kids,
  currentUser,
  subscriptionTier = 'free',
  parentReviews = [],
  onAddChild,
  onDeleteChild,
  onTogglePresence,
  onRateParent,
  onUpgradeClick,
  onOpenChatWithParent
}) => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [ratingModalChild, setRatingModalChild] = useState<Child | null>(null);
  const [selectedStudentContract, setSelectedStudentContract] = useState<Child | null>(null);
  const [selectedStudentPayment, setSelectedStudentPayment] = useState<Child | null>(null);
  const [selectedParentProfileModal, setSelectedParentProfileModal] = useState<Child | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [school, setSchool] = useState<string>(SCHOOLS[0]);
  const [address, setAddress] = useState<string>('');
  const [guardian, setGuardian] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');
  const [authorizedPerson, setAuthorizedPerson] = useState<string>('');

  // Parent review form states
  const [punctualityScore, setPunctualityScore] = useState<number>(5);
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [paymentScore, setPaymentScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');

  // Subscription tier limit rules:
  // - Free: max 5 kids
  // - Pro (24.99): max 40 kids
  // - Premium (44.99): unlimited
  const isFreePlan = subscriptionTier === 'free';
  const isProPlan = subscriptionTier === 'pro';
  const limitReached =
    (isFreePlan && kids.length >= 5) ||
    (isProPlan && kids.length >= 40);

  const presentCount = kids.filter(k => k.isPresentToday !== false).length;
  const absentCount = kids.filter(k => k.isPresentToday === false).length;

  const handleOpenAdd = () => {
    if (isFreePlan && kids.length >= 5) {
      alert('Limite do Plano Gratuito atingido: máximo de 5 crianças. Faça upgrade para o Plano Profissional (até 40 crianças por R$ 24,99/mês) ou Plano Premium (ilimitado por R$ 44,99/mês)!');
      if (onUpgradeClick) onUpgradeClick();
      return;
    }
    if (isProPlan && kids.length >= 40) {
      alert('Limite do Plano Profissional atingido: máximo de 40 crianças. Faça upgrade para o Plano Premium (crianças ilimitadas por R$ 44,99/mês)!');
      if (onUpgradeClick) onUpgradeClick();
      return;
    }
    setIsAddOpen(true);
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreePlan && kids.length >= 5) {
      alert('Limite do Plano Gratuito atingido (máximo de 5 crianças). Assine o Plano Profissional ou Premium para desbloquear!');
      return;
    }
    if (isProPlan && kids.length >= 40) {
      alert('Limite do Plano Profissional atingido (máximo de 40 crianças). Assine o Plano Premium para desbloquear!');
      return;
    }
    if (!name.trim() || !address.trim()) {
      alert('Preencha ao menos o nome da criança e o endereço de embarque.');
      return;
    }

    const newChild: Child = {
      id: 'k_' + Date.now().toString(36),
      n: name.trim(),
      i: Number(age) || 7,
      e: school,
      d: address.trim(),
      r: guardian.trim() || 'Responsável',
      t: phone.trim() || '—',
      o: notes.trim(),
      pg: 0,
      paymentStatus: 'pendente',
      isPresentToday: true,
      authorizedReceivers: [
        {
          name: guardian.trim() || 'Responsável',
          relation: 'Responsável Legal',
          document: 'Identidade Cadastrada',
          phone: phone.trim() || '—',
          isPrimary: true
        },
        ...(authorizedPerson.trim() ? [{
          name: authorizedPerson.trim(),
          relation: 'Autorizado',
          document: 'Apresentar documento',
          phone: emergencyPhone || phone
        }] : [])
      ],
      checkedInMorning: false,
      checkedInSchool: false,
      checkedInAfternoon: false,
      checkedInDelivered: false
    };

    onAddChild(newChild);
    setName('');
    setAge('');
    setAddress('');
    setGuardian('');
    setPhone('');
    setNotes('');
    setEmergencyPhone('');
    setAuthorizedPerson('');
    setIsAddOpen(false);
  };

  const handleSubmitParentReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalChild || !onRateParent) return;

    const overallRating = Math.round((punctualityScore + communicationScore + paymentScore) / 3);

    onRateParent({
      parentEmail: ratingModalChild.guardianEmail || `${ratingModalChild.r.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      parentName: ratingModalChild.r,
      transporterEmail: currentUser?.email || 'transportador@vanescolar.sp',
      transporterName: currentUser?.n || 'Transportador Oficial',
      rating: overallRating,
      punctualityRating: punctualityScore,
      communicationRating: communicationScore,
      paymentRating: paymentScore,
      punctualityScore,
      communicationScore,
      paymentScore,
      comment: reviewComment.trim() || 'Responsável pontual e comprometido com os horários da van.'
    });

    setReviewSuccessMsg('Avaliação enviada com sucesso! Ela passará pela moderação do Administrador DTP antes de ser visível para outros transportadores.');
    setTimeout(() => {
      setReviewSuccessMsg('');
      setRatingModalChild(null);
      setReviewComment('');
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#ffc400]" />
            Alunos Matriculados & Frequência ({kids.length}{isFreePlan ? '/5 no Plano Grátis' : ''})
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Lista completa de alunos matriculados, resumos de presença, mensalidades e contatos de emergência
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className={`text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition ${
            limitReached
              ? 'bg-[#eef2f5] dark:bg-[#26384a] text-[#5d6f80] cursor-not-allowed'
              : 'bg-[#ffc400] text-[#10263b] hover:brightness-105'
          }`}
        >
          {limitReached ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          Adicionar Aluno
        </button>
      </div>

      {/* Free Tier Warning Banner if at limit */}
      {limitReached && (
        <div className="p-3.5 bg-gradient-to-r from-[#10263b] to-[#1a3854] text-white rounded-2xl border border-[#ffc400]/40 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffc400] text-[#10263b] rounded-xl font-black shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[#ffc400]">
                Limite de Alunos Atingido ({kids.length}/{isFreePlan ? 5 : 40} Alunos)
              </div>
              <div className="text-[11px] text-[#d6dee6]">
                Faça upgrade do seu plano para liberar mais vagas para sua van escolar.
              </div>
            </div>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="bg-[#ffc400] text-[#10263b] text-xs font-black px-3 py-1.5 rounded-xl hover:brightness-105 shrink-0"
            >
              Fazer Upgrade
            </button>
          )}
        </div>
      )}

      {/* Attendance Summary Bar */}
      <div className="bg-white dark:bg-[#16232f] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between text-xs font-bold shadow-xs">
        <span className="text-[#5d6f80] dark:text-[#93a5b5] flex items-center gap-1.5">
          <School className="w-4 h-4 text-[#0f7f8c]" />
          Registro de Presença de Hoje:
        </span>
        <div className="flex gap-2 text-[11px]">
          <span className="bg-[#1b8a52]/10 text-[#1b8a52] px-2.5 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {presentCount} Presentes
          </span>
          <span className="bg-[#c93c3c]/10 text-[#c93c3c] px-2.5 py-1 rounded-lg flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {absentCount} Faltas
          </span>
        </div>
      </div>

      {/* Students Cards */}
      <div className="space-y-3">
        {kids.map((c, idx) => {
          const isExpanded = expandedChildId === (c.id || String(idx));
          const isPresent = c.isPresentToday !== false;

          // Find verified ratings given to this parent by transporters
          const reviewsForParent = parentReviews.filter(
            r => (c.guardianEmail && r.parentEmail === c.guardianEmail) || r.parentName.toLowerCase() === c.r.toLowerCase()
          );
          const approvedReviews = reviewsForParent.filter(r => r.status === 'aprovado');
          const avgParentScore = approvedReviews.length > 0
            ? (approvedReviews.reduce((acc, r) => acc + (r.rating ?? (( (r.punctualityRating || 5) + (r.paymentRating || 5) + (r.communicationRating || 5) ) / 3)), 0) / approvedReviews.length).toFixed(1)
            : null;

          return (
            <div
              key={c.id || idx}
              className={`bg-white dark:bg-[#16232f] rounded-2xl border shadow-xs p-4 space-y-3 transition ${
                !isPresent ? 'border-[#c93c3c]/40 bg-[#fff5f5] dark:bg-[#1a1215]' : 'border-[#d6dee6] dark:border-[#26384a]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                      {c.n}
                    </h3>
                    <span className="text-xs font-bold text-[#5d6f80] bg-[#eef2f5] dark:bg-[#0e1822] px-1.5 py-0.2 rounded">
                      {c.i} anos
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                      c.pg === 1
                        ? 'bg-[#1b8a52]/10 text-[#1b8a52]'
                        : c.pg === 2
                        ? 'bg-[#0f7f8c]/15 text-[#0f7f8c]'
                        : 'bg-[#c93c3c]/10 text-[#c93c3c]'
                    }`}>
                      {c.pg === 1 ? 'Mensalidade Paga' : c.pg === 2 ? 'Mensalidade Abonada' : 'Pendente'}
                    </span>
                  </div>
                  <div className="text-xs text-[#5d6f80] dark:text-[#93a5b5] flex items-center gap-1 mt-0.5">
                    <School className="w-3.5 h-3.5 text-[#0f7f8c]" /> {c.e}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRatingModalChild(c)}
                    className="p-1.5 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] rounded-lg hover:bg-[#ffc400]/30 transition text-xs font-black flex items-center gap-1"
                    title="Avaliar responsável (visível para outros transportadores)"
                  >
                    <Star className="w-3.5 h-3.5 fill-[#ffc400]" />
                    <span className="hidden sm:inline">Avaliar Pai</span>
                  </button>

                  <a
                    href={`tel:${c.t.replace(/\D/g, '')}`}
                    className="p-1.5 bg-[#1b8a52]/10 text-[#1b8a52] rounded-lg hover:bg-[#1b8a52]/20 transition"
                    title="Ligar para o responsável"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onDeleteChild(idx)}
                    className="p-1.5 text-[#5d6f80] hover:text-[#c93c3c] transition rounded-lg"
                    title="Remover aluno"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="text-xs text-[#5d6f80] dark:text-[#93a5b5] flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ffc400] shrink-0 mt-0.5" />
                <span>{c.d}</span>
              </div>

              {/* Responsible Info & Rating Badge for Transporters -> Clickable to open ParentProfileModal */}
              <div
                onClick={() => setSelectedParentProfileModal(c)}
                className="bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-[#ffc400] hover:bg-[#ffc400]/5 transition border border-transparent"
                title="Clique para ver o perfil completo e avaliação do responsável"
              >
                <div>
                  <span className="text-[#5d6f80]">Responsável: </span>
                  <b className="text-[#10263b] dark:text-white underline decoration-dotted">{c.r}</b>
                  {c.allowUnaccompaniedDropoff && (
                    <span className="ml-2 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] text-[9px] font-black px-1.5 py-0.5 rounded">
                      Autorizado Desembarque Só
                    </span>
                  )}
                </div>

                {avgParentScore ? (
                  <div className="flex items-center gap-1 bg-white dark:bg-[#16232f] px-2 py-0.5 rounded-md border border-[#d6dee6] dark:border-[#26384a]">
                    <Star className="w-3 h-3 fill-[#ffc400] text-[#ffc400]" />
                    <span className="font-black text-[11px] text-[#10263b] dark:text-white">{avgParentScore}</span>
                    <span className="text-[10px] text-[#5d6f80]">({approvedReviews.length} avaliações)</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#0f7f8c] font-bold">Ver perfil do pai</span>
                )}
              </div>

              {/* Medical observations if any */}
              {c.o && (
                <div className="p-2 bg-[#ffc400]/10 border border-[#ffc400]/30 rounded-xl text-xs text-[#10263b] dark:text-[#ffc400] flex items-start gap-1.5 font-bold">
                  <HeartPulse className="w-3.5 h-3.5 text-[#c93c3c] shrink-0 mt-0.5" />
                  <span>Atenção: {c.o}</span>
                </div>
              )}

              {/* ACESSO AO CONTRATO E REGISTROS DE PAGAMENTO DO ALUNO */}
              <div className="p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#10263b] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#ffc400]" /> Contrato & Mensalidades do Aluno:
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    c.pg === 1
                      ? 'bg-[#1b8a52]/15 text-[#1b8a52]'
                      : c.pg === 2
                      ? 'bg-[#0f7f8c]/15 text-[#0f7f8c]'
                      : 'bg-[#c93c3c]/15 text-[#c93c3c]'
                  }`}>
                    {c.pg === 1 ? 'Mensalidade Paga' : c.pg === 2 ? 'Mensalidade Abonada' : 'Pendente'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentContract(c)}
                    className="p-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs bg-white dark:bg-[#16232f] text-[#10263b] dark:text-white border border-[#d6dee6] dark:border-[#26384a] hover:border-[#ffc400] hover:bg-[#ffc400]/5"
                  >
                    <FileSignature className="w-4 h-4 text-[#ffc400]" />
                    <span>Ver Contrato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentPayment(c)}
                    className="p-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs bg-white dark:bg-[#16232f] text-[#10263b] dark:text-white border border-[#d6dee6] dark:border-[#26384a] hover:border-[#1b8a52] hover:bg-[#1b8a52]/5"
                  >
                    <DollarSign className="w-4 h-4 text-[#1b8a52]" />
                    <span>Pagamentos</span>
                  </button>
                </div>
              </div>

              {/* Toggle details (Authorized Receivers & Emergency) */}
              <div>
                <button
                  onClick={() => setExpandedChildId(isExpanded ? null : (c.id || String(idx)))}
                  className="text-xs font-bold text-[#0f7f8c] dark:text-[#4cc3d1] flex items-center gap-1 hover:underline"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isExpanded ? 'Recolher detalhes' : 'Ver pessoas autorizadas a receber e contatos de emergência'}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-xs space-y-3 border border-[#d6dee6] dark:border-[#26384a]">
                    {/* 1. Emergency Contacts Section */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-[#1b8a52]" />
                        Contatos de Emergência do Aluno:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div className="bg-white dark:bg-[#16232f] p-2 rounded-lg text-[11px] flex justify-between items-center border border-[#d6dee6] dark:border-[#26384a]">
                          <div>
                            <span className="text-[#5d6f80] block text-[10px]">Responsável Principal:</span>
                            <b>{c.r}</b>
                          </div>
                          <a href={`tel:${c.t.replace(/\D/g, '')}`} className="text-[#1b8a52] font-black text-xs">
                            {c.t}
                          </a>
                        </div>
                        <div className="bg-white dark:bg-[#16232f] p-2 rounded-lg text-[11px] flex justify-between items-center border border-[#d6dee6] dark:border-[#26384a]">
                          <div>
                            <span className="text-[#5d6f80] block text-[10px]">Contato Emergência 24h:</span>
                            <b>Central SP / Parente</b>
                          </div>
                          <a href={`tel:${(c.emergencyPhone || c.t || '(11) 98888-7777').replace(/\D/g, '')}`} className="text-[#0f7f8c] font-black text-xs">
                            {c.emergencyPhone || c.t || '(11) 98888-7777'}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* 2. Transport Notes & Medical Info */}
                    <div className="space-y-1">
                      <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5 text-xs">
                        <HeartPulse className="w-3.5 h-3.5 text-[#c93c3c]" />
                        Observações de Saúde & Transporte Escolar:
                      </div>
                      <div className="bg-white dark:bg-[#16232f] p-2.5 rounded-lg text-[11px] text-[#10263b] dark:text-white border border-[#d6dee6] dark:border-[#26384a]">
                        {c.o || 'Nenhuma restrição médica ou alergia informada pelos pais. Utilizar cinto de segurança padrão.'}
                      </div>
                    </div>

                    {/* 3. Authorized Pickups */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5 text-xs">
                        <UserCheck className="w-3.5 h-3.5 text-[#ffc400]" />
                        Pessoas Autorizadas a Retirar no Portão / Escola:
                      </div>
                      {c.authorizedReceivers && c.authorizedReceivers.length > 0 ? (
                        c.authorizedReceivers.map((rec, rIdx) => (
                          <div key={rIdx} className="bg-white dark:bg-[#16232f] p-2 rounded-lg text-[11px] flex justify-between border border-[#d6dee6] dark:border-[#26384a]">
                            <div>
                              <b>{rec.name}</b> ({rec.relation})
                              <div className="text-[#5d6f80]">Documento: {rec.document}</div>
                            </div>
                            <a href={`tel:${rec.phone.replace(/\D/g, '')}`} className="text-[#0f7f8c] font-bold">
                              {rec.phone}
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-[#5d6f80]">Apenas os pais cadastrados ({c.r}).</div>
                      )}

                      {c.allowUnaccompaniedDropoff && (
                        <div className="p-2 bg-[#ffc400]/15 border border-[#ffc400]/40 rounded-lg text-[11px] text-[#10263b] dark:text-[#ffc400] font-bold">
                          ⚠️ Autorização especial: O responsável autorizou o desembarque da criança desacompanhada. {c.unaccompaniedNotes ? `Obs: ${c.unaccompaniedNotes}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Child */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base">Cadastrar Novo Aluno na Van</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#5d6f80] font-black text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChild} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold mb-1">Nome Completo da Criança</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gabriel Martins"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Idade</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 8"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Escola / Colégio</label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400] font-bold"
                >
                  {SCHOOLS.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Endereço de Embarque (Rua, Número, Bairro)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua Gaivota, 230 - Moema"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Nome do Responsável</label>
                  <input
                    type="text"
                    value={guardian}
                    onChange={(e) => setGuardian(e.target.value)}
                    placeholder="Ex: Cristiane Martins"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Observações / Alergias / Recomendações Médicas</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Alergia a picada de insetos, usa bombinha de asma"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Pessoa Adicional Autorizada a Receber (Nome e Doc)</label>
                <input
                  type="text"
                  value={authorizedPerson}
                  onChange={(e) => setAuthorizedPerson(e.target.value)}
                  placeholder="Ex: Vó Neuza (RG 22.333.444-5)"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105"
                >
                  Salvar Cadastro do Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSPORTER EVALUATION OF PARENT */}
      {ratingModalChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <div>
                <h3 className="font-black text-base flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#ffc400] fill-[#ffc400]" />
                  Avaliar Responsável
                </h3>
                <p className="text-[11px] text-[#5d6f80]">
                  {ratingModalChild.r} (Aluno: {ratingModalChild.n})
                </p>
              </div>
              <button onClick={() => setRatingModalChild(null)} className="text-[#5d6f80] font-black text-lg">
                ✕
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="p-4 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-xl text-xs font-bold leading-relaxed">
                ✓ {reviewSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitParentReview} className="space-y-3 text-xs">
                <div className="p-2.5 bg-[#0f7f8c]/10 rounded-xl text-[11px] text-[#0f7f8c] font-bold">
                  ℹ️ Esta avaliação ajuda outros transportadores de SP a conhecer a pontualidade e o relacionamento com a família. Ela passa por moderação prévia da DTP antes de ser publicada.
                </div>

                {/* Score 1: Pontualidade */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold">Pontualidade no Embarque/Desembarque:</label>
                    <span className="font-black text-[#ffc400]">{punctualityScore} estrelas</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPunctualityScore(star)}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                          punctualityScore >= star
                            ? 'bg-[#ffc400] text-[#10263b] border-[#ffc400]'
                            : 'bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] border-[#d6dee6] dark:border-[#26384a]'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score 2: Comunicação */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold">Comunicação e Respeito com a Equipe:</label>
                    <span className="font-black text-[#ffc400]">{communicationScore} estrelas</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommunicationScore(star)}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                          communicationScore >= star
                            ? 'bg-[#ffc400] text-[#10263b] border-[#ffc400]'
                            : 'bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] border-[#d6dee6] dark:border-[#26384a]'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score 3: Pontualidade no Pagamento */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold">Pontualidade das Mensalidades:</label>
                    <span className="font-black text-[#ffc400]">{paymentScore} estrelas</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPaymentScore(star)}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                          paymentScore >= star
                            ? 'bg-[#ffc400] text-[#10263b] border-[#ffc400]'
                            : 'bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] border-[#d6dee6] dark:border-[#26384a]'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentário */}
                <div>
                  <label className="block font-bold mb-1">Depoimento sobre a Família / Responsável:</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Ex: Família muito cordial, sempre pontual no ponto de embarque e avisa com antecedência quando o filho não vai à escola."
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                  <button
                    type="button"
                    onClick={() => setRatingModalChild(null)}
                    className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105"
                  >
                    Enviar Avaliação DTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONTRATO DO ALUNO */}
      {selectedStudentContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#ffc400]" />
                <div>
                  <h3 className="font-black text-sm">Contrato Digital do Aluno</h3>
                  <p className="text-[11px] text-[#5d6f80]">16 cláusulas jurídicas padrão SmartVan / DTP SP</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentContract(null)}
                className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f8fafc] dark:bg-[#0e1822] p-4 rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-2.5">
              <div className="flex justify-between items-center border-b border-[#d6dee6]/60 dark:border-[#26384a]/60 pb-2">
                <span className="font-extrabold text-sm text-[#10263b] dark:text-white">
                  {selectedStudentContract.n} ({selectedStudentContract.i} anos)
                </span>
                <span className="bg-[#1b8a52]/15 text-[#1b8a52] font-black text-[10px] px-2 py-0.5 rounded-full">
                  Contrato Assinado Digitalmente ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><b>Escola:</b> {selectedStudentContract.e}</div>
                <div><b>Responsável:</b> {selectedStudentContract.r}</div>
                <div><b>Embarque:</b> {selectedStudentContract.d}</div>
                <div><b>Contato:</b> {selectedStudentContract.t}</div>
                <div><b>Mensalidade Acordada:</b> R$ {selectedStudentContract.valor || 420},00/mês</div>
                <div><b>Dia de Vencimento:</b> Dia {selectedStudentContract.pgAt || 10}</div>
              </div>

              <div className="p-2.5 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] text-[10px] text-[#5d6f80] dark:text-[#93a5b5] space-y-1">
                <div className="font-bold text-[#10263b] dark:text-white">Cláusula 5ª (Mora e Inadimplência):</div>
                <p>Após 7 dias de atraso incidirão juros legais de 2% ao mês. Após 30 dias de inadimplência o contrato poderá ser rescindido com inclusão nos cadastros protetivos (Serasa).</p>
              </div>

              <div className="p-2.5 bg-[#1b8a52]/10 border border-[#1b8a52]/30 rounded-lg text-[10px] text-[#1b8a52] space-y-1">
                <div className="font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Assinaturas Digitais Autenticadas:
                </div>
                <div>• Transportador: João Batista de Oliveira (CPF/CNPJ 18.490.231/0001-44)</div>
                <div>• Responsável: {selectedStudentContract.r} (Assinatura Eletrônica VESP-AUTH)</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#10263b] text-[#ffc400] font-black rounded-xl hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
              </button>
              <button
                onClick={() => setSelectedStudentContract(null)}
                className="py-2.5 px-4 bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAGAMENTOS DO ALUNO */}
      {selectedStudentPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1b8a52]" />
                <div>
                  <h3 className="font-black text-sm">Financeiro do Aluno</h3>
                  <p className="text-[11px] text-[#5d6f80]">{selectedStudentPayment.n} · Responsável: {selectedStudentPayment.r}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentPayment(null)}
                className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f8fafc] dark:bg-[#0e1822] p-4 rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#5d6f80] block">Mensalidade Atual:</span>
                  <span className="text-base font-black text-[#10263b] dark:text-white">
                    R$ {selectedStudentPayment.valor || 420},00
                  </span>
                </div>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    selectedStudentPayment.pg === 1
                      ? 'bg-[#1b8a52]/15 text-[#1b8a52]'
                      : selectedStudentPayment.pg === 2
                      ? 'bg-[#0f7f8c]/15 text-[#0f7f8c]'
                      : 'bg-[#c93c3c]/15 text-[#c93c3c]'
                  }`}
                >
                  {selectedStudentPayment.pg === 1 ? 'Paga ✓' : selectedStudentPayment.pg === 2 ? 'Abonada 🎁' : 'Pendente ⏳'}
                </span>
              </div>

              <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] space-y-1 border-t border-[#d6dee6]/60 dark:border-[#26384a]/60 pt-2">
                <div><b>Vencimento:</b> Dia {selectedStudentPayment.pgAt || 10} do mês</div>
                <div><b>Método Principal:</b> Pix / Boleto Bancário</div>
                <div><b>Repasse Automático:</b> 95,5% creditado via Webhook BACEN</div>
              </div>

              {/* Status Actions */}
              <div className="pt-1 space-y-1.5">
                <span className="block font-bold text-[10px] uppercase text-[#5d6f80]">Alterar Status da Mensalidade:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      selectedStudentPayment.pg = 1;
                      selectedStudentPayment.paymentStatus = 'pago';
                      alert(`Mensalidade de ${selectedStudentPayment.n} marcada como Paga!`);
                      setSelectedStudentPayment({ ...selectedStudentPayment });
                    }}
                    className="py-2 px-2 bg-green-50 text-[#1b8a52] font-black rounded-xl border border-green-200 text-center hover:bg-green-100 cursor-pointer text-[10px]"
                  >
                    ✓ Pago
                  </button>
                  <button
                    onClick={() => {
                      selectedStudentPayment.pg = 2;
                      selectedStudentPayment.paymentStatus = 'abonado';
                      alert(`Mensalidade de ${selectedStudentPayment.n} abonada com sucesso!`);
                      setSelectedStudentPayment({ ...selectedStudentPayment });
                    }}
                    className="py-2 px-2 bg-teal-50 text-[#0f7f8c] font-black rounded-xl border border-teal-200 text-center hover:bg-teal-100 cursor-pointer text-[10px]"
                  >
                    🎁 Abonar
                  </button>
                  <button
                    onClick={() => {
                      selectedStudentPayment.pg = 0;
                      selectedStudentPayment.paymentStatus = 'pendente';
                      alert(`Mensalidade de ${selectedStudentPayment.n} alterada para Pendente.`);
                      setSelectedStudentPayment({ ...selectedStudentPayment });
                    }}
                    className="py-2 px-2 bg-amber-50 text-[#c93c3c] font-black rounded-xl border border-amber-200 text-center hover:bg-amber-100 cursor-pointer text-[10px]"
                  >
                    ⏳ Pendente
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudentPayment(null)}
              className="w-full py-2.5 bg-[#10263b] text-[#ffc400] font-black rounded-xl hover:brightness-110"
            >
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* Parent Profile Modal */}
      {selectedParentProfileModal && (
        <ParentProfileModal
          parentName={selectedParentProfileModal.r}
          parentEmail={selectedParentProfileModal.guardianEmail || `${selectedParentProfileModal.r.toLowerCase().replace(/\s+/g, '.')}@gmail.com`}
          parentPhone={selectedParentProfileModal.t}
          childName={selectedParentProfileModal.n}
          schoolName={selectedParentProfileModal.e}
          address={selectedParentProfileModal.d}
          reviews={parentReviews}
          onClose={() => setSelectedParentProfileModal(null)}
          onOpenChat={(email, name) => {
            if (onOpenChatWithParent) onOpenChatWithParent(email, name);
            setSelectedParentProfileModal(null);
          }}
          onRateParent={() => {
            setRatingModalChild(selectedParentProfileModal);
            setSelectedParentProfileModal(null);
          }}
        />
      )}
    </div>
  );
};
