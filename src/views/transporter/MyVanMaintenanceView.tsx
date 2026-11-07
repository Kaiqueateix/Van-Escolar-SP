import React, { useState } from 'react';
import { VanMaintenance, TransporterProfile } from '../../types';
import {
  Wrench,
  Gauge,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  ShieldCheck,
  Disc,
  Fuel,
  Plus
} from 'lucide-react';

interface MyVanMaintenanceViewProps {
  maintenance: VanMaintenance | undefined;
  transporter: TransporterProfile;
  onUpdateKm: (newKm: number) => void;
  onLogMaintenance: (item: string) => void;
}

export const MyVanMaintenanceView: React.FC<MyVanMaintenanceViewProps> = ({
  maintenance,
  transporter,
  onUpdateKm,
  onLogMaintenance
}) => {
  const currentKm = maintenance?.currentKm || 78400;
  const nextOilKm = maintenance?.nextOilKm || 80000;
  const kmToOil = nextOilKm - currentKm;

  const [newKmInput, setNewKmInput] = useState<string>(String(currentKm));
  const [isEditingKm, setIsEditingKm] = useState<boolean>(false);

  const handleSaveKm = () => {
    const val = parseInt(newKmInput, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateKm(val);
      setIsEditingKm(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#10263b] dark:text-white flex items-center gap-2">
            Minha Van Escolar
          </h2>
          <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5]">
            Controle de manutenção preventiva, vistorias DTP e documentação
          </p>
        </div>

        <span className="bg-[#1b8a52] text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" /> Frota Legalizada
        </span>
      </div>

      {/* Van Overview Card */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#5d6f80] uppercase tracking-wider">
              Veículo Credenciado
            </div>
            <h3 className="font-black text-base text-[#10263b] dark:text-white mt-0.5">
              {transporter.vanModel} ({transporter.vanYear})
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#5d6f80] mt-1">
              <span>Placa: <b className="font-mono text-[#10263b] dark:text-white">{transporter.vanPlate}</b></span>
              <span>·</span>
              <span>Capacidade: <b>{transporter.seatsTotal} lugares</b></span>
            </div>
          </div>

          <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2.5 rounded-xl text-right border border-[#d6dee6] dark:border-[#26384a]">
            <div className="text-[10px] font-bold text-[#5d6f80]">Odômetro Atual</div>
            {isEditingKm ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={newKmInput}
                  onChange={(e) => setNewKmInput(e.target.value)}
                  className="w-24 p-1 text-xs font-mono font-bold bg-white dark:bg-[#16232f] rounded border"
                />
                <button
                  onClick={handleSaveKm}
                  className="bg-[#1b8a52] text-white text-[10px] font-bold px-2 py-1 rounded"
                >
                  OK
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingKm(true)}
                className="text-base font-black font-mono text-[#10263b] dark:text-white cursor-pointer hover:underline mt-0.5"
                title="Clique para atualizar a quilometragem"
              >
                {currentKm.toLocaleString('pt-BR')} km ✏️
              </div>
            )}
          </div>
        </div>

        {/* Oil meter progress */}
        <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl space-y-1.5 border border-[#d6dee6] dark:border-[#26384a]">
          <div className="flex justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[#ffc400]" />
              Próxima Troca de Óleo Diesel & Filtro:
            </span>
            <span className={kmToOil < 1000 ? 'text-[#c93c3c]' : 'text-[#1b8a52]'}>
              Faltam {kmToOil.toLocaleString('pt-BR')} km ({nextOilKm.toLocaleString('pt-BR')} km)
            </span>
          </div>
          <div className="w-full bg-[#d6dee6] dark:bg-[#26384a] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${kmToOil < 1000 ? 'bg-[#c93c3c]' : 'bg-[#1b8a52]'}`}
              style={{ width: `${Math.min(100, Math.max(10, 100 - (kmToOil / 10000) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Maintenance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Freios e Suspensão */}
        <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#0f7f8c]/10 text-[#0f7f8c] rounded-xl font-bold">
                <Disc className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs text-[#10263b] dark:text-white">Freios & Pastilhas</h4>
                <div className="text-[10px] text-[#5d6f80]">Checagem a cada 15.000 km</div>
              </div>
            </div>
            <span className="text-[11px] font-black bg-[#1b8a52]/10 text-[#1b8a52] px-2 py-0.5 rounded-full">
              Revisados
            </span>
          </div>
          <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
            Pastilhas dianteiras trocadas aos 72.000 km. Fluído de freio DOT 4 novo.
          </p>
        </div>

        {/* Pneus & Alinhamento */}
        <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#ffc400]/10 text-[#10263b] dark:text-[#ffc400] rounded-xl font-bold">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs text-[#10263b] dark:text-white">Pneus & Geometria</h4>
                <div className="text-[10px] text-[#5d6f80]">Calibragem semanal recomendada</div>
              </div>
            </div>
            <span className="text-[11px] font-black bg-[#1b8a52]/10 text-[#1b8a52] px-2 py-0.5 rounded-full">
              Em bom estado
            </span>
          </div>
          <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-relaxed">
            Pneus Michelin Agilis com 65% de vida útil. Rodízio e balanceamento em dia.
          </p>
        </div>
      </div>

      {/* Mandatory Inspections and DTP Legal Alerts */}
      <div className="bg-white dark:bg-[#16232f] p-4 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs space-y-3">
        <h3 className="font-black text-sm text-[#10263b] dark:text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#ffc400]" />
          Vistorias Obrigatórias & Prazos da Prefeitura de SP
        </h3>

        <div className="space-y-2 text-xs">
          {/* Vistoria Semestral DTP */}
          <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#0f7f8c]" />
              <div>
                <div className="font-bold text-[#10263b] dark:text-white">
                  Vistoria Semestral Obrigatória (DTP / Inmetro)
                </div>
                <div className="text-[11px] text-[#5d6f80]">
                  Última: 15/01/2026 · Próxima vistoria obrigatória: <b>15/07/2026</b>
                </div>
              </div>
            </div>
            <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              REGULAR
            </span>
          </div>

          {/* Alvará de Estacionamento DTP */}
          <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#1b8a52]" />
              <div>
                <div className="font-bold text-[#10263b] dark:text-white">
                  Alvará Escolar DTP-SP
                </div>
                <div className="text-[11px] text-[#5d6f80]">
                  Registro: <b>DTP-SP 89.214/2026</b> · Validade: 31/12/2026
                </div>
              </div>
            </div>
            <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              VÁLIDO
            </span>
          </div>

          {/* Tacógrafo Inmetro */}
          <div className="p-3 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-[#ffc400]" />
              <div>
                <div className="font-bold text-[#10263b] dark:text-white">
                  Aferição de Cronotacógrafo
                </div>
                <div className="text-[11px] text-[#5d6f80]">
                  Certificado Inmetro nº 491202 · Válido até Novembro/2026
                </div>
              </div>
            </div>
            <span className="bg-[#1b8a52] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              AFERIDO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
