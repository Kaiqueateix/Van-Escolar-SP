import React, { useState, useRef, useEffect } from 'react';
import { ChatMsg, User, ContractProposal } from '../../types';
import { DEFAULT_CONTRACT_CLAUSES } from '../../constants';
import {
  Send,
  Image,
  CheckCheck,
  Phone,
  FileSignature,
  FileText,
  CheckCircle2,
  X,
  ShieldCheck,
  Clock,
  Calendar,
  AlertTriangle,
  Download,
  Eye,
  XCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { notifier } from '../../services/notifications';

interface ChatViewProps {
  chatId: string;
  chatPartnerName: string;
  chatPartnerRole: string;
  currentUser: User;
  messages: ChatMsg[];
  contracts?: ContractProposal[];
  onSendMessage: (text: string, imageUrl?: string, contractProposalId?: string) => void;
  onCreateContract?: (contract: Omit<ContractProposal, 'id' | 'createdAt' | 'status'>) => string;
  onSignContract?: (contractId: string, signerName: string, cpf: string) => void;
  onRejectContract?: (contractId: string, reason: string) => void;
  onBack?: () => void;
  phoneToCall?: string;
  defaultChildName?: string;
  defaultSchoolName?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatId,
  chatPartnerName,
  chatPartnerRole,
  currentUser,
  messages,
  contracts = [],
  onSendMessage,
  onCreateContract,
  onSignContract,
  onRejectContract,
  onBack,
  phoneToCall,
  defaultChildName = 'Lucas Almeida',
  defaultSchoolName = 'EMEF Santa Rita'
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contract builder modal state (Transporter)
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [contractChildName, setContractChildName] = useState<string>(defaultChildName);
  const [contractSchoolName, setContractSchoolName] = useState<string>(defaultSchoolName);
  const [contractChildGrade, setContractChildGrade] = useState<string>('3º Ano Fundamental');
  const [contractPickupAddress, setContractPickupAddress] = useState<string>('Rua das Acácias, 120 - Jabaquara');
  const [contractDropoffAddress, setContractDropoffAddress] = useState<string>('Rua das Acácias, 120 - Jabaquara');
  const [contractValue, setContractValue] = useState<string>('420');
  const [contractDueDay, setContractDueDay] = useState<number>(10);
  const [contractPeriod, setContractPeriod] = useState<'Manhã' | 'Tarde' | 'Integral'>('Manhã');
  const [contractEntryTime, setContractEntryTime] = useState<string>('07:30');
  const [contractExitTime, setContractExitTime] = useState<string>('12:15');
  const [contractTermMonths, setContractTermMonths] = useState<number>(12);
  const [contractStartDate, setContractStartDate] = useState<string>('01/02/2026');

  // Sign contract modal state (Parent)
  const [contractToSign, setContractToSign] = useState<ContractProposal | null>(null);
  const [signerName, setSignerName] = useState<string>(currentUser.n);
  const [signerCpf, setSignerCpf] = useState<string>(currentUser.cpfCnpj || '349.201.884-12');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);

  // Contract detail preview
  const [contractToView, setContractToView] = useState<ContractProposal | null>(null);

  const QUICK_REPLIES =
    currentUser.role === 't'
      ? [
          '📄 Olá! Vou preparar nossa proposta de contrato com as 16 cláusulas acordadas.',
          '🎒 A rota passa exatamente no seu endereço por volta das 07:15.',
          '🚐 Temos vaga aberta para o turno da manhã.',
          '✓ Contrato recebido e validado com sucesso!'
        ]
      : [
          'Olá! Gostaria de saber sobre vagas para meu filho neste semestre.',
          'Qual o valor acordado para o período da manhã?',
          '✓ Analisei e assinei o contrato digitalmente pelo app!',
          'Poderia me confirmar o horário exato de embarque no portão?'
        ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text && !selectedImage) return;

    onSendMessage(text, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    notifier.playChime('boarding');
  };

  const handleCreateContractProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(contractValue.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor de mensalidade válido.');
      return;
    }

    const newContractId = onCreateContract
      ? onCreateContract({
          transporterEmail: currentUser.email,
          transporterName: currentUser.n,
          transporterCpfCnpj: currentUser.cpfCnpj || '18.490.231/0001-44',
          transporterPhone: currentUser.phone || '(11) 98122-3344',
          parentEmail: 'marta.almeida@gmail.com',
          parentName: chatPartnerName,
          parentCpf: '349.201.884-12',
          parentPhone: '(11) 98811-2233',
          childName: contractChildName.trim(),
          childGrade: contractChildGrade,
          schoolName: contractSchoolName.trim(),
          pickupAddress: contractPickupAddress.trim(),
          dropoffAddress: contractDropoffAddress.trim() || contractPickupAddress.trim(),
          agreedMonthlyValue: val,
          paymentDueDay: Number(contractDueDay) || 10,
          period: contractPeriod,
          entryTime: contractEntryTime,
          exitTime: contractExitTime,
          contractTermMonths: Number(contractTermMonths) || 12,
          startDate: contractStartDate,
          clauses: DEFAULT_CONTRACT_CLAUSES
        })
      : 'ct_' + Date.now();

    onSendMessage(
      `📄 Proposta de Contrato Digital enviada para ${contractChildName}. Valor acordado: R$ ${val.toFixed(2).replace('.', ',')}/mês (Vencimento todo dia ${contractDueDay}). Por favor, examine as cláusulas e assine digitalmente.`,
      undefined,
      newContractId
    );

    setIsContractModalOpen(false);
  };

  const handleConfirmSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractToSign) return;
    if (!signerName.trim() || signerCpf.replace(/\D/g, '').length < 11) {
      alert('Preencha seu nome completo e um CPF válido para assinar digitalmente.');
      return;
    }
    if (!acceptTerms) {
      alert('Você deve aceitar as cláusulas do contrato para prosseguir.');
      return;
    }

    if (onSignContract) {
      onSignContract(contractToSign.id, signerName.trim(), signerCpf.trim());
    }
    onSendMessage(
      `✍️ Contrato assinado digitalmente por ${signerName.trim()} (CPF ${signerCpf.trim()}) com registro de data/hora e IP. O serviço está formalmente ativo e arquivado no DTP!`
    );

    setContractToSign(null);
    notifier.playChime('arrival');
  };

  const handleRefuseContract = (contractId: string) => {
    const reason = prompt('Informe o motivo da recusa ou alteração desejada:');
    if (!reason) return;
    if (onRejectContract) {
      onRejectContract(contractId, reason);
    }
    onSendMessage(`❌ Proposta de contrato recusada pelo responsável. Motivo: ${reason}`);
    setContractToSign(null);
  };

  return (
    <div className="flex flex-col h-[78vh] bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs overflow-hidden pb-2">
      {/* Header */}
      <div className="bg-[#10263b] text-white p-3 flex items-center justify-between border-b border-[#26384a]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 bg-[#1c3044] hover:bg-[#27425d] text-[#ffc400] rounded-xl transition cursor-pointer mr-0.5"
              title="Voltar para lista de conversas"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-[#ffc400] text-[#10263b] flex items-center justify-center font-bold text-base">
            💬
          </div>
          <div>
            <h3 className="font-extrabold text-sm">{chatPartnerName}</h3>
            <span className="text-[11px] text-[#93a5b5] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1b8a52]" /> {chatPartnerRole} · Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 't' && (
            <button
              onClick={() => setIsContractModalOpen(true)}
              className="bg-[#ffc400] text-[#10263b] text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:brightness-105 shadow-xs cursor-pointer"
              title="Gerar proposta de contrato SmartVan"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Gerar Contrato</span>
            </button>
          )}

          {phoneToCall && (
            <a
              href={`tel:${phoneToCall.replace(/\D/g, '')}`}
              className="p-2 bg-[#26384a] hover:bg-[#344b61] rounded-xl text-[#ffc400] transition cursor-pointer"
              title="Ligar agora"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Quick Replies Carousel */}
      <div className="bg-[#f8fafc] dark:bg-[#0e1822] px-3 py-2 border-b border-[#d6dee6] dark:border-[#26384a] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[10px] font-bold text-[#5d6f80] shrink-0">Respostas rápidas:</span>
        {QUICK_REPLIES.map((qr, i) => (
          <button
            key={i}
            onClick={() => handleSend(qr)}
            className="bg-white dark:bg-[#16232f] hover:bg-[#ffc400] hover:text-[#10263b] text-[#10263b] dark:text-[#eaf0f5] border border-[#d6dee6] dark:border-[#26384a] px-2.5 py-1 rounded-full shrink-0 font-medium transition text-[11px] cursor-pointer"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Contract Proposal Bar (Transporter Only) */}
      {currentUser.role === 't' && (
        <div className="bg-[#10263b] text-white px-3.5 py-2.5 border-b border-[#26384a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#ffc400] text-[#10263b] rounded-lg font-black">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white block text-xs">Proposta & Contrato Digital SmartVan</span>
              <span className="text-[10px] text-[#93a5b5]">Aluno: <b>{defaultChildName}</b> · Escola: <b>{defaultSchoolName}</b></span>
            </div>
          </div>
          <button
            onClick={() => setIsContractModalOpen(true)}
            className="bg-[#ffc400] text-[#10263b] font-black text-xs px-3 py-1.5 rounded-lg hover:brightness-105 transition cursor-pointer shrink-0 shadow-xs"
          >
            Criar Proposta de Contrato
          </button>
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#f8fafc]/50 dark:bg-[#0e1822]/40">
        {messages.map((m, idx) => {
          const isMe = m.f === 'me';
          // Find attached contract proposal or fallback to existing active contract for this conversation
          const attachedContract = m.contractProposalId
            ? contracts.find((c) => c.id === m.contractProposalId)
            : (idx === 0 && contracts.length > 0) ? contracts[0] : null;

          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-xs space-y-2 ${
                  isMe
                    ? 'bg-[#ffc400] text-[#10263b] rounded-tr-xs'
                    : 'bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] border border-[#d6dee6] dark:border-[#26384a] rounded-tl-xs'
                }`}
              >
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt="Anexo"
                    className="w-full max-h-48 rounded-xl object-cover border border-black/10"
                  />
                )}

                <div className="leading-relaxed font-medium">{m.x}</div>

                {/* Interactive Contract Proposal Card */}
                {attachedContract && (
                  <div className="bg-[#10263b] text-white p-3.5 rounded-xl border border-[#26384a] space-y-2 mt-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#ffc400]" />
                        <div>
                          <h4 className="font-extrabold text-xs text-white">Contrato de Transporte Escolar</h4>
                          <span className="text-[10px] text-[#93a5b5] font-mono">DTP SP & SmartVan</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          attachedContract.status === 'assinado_ativo'
                            ? 'bg-[#1b8a52] text-white'
                            : attachedContract.status === 'cancelado' || attachedContract.status === 'recusado'
                            ? 'bg-[#c93c3c] text-white'
                            : 'bg-[#ffc400] text-[#10263b]'
                        }`}
                      >
                        {attachedContract.status === 'assinado_ativo'
                          ? '✓ ASSINADO & ATIVO'
                          : attachedContract.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-[#0e1822] p-2.5 rounded-lg text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#93a5b5]">Aluno(a):</span>
                        <b>{attachedContract.childName}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#93a5b5]">Escola:</span>
                        <b>{attachedContract.schoolName}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#93a5b5]">Período:</span>
                        <b>{attachedContract.period} ({attachedContract.entryTime || '07:30'} às {attachedContract.exitTime || '12:15'})</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#93a5b5]">Valor Acordado:</span>
                        <b className="text-[#ffc400] text-xs">
                          R$ {attachedContract.agreedMonthlyValue.toFixed(2).replace('.', ',')} / mês (Venc. Dia {attachedContract.paymentDueDay || 10})
                        </b>
                      </div>
                    </div>

                    {attachedContract.status === 'assinado_ativo' && (
                      <div className="p-2 bg-[#1b8a52]/20 border border-[#1b8a52]/40 rounded-lg text-[10px] text-[#22c55e] flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Selo VESP-AUTH: Contrato Digital Registrado com Assinatura Eletrônica e Carimbo DTP/SP</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => setContractToView(attachedContract)}
                        className="flex-1 bg-[#16232f] hover:bg-[#26384a] text-white text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-[#26384a]"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Cláusulas
                      </button>

                      <button
                        onClick={() => setContractToSign(attachedContract)}
                        className="flex-1 bg-[#ffc400] hover:brightness-105 text-[#10263b] font-black py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
                      >
                        <FileSignature className="w-3.5 h-3.5" /> Assinar Contrato
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right flex items-center justify-end gap-1 ${
                    isMe ? 'text-[#10263b]/70 font-bold' : 'text-[#5d6f80]'
                  }`}
                >
                  <span>{m.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-[#10263b]" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div className="p-3 bg-white dark:bg-[#16232f] border-t border-[#d6dee6] dark:border-[#26384a] flex items-center gap-2">
        <input
          type="text"
          placeholder="Negocie os detalhes, horários e valores..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] text-xs rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
        />

        <button
          onClick={() => handleSend()}
          className="p-2.5 bg-[#ffc400] text-[#10263b] rounded-xl hover:brightness-105 active:scale-95 transition shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL 1: TRANSPORTER CREATES COMPLETE SMARTVAN CONTRACT */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#ffc400]" />
                <h3 className="font-black text-base">Gerador de Contrato Digital Completo</h3>
              </div>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContractProposal} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Nome da Criança *</label>
                  <input
                    type="text"
                    value={contractChildName}
                    onChange={(e) => setContractChildName(e.target.value)}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Escola de Destino *</label>
                  <input
                    type="text"
                    value={contractSchoolName}
                    onChange={(e) => setContractSchoolName(e.target.value)}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Endereço de Embarque *</label>
                  <input
                    type="text"
                    value={contractPickupAddress}
                    onChange={(e) => setContractPickupAddress(e.target.value)}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Endereço de Desembarque</label>
                  <input
                    type="text"
                    value={contractDropoffAddress}
                    onChange={(e) => setContractDropoffAddress(e.target.value)}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Dia do Vencimento</label>
                  <select
                    value={contractDueDay}
                    onChange={(e) => setContractDueDay(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                  >
                    <option value={5}>Todo dia 5</option>
                    <option value={10}>Todo dia 10</option>
                    <option value={15}>Todo dia 15</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Turno</label>
                  <select
                    value={contractPeriod}
                    onChange={(e) => setContractPeriod(e.target.value as any)}
                    className="w-full p-2 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                  >
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Integral</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-1 text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
                <div className="font-bold text-[#10263b] dark:text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1b8a52]" /> Cláusulas Contratuais Inclusas (16 Artigos SmartVan):
                </div>
                <p>• Tolerância improrrogável de 3 minutos de embarque.</p>
                <p>• Juros de mora de 1% e multa de 2% após 7 dias de atraso.</p>
                <p>• Rescisão automática e negativação Serasa/SPC após 30 dias de inadimplência.</p>
                <p>• Seguro APP obrigatório e vistoria semestral DTP.</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105 cursor-pointer shadow-md"
                >
                  Enviar Proposta Contratual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PARENT DIGITAL SIGNATURE & ACCEPTANCE */}
      {contractToSign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#1b8a52]" />
                <h3 className="font-black text-base">Assinatura Digital de Contrato</h3>
              </div>
              <button
                onClick={() => setContractToSign(null)}
                className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5d6f80]">Transportador:</span>
                <b>{contractToSign.transporterName}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5d6f80]">Aluno:</span>
                <b>{contractToSign.childName}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5d6f80]">Escola e Turno:</span>
                <b>{contractToSign.schoolName} ({contractToSign.period})</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5d6f80]">Mensalidade:</span>
                <b className="text-[#1b8a52] text-sm">
                  R$ {contractToSign.agreedMonthlyValue.toFixed(2).replace('.', ',')} / mês (Venc. Dia {contractToSign.paymentDueDay || 10})
                </b>
              </div>
            </div>

            {/* Delinquency & Serasa Clause */}
            <div className="p-3 bg-[#c93c3c]/10 border border-[#c93c3c]/30 rounded-xl space-y-1 text-[11px] text-[#10263b] dark:text-[#f87171]">
              <div className="font-black flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#c93c3c]" />
                Cláusula 7ª - Inadimplência e Serasa:
              </div>
              <p>• O atraso superior a 7 dias incorrerá em multa moratória de 2% e juros de 1% ao mês.</p>
              <p>• <b>O atraso superior a 30 dias</b> cancela de pleno direito o transporte escolar, bloqueia o cadastro e autoriza o envio do débito para inclusão nos órgãos de proteção ao crédito (Serasa/SPC).</p>
            </div>

            <form onSubmit={handleConfirmSignature} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Nome Completo do Responsável Legal</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">CPF do Titular</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={signerCpf}
                  onChange={(e) => setSignerCpf(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border font-mono font-bold"
                  required
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer font-bold pt-1">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#1b8a52]"
                  required
                />
                <span>
                  Declaro que li e concordo integralmente com todas as 16 cláusulas deste contrato de transporte escolar, autorizando a emissão com carimbo eletrônico de data e hora.
                </span>
              </label>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => handleRefuseContract(contractToSign.id)}
                  className="py-2.5 px-3 bg-[#fef2f2] text-[#c93c3c] border border-[#fecaca] rounded-xl font-bold cursor-pointer hover:bg-[#fee2e2]"
                >
                  Recusar Proposta
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1b8a52] text-white font-black rounded-xl hover:brightness-105 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSignature className="w-4 h-4" />
                  Assinar Digitalmente e Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW COMPLETE CONTRACT CLAUSES */}
      {contractToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-xl rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#ffc400]" />
                Instrumento Contratual Completo #{contractToView.id}
              </h3>
              <button
                onClick={() => setContractToView(null)}
                className="text-[#5d6f80] hover:text-black font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border max-h-80 overflow-y-auto text-[11px] leading-relaxed">
              {contractToView.clauses?.map((clause, idx) => (
                <p key={idx} className="text-[#334155] dark:text-[#cbd5e1]">{clause}</p>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-[#ffc400] text-[#10263b] font-black rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Baixar Cópia
              </button>
              <button
                onClick={() => setContractToView(null)}
                className="px-3 py-2 bg-[#e2e8f0] dark:bg-[#26384a] rounded-xl font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
