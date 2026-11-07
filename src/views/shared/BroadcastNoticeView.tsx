import React, { useState } from 'react';
import { BroadcastNotice, UserRole } from '../../types';
import {
  Bell,
  AlertTriangle,
  Megaphone,
  Plus,
  Clock,
  Sparkles,
  Calendar,
  Send
} from 'lucide-react';
import { notifier } from '../../services/notifications';

interface BroadcastNoticeViewProps {
  role: UserRole;
  notices: BroadcastNotice[];
  onSendNotice: (notice: Omit<BroadcastNotice, 'id' | 'createdAt'>) => void;
  transporterName?: string;
  transporterEmail?: string;
}

export const BroadcastNoticeView: React.FC<BroadcastNoticeViewProps> = ({
  role,
  notices,
  onSendNotice,
  transporterName = 'Transportador',
  transporterEmail = 'transporte@vanescolar.sp'
}) => {
  const [isSendOpen, setIsSendOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<BroadcastNotice['category']>('Atraso');
  const [message, setMessage] = useState<string>('');
  const [priority, setPriority] = useState<BroadcastNotice['priority']>('alta');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Preencha título e mensagem do comunicado.');
      return;
    }

    onSendNotice({
      transporterEmail,
      transporterName,
      category,
      title: title.trim(),
      message: message.trim(),
      priority
    });

    notifier.notify(
      `📢 Comunicado Escolar: ${title}`,
      { body: message },
      'alert'
    );

    setTitle('');
    setMessage('');
    setIsSendOpen(false);
  };

  const getCategoryBadge = (cat: BroadcastNotice['category']) => {
    switch (cat) {
      case 'Atraso':
        return <span className="bg-[#c93c3c] text-white text-[10px] font-black px-2 py-0.5 rounded-full">Atraso de Trânsito</span>;
      case 'Problema Mecânico':
        return <span className="bg-[#c93c3c] text-white text-[10px] font-black px-2 py-0.5 rounded-full">Problema Mecânico</span>;
      case 'Mudança de Horário':
        return <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-2 py-0.5 rounded-full">Mudança de Horário</span>;
      case 'Feriado':
        return <span className="bg-[#0f7f8c] text-white text-[10px] font-black px-2 py-0.5 rounded-full">Feriado / Recesso</span>;
      default:
        return <span className="bg-[#5d6f80] text-white text-[10px] font-black px-2 py-0.5 rounded-full">Comunicado Geral</span>;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            Mural de Comunicados Coletivos
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Avisos urgentes sobre trânsito, imprevistos e recessos escolares
          </p>
        </div>

        {role === 't' && (
          <button
            onClick={() => setIsSendOpen(true)}
            className="bg-[#10263b] dark:bg-[#ffc400] text-[#ffc400] dark:text-[#10263b] text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 hover:brightness-110 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Enviar Aviso
          </button>
        )}
      </div>

      {/* Notices Feed */}
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="bg-white dark:bg-[#16232f] p-8 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-center text-xs text-[#5d6f80]">
            Nenhum aviso transmitido nos últimos dias.
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border shadow-xs space-y-2.5 transition ${
                n.priority === 'urgente' || n.priority === 'alta'
                  ? 'bg-white dark:bg-[#16232f] border-l-4 border-l-[#c93c3c] border-[#d6dee6] dark:border-[#26384a]'
                  : 'bg-white dark:bg-[#16232f] border-[#d6dee6] dark:border-[#26384a]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getCategoryBadge(n.category)}
                  <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                    {n.title}
                  </h3>
                </div>
                <span className="text-[10px] text-[#5d6f80] shrink-0 font-medium">{n.createdAt}</span>
              </div>

              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
                {n.message}
              </p>

              <div className="text-[11px] text-[#0f7f8c] font-bold pt-1 border-t border-[#d6dee6] dark:border-[#26384a]">
                Transmitido por: <b>{n.transporterName}</b> (Notificação enviada a todos os pais)
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal to Broadcast Notice */}
      {isSendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-[#ffc400]" />
                Transmitir Comunicado a Todos os Pais
              </h3>
              <button onClick={() => setIsSendOpen(false)} className="text-[#5d6f80] font-black text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Motivo / Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                >
                  <option>Atraso</option>
                  <option>Mudança de Horário</option>
                  <option>Problema Mecânico</option>
                  <option>Alteração de Rota</option>
                  <option>Feriado</option>
                  <option>Geral</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Título do Alerta</label>
                <input
                  type="text"
                  placeholder="Ex: Trânsito intenso na Av. 23 de Maio (+15 min)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Mensagem para os Responsáveis</label>
                <textarea
                  rows={4}
                  placeholder="Descreva a situação, previsão de normalização e tranquilize os pais..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                <button
                  type="button"
                  onClick={() => setIsSendOpen(false)}
                  className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
