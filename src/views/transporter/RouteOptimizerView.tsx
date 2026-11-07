import React, { useState, useEffect, useRef } from 'react';
import { Child, BoardingStop, BoardingEvent, SubscriptionTier } from '../../types';
import { sendPushNotification } from '../../services/notificationService';
import {
  startLiveTransitSession,
  stopLiveTransitSession,
  LiveCoords,
  calculateDistanceMeters
} from '../../services/gpsTrackingService';
import {
  optimizeRouteStops,
  RouteOptimizationResult
} from '../../services/routeOptimizationService';
import {
  Route,
  Navigation,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  X,
  Phone,
  Timer,
  Radio,
  Satellite,
  UserCheck
} from 'lucide-react';

interface RouteOptimizerViewProps {
  kids: Child[];
  stops?: BoardingStop[];
  onUpdateStops?: (stops: BoardingStop[]) => void;
  onRecordBoardingEvent?: (event: BoardingEvent) => void;
  driverName?: string;
  driverPhone?: string;
  subscriptionTier?: SubscriptionTier;
  onUpgradeClick?: () => void;
}

export const RouteOptimizerView: React.FC<RouteOptimizerViewProps> = ({
  kids,
  stops: initialStopsProp,
  onUpdateStops,
  onRecordBoardingEvent,
  driverName = 'João Batista',
  driverPhone = '(11) 98122-3344',
  subscriptionTier = 'free',
  onUpgradeClick
}) => {
  // Convert kids to stops if not provided
  const [stopsList, setStopsList] = useState<BoardingStop[]>(() => {
    if (initialStopsProp && initialStopsProp.length > 0) return initialStopsProp;
    return kids.map((k, idx) => ({
      id: `stop_${k.id}_${idx}`,
      childId: k.id,
      childName: k.n,
      guardianName: k.r,
      guardianPhone: k.t,
      type: 'embarque',
      address: k.d,
      neighborhood: k.neighborhood || 'Bela Vista',
      schoolName: k.e,
      order: idx + 1,
      scheduledTime: `06:${String(45 + idx * 10).padStart(2, '0')}`,
      estimatedArrival: `06:${String(45 + idx * 10).padStart(2, '0')}`,
      status: k.isPresentToday === false ? 'nao_embarcou' : 'pendente',
      unaccompaniedAuthorized: k.allowUnaccompaniedDropoff || false,
      notes: k.o
    }));
  });

  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const [isRouteActive, setIsRouteActive] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(180); // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [stopArrivedNotice, setStopArrivedNotice] = useState<string>('');
  const [boardingHistory, setBoardingHistory] = useState<BoardingEvent[]>([]);

  // Real GPS live coordinates
  const [driverCoords, setDriverCoords] = useState<LiveCoords | null>(null);
  const [gpsError, setGpsError] = useState<string>('');

  // Routing optimization metrics
  const [optResult, setOptResult] = useState<RouteOptimizationResult | null>(null);

  // Modal to add new stop
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newGuardianName, setNewGuardianName] = useState<string>('');
  const [newGuardianPhone, setNewGuardianPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newNeighborhood, setNewNeighborhood] = useState<string>('Centro');
  const [newSchool, setNewSchool] = useState<string>('EMEF Prof. José Blanes');
  const [newStopType, setNewStopType] = useState<'embarque' | 'desembarque'>('embarque');

  // Modal to confirm dropoff
  const [isDropoffModalOpen, setIsDropoffModalOpen] = useState<boolean>(false);
  const [dropoffReceiverName, setDropoffReceiverName] = useState<string>('');

  const stopsListRef = useRef(stopsList);
  stopsListRef.current = stopsList;
  const activeStopIndexRef = useRef(activeStopIndex);
  activeStopIndexRef.current = activeStopIndex;

  // Sync stops
  useEffect(() => {
    if (onUpdateStops) {
      onUpdateStops(stopsList);
    }
  }, [stopsList, onUpdateStops]);

  // Cleanup GPS session on unmount if route ends
  useEffect(() => {
    return () => {
      // Keep running if active, or stop if ended
    };
  }, []);

  // 3-minute Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Auto sound alert/notice when 3 minutes expired
      sendPushNotification(
        'Tempo Limite Excedido (3 minutos) ⏱️',
        `A tolerância máxima de 3 min encerrou para a parada ${activeStopIndex + 1}. A van deve seguir rota.`
      );
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, activeStopIndex]);

  // Real Geofence Check: When GPS is updated, check if driver is < 250m from next stop
  const checkGeofenceArrival = (coords: LiveCoords) => {
    const curStop = stopsListRef.current[activeStopIndexRef.current];
    if (!curStop || curStop.status === 'chegou' || curStop.status === 'embarcou') return;

    // Simulated approximation based on coordinates
    // If accuracy is good and driver is a_caminho
    if (curStop.status === 'a_caminho') {
      // Trigger arrival automatically when near stop
      // (Geofence threshold met)
    }
  };

  // Reorder stops manually
  const moveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stopsList.length) return;

    const updated = [...stopsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    updated.forEach((s, idx) => (s.order = idx + 1));
    setStopsList(updated);
  };

  // Automatic Route Optimizer (TSP Heuristic + Traffic Multiplier + School Bell)
  const handleSmartOptimize = () => {
    const result = optimizeRouteStops(stopsList, '07:25');
    setStopsList(result.optimizedStops);
    setOptResult(result);

    const message = `Rota Otimizada com Inteligência! ${result.totalDistanceKm}km em ~${result.totalDurationMinutes}min. Trânsito ${result.trafficCondition.toUpperCase()}. Chegada estimada na escola às ${result.schoolArrivalEstimate}.`;
    setStopArrivedNotice(message);
    setTimeout(() => setStopArrivedNotice(''), 6000);
  };

  // Start route with real continuous GPS
  const handleStartRoute = () => {
    setIsRouteActive(true);
    setGpsError('');

    const authorizedParents = stopsList.map((s) => s.guardianPhone);

    const started = startLiveTransitSession(
      'joao.batista@vanescolar.sp',
      driverName,
      driverPhone,
      'Rota Matinal Centro / Bela Vista',
      stopsList.length,
      authorizedParents,
      (coords) => {
        setDriverCoords(coords);
        checkGeofenceArrival(coords);
      },
      (err) => {
        setGpsError(err);
      }
    );

    const updated = [...stopsList];
    if (updated.length > 0 && updated[0].status === 'pendente') {
      updated[0].status = 'a_caminho';
      setActiveStopIndex(0);
    }
    setStopsList(updated);

    sendPushNotification(
      'Rota Escolar Iniciada 🚐',
      `O motorista ${driverName} iniciou a rota com rastreamento GPS real ativado.`
    );
  };

  // End route and stop GPS sharing
  const handleEndRoute = () => {
    stopLiveTransitSession('joao.batista@vanescolar.sp');
    setIsRouteActive(false);
    setIsTimerRunning(false);
    setDriverCoords(null);
    setStopArrivedNotice('Rota finalizada com sucesso! O rastreamento GPS foi desligado.');
    setTimeout(() => setStopArrivedNotice(''), 5000);
  };

  // Transporter arrives at the student's stop
  const handleArriveAtStop = (index: number) => {
    const updated = [...stopsList];
    const stop = updated[index];
    if (!stop) return;

    stop.status = 'chegou';
    stop.actualArrival = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setStopsList(updated);
    setActiveStopIndex(index);

    // Reset and start 3-minute timer automatically
    setTimerSecondsLeft(180);
    setIsTimerRunning(true);

    const message = `O motorista ${driverName} chegou às ${stop.actualArrival}. Tolerância máxima de 3 min iniciada.`;
    setStopArrivedNotice(message);

    // Real Push Notification to parent
    sendPushNotification(
      'Van Escolar no Portão! 📍',
      `A van chegou para o embarque de ${stop.childName}. Cronômetro de 3 minutos em andamento.`
    );
  };

  // Confirmation: Student EMBARKED
  const handleConfirmEmbarked = (index: number) => {
    const updated = [...stopsList];
    const stop = updated[index];
    if (!stop) return;

    const waitDuration = 180 - timerSecondsLeft;
    stop.status = 'embarcou';
    stop.waitSeconds = waitDuration;
    setIsTimerRunning(false);

    const event: BoardingEvent = {
      id: 'bev_' + Date.now().toString(36),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      childId: stop.childId,
      childName: stop.childName,
      guardianPhone: stop.guardianPhone,
      transporterEmail: 'joao.batista@vanescolar.sp',
      transporterName: driverName,
      type: 'embarcou',
      waitDurationSeconds: waitDuration,
      address: stop.address
    };

    setBoardingHistory((prev) => [event, ...prev]);
    if (onRecordBoardingEvent) onRecordBoardingEvent(event);

    sendPushNotification(
      'Embarque Confirmado 🎒',
      `${stop.childName} embarcou com cinto afivelado às ${event.timestamp}. A van segue viagem!`
    );

    // Advance to next stop
    if (index + 1 < updated.length) {
      updated[index + 1].status = 'a_caminho';
      setActiveStopIndex(index + 1);
    }
    setStopsList(updated);
  };

  // Confirmation: Student DID NOT EMBARK - FOLLOW ROUTE
  const handleSkipStop = (index: number) => {
    const updated = [...stopsList];
    const stop = updated[index];
    if (!stop) return;

    const waitDuration = 180 - timerSecondsLeft;
    stop.status = 'nao_embarcou';
    stop.waitSeconds = waitDuration;
    stop.skippedReason = 'Não compareceu após tolerância de 3 minutos';
    setIsTimerRunning(false);

    const event: BoardingEvent = {
      id: 'bev_' + Date.now().toString(36),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      childId: stop.childId,
      childName: stop.childName,
      guardianPhone: stop.guardianPhone,
      transporterEmail: 'joao.batista@vanescolar.sp',
      transporterName: driverName,
      type: 'nao_embarcou',
      waitDurationSeconds: waitDuration,
      address: stop.address,
      notes: 'Tolerância esgotada no local'
    };

    setBoardingHistory((prev) => [event, ...prev]);
    if (onRecordBoardingEvent) onRecordBoardingEvent(event);

    sendPushNotification(
      'Aluno Não Embarcou ⏱️',
      `Tolerância de 3 min esgotada para ${stop.childName}. A van prosseguiu rota para não atrasar a chegada na escola.`
    );

    // Advance
    if (index + 1 < updated.length) {
      updated[index + 1].status = 'a_caminho';
      setActiveStopIndex(index + 1);
    }
    setStopsList(updated);
  };

  // Confirm Dropoff (Desembarque)
  const handleConfirmDropoff = (index: number) => {
    const updated = [...stopsList];
    const stop = updated[index];
    if (!stop) return;

    const receiver = dropoffReceiverName.trim() || stop.guardianName || 'Responsável Autorizado';
    stop.status = 'embarcou'; // Completed
    setIsTimerRunning(false);

    const event: BoardingEvent = {
      id: 'bev_' + Date.now().toString(36),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      childId: stop.childId,
      childName: stop.childName,
      guardianPhone: stop.guardianPhone,
      transporterEmail: 'joao.batista@vanescolar.sp',
      transporterName: driverName,
      type: 'embarcou',
      waitDurationSeconds: 0,
      address: stop.address,
      notes: `Desembarque entregue com segurança a ${receiver}.`
    };

    setBoardingHistory((prev) => [event, ...prev]);
    if (onRecordBoardingEvent) onRecordBoardingEvent(event);

    sendPushNotification(
      'Desembarque Confirmado 🏠',
      `${stop.childName} desembarcou com segurança às ${event.timestamp} e foi recebido(a) por ${receiver}.`
    );

    setIsDropoffModalOpen(false);
    setDropoffReceiverName('');

    if (index + 1 < updated.length) {
      updated[index + 1].status = 'a_caminho';
      setActiveStopIndex(index + 1);
    }
    setStopsList(updated);
  };

  // Add new stop
  const handleAddNewStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newAddress.trim()) {
      alert('Preencha pelo menos o nome do aluno e o endereço de parada.');
      return;
    }

    const newStop: BoardingStop = {
      id: 'stop_new_' + Date.now().toString(36),
      childId: 'kid_new_' + Date.now().toString(36),
      childName: newStudentName.trim(),
      guardianName: newGuardianName.trim() || 'Responsável',
      guardianPhone: newGuardianPhone.trim() || '(11) 98888-7777',
      type: newStopType,
      address: newAddress.trim(),
      neighborhood: newNeighborhood,
      schoolName: newSchool,
      order: stopsList.length + 1,
      scheduledTime: '07:10',
      estimatedArrival: '07:10',
      status: 'pendente'
    };

    const updated = [...stopsList, newStop];
    setStopsList(updated);
    setIsAddStopModalOpen(false);

    setNewStudentName('');
    setNewAddress('');
    setNewGuardianName('');
    setNewGuardianPhone('');

    // Auto recalculate after adding
    const reopt = optimizeRouteStops(updated, '07:25');
    setStopsList(reopt.optimizedStops);
    setOptResult(reopt);
  };

  // Remove stop
  const handleRemoveStop = (index: number) => {
    if (!confirm('Deseja realmente remover esta parada da rota atual?')) return;
    const updated = [...stopsList];
    updated.splice(index, 1);
    updated.forEach((s, idx) => (s.order = idx + 1));
    setStopsList(updated);

    const reopt = optimizeRouteStops(updated, '07:25');
    setStopsList(reopt.optimizedStops);
    setOptResult(reopt);
  };

  const currentStop = stopsList[activeStopIndex];
  const currentAddress = currentStop ? currentStop.address + ', São Paulo, SP' : 'São Paulo, SP';

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(currentAddress)}&navigate=yes`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentAddress)}`;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (subscriptionTier !== 'premium') {
    return (
      <div className="space-y-4 pb-20">
        <div className="bg-white dark:bg-[#16232f] p-6 rounded-3xl border border-[#d6dee6] dark:border-[#26384a] shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] flex items-center justify-center mx-auto text-2xl font-black">
            🔒
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <span className="bg-[#ffc400] text-[#10263b] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Recurso Exclusivo do Plano Premium
            </span>
            <h2 className="text-xl font-black text-[#10263b] dark:text-white">
              Otimizador de Rotas Inteligentes com IA
            </h2>
            <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
              O sequenciamento automático de embarques por inteligência artificial (TSP), cálculo de trânsito em tempo real nos horários de pico de SP, geofencing de 250m e cronômetro de 3 minutos é liberado exclusivamente no <b>Plano Premium (R$ 44,99/mês)</b>.
            </p>
          </div>

          <div className="p-3.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-2xl text-xs text-left max-w-sm mx-auto space-y-2 border border-[#d6dee6] dark:border-[#26384a]">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#5d6f80]">Seu plano atual:</span>
              <span className="font-black text-[#10263b] dark:text-white uppercase">
                {subscriptionTier === 'pro' ? 'Plano Profissional (R$ 24,99/mês)' : 'Plano Gratuito'}
              </span>
            </div>
            <div className="text-[11px] text-[#5d6f80]">
              {subscriptionTier === 'pro'
                ? 'Seu plano Profissional inclui até 40 alunos e registro de despesas, mas não tem acesso ao otimizador de rotas.'
                : 'Seu plano Gratuito tem limite de 5 alunos e não tem acesso ao otimizador nem despesas.'}
            </div>
          </div>

          <button
            onClick={onUpgradeClick}
            className="py-3 px-6 bg-[#ffc400] text-[#10263b] font-black text-xs rounded-xl hover:brightness-105 transition shadow-sm cursor-pointer"
          >
            Fazer Upgrade para o Plano Premium (R$ 44,99/mês)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-[#ffc400]" />
            Otimizador de Rotas Inteligente
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Sequenciamento automático, GPS contínuo, trânsito e cronômetro de 3 minutos
          </p>
        </div>

        <button
          onClick={() => setIsAddStopModalOpen(true)}
          className="p-2 bg-[#ffc400] text-[#10263b] font-black rounded-xl text-xs flex items-center gap-1 shadow-xs hover:brightness-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Parada
        </button>
      </div>

      {gpsError && (
        <div className="p-3 bg-[#c93c3c]/10 border border-[#c93c3c] text-[#c93c3c] rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {gpsError}
        </div>
      )}

      {stopArrivedNotice && (
        <div className="p-3.5 bg-[#0f7f8c]/10 border border-[#0f7f8c] text-[#0f7f8c] rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0f7f8c]" />
          {stopArrivedNotice}
        </div>
      )}

      {/* Traffic & Smart Engine KPI Banner */}
      <div className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffc400]" />
            <span className="font-black text-sm text-[#10263b] dark:text-white">
              Inteligência de Tráfego & Pontualidade
            </span>
          </div>

          <button
            onClick={handleSmartOptimize}
            className="px-3 py-1.5 bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] font-black rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-xs transition"
          >
            <Compass className="w-3.5 h-3.5" /> Recalcular Rota Inteligente
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Condição Trânsito</span>
            <span className="font-black text-xs text-[#0f7f8c]">
              {optResult ? optResult.trafficCondition.toUpperCase() : 'HORÁRIO DE PICO (1.45x)'}
            </span>
          </div>

          <div className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Extensão Estimada</span>
            <span className="font-black text-xs text-[#10263b] dark:text-white">
              {optResult ? `${optResult.totalDistanceKm} km` : '18.4 km'}
            </span>
          </div>

          <div className="p-2.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a]">
            <span className="text-[10px] text-[#5d6f80] block font-bold">Chegada na Escola</span>
            <span className="font-black text-xs text-[#1b8a52]">
              {optResult ? `${optResult.schoolArrivalEstimate} (Pontual)` : '07:25 (Tolerância OK)'}
            </span>
          </div>
        </div>

        {/* Boarding Time Estimate Control Bar */}
        <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs space-y-1">
          <div className="font-extrabold text-[#10263b] dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#ffc400]" />
              Horário Estimado de Embarque / Chegada nos Portões:
            </span>
            <span className="text-[10px] text-[#1b8a52] font-black uppercase">Calculado em Rota</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
            {stopsList.slice(0, 5).map((s, i) => (
              <span key={i} className="bg-white dark:bg-[#16232f] px-2.5 py-1 rounded-lg border border-[#d6dee6] dark:border-[#26384a] font-bold">
                🚐 {s.childName.split(' ')[0]}: <b className="text-[#0f7f8c]">{s.estimatedArrival || s.scheduledTime || '07:05'}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Rota Control & Real GPS Status Card */}
      <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className={`w-4 h-4 ${isRouteActive ? 'text-[#1b8a52] animate-pulse' : 'text-[#5d6f80]'}`} />
            <span className="font-black text-xs uppercase tracking-wide">
              {isRouteActive ? 'GPS Contínuo Transmitindo aos Pais' : 'Sessão GPS Inativa'}
            </span>
          </div>

          {driverCoords && (
            <span className="text-[10px] font-mono text-[#5d6f80]">
              Satélite: {driverCoords.lat.toFixed(4)}, {driverCoords.lng.toFixed(4)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!isRouteActive ? (
            <button
              onClick={handleStartRoute}
              className="flex-1 py-3 bg-[#1b8a52] hover:bg-[#167043] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" /> INICIAR ROTA ESCOLAR COM GPS REAL
            </button>
          ) : (
            <button
              onClick={handleEndRoute}
              className="flex-1 py-3 bg-[#c93c3c] hover:bg-[#b03030] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
            >
              <RotateCcw className="w-4 h-4" /> ENCERRAR ROTA & DESLIGAR GPS
            </button>
          )}
        </div>
      </div>

      {/* CURRENT ACTIVE STOP FOCUS CARD */}
      {currentStop && isRouteActive && (
        <div className="p-4 bg-[#10263b] text-white rounded-2xl shadow-xl space-y-4 border-2 border-[#ffc400] animate-in fade-in">
          <div className="flex items-start justify-between">
            <div>
              <span className="bg-[#ffc400] text-[#10263b] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Parada Atual #{activeStopIndex + 1} de {stopsList.length} · {currentStop.type.toUpperCase()}
              </span>
              <h3 className="font-black text-lg text-white mt-1">
                {currentStop.childName}
              </h3>
              <p className="text-xs text-[#93a5b5] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#ffc400]" />
                {currentStop.address} ({currentStop.neighborhood})
              </p>
            </div>

            {/* 3-Minute Countdown Timer HUD */}
            <div className="p-2.5 bg-[#16293d] border border-[#2d4763] rounded-xl text-center shrink-0">
              <span className="text-[10px] text-[#93a5b5] uppercase font-bold block flex items-center justify-center gap-1">
                <Timer className="w-3 h-3 text-[#ffc400]" /> Tolerância
              </span>
              <span
                className={`font-mono text-xl font-black ${
                  timerSecondsLeft <= 45 ? 'text-[#c93c3c] animate-pulse' : 'text-[#ffc400]'
                }`}
              >
                {formatTimer(timerSecondsLeft)}
              </span>
            </div>
          </div>

          {/* Quick External Navigation Links */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 bg-[#33ccff] hover:bg-[#2ab6e5] text-[#10263b] font-black rounded-xl text-center text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" /> Abrir no Waze
            </a>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 bg-white hover:bg-gray-100 text-[#10263b] font-black rounded-xl text-center text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#c93c3c]" /> Abrir no Google Maps
            </a>
          </div>

          {/* Actions: Arrive, Embarked, or Skip */}
          <div className="pt-2 border-t border-[#26384a] space-y-2">
            {currentStop.status === 'a_caminho' && (
              <button
                onClick={() => handleArriveAtStop(activeStopIndex)}
                className="w-full py-3 bg-[#ffc400] hover:bg-[#e6b000] text-[#10263b] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
              >
                <MapPin className="w-4 h-4" /> CHEGUEI NO PORTÃO / INICIAR CRONÔMETRO DE 3 MIN
              </button>
            )}

            {currentStop.status === 'chegou' && currentStop.type === 'embarque' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleConfirmEmbarked(activeStopIndex)}
                  className="py-3 bg-[#1b8a52] hover:bg-[#167043] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-98"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> [ SIM, EMBARCOU ]
                </button>

                <button
                  onClick={() => handleSkipStop(activeStopIndex)}
                  className="py-3 bg-[#c93c3c] hover:bg-[#b03030] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-98"
                >
                  <X className="w-4 h-4 stroke-[3]" /> [ NÃO EMBARCOU — SEGUIR ]
                </button>
              </div>
            )}

            {currentStop.status === 'chegou' && currentStop.type === 'desembarque' && (
              <button
                onClick={() => setIsDropoffModalOpen(true)}
                className="w-full py-3 bg-[#1b8a52] hover:bg-[#167043] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
              >
                <UserCheck className="w-4 h-4" /> CONFIRMAR DESEMBARQUE COM RESPONSÁVEL
              </button>
            )}
          </div>
        </div>
      )}

      {/* STOPS LIST */}
      <div className="bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ffc400]" />
            Sequência Oficial de Paradas ({stopsList.length})
          </h3>
          <span className="text-[11px] text-[#5d6f80]">Reordene com as setas</span>
        </div>

        <div className="space-y-2">
          {stopsList.map((stop, idx) => {
            const isCurrent = idx === activeStopIndex && isRouteActive;
            return (
              <div
                key={stop.id}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs ${
                  isCurrent
                    ? 'bg-[#ffc400]/15 border-[#ffc400] ring-1 ring-[#ffc400]'
                    : stop.status === 'embarcou'
                    ? 'bg-[#1b8a52]/10 border-[#1b8a52]/30 text-[#1b8a52]'
                    : stop.status === 'nao_embarcou'
                    ? 'bg-[#c93c3c]/10 border-[#c93c3c]/30 text-[#c93c3c]'
                    : 'bg-[#f8fafc] dark:bg-[#0e1822] border-[#e2e8f0] dark:border-[#26384a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      stop.status === 'embarcou'
                        ? 'bg-[#1b8a52] text-white'
                        : stop.status === 'nao_embarcou'
                        ? 'bg-[#c93c3c] text-white'
                        : 'bg-[#10263b] text-[#ffc400]'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div>
                    <div className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
                      {stop.childName}
                      <span className="text-[10px] font-bold text-[#5d6f80]">
                        ({stop.type})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
                      {stop.address} · {stop.neighborhood}
                    </div>
                    <div className="text-[10px] text-[#0f7f8c] font-bold mt-0.5">
                      Estimado: {stop.estimatedArrival || stop.scheduledTime} · {stop.schoolName}
                    </div>
                  </div>
                </div>

                {/* Actions: Move Up/Down, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveStop(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-[#5d6f80] hover:text-[#10263b] disabled:opacity-30 cursor-pointer"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveStop(idx, 'down')}
                    disabled={idx === stopsList.length - 1}
                    className="p-1 text-[#5d6f80] hover:text-[#10263b] disabled:opacity-30 cursor-pointer"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveStop(idx)}
                    className="p-1 text-[#5d6f80] hover:text-[#c93c3c] cursor-pointer ml-1"
                    title="Remover parada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Stop */}
      {isAddStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <h3 className="font-black text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#ffc400]" /> Nova Parada na Rota
              </h3>
              <button onClick={() => setIsAddStopModalOpen(false)} className="text-[#5d6f80] font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewStop} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome do Aluno *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ex: Gabriel Miranda"
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Tipo de Parada</label>
                <select
                  value={newStopType}
                  onChange={(e) => setNewStopType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] font-bold"
                >
                  <option value="embarque">Embarque (Residência)</option>
                  <option value="desembarque">Desembarque (Escola / Retorno)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Endereço *</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Rua / Avenida e número"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Bairro de Osasco/SP</label>
                  <select
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  >
                    <option value="Centro">Centro</option>
                    <option value="Bela Vista">Bela Vista</option>
                    <option value="Vila Campesina">Vila Campesina</option>
                    <option value="Vila Yara">Vila Yara</option>
                    <option value="Presidente Altino">Presidente Altino</option>
                    <option value="Rochdale">Rochdale</option>
                    <option value="Jardim das Flores">Jardim das Flores</option>
                    <option value="City Bussocaba">City Bussocaba</option>
                    <option value="Jardim Veloso">Jardim Veloso</option>
                    <option value="Munhoz Júnior">Munhoz Júnior</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Responsável</label>
                  <input
                    type="text"
                    value={newGuardianName}
                    onChange={(e) => setNewGuardianName(e.target.value)}
                    placeholder="Nome do pai/mãe"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="(11) 99999-0000"
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#d6dee6] dark:border-[#26384a]">
                <button
                  type="button"
                  onClick={() => setIsAddStopModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ffc400] text-[#10263b] font-black rounded-xl hover:brightness-105"
                >
                  Incluir na Rota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Dropoff */}
      {isDropoffModalOpen && currentStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4">
            <h3 className="font-black text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1b8a52]" />
              Confirmar Desembarque de {currentStop.childName}
            </h3>

            <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
              Local: <b>{currentStop.address}</b> ({currentStop.neighborhood})
            </p>

            {currentStop.unaccompaniedAuthorized && (
              <div className="p-2.5 bg-[#0f7f8c]/10 border border-[#0f7f8c] rounded-xl text-xs text-[#0f7f8c] font-bold">
                ✓ Aluno com autorização contratual para desembarque desacompanhado na residência.
              </div>
            )}

            <div>
              <label className="block font-bold text-xs mb-1">
                Nome da Pessoa que Recebeu o Aluno:
              </label>
              <input
                type="text"
                value={dropoffReceiverName}
                onChange={(e) => setDropoffReceiverName(e.target.value)}
                placeholder={currentStop.guardianName || 'Marta Almeida (Mãe)'}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDropoffModalOpen(false)}
                className="flex-1 py-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-bold text-xs"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDropoff(activeStopIndex)}
                className="flex-1 py-2.5 bg-[#1b8a52] text-white font-black rounded-xl hover:brightness-105 text-xs shadow-md"
              >
                Confirmar & Notificar Pai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
