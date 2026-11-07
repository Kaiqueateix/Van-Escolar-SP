import React, { useState } from 'react';
import { User } from '../../types';
import { saveSupportTicketToFirestore } from '../../services/firebaseSyncService';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface SupportTicketItem {
  id: string;
  protocol: string;
  subject: string;
  category: string;
  message: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  createdAt: string;
}

interface SupportViewProps {
  currentUser: User;
  onBack?: () => void;
}

const FAQS = [
  {
    q: 'Como funciona a cobrança de juros e atraso na mensalidade?',
    a: 'Conforme as regras do aplicativo e o contrato de transporte, mensalidades atrasadas por mais de 7 dias recebem juros de 2% ao mês e multa moratória. Ao completar 30 dias de inadimplência sem acordo, o contrato pode ser rescindido e o débito notificado aos órgãos de proteção ao crédito (Serasa/SPC).'
  },
  {
    q: 'Como o transportador obtém o selo de Verificado DTP?',
    a: 'O transportador deve enviar a CNH com EAR, Certificado de Curso Especializado de Transporte Escolar, CRLV atualizado e o Certificado de Inspeção Semestral do DTP SP na aba Perfil. A aprovação é conferida pelo órgão regulador em até 48 horas úteis.'
  },
  {
    q: 'Como funciona a privacidade e o rastreamento GPS dos alunos?',
    a: 'O GPS só é transmitido enquanto o transportador estiver em trânsito com a viagem ativa. Fora do itinerário escolar, o compartilhamento é desligado automaticamente, em estrita conformidade com a LGPD e o Estatuto da Criança e do Adolescente.'
  },
  {
    q: 'Como cancelar ou alterar o plano de assinatura do transportador?',
    a: 'Na aba "Mais" > "Planos de Assinatura", você pode visualizar o plano ativo (Gratuito, Profissional ou Premium) e cancelar a qualquer momento sem multa de fidelidade. O acesso aos benefícios continua válido até o fim do ciclo mensal vigente.'
  },
  {
    q: 'O que fazer se a criança não for à escola em determinado dia?',
    a: 'O responsável pode avisar o motorista diretamente pelo chat ou marcar a ausência na aba Embarques. O transportador saberá com antecedência e não precisará desviar a rota até o portão.'
  }
];

