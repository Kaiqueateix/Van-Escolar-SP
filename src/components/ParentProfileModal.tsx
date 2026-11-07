import React from 'react';
import { ParentReviewByTransporter } from '../types';
import {
  User,
  Star,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  X,
  Award,
  AlertCircle
} from 'lucide-react';

interface ParentProfileModalProps {
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  childName?: string;
  schoolName?: string;
  address?: string;
  reviews?: ParentReviewByTransporter[];
  onClose: () => void;
  onOpenChat?: (email: string, name: string) => void;
  onRateParent?: () => void;
}

export const ParentProfileModal: React.FC<ParentProfileModalProps> = ({
  parentName,
  parentEmail,
  parentPhone = '(11) 98811-2233',
  childName,
  schoolName,
  address,
  reviews = [],
  onClose,
  onOpenChat,
  onRateParent
}) => {
  const DEFAULT_PARENT_REVIEWS: ParentReviewByTransporter[] = [
    {
      id: 'prev_default1',
      transporterEmail: 'joao.batista@vanescolar.sp',
      transporterName: 'João Batista de Oliveira',
      parentEmail: parentEmail || 'marta.almeida@gmail.com',
      parentName: parentName || 'Marta Almeida',
      punctualityRating: 5,
      paymentRating: 5,
      communicationRating: 5,
      rating: 5,
      comment: 'Família exemplar! Criança sempre pontual no portão e pagamento das mensalidades rigorosamente em dia.',
      date: '10/10/2026',
      status: 'aprovado'
    },
    {
      id: 'prev_default2',
      transporterEmail: 'carlos.eduardo@vanescolar.sp',
      transporterName: 'Carlos Eduardo Santos',
      parentEmail: parentEmail || 'marta.almeida@gmail.com',
      parentName: parentName || 'Marta Almeida',
      punctualityRating: 5,
      paymentRating: 5,
      communicationRating: 5,
      rating: 5,
      comment: 'Excelente comunicação. Avisa com antecedência sobre eventuais faltas ou trocas de horário.',
      date: '24/09/2026',
      status: 'aprovado'
    }
  ];

  const matchingReviews = reviews.filter(
    r =>
      (parentEmail && r.parentEmail.toLowerCase() === parentEmail.toLowerCase()) ||
      r.parentName.toLowerCase() === parentName.toLowerCase()
  );

  const approvedReviews = matchingReviews.filter(r => r.status === 'aprovado' || !r.status).length > 0
    ? matchingReviews.filter(r => r.status === 'aprovado' || !r.status)
    : DEFAULT_PARENT_REVIEWS;

  // Compute average metrics
  const totalCount = approvedReviews.length;
  const avgOverall =
    totalCount > 0
      ? (
          approvedReviews.reduce(
            (acc, r) =>
              acc +
              (r.rating ??
                ((r.punctualityRating || 5) + (r.paymentRating || 5) + (r.communicationRating || 5)) / 3),
            0
          ) / totalCount
        ).toFixed(1)
      : '5.0';

  const avgPunctuality =
    totalCount > 0
      ? (approvedReviews.reduce((acc, r) => acc + (r.punctualityRating || r.punctualityScore || 5), 0) / totalCount).toFixed(1)
      : '5.0';

  const avgPayment =
    totalCount > 0
      ? (approvedReviews.reduce((acc, r) => acc + (r.paymentRating || r.paymentScore || 5), 0) / totalCount).toFixed(1)
      : '5.0';

  const avgCommunication =
    totalCount > 0
      ? (approvedReviews.reduce((acc, r) => acc + (r.communicationRating || r.communicationScore || 5), 0) / totalCount).toFixed(1)
      : '5.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-3xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden transform transition-all my-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#10263b] via-[#1c3044] to-[#26384a] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffc400] to-[#e6b000] text-[#10263b] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
              {parentName.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Responsável Verificado
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white mt-1">
                {parentName}
              </h3>
              <p className="text-xs text-[#93a5b5] font-medium">
                {parentEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Main Reputational Score Box */}
          <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#5d6f80] dark:text-[#93a5b5]">
                Reputação na Comunidade de Motoristas
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-[#10263b] dark:text-white">
                  {avgOverall}
                </span>
                <div className="flex items-center text-[#ffc400]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-[#ffc400]" />
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-0.5 font-semibold">
                {totalCount > 0 ? `${totalCount} avaliações de transportadores credenciados` : 'Excelente histórico de pontualidade'}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block p-2 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] rounded-xl font-black text-xs">
                Selo Família Nota 10 🌟
              </span>
            </div>
          </div>

          {/* Breakdown Ratings */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
              <Clock className="w-4 h-4 text-[#0f7f8c] mx-auto mb-1" />
              <div className="text-[10px] text-[#5d6f80]">Pontualidade</div>
              <div className="font-black text-sm text-[#10263b] dark:text-white mt-0.5">
                {avgPunctuality} ★
              </div>
            </div>

            <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
              <DollarSign className="w-4 h-4 text-[#1b8a52] mx-auto mb-1" />
              <div className="text-[10px] text-[#5d6f80]">Pagamento</div>
              <div className="font-black text-sm text-[#10263b] dark:text-white mt-0.5">
                {avgPayment} ★
              </div>
            </div>

            <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a]">
              <MessageSquare className="w-4 h-4 text-[#ffc400] mx-auto mb-1" />
              <div className="text-[10px] text-[#5d6f80]">Comunicação</div>
              <div className="font-black text-sm text-[#10263b] dark:text-white mt-0.5">
                {avgCommunication} ★
              </div>
            </div>
          </div>

          {/* Student details if available */}
          {(childName || schoolName || address) && (
            <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-xs space-y-1.5">
              <div className="font-extrabold text-[#10263b] dark:text-white uppercase text-[10px] tracking-wider text-[#0f7f8c]">
                Informações do Transporte Escolar:
              </div>
              {childName && (
                <div>
                  <span className="text-[#5d6f80]">Aluno(a): </span>
                  <b className="text-[#10263b] dark:text-white">{childName}</b>
                </div>
              )}
              {schoolName && (
                <div>
                  <span className="text-[#5d6f80]">Escola: </span>
                  <b className="text-[#10263b] dark:text-white">{schoolName}</b>
                </div>
              )}
              {address && (
                <div>
                  <span className="text-[#5d6f80]">Endereço de Embarque: </span>
                  <span className="font-medium text-[#10263b] dark:text-white">{address}</span>
                </div>
              )}
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-[#10263b] dark:text-white flex items-center justify-between">
              <span>Avaliações de Transportadores ({approvedReviews.length})</span>
              {onRateParent && (
                <button
                  type="button"
                  onClick={onRateParent}
                  className="text-[11px] text-[#0f7f8c] dark:text-[#4cc3d1] font-bold hover:underline"
                >
                  + Avaliar Responsável
                </button>
              )}
            </h4>

            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {approvedReviews.length === 0 ? (
                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-xl text-center text-xs text-[#5d6f80]">
                  Nenhum transportador registrou avaliações para este responsável ainda. Família com excelente histórico inicial!
                </div>
              ) : (
                approvedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#10263b] dark:text-white">{rev.transporterName || 'Motorista Credenciado'}</span>
                      <span className="text-[#ffc400] font-black">{rev.rating || 5} ★</span>
                    </div>
                    <p className="text-[#5d6f80] dark:text-[#93a5b5] text-[11px] italic">
                      "{rev.comment}"
                    </p>
                    {rev.date && (
                      <div className="text-[9px] text-[#5d6f80] text-right">{rev.date}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
            {onOpenChat ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChat(parentEmail, parentName);
                  onClose();
                }}
                className="py-3 px-3 bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#ffc400]" />
                <span>Conversar no Chat</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-3 bg-[#eef2f5] dark:bg-[#0e1822] text-[#10263b] dark:text-white font-extrabold text-xs rounded-xl"
              >
                Fechar
              </button>
            )}

            <a
              href={`tel:${parentPhone.replace(/\D/g, '')}`}
              className="py-3 px-3 bg-[#1b8a52] hover:bg-[#167043] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>Ligar p/ Responsável</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
