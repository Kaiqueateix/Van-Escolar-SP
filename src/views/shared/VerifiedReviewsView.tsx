import React, { useState } from 'react';
import { VerifiedReview, TransporterProfile } from '../../types';
import { Star, ShieldCheck, MessageCircle, Plus, CheckCircle2 } from 'lucide-react';

interface VerifiedReviewsViewProps {
  transporter: TransporterProfile;
  reviews: VerifiedReview[];
  onAddReview: (review: Omit<VerifiedReview, 'id' | 'date'>) => void;
  currentUserEmail: string;
  currentUserName: string;
  hasActiveHire: boolean;
}

export const VerifiedReviewsView: React.FC<VerifiedReviewsViewProps> = ({
  transporter,
  reviews,
  onAddReview,
  currentUserEmail,
  currentUserName,
  hasActiveHire
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const transporterReviews = reviews.filter(
    r => r.transporterId === transporter.id && (r.status === 'aprovado' || (!r.status && r.verifiedHire) || r.parentEmail === currentUserEmail)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onAddReview({
      transporterId: transporter.id,
      parentName: currentUserName,
      parentEmail: currentUserEmail,
      rating,
      comment: comment.trim(),
      verifiedHire: true,
      status: 'pendente_moderacao'
    });

    setComment('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white">
            Avaliações Verificadas
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Depoimentos exclusivos de famílias que contrataram o serviço
          </p>
        </div>

        {hasActiveHire && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ffc400] text-[#10263b] text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1 shadow-xs hover:brightness-105"
          >
            <Plus className="w-3.5 h-3.5" /> Avaliar Van
          </button>
        )}
      </div>

      {/* Driver Score Overview */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={transporter.photoUrl} alt={transporter.name} className="w-12 h-12 rounded-xl object-cover border" />
          <div>
            <h3 className="font-black text-sm text-[#10263b] dark:text-white">{transporter.name}</h3>
            <div className="flex items-center gap-1 text-[#ffc400] text-xs font-black mt-0.5">
              <Star className="w-4 h-4 fill-[#ffc400]" />
              <span className="text-base text-[#10263b] dark:text-white">{transporter.rating.toFixed(1)}</span>
              <span className="text-[#5d6f80] font-normal">({transporterReviews.length} avaliações)</span>
            </div>
          </div>
        </div>

        <span className="bg-[#1b8a52]/10 text-[#1b8a52] text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> 100% Verificadas
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {transporterReviews.length === 0 ? (
          <div className="bg-white dark:bg-[#16232f] p-8 rounded-2xl border text-center text-xs text-[#5d6f80]">
            Nenhuma avaliação ainda para este transportador.
          </div>
        ) : (
          transporterReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#10263b] dark:text-white">{rev.parentName}</span>
                  {rev.verifiedHire && (
                    <span className="bg-[#1b8a52] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      ✓ Contratante Verificado
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#5d6f80]">{rev.date}</span>
              </div>

              <div className="flex items-center gap-0.5 text-[#ffc400]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#ffc400]' : 'text-[#d6dee6]'}`}
                  />
                ))}
              </div>

              <p className="text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
                "{rev.comment}"
              </p>

              {rev.reply && (
                <div className="p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border-l-3 border-[#0f7f8c] space-y-1">
                  <div className="font-bold text-[11px] text-[#0f7f8c]">
                    Resposta de {transporter.name}:
                  </div>
                  <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
                    {rev.reply}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Add Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base">Avaliar o Transporte Escolar</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#5d6f80] font-black text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Nota em Estrelas</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${s <= rating ? 'fill-[#ffc400] text-[#ffc400]' : 'text-[#d6dee6]'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Seu Depoimento</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte sua experiência com pontualidade, cuidado da monitora e conservação da van..."
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] focus:outline-[#ffc400]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105"
                >
                  Publicar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