export const SupportView: React.FC<SupportViewProps> = ({ currentUser, onBack }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [tickets, setTickets] = useState<SupportTicketItem[]>(() => {
    return [
      {
        id: 't_init_1',
        protocol: 'VESP-2026-8910',
        subject: 'Dúvida sobre credenciamento semestral',
        category: 'Regulamentação DTP',
        message: 'Gostaria de confirmar se a vistoria de março já é aceita no cadastro da plataforma.',
        status: 'resolvido',
        createdAt: '02/11/2026 14:30'
      }
    ];
  });

  // Ticket form
  const [subject, setSubject] = useState<string>('');
  const [category, setCategory] = useState<string>('Dúvida Geral');
  const [message, setMessage] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Preencha o assunto e a descrição do seu chamado.');
      return;
    }

    const newTicket: SupportTicketItem = {
      id: 'tick_' + Date.now().toString(36),
      protocol: `VESP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: 'aberto',
      createdAt: new Date().toLocaleString('pt-BR')
    };

    saveSupportTicketToFirestore({
      id: newTicket.id,
      userEmail: currentUser.email,
      userName: currentUser.n,
      subject: newTicket.subject,
      category: newTicket.category,
      message: newTicket.message,
      status: newTicket.status,
      createdAt: newTicket.createdAt,
      protocol: newTicket.protocol
    }).catch(err => console.warn('Deferred Firestore ticket save:', err));

    setTickets([newTicket, ...tickets]);
    setSubject('');
    setMessage('');
    setSuccessMsg(`Chamado ${newTicket.protocol} aberto com sucesso! Nossa equipe responderá em até 4 horas úteis.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#10263b] to-[#1c3044] text-white p-5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 bg-[#1c3044] hover:bg-[#26384a] text-[#ffc400] rounded-xl transition cursor-pointer mr-1"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-[#ffc400] text-[#10263b] flex items-center justify-center font-black">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                Central de Ajuda & Suporte Oficial
              </h2>
              <p className="text-xs text-[#93a5b5]">
                Atendimento exclusivo para transportadores, pais e instituições escolares
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Fast Channel */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <a
            href={`https://wa.me/5511999999999?text=${encodeURIComponent(
              `Olá! Sou ${currentUser.n} (${currentUser.role === 't' ? 'Transportador' : 'Responsável'}) e preciso de suporte com a plataforma Van Escolar SP.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-[#1b8a52] hover:bg-[#167043] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chamar Suporte no WhatsApp (Plantão)</span>
          </a>

          <a
            href="tel:1133967000"
            className="py-2.5 px-4 bg-[#26384a] hover:bg-[#344b61] text-[#ffc400] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Ouvidoria DTP: 156 / (11) 3396-7000</span>
          </a>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-3 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Open Ticket Form */}
      <form
        onSubmit={handleCreateTicket}
        className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3 text-xs text-[#10263b] dark:text-white"
      >
        <div className="flex items-center gap-2 border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
          <Mail className="w-4 h-4 text-[#ffc400]" />
          <h3 className="font-black text-sm">Abrir Novo Chamado de Suporte</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1">Categoria:</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
            >
              <option value="Dúvida Geral">Dúvida Geral</option>
              <option value="Financeiro & Mensalidades">Financeiro & Mensalidades</option>
              <option value="Regulamentação DTP & Vistoria">Regulamentação DTP & Vistoria</option>
              <option value="Rastreamento GPS & Rotas">Rastreamento GPS & Rotas</option>
              <option value="Contrato & Assinatura Digital">Contrato & Assinatura Digital</option>
              <option value="Planos & Pagamento">Planos & Assinatura do App</option>
              <option value="Reportar Problema Técnico">Reportar Problema Técnico</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Assunto Resumido:</label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Ex: Como validar comprovante de vistoria"
              className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">Mensagem / Detalhes:</label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Descreva detalhadamente o ocorrido para agilizar o atendimento..."
            className="w-full p-2.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822] text-xs font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" /> Enviar Chamado para a Equipe
        </button>
      </form>

      {/* Tickets History */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0f7f8c]" /> Meus Protocolos Anteriores
        </h3>

        <div className="space-y-2">
          {tickets.map(t => (
            <div
              key={t.id}
              className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-[#10263b] dark:text-white">
                  #{t.protocol}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    t.status === 'resolvido'
                      ? 'bg-[#1b8a52]/15 text-[#1b8a52]'
                      : t.status === 'em_atendimento'
                      ? 'bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400]'
                      : 'bg-[#0f7f8c]/15 text-[#0f7f8c]'
                  }`}
                >
                  {t.status === 'resolvido' ? 'Resolvido' : t.status === 'em_atendimento' ? 'Em Atendimento' : 'Aberto'}
                </span>
              </div>
              <div className="font-bold text-[#10263b] dark:text-white">{t.subject}</div>
              <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">{t.message}</p>
              <div className="text-[10px] text-[#5d6f80] pt-1 border-t border-[#d6dee6]/60 dark:border-[#26384a]/60">
                Criado em: {t.createdAt} · Categoria: {t.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive FAQ */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#ffc400]" /> Perguntas Frequentes (FAQ)
        </h3>

        <div className="space-y-2 text-xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3 bg-[#eef2f5] dark:bg-[#0e1822] text-left font-black text-[#10263b] dark:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#5d6f80] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#5d6f80] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-3 bg-white dark:bg-[#16232f] text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed border-t border-[#d6dee6] dark:border-[#26384a]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
