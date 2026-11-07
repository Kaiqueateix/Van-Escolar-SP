import React, { useState } from 'react';
import { TransporterProfile, DocumentItem, SchoolScheduleItem } from '../../types';
import { SCHOOLS } from '../../constants';
import {
  ShieldCheck,
  Award,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Camera,
  Star,
  Users,
  AlertCircle,
  School,
  Plus,
  Trash2
} from 'lucide-react';

interface TransporterProfileViewProps {
  transporter: TransporterProfile;
  onUpdateProfile: (updated: Partial<TransporterProfile>) => void;
  onSubmitVerificationDocs: (docs: DocumentItem[], cnhNumber: string, cnhCategory: string, dtpNumber: string) => void;
}

export const TransporterProfileView: React.FC<TransporterProfileViewProps> = ({
  transporter,
  onUpdateProfile,
  onSubmitVerificationDocs
}) => {
  const [bio, setBio] = useState<string>(transporter.bio);
  const [seatsAvailable, setSeatsAvailable] = useState<number>(transporter.seatsAvailable);

  // School schedules
  const [schedules, setSchedules] = useState<SchoolScheduleItem[]>(
    transporter.schoolSchedules || [
      {
        schoolName: 'Colégio Arquidiocesano',
        morningEntry: '07:30',
        morningExit: '12:15',
        afternoonEntry: '13:00',
        afternoonExit: '17:30'
      },
      {
        schoolName: 'Colégio Bandeirantes',
        morningEntry: '07:15',
        morningExit: '12:45',
        afternoonEntry: '13:15',
        afternoonExit: '18:00'
      }
    ]
  );

  const [newSchoolName, setNewSchoolName] = useState<string>(SCHOOLS[0]);
  const [customSchoolName, setCustomSchoolName] = useState<string>('');
  const [morningEntry, setMorningEntry] = useState<string>('07:30');
  const [morningExit, setMorningExit] = useState<string>('12:15');
  const [afternoonEntry, setAfternoonEntry] = useState<string>('13:00');
  const [afternoonExit, setAfternoonExit] = useState<string>('17:30');
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState<boolean>(false);

  // Document submission form
  const [cnhNumber, setCnhNumber] = useState<string>(transporter.verification.cnhNumber || '04982719231');
  const [cnhCategory, setCnhCategory] = useState<string>(transporter.verification.cnhCategory || 'D (com EAR)');
  const [dtpNumber, setDtpNumber] = useState<string>(transporter.verification.dtpNumber || 'DTP-SP 89.214/2026');
  const [docSuccessMsg, setDocSuccessMsg] = useState<string>('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      bio,
      seatsAvailable,
      schoolSchedules: schedules
    });
    alert('Perfil profissional e escolas atendidas atualizados com sucesso!');
  };

  const handleAddSchoolSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSchool = customSchoolName.trim() || newSchoolName;
    if (!finalSchool) return;

    const newItem: SchoolScheduleItem = {
      schoolName: finalSchool,
      morningEntry: morningEntry || '07:30',
      morningExit: morningExit || '12:15',
      afternoonEntry: afternoonEntry || '13:00',
      afternoonExit: afternoonExit || '17:30'
    };

    const updated = [...schedules, newItem];
    setSchedules(updated);
    onUpdateProfile({ schoolSchedules: updated });

    setCustomSchoolName('');
    setIsAddSchoolOpen(false);
  };

  const handleRemoveSchoolSchedule = (idx: number) => {
    const updated = [...schedules];
    updated.splice(idx, 1);
    setSchedules(updated);
    onUpdateProfile({ schoolSchedules: updated });
  };

  const handleSendDocsForReview = (e: React.FormEvent) => {
    e.preventDefault();
    const docs: DocumentItem[] = [
      { id: 'd1', name: 'CNH D com EAR', type: 'cnh', status: 'pendente', submittedAt: new Date().toLocaleDateString('pt-BR') },
      { id: 'd2', name: 'Certificado Curso Transporte Escolar', type: 'curso', status: 'pendente', submittedAt: new Date().toLocaleDateString('pt-BR') },
      { id: 'd3', name: 'Alvará Escolar DTP-SP', type: 'alvara_dtp', status: 'pendente', submittedAt: new Date().toLocaleDateString('pt-BR') },
      { id: 'd4', name: 'Laudo Vistoria Semestral Inmetro', type: 'vistoria', status: 'pendente', submittedAt: new Date().toLocaleDateString('pt-BR') },
      { id: 'd5', name: 'Apólice Seguro APP Passageiros', type: 'seguro_app', status: 'pendente', submittedAt: new Date().toLocaleDateString('pt-BR') }
    ];

    onSubmitVerificationDocs(docs, cnhNumber, cnhCategory, dtpNumber);
    setDocSuccessMsg('Documentos enviados com sucesso para a fila de verificação do Administrador DTP!');
    setTimeout(() => setDocSuccessMsg(''), 5000);
  };

  const isApproved = transporter.isVerified && transporter.verification.status === 'aprovado';

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white">
          Perfil Profissional & Verificação DTP
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Envio de documentos obrigatórios, escolas atendidas e horários
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
        isApproved
          ? 'bg-[#1b8a52]/10 border-[#1b8a52]/30 text-[#1b8a52]'
          : transporter.verification.status === 'pendente'
          ? 'bg-[#ffc400]/15 border-[#ffc400]/40 text-[#10263b] dark:text-[#ffc400]'
          : 'bg-[#eef2f5] dark:bg-[#0e1822] border-[#d6dee6] dark:border-[#26384a] text-[#5d6f80]'
      }`}>
        <div className={`p-2 rounded-xl text-white font-black shrink-0 ${
          isApproved ? 'bg-[#1b8a52]' : 'bg-[#ffc400] text-[#10263b]'
        }`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="font-extrabold text-sm flex items-center gap-2">
            <span>Selo Oficial de Transportador Verificado</span>
            {isApproved ? (
              <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                APROVADO & ATIVO
              </span>
            ) : (
              <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-2 py-0.5 rounded-full">
                EM ANÁLISE ADMINISTRATIVA
              </span>
            )}
          </div>
          <p className="text-xs mt-1 text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
            {isApproved
              ? 'Todos os seus documentos (CNH D, Curso Escolar, Alvará DTP e Vistoria) foram verificados e aprovados pelo Administrador. O selo oficial é exibido para todas as famílias.'
              : 'Seus documentos estão em conferência. O selo oficial só é concedido após aprovação definitiva pelo painel administrativo DTP.'}
          </p>
        </div>
      </div>

      {/* ESCOLAS ATENDIDAS & HORÁRIOS (NO LUGAR DE PREÇO SUGERIDO) */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
              <School className="w-4 h-4 text-[#ffc400]" />
              Escolas Atendidas & Horários de Entrada/Saída
            </h3>
            <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
              Informe as instituições que você atende e as janelas de horários da sua rota
            </p>
          </div>

          <button
            onClick={() => setIsAddSchoolOpen(true)}
            className="bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Escola
          </button>
        </div>

        {/* List of Attended Schools */}
        <div className="space-y-2">
          {schedules.length === 0 ? (
            <div className="p-4 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-center text-xs text-[#5d6f80]">
              Nenhuma escola cadastrada. Toque em "+ Adicionar Escola".
            </div>
          ) : (
            schedules.map((sc, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
                    <School className="w-4 h-4 text-[#0f7f8c]" />
                    {sc.schoolName}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-1">
                    <div>
                      Manhã: <b>{sc.morningEntry}</b> (Entrada) - <b>{sc.morningExit}</b> (Saída)
                    </div>
                    <div>
                      Tarde: <b>{sc.afternoonEntry}</b> (Entrada) - <b>{sc.afternoonExit}</b> (Saída)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSchoolSchedule(idx)}
                  className="p-1.5 text-[#5d6f80] hover:text-[#c93c3c] transition rounded-lg"
                  title="Remover escola"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add School Schedule */}
      {isAddSchoolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base flex items-center gap-1.5">
                <School className="w-4 h-4 text-[#ffc400]" />
                Nova Escola Atendida
              </h3>
              <button onClick={() => setIsAddSchoolOpen(false)} className="text-[#5d6f80] font-black text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchoolSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Selecione da Lista Oficial</label>
                <select
                  value={newSchoolName}
                  onChange={(e) => {
                    setNewSchoolName(e.target.value);
                    setCustomSchoolName('');
                  }}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                >
                  {SCHOOLS.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Ou Digite Outra Escola de SP</label>
                <input
                  type="text"
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  placeholder="Ex: Escola Municipal Desembargador Amorim Lima"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                />
              </div>

              <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl space-y-2 border border-[#d6dee6] dark:border-[#26384a]">
                <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#ffc400]" />
                  Horários Turno Manhã
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#5d6f80] mb-0.5">Entrada Manhã</label>
                    <input
                      type="time"
                      value={morningEntry}
                      onChange={(e) => setMorningEntry(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#5d6f80] mb-0.5">Saída Manhã</label>
                    <input
                      type="time"
                      value={morningExit}
                      onChange={(e) => setMorningExit(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl space-y-2 border border-[#d6dee6] dark:border-[#26384a]">
                <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0f7f8c]" />
                  Horários Turno Tarde
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#5d6f80] mb-0.5">Entrada Tarde</label>
                    <input
                      type="time"
                      value={afternoonEntry}
                      onChange={(e) => setAfternoonEntry(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#5d6f80] mb-0.5">Saída Tarde</label>
                    <input
                      type="time"
                      value={afternoonExit}
                      onChange={(e) => setAfternoonExit(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolOpen(false)}
                  className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105"
                >
                  Salvar Escola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Submission Form */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#ffc400]" />
          Documentação Obrigatória para Credenciamento
        </h3>

        {docSuccessMsg && (
          <div className="p-3 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-xl text-xs font-bold">
            ✓ {docSuccessMsg}
          </div>
        )}

        <form onSubmit={handleSendDocsForReview} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Número de Registro CNH</label>
              <input
                type="text"
                value={cnhNumber}
                onChange={(e) => setCnhNumber(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Categoria CNH</label>
              <select
                value={cnhCategory}
                onChange={(e) => setCnhCategory(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
              >
                <option>D (com EAR)</option>
                <option>E (com EAR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Número do Alvará DTP / Prefeitura de SP</label>
            <input
              type="text"
              value={dtpNumber}
              onChange={(e) => setDtpNumber(e.target.value)}
              className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
              required
            />
          </div>

          {/* Documents Checklist Status */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-[#5d6f80] uppercase">Documentos Requeridos:</div>

            <div className="p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0f7f8c]" />
                <div>
                  <span className="font-bold">1. CNH D com Exercício de Atividade Remunerada (EAR)</span>
                  <div className="text-[10px] text-[#5d6f80]">Exigência do Código de Trânsito Brasileiro</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#1b8a52] text-white px-2 py-0.5 rounded font-bold">Anexado</span>
            </div>

            <div className="p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0f7f8c]" />
                <div>
                  <span className="font-bold">2. Certificado de Curso Especializado de Condutor Escolar</span>
                  <div className="text-[10px] text-[#5d6f80]">Carga horária de 50 horas com atualização válida</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#1b8a52] text-white px-2 py-0.5 rounded font-bold">Anexado</span>
            </div>

            <div className="p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0f7f8c]" />
                <div>
                  <span className="font-bold">3. Laudo de Vistoria Semestral Obrigatória (DTP / Inmetro)</span>
                  <div className="text-[10px] text-[#5d6f80]">Checagem de cinto, tacógrafo e freios</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#1b8a52] text-white px-2 py-0.5 rounded font-bold">Anexado</span>
            </div>

            <div className="p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0f7f8c]" />
                <div>
                  <span className="font-bold">4. Seguro APP (Acidentes Pessoais a Passageiros)</span>
                  <div className="text-[10px] text-[#5d6f80]">Apólice ativa com cobertura mínima por passageiro</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#1b8a52] text-white px-2 py-0.5 rounded font-bold">Anexado</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#10263b] hover:bg-[#1a3854] text-white font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Upload className="w-4 h-4 text-[#ffc400]" />
            Enviar / Atualizar Documentos para Análise DTP
          </button>
        </form>
      </div>

      {/* Public Profile Settings */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-[#ffc400]" />
          Apresentação Pública & Dados do Condutor
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          {/* Driver Individual Photo */}
          <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] flex items-center gap-3">
            <img
              src={transporter.photoUrl}
              alt={transporter.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#ffc400] shadow-sm shrink-0"
            />
            <div className="flex-1 space-y-1">
              <label className="block font-bold text-xs text-[#10263b] dark:text-white">
                Fotografia Individual do Motorista
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  defaultValue={transporter.photoUrl}
                  placeholder="URL da sua foto de perfil..."
                  id="driver-avatar-input"
                  className="flex-1 p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('driver-avatar-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      onUpdateProfile({ photoUrl: input.value.trim() });
                      alert('Foto do motorista atualizada!');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] font-black rounded-lg text-xs cursor-pointer hover:brightness-110"
                >
                  Salvar Foto
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Apelido ou Como é Conhecido</label>
              <input
                type="text"
                defaultValue={transporter.nickname || transporter.name.split(' ')[0]}
                onChange={(e) => onUpdateProfile({ nickname: e.target.value })}
                placeholder="Ex: Tio João da Van"
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Telefone / WhatsApp de Contato</label>
              <input
                type="text"
                defaultValue={transporter.phone}
                onChange={(e) => onUpdateProfile({ phone: e.target.value })}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold mb-1">Modelo da Van</label>
              <input
                type="text"
                defaultValue={transporter.vanModel}
                onChange={(e) => onUpdateProfile({ vanModel: e.target.value })}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Placa Oficial</label>
              <input
                type="text"
                defaultValue={transporter.vanPlate}
                onChange={(e) => onUpdateProfile({ vanPlate: e.target.value })}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Lugares Disponíveis</label>
              <input
                type="number"
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Apresentação / Biografia Profissional</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
            />
          </div>

          {/* Vehicle Photos Gallery (Minimum 4 photos) */}
          <div className="space-y-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#10263b] dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#ffc400]" /> Galeria de Fotos do Veículo (Mínimo 4 fotos obrigatórias)
              </label>
              <span className={`text-[11px] font-black ${transporter.vanPhotos?.length >= 4 ? 'text-[#1b8a52]' : 'text-[#c93c3c]'}`}>
                {transporter.vanPhotos?.length || 0} de 4 fotos mínimas
              </span>
            </div>

            <p className="text-[11px] text-[#5d6f80]">
              Sugestão de fotos para aprovação DTP: 1. Frente com placa visível, 2. Lateral com faixa amarela 'ESCOLAR', 3. Bancos e cintos, 4. Painel e tacógrafo.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {transporter.vanPhotos?.map((photoUrl, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-4/3 bg-black border border-[#d6dee6] dark:border-[#26384a]">
                  <img src={photoUrl} alt={`Van Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const updatedPhotos = transporter.vanPhotos.filter((_, idx) => idx !== i);
                      onUpdateProfile({ vanPhotos: updatedPhotos });
                    }}
                    className="absolute top-1 right-1 bg-red-600/80 text-white p-1 rounded-full text-[10px] hover:bg-red-700 cursor-pointer"
                    title="Remover foto"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    Foto #{i + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="url"
                id="add-van-photo-input"
                placeholder="URL da nova foto do veículo..."
                className="flex-1 p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('add-van-photo-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const updated = [...(transporter.vanPhotos || []), input.value.trim()];
                    onUpdateProfile({ vanPhotos: updated });
                    input.value = '';
                  }
                }}
                className="px-3 py-2 bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] font-black rounded-xl text-xs hover:brightness-110 cursor-pointer"
              >
                + Adicionar Foto
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ffc400] text-[#10263b] font-black py-2.5 rounded-xl hover:brightness-105 transition shadow-xs cursor-pointer mt-2"
          >
            Salvar Alterações do Perfil Profissional
          </button>
        </form>
      </div>
    </div>
  );
};
