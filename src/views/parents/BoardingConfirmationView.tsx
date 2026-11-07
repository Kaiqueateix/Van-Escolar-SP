import React, { useState } from 'react';
import { Child, AuthorizedReceiver } from '../../types';
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Trash2,
  Phone,
  Clock,
  Home,
  School,
  CheckCircle,
  AlertCircle,
  Key,
  ShieldAlert
} from 'lucide-react';

interface BoardingConfirmationViewProps {
  child: Child;
  onUpdateChild: (updated: Child) => void;
}

export const BoardingConfirmationView: React.FC<BoardingConfirmationViewProps> = ({
  child,
  onUpdateChild
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverRelation, setReceiverRelation] = useState<string>('Avó');
  const [receiverDoc, setReceiverDoc] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');

  // Unaccompanied dropoff local states
  const [allowUnaccompanied, setAllowUnaccompanied] = useState<boolean>(
    !!child.allowUnaccompaniedDropoff
  );
  const [unaccompaniedNotes, setUnaccompaniedNotes] = useState<string>(
    child.unaccompaniedNotes || ''
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const receivers = child.authorizedReceivers || [];

  const handleAddReceiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim() || !receiverDoc.trim()) {
      alert('Preencha ao menos o nome completo e o documento (RG/CPF).');
      return;
    }

    const newReceiver: AuthorizedReceiver = {
      name: receiverName.trim(),
      relation: receiverRelation,
      document: receiverDoc.trim(),
      phone: receiverPhone.trim() || child.t
    };

    const updatedChild = {
      ...child,
      authorizedReceivers: [...receivers, newReceiver]
    };

    onUpdateChild(updatedChild);
    setReceiverName('');
    setReceiverDoc('');
    setReceiverPhone('');
    setIsAddModalOpen(false);
  };

  const handleRemoveReceiver = (idx: number) => {
    if (confirm('Deseja remover esta pessoa da lista de autorizados?')) {
      const updated = [...receivers];
      updated.splice(idx, 1);
      onUpdateChild({
        ...child,
        authorizedReceivers: updated
      });
    }
  };

  const handleSaveUnaccompaniedSettings = () => {
    const updatedChild: Child = {
      ...child,
      allowUnaccompaniedDropoff: allowUnaccompanied,
      unaccompaniedNotes: unaccompaniedNotes.trim()
    };
    onUpdateChild(updatedChild);
    setSaveSuccessMsg('Autorização de desembarque atualizada e informada ao transportador!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white">
          Embarques & Pessoas Autorizadas
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Acompanhamento seguro do dia e controle de entrega da criança
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Today's Checklist Card */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ffc400] text-[#10263b] flex items-center justify-center font-black">
              🎒
            </div>
            <div>
              <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                {child.n}
              </h3>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                {child.e} · {child.i} anos
              </p>
            </div>
          </div>
          <span className="text-xs bg-[#1b8a52]/10 text-[#1b8a52] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Monitoria Ativa
          </span>
        </div>

        {/* 4 Checkpoint steps for the day */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-[#5d6f80] dark:text-[#93a5b5] uppercase tracking-wider">
            Etapas de Confirmação de Hoje:
          </h4>

          {/* 1. Embarque Residência */}
          <div className="p-3 rounded-xl bg-[#1b8a52]/10 border border-[#1b8a52]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#1b8a52] text-white flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-[#1b8a52]">1. Embarque na Residência</div>
                <div className="text-[#5d6f80] dark:text-[#93a5b5] text-[11px]">
                  Confirmado às 07:35 por João Batista (Monitora: Cláudia)
                </div>
              </div>
            </div>
            <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              ✓ REALIZADO
            </span>
          </div>

          {/* 2. Chegada na Escola */}
          <div className="p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#0f7f8c] text-white flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-[#10263b] dark:text-white">2. Chegada à Escola</div>
                <div className="text-[#5d6f80] dark:text-[#93a5b5] text-[11px]">
                  Previsão de entrega no portão: 07:55
                </div>
              </div>
            </div>
            <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              EM TRÂNSITO
            </span>
          </div>

          {/* 3. Saída da Escola */}
          <div className="p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#5d6f80] text-white flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-[#10263b] dark:text-white">3. Saída da Escola (Retorno)</div>
                <div className="text-[#5d6f80] text-[11px]">
                  Horário previsto: 17:15
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#5d6f80]">
              Pendente
            </span>
          </div>

          {/* 4. Desembarque */}
          <div className="p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#5d6f80] text-white flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-[#10263b] dark:text-white">4. Desembarque na Residência</div>
                <div className="text-[#5d6f80] text-[11px]">
                  {child.allowUnaccompaniedDropoff
                    ? 'Autorizado desembarque desacompanhado conforme declaração abaixo'
                    : 'Entrega exclusiva a pessoa autorizada'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#5d6f80]">
              Pendente
            </span>
          </div>
        </div>
      </div>

      {/* AUTORIZAÇÃO DE DESEMBARQUE DESACOMPANHADO */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] rounded-xl shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                Autorização para Deixar Criança em Casa Sem Responsável
              </h3>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                Permitir que a criança entre em casa desacompanhada após o retorno escolar
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-3 text-xs">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allowUnaccompanied}
              onChange={(e) => setAllowUnaccompanied(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#ffc400] rounded-md focus:ring-[#ffc400]"
            />
            <div className="font-bold text-[#10263b] dark:text-white leading-snug">
              Eu, responsável legal por {child.n}, AUTORIZO expressamente o motorista e monitor da van escolar a realizar o desembarque na residência cadastrada ({child.d}) sem a presença obrigatória de um adulto para recebê-la no portão.
            </div>
          </label>

          {allowUnaccompanied && (
            <div className="space-y-2 pt-1 border-t border-[#d6dee6] dark:border-[#26384a]">
              <div className="flex items-center gap-1.5 text-[#c93c3c] font-black text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                Instruções de Acesso da Criança (Portaria / Chaves / Senha):
              </div>
              <input
                type="text"
                value={unaccompaniedNotes}
                onChange={(e) => setUnaccompaniedNotes(e.target.value)}
                placeholder="Ex: A criança possui a chave de casa na mochila e entra pelo portão social"
                className="w-full p-2.5 bg-white dark:bg-[#16232f] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs font-medium focus:outline-[#ffc400]"
              />
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveUnaccompaniedSettings}
              className="bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] font-black text-xs px-4 py-2 rounded-xl transition shadow-xs"
            >
              Salvar Termo de Autorização
            </button>
          </div>
        </div>
      </div>

      {/* Authorized Receivers Management Card */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#ffc400]" />
              Pessoas Autorizadas a Receber a Criança
            </h3>
            <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
              Documentos de familiares e terceiros autorizados a receber no portão
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#10263b] dark:bg-[#ffc400] text-[#ffc400] dark:text-[#10263b] text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 hover:brightness-110 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        <div className="space-y-2">
          {receivers.length === 0 ? (
            <div className="p-4 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl text-center text-xs text-[#5d6f80]">
              Nenhuma pessoa autorizada além dos pais. Toque em "+ Adicionar".
            </div>
          ) : (
            receivers.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-[#10263b] dark:text-white">
                      {rec.name}
                    </span>
                    <span className="text-[10px] bg-[#ffc400] text-[#10263b] px-1.5 py-0.2 rounded font-black">
                      {rec.relation}
                    </span>
                    {rec.isPrimary && (
                      <span className="text-[10px] bg-[#1b8a52] text-white px-1.5 py-0.2 rounded font-bold">
                        Titular
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                    Doc: <b>{rec.document}</b> · Tel: <a href={`tel:${rec.phone.replace(/\D/g, '')}`} className="text-[#0f7f8c] font-bold">{rec.phone}</a>
                  </div>
                </div>

                {!rec.isPrimary && (
                  <button
                    onClick={() => handleRemoveReceiver(idx)}
                    className="p-1.5 text-[#c93c3c] hover:bg-[#c93c3c]/10 rounded-lg transition"
                    title="Remover autorização"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal to Add Authorized Receiver */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base">Nova Pessoa Autorizada</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#5d6f80] font-black text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReceiver} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Ex: Neuza Ferreira Martins"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Grau de Parentesco / Vínculo</label>
                  <select
                    value={receiverRelation}
                    onChange={(e) => setReceiverRelation(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                  >
                    <option>Avó</option>
                    <option>Avô</option>
                    <option>Tia / Tio</option>
                    <option>Irmão(ã) Mais Velho(a)</option>
                    <option>Babá / Cuidador</option>
                    <option>Vizinho(a) Autorizado</option>
                    <option>Porteiro do Prédio</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Documento (RG ou CPF)</label>
                  <input
                    type="text"
                    value={receiverDoc}
                    onChange={(e) => setReceiverDoc(e.target.value)}
                    placeholder="Ex: RG 22.333.444-5"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="(11) 97777-6666"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105"
                >
                  Confirmar Autorização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
