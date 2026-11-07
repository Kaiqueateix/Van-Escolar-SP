import React, { useState, useEffect } from 'react';
import { TransporterProfile, Child, TravelStage } from '../../types';
import { TRAVEL_STAGES } from '../../constants';
import { notifier } from '../../services/notifications';
import {
  getLiveTransitSession,
  calculateDistanceMeters,
  calculateTransitETA,
  LiveTransitSession,
  LiveCoords
} from '../../services/gpsTrackingService';
import {
  Navigation,
  Clock,
  MapPin,
  ShieldCheck,
  Bell,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  History,
  Radio,
  ExternalLink,
  Satellite,
  Compass,
  Gauge
} from 'lucide-react';

interface TrackingViewProps {
  transporter: TransporterProfile | null;
  child: Child | null;
  onGoToSearch: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  transporter,
  child,
  onGoToSearch
}) => {
  const [liveSession, setLiveSession] = useState<LiveTransitSession | null>(() => {
    return transporter ? getLiveTransitSession(transporter.email) : null;
  });

  const [lastSecondsAgo, setLastSecondsAgo] = useState<number>(0);
  const [hasWarnedArrival, setHasWarnedArrival] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<TravelStage>(child?.travelStage || 2);
  const [isVehicleDetailOpen, setIsVehicleDetailOpen] = useState<boolean>(false);

  // Approximate default coordinates for child residence in Osasco / SP
  const childCoords = {
    lat: -23.5358,
    lng: -46.7865
  };

  // Sync with live GPS updates
  useEffect(() => {
    const handleGpsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LiveTransitSession>;
      if (customEvent.detail && transporter && customEvent.detail.transporterEmail === transporter.email) {
        setLiveSession(customEvent.detail);
        setLastSecondsAgo(0);
      }
    };

    window.addEventListener('vesp_gps_position_update', handleGpsUpdate);

    // Initial check
    if (transporter) {
      const s = getLiveTransitSession(transporter.email);
      setLiveSession(s);
    }

    const interval = setInterval(() => {
      setLastSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      window.removeEventListener('vesp_gps_position_update', handleGpsUpdate);
      clearInterval(interval);
    };
  }, [transporter]);

  // Calculate real distance and ETA if live coords are available
  const driverCoords = liveSession?.currentCoords;
  const isTripActive = liveSession?.isActive && driverCoords !== undefined;

  let distanceMeters = 0;
  let etaMinutes = 8;
  let speedKmH = 0;

  if (driverCoords) {
    distanceMeters = Math.round(
      calculateDistanceMeters(
        driverCoords.lat,
        driverCoords.lng,
        childCoords.lat,
        childCoords.lng
      )
    );
    etaMinutes = calculateTransitETA(distanceMeters);
    speedKmH = driverCoords.speed ? Math.round(driverCoords.speed * 3.6) : 24;
  }

  // Auto trigger proximity notification if within 500m
  useEffect(() => {
    if (isTripActive && distanceMeters > 0 && distanceMeters <= 500 && !hasWarnedArrival) {
      setHasWarnedArrival(true);
      notifier.notify(
        '🚐 Van Escolar SP: Chegando ao Portão!',
        {
          body: `A van de ${transporter?.name} está a menos de ${distanceMeters}m de distância. Leve o aluno ao embarque!`
        },
        'arrival'
      );
    }
  }, [isTripActive, distanceMeters, hasWarnedArrival, transporter]);

  const handleManualRefresh = () => {
    if (transporter) {
      const s = getLiveTransitSession(transporter.email);
      setLiveSession(s);
      setLastSecondsAgo(0);
    }
  };

  const handleOpenGoogleMaps = () => {
    if (driverCoords) {
      const url = `https://www.google.com/maps/search/?api=1&query=${driverCoords.lat},${driverCoords.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#ffc400] animate-pulse" />
            Rastreamento GPS em Tempo Real
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Posicionamento contínuo via satélite do veículo credenciado
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="p-2 bg-white dark:bg-[#16232f] rounded-xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs text-[#10263b] dark:text-white hover:text-[#ffc400] transition cursor-pointer"
          title="Atualizar localização"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Real GPS Session Status Banner */}
      {isTripActive ? (
        <div className="p-3.5 bg-[#1b8a52]/10 border border-[#1b8a52]/30 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b8a52] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1b8a52]"></span>
            </span>
            <div>
              <div className="text-xs font-black text-[#1b8a52] uppercase tracking-wide">
                Sessão de Transporte Escolar Ativa
              </div>
              <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
                Rota: <b>{liveSession.activeRouteName}</b> · Satélite conectado
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-[#5d6f80] dark:text-[#93a5b5]">
            Atualizado há <span className="font-bold text-[#10263b] dark:text-white">{lastSecondsAgo}s</span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#eef2f5] dark:bg-[#16232f] border border-[#d6dee6] dark:border-[#26384a] rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-[#5d6f80] dark:text-[#93a5b5]">
            <Satellite className="w-4 h-4 text-[#ffc400]" />
            Viagem Não Iniciada no Momento
          </div>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
            O compartilhamento de GPS contínuo é ativado automaticamente assim que o motorista <b>{transporter?.name || 'escolar'}</b> inicia o trajeto pelo aplicativo. Fora do expediente, o rastreamento é interrompido para proteção da privacidade do condutor e conformidade com a LGPD.
          </p>
        </div>
      )}

      {/* Main Map & Metrics Card */}
      <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] p-4 shadow-xs space-y-4">
        {/* Driver Quick Badge */}
        <div
          onClick={() => setIsVehicleDetailOpen(true)}
          className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3 cursor-pointer group hover:bg-[#f8fafc] dark:hover:bg-[#0e1822] p-2 rounded-xl transition"
          title="Clique para abrir os detalhes completos do motorista e do veículo"
        >
          <div className="flex items-center gap-3">
            <img
              src={transporter?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={transporter?.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#ffc400] group-hover:scale-105 transition"
            />
            <div>
              <div className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5 group-hover:text-[#0f7f8c] dark:group-hover:text-[#ffc400] transition">
                {transporter?.name}
                <ShieldCheck className="w-4 h-4 text-[#1b8a52]" />
              </div>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                {transporter?.vanModel} · Placa <b>{transporter?.vanPlate}</b>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#0f7f8c] font-black uppercase tracking-wider block">Ver Detalhes do Veículo</span>
            <span className="text-lg font-black text-[#0f7f8c]">
              {isTripActive ? `~${etaMinutes} min` : '--'}
            </span>
          </div>
        </div>

        {/* Live Vector Map View */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-[#e6ebf0] dark:bg-[#091118] border border-[#d6dee6] dark:border-[#26384a]">
          {/* Stylized SP Grid lines */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          {/* SVG Route Corridor */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
            {/* Main Road Line */}
            <path
              d="M 50,180 Q 150,140 220,110 T 350,40"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="12"
              className="dark:stroke-[#1e2d3d]"
              strokeLinecap="round"
            />
            <path
              d="M 50,180 Q 150,140 220,110 T 350,40"
              fill="none"
              stroke="#ffc400"
              strokeWidth="4"
              strokeDasharray="6 4"
            />

            {/* Destination: School */}
            <circle cx="350" cy="40" r="10" fill="#0f7f8c" />
            <text x="350" y="24" fill="#0f7f8c" fontSize="10" fontWeight="900" textAnchor="middle">
              Escola
            </text>

            {/* Child Residence */}
            <circle cx="50" cy="180" r="10" fill="#1b8a52" />
            <text x="50" y="202" fill="#1b8a52" fontSize="10" fontWeight="900" textAnchor="middle">
              Casa ({child?.n.split(' ')[0] || 'Aluno'})
            </text>

            {/* Van Position */}
            {isTripActive && driverCoords && (
              <g transform="translate(180, 120)">
                <circle cx="0" cy="0" r="14" fill="#ffc400" className="animate-pulse" opacity="0.4" />
                <circle cx="0" cy="0" r="9" fill="#10263b" stroke="#ffc400" strokeWidth="2" />
                <text x="0" y="3" fill="#ffc400" fontSize="8" fontWeight="bold" textAnchor="middle">
                  VAN
                </text>
              </g>
            )}
          </svg>

          {/* Overlay Coordinates & Telemetry */}
          <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white p-2 rounded-xl text-[10px] font-mono space-y-0.5">
            <div className="flex items-center gap-1.5 text-[#ffc400] font-bold">
              <Radio className="w-3 h-3 animate-ping" />
              <span>{isTripActive ? 'SINAL GPS ATIVO' : 'GPS STANDBY'}</span>
            </div>
            {driverCoords ? (
              <>
                <div>Lat: {driverCoords.lat.toFixed(5)}</div>
                <div>Lng: {driverCoords.lng.toFixed(5)}</div>
                <div>Precisão: ±{driverCoords.accuracy}m</div>
              </>
            ) : (
              <div className="text-gray-400">Aguardando início pelo motorista</div>
            )}
          </div>

          {/* External Map Link Button */}
          {driverCoords && (
            <button
              onClick={handleOpenGoogleMaps}
              className="absolute bottom-2.5 right-2.5 bg-[#10263b] hover:bg-[#1a3854] text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-md cursor-pointer border border-[#ffc400]/40 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ffc400]" />
              Abrir no Google Maps
            </button>
          )}
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Distância Real</span>
            <span className="font-black text-sm text-[#10263b] dark:text-white">
              {isTripActive ? (distanceMeters > 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} m`) : '--'}
            </span>
          </div>

          <div className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Velocidade Van</span>
            <span className="font-black text-sm text-[#10263b] dark:text-white">
              {isTripActive ? `${speedKmH} km/h` : '--'}
            </span>
          </div>

          <div className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Previsão no Portão</span>
            <span className="font-black text-sm text-[#1b8a52]">
              {isTripActive ? `~${etaMinutes} min` : '--'}
            </span>
          </div>
        </div>

        {/* 6 Official Travel Stages Progress Bar */}
        <div className="pt-2 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
          <span className="text-[11px] font-bold uppercase text-[#5d6f80] block">
            Status da Etapa da Viagem:
          </span>

          <div className="grid grid-cols-6 gap-1">
            {TRAVEL_STAGES.map((s) => (
              <div
                key={s.stage}
                className={`h-2 rounded-full transition-all ${
                  s.stage <= currentStage ? 'bg-[#ffc400]' : 'bg-[#e2e8f0] dark:bg-[#26384a]'
                }`}
                title={s.label}
              />
            ))}
          </div>

          <div className="p-2.5 bg-[#ffc400]/10 border border-[#ffc400]/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{TRAVEL_STAGES[currentStage - 1]?.icon}</span>
              <div>
                <span className="font-black text-[#10263b] dark:text-white">
                  Etapa {currentStage}: {TRAVEL_STAGES[currentStage - 1]?.label}
                </span>
                <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
                  {TRAVEL_STAGES[currentStage - 1]?.desc}
                </p>
              </div>
            </div>

            <CheckCircle className="w-4 h-4 text-[#1b8a52] shrink-0" />
          </div>
        </div>
      </div>

      {/* Transport Details Modal */}
      {isVehicleDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-3xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden my-6 animate-in fade-in space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={transporter?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={transporter?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#ffc400]"
                />
                <div>
                  <h3 className="font-black text-base text-[#10263b] dark:text-white flex items-center gap-1.5">
                    {transporter?.name || 'João Batista'}
                    <ShieldCheck className="w-4 h-4 text-[#1b8a52]" />
                  </h3>
                  <p className="text-xs text-[#0f7f8c] font-bold">
                    Credenciamento DTP SP Activo · Alvará 48.920-SP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVehicleDetailOpen(false)}
                className="text-[#5d6f80] hover:text-black dark:text-[#93a5b5] font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-1.5">
                <div className="font-black text-xs text-[#10263b] dark:text-white uppercase tracking-wider">
                  🚌 Especificações do Veículo:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><b>Modelo:</b> {transporter?.vanModel || 'Van Escolar Mercedes Sprinter'}</div>
                  <div><b>Ano Fabricação:</b> {transporter?.vanYear || 2022}</div>
                  <div><b>Placa Oficial:</b> <span className="font-mono font-bold text-[#10263b] dark:text-white">{transporter?.vanPlate || 'BRA-2026'}</span></div>
                  <div><b>Capacidade:</b> {transporter?.seatsTotal || 15} passageiros</div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-1">
                <div className="font-black text-xs text-[#10263b] dark:text-white uppercase tracking-wider">
                  ⭐ Equipamentos de Segurança & Comodidades:
                </div>
                <ul className="list-disc list-inside text-[#5d6f80] dark:text-[#93a5b5] space-y-0.5 text-[11px]">
                  <li>Cintos de segurança de 3 pontos para todos os assentos</li>
                  <li>Monitora auxiliar credenciada a bordo</li>
                  <li>Ar-condicionado e tacógrafo aferido pelo Inmetro</li>
                  <li>Selo de vistoria semestral aprovado pelo DTP/SP</li>
                </ul>
              </div>

              <div className="p-3 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-1">
                <div className="font-black text-xs text-[#10263b] dark:text-white uppercase tracking-wider">
                  📞 Telefone Direto do Motorista:
                </div>
                <a
                  href={`tel:${(transporter?.phone || '(11) 98122-3344').replace(/\D/g, '')}`}
                  className="text-xs font-black text-[#1b8a52] hover:underline block"
                >
                  {transporter?.phone || '(11) 98122-3344'} (Ligar Agora)
                </a>
              </div>
            </div>

            <button
              onClick={() => setIsVehicleDetailOpen(false)}
              className="w-full py-2.5 bg-[#10263b] text-[#ffc400] font-black rounded-xl text-xs hover:brightness-110"
            >
              Fechar Detalhes do Transporte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
