import React, { useState } from 'react';
import { ServicePartnerItem, PartnerPromotion, SubscriptionTier, FreelanceDriver } from '../../types';
import {
  Wrench,
  Bus,
  Phone,
  CheckCircle2,
  Tag,
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Scissors,
  Car,
  Package,
  Layers,
  Lock,
  MessageSquare,
  Users
} from 'lucide-react';

interface ServicesPartnersViewProps {
  partners: ServicePartnerItem[];
  promotions: PartnerPromotion[];
  freelanceDrivers?: FreelanceDriver[];
  subscriptionTier?: SubscriptionTier;
  onPartnerContact?: (partnerName: string) => void;
  onNavigateToSubscriptions?: () => void;
}

export const ServicesPartnersView: React.FC<ServicesPartnersViewProps> = ({
  partners,
  promotions,
  freelanceDrivers = [],
  subscriptionTier = 'free',
  onPartnerContact,
  onNavigateToSubscriptions
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'funileiro' | 'mecanicos' | 'tapeceiros' | 'auto_pecas' | 'vans_locacao' | 'motorista_freelancer'
  >('funileiro');
  const [toastMsg, setToastMsg] = useState<string>('');

  const isProOrPremium = subscriptionTier === 'pro' || subscriptionTier === 'premium';
  const activePromos = promotions.filter((p) => p.isActive ?? p.active);
  const filteredPartners = partners.filter((p) => p.category === activeCategory);

  const handleInterest = (partnerName: string) => {
    if (!isProOrPremium) {
      if (onNavigateToSubscriptions) onNavigateToSubscriptions();
      return;
    }
    if (onPartnerContact) {
      onPartnerContact(partnerName);
    }
    setToastMsg(`Interesse registrado com sucesso para ${partnerName}! Condição exclusiva ativada.`);
    setTimeout(() => setToastMsg(''), 4500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#ffc400]" />
          Serviços, Frotistas & Rede Credenciada SP
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Oficinas, funilarias, tapeçarias, autopeças, vans para locação e motoristas freelancers credenciados
        </p>
      </div>

      {toastMsg && (
        <div className="p-3 bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMsg}
        </div>
      )}

      {/* PROMOTIONS CAROUSEL WITH PRO/PREMIUM LOCK */}
      <div className="bg-gradient-to-r from-[#10263b] via-[#162a3f] to-[#0f7f8c] text-white p-4 rounded-2xl border border-[#ffc400]/40 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#ffc400] text-[#10263b] rounded-lg font-black">
              <Tag className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#ffc400]">
              Cupons & Promoções Exclusivas em Auto Peças e Mecânica
            </span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">
            {activePromos.length} Ofertas Ativas
          </span>
        </div>

        {!isProOrPremium ? (
          <div className="p-3.5 bg-black/40 backdrop-blur-xs rounded-xl border border-[#ffc400]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#ffc400] shrink-0" />
              <div>
                <div className="font-black text-[#ffc400]">
                  Benefício Exclusivo dos Planos Pro e Premium
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-snug">
                  Você está no Plano Gratuito. Frotistas Pro e Premium economizam mais de R$ 600/mês em peças e serviços com os cupons credenciados.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToSubscriptions}
              className="bg-[#ffc400] text-[#10263b] font-black text-xs px-3.5 py-2 rounded-xl shrink-0 hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              Fazer Upgrade Pro →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-[#0e1822]/80 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-1.5 py-0.2 rounded font-mono">
                      {promo.discountBadge}
                    </span>
                    <span className="font-extrabold text-white">{promo.title}</span>
                  </div>
                  <div className="text-[11px] text-[#cbd5e1] mt-1">{promo.description}</div>
                  <div className="text-[10px] text-[#ffc400] font-bold mt-1">
                    Loja: {promo.partnerName} {promo.couponCode ? `· Cupom: ${promo.couponCode}` : ''}
                  </div>
                </div>

                <button
                  onClick={() => handleInterest(promo.partnerName)}
                  className="bg-[#ffc400] text-[#10263b] text-[11px] font-black px-2.5 py-1.5 rounded-lg shrink-0 hover:brightness-105 transition cursor-pointer"
                >
                  Resgatar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6 CATEGORY TABS (INCLUDING MOTORISTA FREELANCER) */}
      <div className="flex bg-white dark:bg-[#16232f] p-1.5 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] text-xs font-bold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveCategory('funileiro')}
          className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'funileiro'
              ? 'bg-[#10263b] text-white shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b]'
          }`}
        >
          <Car className="w-3.5 h-3.5 text-[#ffc400]" />
          Funileiro
        </button>

        <button
          onClick={() => setActiveCategory('mecanicos')}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'mecanicos'
              ? 'bg-[#10263b] text-white shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-[#ffc400]" />
          Mecânicos
        </button>

        <button
          onClick={() => setActiveCategory('tapeceiros')}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'tapeceiros'
              ? 'bg-[#10263b] text-white shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b]'
          }`}
        >
          <Scissors className="w-3.5 h-3.5 text-[#ffc400]" />
          Tapeceiros
        </button>

        <button
          onClick={() => setActiveCategory('auto_pecas')}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'auto_pecas'
              ? 'bg-[#10263b] text-white shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b]'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-[#ffc400]" />
          Auto Peças
        </button>

        <button
          onClick={() => setActiveCategory('vans_locacao')}
          className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'vans_locacao'
              ? 'bg-[#10263b] text-white shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b]'
          }`}
        >
          <Bus className="w-3.5 h-3.5 text-[#ffc400]" />
          Vans Locação
        </button>

        <button
          onClick={() => setActiveCategory('motorista_freelancer')}
          className={`flex-1 min-w-[140px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'motorista_freelancer'
              ? 'bg-[#10263b] text-white shadow-xs font-black'
              : 'text-[#5d6f80] hover:text-[#10263b]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#ffc400]" />
          Motorista Freelancer
        </button>
      </div>

      {/* ========================================================
          FREELANCE DRIVERS TAB
          ======================================================== */}
      {activeCategory === 'motorista_freelancer' ? (
        <div className="space-y-3 animate-in fade-in">
          <div className="p-3 bg-white dark:bg-[#16232f] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs">
            <span className="font-black text-[#10263b] dark:text-[#ffc400] block mb-0.5">
              Pronto Atendimento para Cobertura de Rotas Escolares
            </span>
            <span className="text-[#5d6f80] dark:text-[#93a5b5]">
              Motoristas profissionais com CNH categoria D/E com EAR, credenciados pelo DTP e aptos para cobrir atestados, férias ou imprevistos mecânicos da sua van.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {freelanceDrivers.map((fl) => (
              <div
                key={fl.id}
                className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img src={fl.photoUrl} alt={fl.name} className="w-12 h-12 rounded-xl object-cover border-2 border-[#ffc400]" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-sm text-[#10263b] dark:text-white">{fl.name}</h4>
                        <span className="bg-[#1b8a52]/10 text-[#1b8a52] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          DTP Verificado
                        </span>
                      </div>
                      <div className="text-[11px] text-[#ffc400] font-bold">"{fl.nickname}"</div>
                      <div className="text-[11px] text-[#5d6f80]">{fl.cnhCategory} · {fl.dtpRegistration}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#5d6f80] block">Valor Diária</span>
                    <span className="text-base font-black text-[#10263b] dark:text-white">
                      R$ {fl.dailyRate.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5d6f80] dark:text-[#cbd5e1] leading-relaxed">
                  {fl.bio}
                </p>

                <div className="text-[11px] text-[#5d6f80] bg-[#f8fafc] dark:bg-[#0e1822] p-2 rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
                  <div>Região: <b>{fl.region}</b> · Experiência: <b>{fl.experienceYears} anos</b></div>
                  <div>Disponibilidade: <b>{fl.availableDays}</b></div>
                </div>

                <a
                  href={`https://wa.me/${fl.whatsapp}?text=${encodeURIComponent(`Olá ${fl.nickname}, vi seu perfil de motorista freelancer no app Van Escolar SP! Gostaria de verificar disponibilidade para cobertura de rota.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> CHAMAR NO WHATSAPP
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STANDARD SERVICE PARTNERS LIST */
        <div className="space-y-3">
          {filteredPartners.length === 0 ? (
            <div className="p-8 bg-white dark:bg-[#16232f] rounded-2xl border text-center text-xs text-[#5d6f80]">
              Nenhum parceiro cadastrado nesta categoria ainda. O Administrador DTP está credenciando novos prestadores.
            </div>
          ) : (
            filteredPartners.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                        {item.name}
                      </h3>
                      {item.isVerifiedPartner && (
                        <span className="bg-[#1b8a52]/10 text-[#1b8a52] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Credenciado DTP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                      Especialidade: <b className="text-[#10263b] dark:text-white">{item.specialty}</b>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#5d6f80] dark:text-[#93a5b5] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#ffc400] shrink-0" />
                      <span>{item.address} ({item.region})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[#ffc400] text-xs font-black bg-[#ffc400]/10 px-2 py-1 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5 fill-[#ffc400]" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </div>

                {item.discountDeal && (
                  <div className="p-2.5 bg-[#1b8a52]/10 border border-[#1b8a52]/30 rounded-xl text-xs text-[#1b8a52] font-black flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span>Benefício: {item.discountDeal}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[#d6dee6] dark:border-[#26384a]">
                  <a
                    href={`tel:${item.phone.replace(/\D/g, '')}`}
                    className="bg-[#10263b] text-[#ffc400] text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs hover:brightness-110 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> {item.phone}
                  </a>

                  <button
                    onClick={() => handleInterest(item.name)}
                    className="bg-[#ffc400] text-[#10263b] text-xs font-black px-3.5 py-2 rounded-xl shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
                  >
                    Solicitar Condição Especial
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
