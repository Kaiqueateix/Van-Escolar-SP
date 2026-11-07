import React, { useState } from 'react';
import { NewStudentOpportunity, TransporterProfile, ParentReviewByTransporter } from '../../types';
import { REGIONS, SCHOOLS } from '../../constants';
import { ParentProfileModal } from '../../components/ParentProfileModal';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  SlidersHorizontal,
  Navigation,
  Sparkles,
  Phone,
  AlertCircle,
  Star,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface NewStudentOpportunitiesViewProps {
  opportunities: NewStudentOpportunity[];
  transporter: TransporterProfile;
  parentReviews?: ParentReviewByTransporter[];
  onExpressInterest: (opportunityId: string) => void;
  onOpenChatWithParent: (parentEmail: string, parentName: string) => void;
  onUpdateCoverage: (regions: number[], schools: number[]) => void;
}

export const NewStudentOpportunitiesView: React.FC<NewStudentOpportunitiesViewProps> = ({
  opportunities,
  transporter,
  parentReviews = [],
  onExpressInterest,
  onOpenChatWithParent,
  onUpdateCoverage
}) => {
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterSchedule, setFilterSchedule] = useState<string>('all');
  const [isConfigCoverageOpen, setIsConfigCoverageOpen] = useState<boolean>(false);

  // Parent profile modal state
  const [selectedParentModal, setSelectedParentModal] = useState<{
    parentName: string;
    parentEmail: string;
    parentPhone?: string;
    childName?: string;
    schoolName?: string;
    address?: string;
  } | null>(null);

  // Local instant expressed state to guarantee instantaneous UI reaction
  const [expressedOppIds, setExpressedOppIds] = useState<Set<string>>(new Set());

  // Coverage settings modal state
  const [tempRegions, setTempRegions] = useState<number[]>(transporter.regions);
  const [tempSchools, setTempSchools] = useState<number[]>(transporter.schools);

  const toggleRegion = (idx: number) => {
    if (tempRegions.includes(idx)) {
      setTempRegions(tempRegions.filter(x => x !== idx));
    } else {
      setTempRegions([...tempRegions, idx]);
    }
  };

  const toggleSchool = (idx: number) => {
    if (tempSchools.includes(idx)) {
      setTempSchools(tempSchools.filter(x => x !== idx));
    } else {
      setTempSchools([...tempSchools, idx]);
    }
  };

  const handleSaveCoverage = () => {
    onUpdateCoverage(tempRegions, tempSchools);
    setIsConfigCoverageOpen(false);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (opp.status === 'aguardando_analise' || opp.status === 'reprovada') return false;
    if (filterRegion !== 'all' && opp.region !== filterRegion) return false;
    if (filterSchedule !== 'all' && opp.desiredSchedule !== filterSchedule) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            Oportunidades de Novos Alunos
            <span className="bg-[#ffc400] text-[#10263b] text-xs font-black px-2 py-0.5 rounded-full">
              {opportunities.length}
            </span>
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Famílias em São Paulo procurando transporte. Clique no card da criança para ver a avaliação do responsável.
          </p>
        </div>

        <button
          onClick={() => setIsConfigCoverageOpen(true)}
          className="bg-[#10263b] dark:bg-[#26384a] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 hover:brightness-110 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#ffc400]" />
          Minhas Regiões
        </button>
      </div>

      {/* Coverage Status Bar */}
      <div className="bg-white dark:bg-[#16232f] p-3 rounded-xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1b8a52]/10 text-[#1b8a52] rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#5d6f80] dark:text-[#93a5b5]">Suas regiões ativas: </span>
            <span className="font-bold text-[#10263b] dark:text-white">
              {transporter.regions.map(r => REGIONS[r]).join(', ') || 'Nenhuma selecionada'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsConfigCoverageOpen(true)}
          className="text-[#0f7f8c] dark:text-[#4cc3d1] font-extrabold hover:underline text-[11px] cursor-pointer"
        >
          Editar
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setFilterRegion('all')}
          className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
            filterRegion === 'all'
              ? 'bg-[#10263b] text-white border-[#10263b]'
              : 'bg-white dark:bg-[#16232f] border-[#d6dee6] dark:border-[#26384a] text-[#5d6f80]'
          }`}
        >
          Todas as Regiões
        </button>
        {REGIONS.map((r, i) => (
          <button
            key={i}
            onClick={() => setFilterRegion(r)}
            className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
              filterRegion === r
                ? 'bg-[#10263b] text-white border-[#10263b]'
                : 'bg-white dark:bg-[#16232f] border-[#d6dee6] dark:border-[#26384a] text-[#5d6f80]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="space-y-3">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white dark:bg-[#16232f] p-8 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center space-y-2">
            <div className="text-3xl">🎒</div>
            <h3 className="font-bold text-sm">Nenhuma oportunidade nesta região no momento</h3>
            <p className="text-xs text-[#5d6f80]">Novos pedidos de famílias são postados diariamente.</p>
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const hasExpressed =
              expressedOppIds.has(opp.id) ||
              (opp.interestedTransporters &&
                opp.interestedTransporters.some(
                  e => e.toLowerCase() === transporter.email.toLowerCase()
                ));

            return (
              <div
                key={opp.id}
                className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3 hover:border-[#ffc400] transition group"
              >
                {/* Clickable Header of Opportunity Card -> opens Parent Profile Modal */}
                <div
                  onClick={() =>
                    setSelectedParentModal({
                      parentName: opp.parentName,
                      parentEmail: opp.parentEmail,
                      parentPhone: opp.parentPhone || '(11) 98811-2233',
                      childName: opp.childName,
                      schoolName: opp.school,
                      address: `${opp.neighborhood} (${opp.region})`
                    })
                  }
                  className="flex justify-between items-start gap-2 cursor-pointer p-2 -m-2 rounded-xl hover:bg-[#eef2f5] dark:hover:bg-[#0e1822] transition"
                  title="Clique para abrir o perfil e a avaliação do responsável"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] font-black flex items-center justify-center text-sm shrink-0 border border-[#ffc400]/40 group-hover:scale-105 transition">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#0f7f8c]/10 text-[#0f7f8c] dark:text-[#4cc3d1] px-2 py-0.5 rounded-md">
                          {opp.school}
                        </span>
                        <span className="text-[10px] text-[#5d6f80]">{opp.createdAt}</span>
                      </div>
                      <h3 className="font-black text-sm text-[#10263b] dark:text-white mt-0.5 flex items-center gap-1.5">
                        <span>{opp.childName}</span>
                        <span className="text-xs font-normal text-[#5d6f80]">· Responsável: <b>{opp.parentName}</b></span>
                      </h3>
                      <div className="text-[11px] text-[#0f7f8c] font-bold flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-[#ffc400] text-[#ffc400]" />
                        <span>Clique para ver perfil completo & avaliação da família</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {opp.distanceKm && (
                    <span className="bg-[#1b8a52]/10 text-[#1b8a52] text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                      <Navigation className="w-3 h-3" />
                      ~{opp.distanceKm} km da sua rota
                    </span>
                  )}
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2 rounded-xl flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0f7f8c] shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-[#5d6f80]">Bairro / Região</div>
                      <b className="truncate block">{opp.neighborhood} ({opp.region})</b>
                    </div>
                  </div>

                  <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2 rounded-xl flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#ffc400] shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#5d6f80]">Turno Desejado</div>
                      <b>{opp.desiredSchedule}</b>
                    </div>
                  </div>

                  <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2 rounded-xl flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#1b8a52] shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#5d6f80]">Início</div>
                      <b>{opp.startDate}</b>
                    </div>
                  </div>
                </div>

                {/* Notes from parent */}
                {opp.notes && (
                  <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-xl border-l-3 border-[#ffc400]">
                    "{opp.notes}"
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#d6dee6] dark:border-[#26384a]">
                  <button
                    onClick={() => onOpenChatWithParent(opp.parentEmail, opp.parentName)}
                    className="flex-1 py-2.5 px-3 bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="Conversar diretamente com a família no chat"
                  >
                    <MessageSquare className="w-4 h-4 text-[#ffc400]" />
                    Conversar no Chat com o Pai
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasExpressed) {
                        setExpressedOppIds(prev => new Set(prev).add(opp.id));
                        onExpressInterest(opp.id);
                      }
                    }}
                    disabled={hasExpressed}
                    className={`py-2.5 px-3.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0 ${
                      hasExpressed
                        ? 'bg-[#1b8a52] text-white shadow-xs cursor-default opacity-100'
                        : 'bg-[#ffc400] text-[#10263b] hover:brightness-105 shadow-xs cursor-pointer active:scale-95'
                    }`}
                    title={hasExpressed ? 'Notificação enviada ao pai! Seu interesse está registrado.' : 'Enviar notificação automática ao pai'}
                  >
                    {hasExpressed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>Interesse Salvo</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#10263b]" />
                        <span>Manifestar Interesse</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Parent Profile Modal */}
      {selectedParentModal && (
        <ParentProfileModal
          parentName={selectedParentModal.parentName}
          parentEmail={selectedParentModal.parentEmail}
          parentPhone={selectedParentModal.parentPhone}
          childName={selectedParentModal.childName}
          schoolName={selectedParentModal.schoolName}
          address={selectedParentModal.address}
          reviews={parentReviews}
          onClose={() => setSelectedParentModal(null)}
          onOpenChat={(email, name) => {
            onOpenChatWithParent(email, name);
            setSelectedParentModal(null);
          }}
        />
      )}

      {/* Coverage Configuration Modal */}
      {isConfigCoverageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base">Configurar Regiões & Escolas de Atendimento</h3>
              <button
                onClick={() => setIsConfigCoverageOpen(false)}
                className="text-[#5d6f80] font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-2">Regiões Atendidas por sua Van:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REGIONS.map((reg, idx) => {
                    const isSelected = tempRegions.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleRegion(idx)}
                        className={`p-2.5 rounded-xl border text-left font-bold transition text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#ffc400] text-[#10263b] border-[#ffc400]'
                            : 'bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] dark:text-[#93a5b5] border-[#d6dee6] dark:border-[#26384a]'
                        }`}
                      >
                        <span>{reg}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Escolas de seu Itinerário:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {SCHOOLS.map((sch, idx) => {
                    const isSelected = tempSchools.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleSchool(idx)}
                        className={`w-full p-2.5 rounded-xl border text-left font-bold transition text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f7f8c] text-white border-[#0f7f8c]'
                            : 'bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] dark:text-[#93a5b5] border-[#d6dee6] dark:border-[#26384a]'
                        }`}
                      >
                        <span>{sch}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
              <button
                type="button"
                onClick={() => setIsConfigCoverageOpen(false)}
                className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCoverage}
                className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 cursor-pointer"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
