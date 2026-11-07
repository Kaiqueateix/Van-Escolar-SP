import React, { useState } from 'react';
import { Child } from '../../types';
import { SCHOOLS } from '../../constants';
import {
  Plus,
  User,
  GraduationCap,
  School,
  HeartPulse,
  Sparkles,
  Check,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';

interface NetflixProfileSelectorProps {
  childrenList: Child[];
  activeChildId?: string;
  onSelectChild: (childId: string) => void;
  onAddChild: (child: Child) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const AVATAR_COLORS = [
  'from-[#ffc400] to-[#f59e0b] text-[#10263b]',
  'from-[#0f7f8c] to-[#0284c7] text-white',
  'from-[#1b8a52] to-[#10b981] text-white',
  'from-[#8b5cf6] to-[#6366f1] text-white',
  'from-[#ec4899] to-[#f43f5e] text-white',
  'from-[#f97316] to-[#ea580c] text-white'
];

export const NetflixProfileSelector: React.FC<NetflixProfileSelectorProps> = ({
  childrenList,
  activeChildId,
  onSelectChild,
  onAddChild,
  onClose,
  isModal = false
}) => {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(childrenList.length === 0);
  const [name, setName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('2018-05-10');
  const [grade, setGrade] = useState<string>('2º Ano Fundamental');
  const [school, setSchool] = useState<string>(SCHOOLS[0] || 'EMEF Marechal Bittencourt');
  const [address, setAddress] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [medicalNotes, setMedicalNotes] = useState<string>('');

  const calculateAge = (dob: string): number => {
    if (!dob) return 7;
    const birth = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 ? calculatedAge : 7;
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome da criança.');
      return;
    }

    const calculatedAge = calculateAge(birthDate);
    const newChild: Child = {
      id: 'k_child_' + Date.now().toString(36),
      n: name.trim(),
      i: calculatedAge,
      birthDate,
      grade,
      allergies: allergies.trim() || undefined,
      medicalNotes: medicalNotes.trim() || undefined,
      e: school,
      d: address.trim() || 'Endereço residencial cadastrado',
      r: 'Responsável',
      t: '(11) 98811-2233',
      o: medicalNotes.trim() || allergies.trim() || '',
      pg: 0,
      paymentStatus: 'pendente',
      isPresentToday: true,
      authorizedReceivers: [
        {
          name: 'Responsável Principal',
          relation: 'Pai/Mãe',
          document: 'Identidade Cadastrada',
          phone: '(11) 98811-2233',
          isPrimary: true
        }
      ]
    };

    onAddChild(newChild);
    onSelectChild(newChild.id);
    setIsAddingNew(false);
    setName('');
    setAllergies('');
    setMedicalNotes('');
    if (onClose) onClose();
  };

  const content = (
    <div className="space-y-6 max-w-xl mx-auto py-2">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Perfis Familiares
        </div>
        <h2 className="text-2xl font-black text-[#10263b] dark:text-white tracking-tight">
          Quem está indo para a escola hoje?
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] max-w-md mx-auto">
          Selecione o perfil do seu filho para acompanhar o trajeto da van, horários de chegada e pagamentos separadamente.
        </p>
      </div>

      {!isAddingNew ? (
        <>
          {/* Netflix Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
            {childrenList.map((child, idx) => {
              const isSelected = child.id === activeChildId;
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initials = child.n
                .split(' ')
                .slice(0, 2)
                .map(part => part[0])
                .join('')
                .toUpperCase();

              return (
                <button
                  key={child.id || idx}
                  onClick={() => {
                    onSelectChild(child.id);
                    if (onClose) onClose();
                  }}
                  className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                    isSelected
                      ? 'border-[#ffc400] bg-[#ffc400]/10 dark:bg-[#ffc400]/5 scale-102 shadow-md'
                      : 'border-[#d6dee6] dark:border-[#26384a] bg-white dark:bg-[#16232f] hover:border-[#ffc400]/60 hover:scale-101'
                  }`}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1b8a52] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Avatar Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center font-black text-2xl shadow-inner mb-2.5 transition group-hover:scale-105`}
                  >
                    {initials || '👧'}
                  </div>

                  {/* Name & Grade */}
                  <div className="w-full">
                    <h3 className="font-extrabold text-sm text-[#10263b] dark:text-white truncate">
                      {child.n}
                    </h3>
                    <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] font-bold">
                      {child.grade || `${child.i} anos`}
                    </p>
                    <p className="text-[10px] text-[#0f7f8c] dark:text-[#4cc3d1] truncate mt-0.5 font-medium">
                      {child.e}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Add New Child Card */}
            <button
              onClick={() => setIsAddingNew(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-[#d6dee6] dark:border-[#26384a] hover:border-[#ffc400] bg-[#eef2f5]/50 dark:bg-[#0e1822]/50 hover:bg-[#ffc400]/5 transition flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#d6dee6] dark:bg-[#26384a] group-hover:bg-[#ffc400] text-[#5d6f80] group-hover:text-[#10263b] flex items-center justify-center font-black text-2xl mb-2.5 transition">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-extrabold text-xs text-[#10263b] dark:text-white">
                Adicionar Filho
              </span>
              <span className="text-[10px] text-[#5d6f80]">Criar novo perfil</span>
            </button>
          </div>

          {onClose && (
            <div className="flex justify-center pt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-[#10263b] dark:bg-[#26384a] text-white font-extrabold text-xs rounded-xl hover:brightness-110 shadow-xs"
              >
                Acessar Aplicativo
              </button>
            </div>
          )}
        </>
      ) : (
        /* Form: Add New Child Profile */
        <form
          onSubmit={handleSaveChild}
          className="bg-white dark:bg-[#16232f] p-5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-md space-y-3.5 text-xs text-[#10263b] dark:text-white"
        >
          <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
            <h3 className="font-black text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#ffc400]" /> Cadastrar Perfil de Filho
            </h3>
            {childrenList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-[#5d6f80] hover:text-[#10263b] font-bold"
              >
                Voltar
              </button>
            )}
          </div>

          <div>
            <label className="block font-bold mb-1">Nome Completo da Criança *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Sofia Almeida"
              className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Série / Ano Escolar</label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="Ex: 3º Ano Fundamental"
                className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Escola onde estuda</label>
            <select
              value={school}
              onChange={e => setSchool(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
            >
              {SCHOOLS.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Endereço de Embarque / Residência</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Rua, número e bairro para a van buscar"
              className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Alergias (se houver)</label>
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="Ex: Amendoim, lactose"
                className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Cuidados / Observações</label>
              <input
                type="text"
                value={medicalNotes}
                onChange={e => setMedicalNotes(e.target.value)}
                placeholder="Ex: Usa óculos, enjoo"
                className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
            {childrenList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 shadow-xs"
            >
              Salvar Perfil do Filho
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative bg-[#eef2f5] dark:bg-[#0e1822] w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-[#d6dee6] dark:border-[#26384a]">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-[#16232f] text-black dark:text-white font-black flex items-center justify-center shadow-md border border-[#d6dee6] dark:border-[#26384a] cursor-pointer hover:scale-105 transition"
            >
              ✕
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
};
