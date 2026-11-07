import React, { useState } from 'react';
import { SCHOOLS, REGIONS, OSASCO_SCHOOLS } from '../constants';
import { NewStudentOpportunity } from '../types';
import { Plus, X, CheckCircle2, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface RequestOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opp: Omit<NewStudentOpportunity, 'id' | 'createdAt' | 'interestedTransporters'>) => void;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
}

export const RequestOpportunityModal: React.FC<RequestOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentName,
  parentEmail,
  parentPhone = '(11) 98811-2233'
}) => {
  const [childName, setChildName] = useState<string>('');
  const [grade, setGrade] = useState<string>('2º Ano Fundamental');
  const [school, setSchool] = useState<string>('EMEF Santa Rita');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('Jabaquara');
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [desiredSchedule, setDesiredSchedule] = useState<'Manhã' | 'Tarde' | 'Integral'>('Manhã');
  const [entryTime, setEntryTime] = useState<string>('07:30');
  const [exitTime, setExitTime] = useState<string>('12:15');
  const [childCount, setChildCount] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('Imediato');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !pickupAddress.trim() || !neighborhood.trim()) {
      alert('Preencha o nome da criança, o endereço de embarque e o bairro.');
      return;
    }

    onSubmit({
      parentName,
      parentEmail,
      parentPhone,
      childName: childName.trim(),
      grade,
      school,
      pickupAddress: pickupAddress.trim(),
      dropoffAddress: dropoffAddress.trim() || pickupAddress.trim(),
      neighborhood: neighborhood.trim(),
      region,
      desiredSchedule,
      entryTime,
      exitTime,
      childCount: Number(childCount) || 1,
      startDate,
      distanceKm: 2.1,
      notes: notes.trim(),
      status: 'aguardando_analise' // Sent to DTP admin for moderation
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
          <div>
            <h3 className="font-black text-base flex items-center gap-1.5">
              <span>Publicar Solicitação de Transporte Escolar</span>
            </h3>
            <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
              Preencha os dados obrigatórios da rota. Sua solicitação será validada pelo DTP e disponibilizada aos motoristas credenciados.
            </p>
          </div>
          <button onClick={onClose} className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-lg cursor-pointer">
            ✕
          </button>
        </div>

        {/* Regulatory Banner */}
        <div className="p-2.5 bg-[#e3f2fd] dark:bg-[#1a2f44] rounded-xl border border-[#90caf9] dark:border-[#244b6e] text-[11px] text-[#1565c0] dark:text-[#90caf9] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Após o envio, o órgão regulador DTP analisa a solicitação para garantir conformidade antes de abri-la para orçamentos no chat.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Nome da Criança *</label>
              <input
                type="text"
                placeholder="Ex: Lucas Almeida"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Série / Ano Escolar *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              >
                <option>Educação Infantil (Pré I / II)</option>
                <option>1º Ano Fundamental</option>
                <option>2º Ano Fundamental</option>
                <option>3º Ano Fundamental</option>
                <option>4º Ano Fundamental</option>
                <option>5º Ano Fundamental</option>
                <option>6º ao 9º Ano</option>
                <option>Ensino Médio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Escola / Colégio de Destino *</label>
            <input
              type="text"
              list="modal-schools"
              placeholder="Digite ou escolha a escola"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
              required
            />
            <datalist id="modal-schools">
              {OSASCO_SCHOOLS.map((s) => (
                <option key={s.id} value={s.name}>{s.neighborhood} - {s.type}</option>
              ))}
              {SCHOOLS.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Endereço de Embarque (Residência) *</label>
              <input
                type="text"
                placeholder="Rua, número e complemento"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Endereço de Desembarque na Volta</label>
              <input
                type="text"
                placeholder="Mesmo da ida ou outro local"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Bairro *</label>
              <input
                type="text"
                placeholder="Ex: Jabaquara / Moema"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Região de SP</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              >
                {REGIONS.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold mb-1">Período</label>
              <select
                value={desiredSchedule}
                onChange={(e) => setDesiredSchedule(e.target.value as any)}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Integral</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Horário Entrada</label>
              <input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Horário Saída</label>
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Observações Adicionais para os Condutores</label>
            <textarea
              rows={2}
              placeholder="Ex: Necessário veículo com ar-condicionado e monitora a bordo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 cursor-pointer shadow-md"
            >
              Publicar Solicitação de Vaga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
