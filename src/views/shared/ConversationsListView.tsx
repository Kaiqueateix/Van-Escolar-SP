import React, { useState } from 'react';
import { User, ContractProposal } from '../../types';
import {
  MessageSquare,
  Search,
  FileCheck,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCheck,
  Plus,
  UserCheck
} from 'lucide-react';

export interface ChatConversationItem {
  id: string; // chatKey or email
  partnerName: string;
  partnerEmail: string;
  partnerPhone?: string;
  partnerRole: 'c' | 't';
  childName?: string;
  schoolName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  contract?: ContractProposal | null;
}

interface ConversationsListViewProps {
  currentUser: User;
  conversations: ChatConversationItem[];
  onSelectConversation: (convo: ChatConversationItem) => void;
  onNewChat?: () => void;
}

export const ConversationsListView: React.FC<ConversationsListViewProps> = ({
  currentUser,
  conversations,
  onSelectConversation,
  onNewChat
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = conversations.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.partnerName.toLowerCase().includes(q) ||
      (c.childName && c.childName.toLowerCase().includes(q)) ||
      (c.schoolName && c.schoolName.toLowerCase().includes(q)) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3 pb-20">
      {/* WhatsApp Header Bar */}
      <div className="bg-[#10263b] text-white p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ffc400] text-[#10263b] flex items-center justify-center font-black shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
                Conversas com Famílias & Contratos
              </h2>
              <p className="text-xs text-[#93a5b5]">
                {currentUser.role === 't' ? 'Atendimento aos pais e propostas de transporte' : 'Chat direto com os transportadores'}
              </p>
            </div>
          </div>

          <span className="bg-[#ffc400] text-[#10263b] font-black text-xs px-2.5 py-0.5 rounded-full">
            {conversations.length} conversas
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#93a5b5] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da família, aluno ou escola..."
            className="w-full pl-9 pr-3 py-2 bg-[#1c3044] text-white placeholder-[#93a5b5] rounded-xl text-xs font-bold border border-[#2e4760] focus:border-[#ffc400] focus:outline-none"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#5d6f80] mx-auto opacity-50" />
            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-xs text-[#5d6f80]">
              As conversas iniciadas com pais e transportadores aparecerão aqui.
            </p>
          </div>
        ) : (
          filtered.map(convo => {
            const hasContract = Boolean(convo.contract);
            const isSigned = convo.contract?.status === 'assinado_ativo';

            return (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo)}
                className="w-full p-3.5 bg-white dark:bg-[#16232f] hover:bg-[#f8fafc] dark:hover:bg-[#1c2c3b] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10263b] to-[#1c3044] text-[#ffc400] flex items-center justify-center font-black text-base shadow-inner">
                      {convo.partnerName.slice(0, 2).toUpperCase()}
                    </div>
                    {isSigned && (
                      <span
                        title="Contrato Assinado Ativo"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1b8a52] text-white flex items-center justify-center text-[10px] shadow-xs"
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="font-extrabold text-sm text-[#10263b] dark:text-white truncate">
                        {convo.partnerName}
                      </h3>
                      <span className="text-[10px] text-[#5d6f80] shrink-0 font-medium">
                        {convo.lastMessageTime}
                      </span>
                    </div>

                    {/* Child Tag */}
                    {convo.childName && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0f7f8c] dark:text-[#4cc3d1] mb-1 truncate">
                        <span className="bg-[#0f7f8c]/15 px-1.5 py-0.2 rounded-md">
                          🎒 Aluno: {convo.childName}
                        </span>
                        {convo.schoolName && (
                          <span className="text-[#5d6f80] truncate">· {convo.schoolName}</span>
                        )}
                      </div>
                    )}

                    {/* Last message preview */}
                    <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] truncate flex items-center gap-1 font-medium">
                      <CheckCheck className="w-3.5 h-3.5 text-[#1b8a52] shrink-0" />
                      <span>{convo.lastMessage}</span>
                    </p>
                  </div>
                </div>

                {/* Right badges */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                  {convo.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#1b8a52] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {convo.unreadCount}
                    </span>
                  )}

                  {hasContract && (
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 ${
                        isSigned
                          ? 'bg-[#1b8a52]/15 text-[#1b8a52]'
                          : 'bg-[#ffc400]/25 text-[#10263b] dark:text-[#ffc400]'
                      }`}
                    >
                      <FileCheck className="w-2.5 h-2.5" />
                      {isSigned ? 'Contrato Ativo' : 'Proposta'}
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-[#5d6f80] group-hover:text-[#ffc400] transition" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
