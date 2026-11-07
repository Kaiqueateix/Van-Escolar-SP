import React, { useState, useMemo } from 'react';
import { TransporterProfile } from '../../types';
import { REGIONS, SCHOOLS } from '../../constants';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  Plus,
  Scale,
  X,
  Sparkles,
  MessageCircle,
  FileSignature,
  School,
  Clock
} from 'lucide-react';

interface SearchCompareViewProps {
  transporters: TransporterProfile[];
  selectedTransporterId: string | null;
  onSelectTransporter: (id: string) => void;
  onOpenChat: (transporterId: string) => void;
  onRequestOpportunity: () => void;
}

export const SearchCompareView: React.FC<SearchCompareViewProps> = ({
  transporters,
  selectedTransporterId,
  onSelectTransporter,
  onOpenChat,
  onRequestOpportunity,
}) => {
  // Search & Filters state
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<number>(-1); // -1 = todas
  const [bairroQuery, setBairroQuery] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailableSeats, setOnlyAvailableSeats] = useState<boolean>(false);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Compare up to 3 transporters
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparingOpen, setIsComparingOpen] = useState<boolean>(false);
  const [selectedTransporterForDetail, setSelectedTransporterForDetail] = useState<TransporterProfile | null>(null);

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(x => x !== id));
    } else {
      if (compareIds.length >= 3) {
        alert('Você pode comparar até 3 transportadores simultaneamente.');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const filteredTransporters = useMemo(() => {
    return transporters.filter(t => {
      // Free text school match
      if (schoolSearchQuery.trim()) {
        const sQuery = schoolSearchQuery.toLowerCase();
        const matchesSchoolList = t.schools.some(idx =>
          SCHOOLS[idx]?.toLowerCase().includes(sQuery)
        );
        const matchesSchoolSchedules = t.schoolSchedules?.some(s =>
          s.schoolName.toLowerCase().includes(sQuery)
        );
        if (!matchesSchoolList && !matchesSchoolSchedules) return false;
      }

      if (selectedRegion !== -1 && !t.regions.includes(selectedRegion)) return false;
      if (t.rating < minRating) return false;
      if (onlyAvailableSeats && t.seatsAvailable <= 0) return false;
      if (onlyVerified && !t.isVerified) return false;

      if (bairroQuery.trim()) {
        const query = bairroQuery.toLowerCase();
        const matchesVan = t.vanModel.toLowerCase().includes(query);
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesRegion = t.regions.some(r => REGIONS[r]?.toLowerCase().includes(query));
        if (!matchesVan && !matchesName && !matchesRegion) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return b.rating - a.rating;
    });
  }, [
    transporters,
    schoolSearchQuery,
    selectedRegion,
    minRating,
    onlyAvailableSeats,
    onlyVerified,
    bairroQuery
  ]);

  const comparedTransportersList = useMemo(() => {
    return transporters.filter(t => compareIds.includes(t.id));
  }, [transporters, compareIds]);

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white">
            Buscar Transporte Escolar
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Encontre motoristas credenciados DTP e negocie o contrato pelo chat
          </p>
        </div>
        <button
          onClick={onRequestOpportunity}
          className="bg-[#10263b] dark:bg-[#ffc400] text-[#ffc400] dark:text-[#10263b] text-xs font-black px-3.5 py-2 rounded-xl shadow-xs hover:brightness-110 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Publicar Solicitação
        </button>
      </div>

      {/* Main Filter Card */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        {/* School Free-Text Search Input */}
        <div>
          <label className="block text-xs font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
            Pesquisar pelo Nome da Escola ou Colégio (São Paulo & Osasco)
          </label>
          <div className="relative">
            <School className="w-4 h-4 absolute left-3 top-3 text-[#0f7f8c]" />
            <input
              type="text"
              list="search-schools-list"
              placeholder="Digite o nome da escola (Ex: Colégio São Luís, Santa Rita, EMEF Blanes...)"
              value={schoolSearchQuery}
              onChange={(e) => setSchoolSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0e1822] text-[#10263b] dark:text-[#eaf0f5] text-xs font-bold rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
            />
            <datalist id="search-schools-list">
              {SCHOOLS.map((s, idx) => (
                <option key={idx} value={s} />
              ))}
            </datalist>
          </div>
          {schoolSearchQuery && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#0f7f8c]">
              <span>Filtrando por escola: <b>"{schoolSearchQuery}"</b></span>
              <button
                onClick={() => setSchoolSearchQuery('')}
                className="text-[#c93c3c] font-black underline ml-1"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Region Selector */}
          <div>
            <label className="block text-xs font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
              Região de São Paulo
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(Number(e.target.value))}
              className="w-full bg-[#f8fafc] dark:bg-[#0e1822] text-[#10263b] dark:text-[#eaf0f5] text-xs font-bold p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
            >
              <option value={-1}>Todas as Regiões de SP ({REGIONS.length})</option>
              {REGIONS.map((r, idx) => (
                <option key={idx} value={idx}>{r}</option>
              ))}
            </select>
          </div>

          {/* Search input for neighborhood or driver */}
          <div>
            <label className="block text-xs font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
              Bairro ou Motorista
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#5d6f80]" />
              <input
                type="text"
                placeholder="Ex: Moema, Jabaquara, Tatuapé..."
                value={bairroQuery}
                onChange={(e) => setBairroQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0e1822] text-xs rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
              />
            </div>
          </div>
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="flex items-center justify-between pt-1 border-t border-[#d6dee6] dark:border-[#26384a]">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-bold text-[#0f7f8c] dark:text-[#4cc3d1] flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? 'Ocultar filtros adicionais' : 'Mais filtros (Vagas e Selo Verificado)'}
          </button>
          <span className="text-[11px] text-[#5d6f80]">
            {filteredTransporters.length} van(s) disponível(is)
          </span>
        </div>

        {/* Advanced Filters Expandable */}
        {showFilters && (
          <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl space-y-3 pt-2">
            <div className="flex flex-wrap gap-4 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailableSeats}
                  onChange={(e) => setOnlyAvailableSeats(e.target.checked)}
                  className="rounded text-[#ffc400] focus:ring-0"
                />
                Apenas vans com vagas abertas
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded text-[#1b8a52] focus:ring-0"
                />
                <span className="inline-flex items-center gap-1 text-[#1b8a52]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Apenas Verificados DTP
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Compare floating badge if items selected */}
      {compareIds.length > 0 && (
        <div className="sticky top-14 z-30 bg-[#ffc400] text-[#10263b] p-3 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 text-xs font-black">
            <Scale className="w-4 h-4" />
            <span>{compareIds.length} transportador(es) selecionado(s) para comparar</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComparingOpen(true)}
              className="bg-[#10263b] text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm hover:brightness-110"
            >
              Comparar Agora
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="text-[#10263b] hover:opacity-75 p-1"
              title="Limpar seleção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notice regarding contract negotiation in chat */}
      <div className="p-3 bg-[#0f7f8c]/10 border border-[#0f7f8c]/30 rounded-xl text-xs flex items-center gap-2 text-[#0f7f8c] dark:text-[#4cc3d1]">
        <FileSignature className="w-4 h-4 shrink-0" />
        <span>
          <b>Valores e Períodos Decididos em Chat:</b> O valor mensal, turno e tempo de contrato são negociados diretamente no chat com o transportador, que gera o contrato digital para assinatura pelo app.
        </span>
      </div>

      {/* School Pickup Route Optimization & Boarding Time Estimate Card */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ffc400] text-[#10263b] rounded-lg font-black">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs text-[#10263b] dark:text-white">
                Otimizador de Rotas & Horários de Embarque (Previsão Matinal)
              </h3>
              <p className="text-[10px] text-[#5d6f80]">Cálculo geográfico por IA para chegada pontual aos portões</p>
            </div>
          </div>
          <span className="bg-[#1b8a52]/15 text-[#1b8a52] text-[10px] font-black px-2 py-0.5 rounded-full">
            Trânsito Fluido 🟢
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-[#f8fafc] dark:bg-[#0e1822] p-2 rounded-xl border border-[#d6dee6] dark:border-[#26384a]">
            <span className="text-[9px] text-[#5d6f80] block font-bold">Saída Inicial</span>
            <span className="font-black text-xs text-[#10263b] dark:text-white">06:45 AM</span>
          </div>
          <div className="bg-[#f8fafc] dark:bg-[#0e1822] p-2 rounded-xl border border-[#d6dee6] dark:border-[#26384a]">
            <span className="text-[9px] text-[#5d6f80] block font-bold">Embarque Aluno</span>
            <span className="font-black text-xs text-[#0f7f8c]">07:02 AM</span>
          </div>
          <div className="bg-[#f8fafc] dark:bg-[#0e1822] p-2 rounded-xl border border-[#d6dee6] dark:border-[#26384a]">
            <span className="text-[9px] text-[#5d6f80] block font-bold">Chegada Escola</span>
            <span className="font-black text-xs text-[#1b8a52]">07:25 AM</span>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredTransporters.length === 0 ? (
          <div className="bg-white dark:bg-[#16232f] p-8 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center space-y-3">
            <div className="text-4xl">🚌</div>
            <h3 className="font-extrabold text-base text-[#10263b] dark:text-white">
              Nenhum transportador atende aos filtros pesquisados
            </h3>
            <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] max-w-sm mx-auto">
              Você pode publicar sua vaga para que motoristas que fazem essa rota recebam seu contato!
            </p>
            <button
              onClick={onRequestOpportunity}
              className="bg-[#ffc400] text-[#10263b] text-xs font-black px-4 py-2.5 rounded-xl shadow-sm hover:brightness-105"
            >
              Publicar Vaga para Família
            </button>
          </div>
        ) : (
          filteredTransporters.map((t) => {
            const isCompared = compareIds.includes(t.id);
            const isSelected = selectedTransporterId === t.id;

            return (
              <div
                key={t.id}
                className={`bg-white dark:bg-[#16232f] rounded-2xl border transition p-4 space-y-3 ${
                  isSelected
                    ? 'border-[#ffc400] ring-2 ring-[#ffc400]/20 shadow-md'
                    : 'border-[#d6dee6] dark:border-[#26384a] hover:border-[#93a5b5]'
                }`}
              >
                {/* Header of Driver Card (NO PRICE) */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedTransporterForDetail(t)}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="Clique para ver perfil e reputação detalhada do transportador"
                  >
                    <img
                      src={t.photoUrl}
                      alt={t.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#d6dee6] dark:border-[#26384a] group-hover:border-[#ffc400] transition"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-black text-sm text-[#10263b] dark:text-white group-hover:text-[#0f7f8c] dark:group-hover:text-[#ffc400] transition">
                          {t.name}
                        </h3>
                        {t.isSponsored && (
                          <span className="bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Destaque
                          </span>
                        )}
                        {t.isVerified && (
                          <span className="bg-[#1b8a52] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> VERIFICADO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                        {t.vanModel} ({t.vanYear}) · Placa {t.vanPlate}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedTransporterForDetail(t)}
                    className="text-right cursor-pointer group"
                    title="Ver detalhamento das avaliações e nota de reputação"
                  >
                    <div className="flex items-center justify-end gap-1 text-xs font-black text-[#10263b] dark:text-[#ffc400] group-hover:underline">
                      <Star className="w-3.5 h-3.5 fill-[#ffc400] text-[#ffc400]" />
                      <span>{t.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-[#5d6f80]">({t.reviewsCount})</span>
                    </div>
                    <span className="inline-block text-[11px] font-bold text-[#0f7f8c] dark:text-[#4cc3d1] mt-0.5">
                      Ver Perfil & Avaliações
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] line-clamp-2 leading-relaxed">
                  {t.bio}
                </p>

                {/* Schools & Schedules Preview */}
                {t.schoolSchedules && t.schoolSchedules.length > 0 && (
                  <div className="bg-[#f8fafc] dark:bg-[#0e1822] p-2.5 rounded-xl space-y-1 text-[11px]">
                    <div className="font-bold text-[#5d6f80] text-[10px] flex items-center gap-1">
                      <School className="w-3 h-3 text-[#0f7f8c]" /> Escolas e Horários Atendidos:
                    </div>
                    {t.schoolSchedules.map((sc, i) => (
                      <div key={i} className="flex justify-between items-center text-[#10263b] dark:text-[#eaf0f5]">
                        <span className="font-bold truncate max-w-[200px]">{sc.schoolName}</span>
                        <span className="text-[#5d6f80] text-[10px]">
                          Manhã: {sc.morningEntry}h - {sc.morningExit}h
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regions and Seats Badges */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="bg-[#f8fafc] dark:bg-[#0e1822] text-[#10263b] dark:text-[#eaf0f5] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0f7f8c]" />
                    {t.regions.map(r => REGIONS[r]).join(', ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg font-black flex items-center gap-1 ${
                    t.seatsAvailable > 0
                      ? 'bg-[#1b8a52]/10 text-[#1b8a52]'
                      : 'bg-[#c93c3c]/10 text-[#c93c3c]'
                  }`}>
                    <Users className="w-3 h-3" />
                    {t.seatsAvailable > 0
                      ? `${t.seatsAvailable} vaga(s) restante(s)`
                      : 'Lotado'}
                  </span>
                </div>

                {/* Amenities pills */}
                {t.amenities && t.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {t.amenities.map((am, i) => (
                      <span key={i} className="bg-[#f8fafc] dark:bg-[#0e1822] text-[#5d6f80] dark:text-[#93a5b5] px-2 py-0.5 rounded-md font-semibold">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons: Conversar & Negociar Contrato */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#d6dee6] dark:border-[#26384a]">
                  {/* Compare button */}
                  <button
                    onClick={() => toggleCompare(t.id)}
                    className={`text-xs font-bold px-2.5 py-2 rounded-xl border flex items-center gap-1 transition ${
                      isCompared
                        ? 'bg-[#ffc400] text-[#10263b] border-[#ffc400]'
                        : 'border-[#d6dee6] dark:border-[#26384a] text-[#5d6f80] dark:text-[#93a5b5] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    {isCompared ? 'Comparando' : 'Comparar'}
                  </button>

                  {/* Main Action: Conversar & Negociar Contrato */}
                  <button
                    onClick={() => {
                      onSelectTransporter(t.id);
                      onOpenChat(t.id);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl font-black text-xs bg-[#ffc400] text-[#10263b] hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Conversar & Negociar Contrato
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comparison Modal */}
      {isComparingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden my-6">
            <div className="bg-[#10263b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#ffc400]" />
                <h3 className="font-extrabold text-base">Comparador de Transportadores Escolares</h3>
              </div>
              <button
                onClick={() => setIsComparingOpen(false)}
                className="p-1 rounded-lg text-[#93a5b5] hover:text-white hover:bg-[#26384a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d6dee6] dark:border-[#26384a]">
                    <th className="p-2 font-black text-[#5d6f80] dark:text-[#93a5b5] w-32">Critério</th>
                    {comparedTransportersList.map(t => (
                      <th key={t.id} className="p-2 min-w-[160px] text-center font-black">
                        <div className="flex flex-col items-center gap-1">
                          <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-xl object-cover" />
                          <span>{t.name}</span>
                          <span className="text-[10px] font-bold text-[#ffc400]">⭐ {t.rating} ({t.reviewsCount})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6dee6] dark:divide-[#26384a]">
                  <tr>
                    <td className="p-2 font-bold text-[#5d6f80]">Valores & Contrato</td>
                    {comparedTransportersList.map(t => (
                      <td key={t.id} className="p-2 text-center font-bold text-[#0f7f8c] dark:text-[#4cc3d1]">
                        Negociado no Chat
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#5d6f80]">Selo Verificado DTP</td>
                    {comparedTransportersList.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        {t.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[#1b8a52] font-black">
                            <ShieldCheck className="w-4 h-4" /> Aprovado DTP
                          </span>
                        ) : (
                          <span className="text-[#5d6f80]">Em análise</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#5d6f80]">Veículo & Ano</td>
                    {comparedTransportersList.map(t => (
                      <td key={t.id} className="p-2 text-center font-bold">
                        {t.vanModel} ({t.vanYear})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#5d6f80]">Vagas Abertas</td>
                    {comparedTransportersList.map(t => (
                      <td key={t.id} className="p-2 text-center font-black">
                        <span className={t.seatsAvailable > 0 ? 'text-[#1b8a52]' : 'text-[#c93c3c]'}>
                          {t.seatsAvailable > 0 ? `${t.seatsAvailable} vagas` : 'Lotado'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#5d6f80]">Comodidades</td>
                    {comparedTransportersList.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        <div className="flex flex-col gap-1 text-[10px]">
                          {t.amenities.map((a, idx) => (
                            <span key={idx} className="bg-[#f8fafc] dark:bg-[#0e1822] py-0.5 rounded">
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#5d6f80]">Ação</td>
                    {comparedTransportersList.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        <button
                          onClick={() => {
                            onSelectTransporter(t.id);
                            onOpenChat(t.id);
                            setIsComparingOpen(false);
                          }}
                          className="w-full bg-[#ffc400] text-[#10263b] font-black py-1.5 px-2 rounded-lg text-xs hover:brightness-105"
                        >
                          Iniciar Chat
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transporter Detailed Reputation & Profile Modal */}
      {selectedTransporterForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-xl rounded-3xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden my-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#10263b] via-[#1c3044] to-[#26384a] text-white p-5 relative">
              <button
                onClick={() => setSelectedTransporterForDetail(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={selectedTransporterForDetail.photoUrl}
                  alt={selectedTransporterForDetail.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#ffc400] shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    {selectedTransporterForDetail.isVerified ? (
                      <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Credenciado DTP/SP
                      </span>
                    ) : (
                      <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Transportador Cadastrado
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-white mt-1">
                    {selectedTransporterForDetail.name}
                  </h3>
                  <p className="text-xs text-[#93a5b5] font-medium">
                    {selectedTransporterForDetail.vanModel} ({selectedTransporterForDetail.vanYear}) · Placa {selectedTransporterForDetail.vanPlate}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Rating Overview */}
              <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#5d6f80] dark:text-[#93a5b5]">
                    Reputação Geral do Transportador
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-[#10263b] dark:text-white">
                      {selectedTransporterForDetail.rating.toFixed(1)}
                    </span>
                    <div className="flex items-center text-[#ffc400]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-[#ffc400]" />
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5 font-semibold">
                    {selectedTransporterForDetail.reviewsCount || 12} avaliações verificadas de pais
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block p-2 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] rounded-xl font-black text-xs">
                    Selo Prata DTP 🏅
                  </span>
                </div>
              </div>

              {/* Rating Breakdown Criteria */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
                  <Clock className="w-4 h-4 text-[#0f7f8c] mx-auto mb-1" />
                  <div className="text-[10px] text-[#5d6f80]">Pontualidade</div>
                  <div className="font-black text-xs text-[#10263b] dark:text-white mt-0.5">5.0 ★</div>
                </div>

                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
                  <ShieldCheck className="w-4 h-4 text-[#1b8a52] mx-auto mb-1" />
                  <div className="text-[10px] text-[#5d6f80]">Segurança</div>
                  <div className="font-black text-xs text-[#10263b] dark:text-white mt-0.5">5.0 ★</div>
                </div>

                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
                  <Users className="w-4 h-4 text-[#ffc400] mx-auto mb-1" />
                  <div className="text-[10px] text-[#5d6f80]">Atendimento</div>
                  <div className="font-black text-xs text-[#10263b] dark:text-white mt-0.5">4.9 ★</div>
                </div>

                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
                  <Sparkles className="w-4 h-4 text-[#0f7f8c] mx-auto mb-1" />
                  <div className="text-[10px] text-[#5d6f80]">Conservação</div>
                  <div className="font-black text-xs text-[#10263b] dark:text-white mt-0.5">5.0 ★</div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-1">
                  <div className="font-bold text-[#10263b] dark:text-white">Sobre o Condutor:</div>
                  <p className="text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
                    {selectedTransporterForDetail.bio}
                  </p>
                </div>

                <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] grid grid-cols-2 gap-2">
                  <div><b>Experiência:</b> {selectedTransporterForDetail.experienceYears || 5} anos</div>
                  <div><b>Vagas Abertas:</b> {selectedTransporterForDetail.seatsAvailable} de {selectedTransporterForDetail.seatsTotal}</div>
                  <div><b>Regiões:</b> {selectedTransporterForDetail.regions.map(r => REGIONS[r]).join(', ')}</div>
                  <div><b>Alvará DTP:</b> 48.920-SP</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-[#d6dee6] dark:border-[#26384a] flex gap-2">
                <button
                  onClick={() => setSelectedTransporterForDetail(null)}
                  className="py-3 px-4 bg-[#eef2f5] dark:bg-[#0e1822] text-[#5d6f80] font-bold text-xs rounded-xl"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    const tId = selectedTransporterForDetail.id;
                    setSelectedTransporterForDetail(null);
                    onSelectTransporter(tId);
                    onOpenChat(tId);
                  }}
                  className="flex-1 py-3 px-4 bg-[#ffc400] text-[#10263b] font-black text-xs rounded-xl hover:brightness-105 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Negociar Mensalidade & Contrato no Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
