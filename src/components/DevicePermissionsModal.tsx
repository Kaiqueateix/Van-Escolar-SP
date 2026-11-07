import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Camera,
  FolderOpen,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smartphone,
  Info,
  X
} from 'lucide-react';

interface DevicePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [gpsStatus, setGpsStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [fileTested, setFileTested] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((res) => {
          setGpsStatus(res.state as 'prompt' | 'granted' | 'denied');
          res.onchange = () => {
            setGpsStatus(res.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {
          // Fallback if permission query is not fully supported
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestGPS = () => {
    if (!('geolocation' in navigator)) {
      setStatusMessage('Geolocalização não é suportada por este dispositivo.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus('granted');
        setStatusMessage(
          `GPS Real Concedido com sucesso! Precisão atual: ±${Math.round(pos.coords.accuracy)} metros.`
        );
      },
      (err) => {
        if (err.code === 1) {
          setGpsStatus('denied');
          setStatusMessage(
            'Permissão negada. Acesse as configurações do seu navegador ou do Android e permita "Localização".'
          );
        } else {
          setStatusMessage('Erro ao obter satélites do GPS: ' + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleTestFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      setFileTested(true);
      setStatusMessage('Acesso à galeria e câmera do dispositivo testado e liberado com sucesso!');
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] p-5 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#10263b] text-[#ffc400] rounded-xl font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#10263b] dark:text-white">
                Permissões do Dispositivo & Privacidade
              </h2>
              <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
                Regulamentação DTP-SP, Diretrizes Android e Conformidade LGPD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#5d6f80] hover:bg-[#eef2f5] dark:hover:bg-[#0e1822] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 bg-[#0f7f8c]/10 border border-[#0f7f8c] text-[#0f7f8c] rounded-xl text-xs font-bold flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            {statusMessage}
          </div>
        )}

        {/* Permissions list */}
        <div className="space-y-3 text-xs">
          {/* Permission 1: GPS */}
          <div className="p-3.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-[#10263b] dark:text-white">
                <MapPin className="w-4 h-4 text-[#ffc400]" />
                1. Localização GPS em Tempo Real
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  gpsStatus === 'granted'
                    ? 'bg-[#1b8a52]/20 text-[#1b8a52]'
                    : gpsStatus === 'denied'
                    ? 'bg-[#c93c3c]/20 text-[#c93c3c]'
                    : 'bg-[#ffc400]/20 text-[#ffc400]'
                }`}
              >
                {gpsStatus === 'granted' ? 'Autorizado' : gpsStatus === 'denied' ? 'Negado' : 'Pendente'}
              </span>
            </div>

            <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
              <b>Finalidade Exclusiva:</b> Transmissão da localização da van escolar aos pais e responsáveis durante o itinerário matutino e vespertino, estimativa de chegada e detecção automática de proximidade ao portão.
            </p>

            <div className="p-2 bg-[#ffc400]/10 border border-[#ffc400]/30 rounded-lg text-[10px] text-[#10263b] dark:text-[#ffc400] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Privacidade Estrita: O GPS só é capturado durante viagens ativas iniciadas pelo motorista. Fora do horário de transporte, o compartilhamento é 100% desligado.</span>
            </div>

            <button
              onClick={handleRequestGPS}
              className="w-full py-2 bg-[#10263b] hover:bg-[#1a3854] text-[#ffc400] font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              {gpsStatus === 'granted' ? 'Testar Sinal de Satélite GPS' : 'Autorizar Localização GPS'}
            </button>
          </div>

          {/* Permission 2: Files & Camera */}
          <div className="p-3.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#e2e8f0] dark:border-[#26384a] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-[#10263b] dark:text-white">
                <Camera className="w-4 h-4 text-[#0f7f8c]" />
                2. Acesso à Câmera e Galeria de Fotos
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  fileTested ? 'bg-[#1b8a52]/20 text-[#1b8a52]' : 'bg-[#5d6f80]/20 text-[#5d6f80]'
                }`}
              >
                {fileTested ? 'Verificado' : 'Disponível'}
              </span>
            </div>

            <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
              <b>Finalidade:</b> Envio das fotos obrigatórias do veículo (mínimo de 4 fotos da van para conferência pelas famílias), CNH profissional categoria D/E com EAR, certificado do curso de transporte e laudo de vistoria do Inmetro/DTP.
            </p>

            <button
              onClick={handleTestFilePicker}
              className="w-full py-2 bg-[#0f7f8c] hover:bg-[#0d6e7a] text-white font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Testar Acesso a Fotos / Galeria
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between">
          <span className="text-[11px] text-[#5d6f80]">
            Em conformidade com a LGPD (Lei 13.709/18)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ffc400] text-[#10263b] font-black rounded-xl text-xs hover:brightness-105 cursor-pointer"
          >
            Entendido & Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
