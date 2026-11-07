import React from 'react';
import { ShieldCheck, Lock, UserCheck, X } from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-lg rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden my-6">
        <div className="bg-[#10263b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ffc400]" />
            <h3 className="font-extrabold text-base">Privacidade, LGPD & Proteção Infantil</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#93a5b5] hover:text-white hover:bg-[#26384a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs leading-relaxed">
          <div className="bg-[#1b8a52]/10 border border-[#1b8a52]/30 p-3 rounded-xl flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#1b8a52] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1b8a52]">Conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018)</h4>
              <p className="text-[#5d6f80] dark:text-[#93a5b5] mt-1">
                O Van Escolar SP adota o mais alto padrão de segurança no tratamento de dados cadastrais, financeiros e de deslocamento.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-extrabold text-sm flex items-center gap-1.5 text-[#10263b] dark:text-white">
              <UserCheck className="w-4 h-4 text-[#0f7f8c]" /> 1. Proteção Especial a Dados de Crianças e Adolescentes (Art. 14 LGPD)
            </h5>
            <p className="text-[#5d6f80] dark:text-[#93a5b5]">
              O tratamento de dados pessoais de crianças (nomes, fotos, escolas, restrições médicas e rotas de embarque) é realizado <b>exclusivamente mediante consentimento específico</b> manifestado por pelo menos um dos pais ou responsável legal, estritamente para a finalidade da execução segura do transporte escolar.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-extrabold text-sm flex items-center gap-1.5 text-[#10263b] dark:text-white">
              <Lock className="w-4 h-4 text-[#ffc400]" /> 2. Rastreamento GPS e Acesso Restrito
            </h5>
            <p className="text-[#5d6f80] dark:text-[#93a5b5]">
              As coordenadas de localização em tempo real da van e o histórico de paradas são <b>estritamente restritos</b> aos responsáveis com contrato ativo e ao transportador contratado. Nenhum terceiro ou visitante não autenticado tem acesso a rotas escolares.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-extrabold text-sm flex items-center gap-1.5 text-[#10263b] dark:text-white">
              <ShieldCheck className="w-4 h-4 text-[#1b8a52]" /> 3. Registro de Auditoria & Trilha de Segurança
            </h5>
            <p className="text-[#5d6f80] dark:text-[#93a5b5]">
              Todas as ações de verificação cadastral, aprovação de alvarás do DTP, moderação de denúncias e alterações de status são registradas com carimbo de tempo, IP e identificação do agente para conformidade regulatória.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-extrabold text-sm text-[#10263b] dark:text-white">
              4. Direitos do Titular
            </h5>
            <p className="text-[#5d6f80] dark:text-[#93a5b5]">
              A qualquer momento o responsável legal poderá solicitar acesso, correção, anonimização ou exclusão definitiva dos dados de sua família através do canal de atendimento ou no menu de perfil.
            </p>
          </div>
        </div>

        <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 border-t border-[#d6dee6] dark:border-[#26384a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ffc400] text-[#10263b] rounded-xl font-bold text-xs hover:brightness-105 transition"
          >
            Entendido e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};
