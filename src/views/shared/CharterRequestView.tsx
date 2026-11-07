import React, { useState } from 'react';
import { CharterRequest, TransporterProfile } from '../../types';
import { Bus, Calendar, MapPin, Users, Send, CheckCircle2, MessageSquare, Phone, Star, ShieldCheck } from 'lucide-react';

interface CharterRequestViewProps {
  userRole: string;
  userName: string;
  userEmail: string;
  charters: CharterRequest[];
  transporters?: TransporterProfile[];
  onSubmitCharter: (charter: Omit<CharterRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const CharterRequestView: React.FC<CharterRequestViewProps> = ({
  userRole,
  userName,
  userEmail,
  charters,
  transporters = [],
  onSubmitCharter
}) => {
  const [purpose, setPurpose] = useState<CharterRequest['purpose']>('Passeio Escolar');
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('08:00');
  const [passengersCount, setPassengersCount] = useState<number>(15);
  const [notes, setNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('(11) 98811-2233');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departure.trim() || !destination.trim() || !date) {
      alert('Preencha os locais de saída, destino e data do evento.');
      return;
    }

    onSubmitCharter({
      requesterName: userName,
      requesterEmail: userEmail,
      requesterPhone: phone,
      destination: destination.trim(),
      departure: departure.trim(),
      date,
      time,
      passengersCount: Number(passengersCount) || 15,
      purpose,
      notes: notes.trim()
    });

    setSubmitted(true);
    setDeparture('');
    setDestination('');
    setNotes('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const getWhatsAppCharterLink = (driverPhone: string, driverName: string) => {
    const cleanPhone = driverPhone.replace(/\D/g, '');
    const internationalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = `Olá ${driverName}, estou no app Van Escolar SP e gostaria de um orçamento para fretamento/passeio eventual (${purpose || 'Passeio Escolar'}) para ${passengersCount} passageiros no dia ${date || 'a combinar'}.`;
    return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
          <Bus className="w-5 h-5 text-[#ffc400]" />
          Transporte Eventual, Excursões & Fretamento
        </h2>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
          Contratação pontual de vans escolares credenciadas para passeios, viagens pedagógicas e eventos
        </p>
      </div>

      {submitted && (
        <div className="bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Solicitação de orçamento enviada aos transportadores escolares credenciados!
        </div>
      )}

      {/* Featured Transport Partners with Direct WhatsApp Button */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1b8a52]" />
            Transportadores Credenciados DTP Disponíveis para Fretamento
          </h3>
          <span className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">Contato Direto WhatsApp</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {transporters.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="p-3.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <img src={t.photoUrl} alt={t.name} className="w-11 h-11 rounded-xl object-cover border border-[#ffc400]" />
                  <div>
                    <h4 className="font-black text-sm text-[#10263b] dark:text-white">{t.name}</h4>
                    <p className="text-[11px] text-[#5d6f80]">
                      {t.vanModel} ({t.vanYear}) · Placa: {t.vanPlate}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#ffc400] font-bold">
                      <Star className="w-3 h-3 fill-current" /> {t.rating.toFixed(1)} ({t.reviewsCount} avaliações)
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#5d6f80] block">Capacidade</span>
                  <span className="text-xs font-black text-[#10263b] dark:text-white">
                    {t.seatsTotal} lugares
                  </span>
                </div>
              </div>

              {/* Van Photo Gallery Preview */}
              {t.vanPhotos && t.vanPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-1 rounded-lg overflow-hidden">
                  {t.vanPhotos.slice(0, 4).map((imgUrl, i) => (
                    <img key={i} src={imgUrl} alt={`Foto van ${i + 1}`} className="w-full h-12 object-cover" />
                  ))}
                </div>
              )}

              <div className="text-[10px] text-[#5d6f80] flex items-center justify-between">
                <span>Ar-condicionado · Seguro APP · DTP Ativo</span>
                <span className="font-bold text-[#1b8a52]">Disponibilidade para eventos</span>
              </div>

              <a
                href={getWhatsAppCharterLink(t.phone, t.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-xl text-center flex items-center justify-center gap-2 text-xs shadow-sm transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> CHAMAR NO WHATSAPP
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Request Form */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <Send className="w-4 h-4 text-[#ffc400]" />
          Ou Publique sua Cotação Geral para Todos os Frotistas de SP
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Finalidade do Transporte</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as any)}
              className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
            >
              <option>Passeio Escolar</option>
              <option>Excursão</option>
              <option>Atividade Extracurricular</option>
              <option>Festa / Evento</option>
              <option>Outro</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Local de Saída (Origem em SP) *</label>
              <input
                type="text"
                placeholder="Ex: EMEF Santa Rita - Jabaquara"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Destino *</label>
              <input
                type="text"
                placeholder="Ex: Museu Catavento ou Parque Ibirapuera"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold mb-1">Data *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Horário de Saída</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Nº de Passageiros</label>
              <input
                type="number"
                min="1"
                max="35"
                value={passengersCount}
                onChange={(e) => setPassengersCount(Number(e.target.value))}
                className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Observações Adicionais</label>
            <textarea
              rows={2}
              placeholder="Ex: Necessário ar-condicionado e monitor a bordo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ffc400] text-[#10263b] font-black py-2.5 rounded-xl hover:brightness-105 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Disparar Solicitação para Todos os Frotistas
          </button>
        </form>
      </div>
    </div>
  );
};
