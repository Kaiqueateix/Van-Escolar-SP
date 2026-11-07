import React, { useState } from 'react';
import { User, SubscriptionTier } from '../types';
import { Bell, ShieldCheck, Download, Smartphone, Moon, Sun, LogOut, ArrowRightLeft, ArrowLeft } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onSwitchUser: (email: string) => void;
  onOpenStoreModal: () => void;
  onOpenPermissions?: () => void;
  onOpenLGPD: () => void;
  unreadCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  subscriptionTier?: SubscriptionTier;
  isVerified?: boolean;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onSwitchUser,
  onOpenStoreModal,
  onOpenPermissions,
  onOpenLGPD,
  unreadCount = 0,
  darkMode,
  onToggleDarkMode,
  subscriptionTier,
  isVerified,
  canGoBack,
  onGoBack
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-[#10263b] text-white shadow-md border-b border-[#26384a]">
      {/* Top Brand Bar */}
      <div className="max-w-md sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-1 bg-[#1c3044] hover:bg-[#27425d] active:scale-95 text-[#ffc400] text-xs font-black py-1.5 px-2.5 rounded-xl border border-[#3b536e] transition cursor-pointer shadow-sm mr-1"
              title="Voltar para a aba anterior"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Voltar</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-[#ffc400] text-[#10263b] flex items-center justify-center font-black text-xl shadow-inner shrink-0">
            🚌
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Van Escolar <span className="text-[#ffc400]">SP</span>
              </h1>
              {isVerified && (
                <span title="Transportador Verificado DTP SP" className="inline-flex items-center gap-0.5 bg-[#1b8a52] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> VERIFICADO
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#93a5b5] font-medium leading-none">
              Plataforma Oficial de Transporte Escolar SP
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Permissions Modal button */}
          {onOpenPermissions && (
            <button
              onClick={onOpenPermissions}
              className="flex items-center gap-1.5 bg-[#26384a] hover:bg-[#344b61] text-[#ffc400] text-xs font-bold py-1.5 px-2.5 rounded-lg transition cursor-pointer"
              title="Permissões do Dispositivo (GPS, Câmera e Notificações)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Permissões</span>
            </button>
          )}

          {/* Quick Store / App Store Ready Button */}
          <button
            onClick={onOpenStoreModal}
            className="hidden sm:flex items-center gap-1.5 bg-[#26384a] hover:bg-[#344b61] text-[#ffc400] text-xs font-bold py-1.5 px-2.5 rounded-lg transition"
            title="Pronto para Google Play Store e Apple App Store"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Lojas de Apps</span>
          </button>

          {/* Install PWA Button */}
          {(isInstallable || isIOS) && (
            <button
              onClick={() => {
                if (isInstallable) install();
                else onOpenStoreModal();
              }}
              className="flex items-center gap-1 bg-[#ffc400] text-[#10263b] text-xs font-black py-1 px-2.5 rounded-lg shadow-sm hover:brightness-105 active:scale-95 transition"
              title="Instalar no celular"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Instalar</span>
            </button>
          )}

          {/* Theme Toggle: Day (white/light) vs Night (dark/black) */}
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              darkMode
                ? 'bg-[#1e293b] text-[#ffc400] border-[#334155] hover:bg-[#334155]'
                : 'bg-white text-[#10263b] border-[#d6dee6] hover:bg-[#f1f5f9]'
            }`}
            title={darkMode ? 'Mudar para Modo Dia (Claro e Branco)' : 'Mudar para Modo Noite (Escuro e Preto)'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#ffc400]" />
                <span className="hidden sm:inline">Dia</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#10263b]" />
                <span className="hidden sm:inline">Noite</span>
              </>
            )}
          </button>

          {/* User profile dropdown / fast switcher */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1.5 bg-[#16232f] border border-[#26384a] text-xs text-[#eaf0f5] py-1 px-2.5 rounded-lg hover:bg-[#26384a] transition cursor-pointer"
                title="Trocar perfil de demonstração"
              >
                <span className="w-2 h-2 rounded-full bg-[#1b8a52]"></span>
                <span className="font-bold max-w-[80px] sm:max-w-[120px] truncate">
                  {user.n.split(' ')[0]}
                </span>
                <ArrowRightLeft className="w-3 h-3 text-[#ffc400]" />
              </button>

              {/* Demo accounts fast switch menu */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-64 bg-[#16232f] border border-[#26384a] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[11px] font-bold text-[#93a5b5] uppercase tracking-wider border-b border-[#26384a]">
                      Alternar Perfil Demo:
                    </div>
                    <button
                      onClick={() => { onSwitchUser('marta.almeida@gmail.com'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#26384a] text-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold">Marta Almeida</div>
                        <div className="text-[11px] text-[#93a5b5]">👨‍👩‍👧 Responsável / Família</div>
                      </div>
                      {user.role === 'c' && <span className="text-[#ffc400] font-black">✓</span>}
                    </button>
                    <button
                      onClick={() => { onSwitchUser('joao.batista@vanescolar.sp'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#26384a] text-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold">João Batista</div>
                        <div className="text-[11px] text-[#ffc400]">🚐 Transportador Premium</div>
                      </div>
                      {user.role === 't' && <span className="text-[#ffc400] font-black">✓</span>}
                    </button>
                    <button
                      onClick={() => { onSwitchUser('admin@vanescolar.sp'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#26384a] text-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold">Admin DTP SP</div>
                        <div className="text-[11px] text-[#0f7f8c]">🛡️ Painel Administrativo</div>
                      </div>
                      {user.role === 'a' && <span className="text-[#ffc400] font-black">✓</span>}
                    </button>
                    <div className="border-t border-[#26384a] mt-1 pt-1">
                      {onOpenPermissions && (
                        <button
                          onClick={() => { onOpenPermissions(); setIsMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#93a5b5] hover:text-white hover:bg-[#26384a] flex items-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-[#ffc400]" /> Permissões do Dispositivo (GPS/Fotos)
                        </button>
                      )}
                      <button
                        onClick={() => { onOpenLGPD(); setIsMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#93a5b5] hover:text-white hover:bg-[#26384a]"
                      >
                        Termos LGPD & Proteção de Crianças
                      </button>
                      <button
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#c93c3c] hover:bg-[#26384a] flex items-center gap-1.5 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-bar with User Status banner */}
      {user && (
        <div className="bg-[#0e1822] px-4 py-1.5 text-xs flex items-center justify-between border-t border-[#26384a]">
          <div className="flex items-center gap-2 text-[#93a5b5] max-w-md sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto w-full">
            <span className="font-medium">
              Conectado como <b className="text-white">{user.n}</b>
            </span>
            <span className="text-[#5d6f80]">|</span>
            {user.role === 'c' && (
              <span className="text-[#ffc400] font-bold">Responsável</span>
            )}
            {user.role === 't' && (
              <span className="text-[#ffc400] font-bold flex items-center gap-1">
                Transportador ({subscriptionTier === 'premium' ? 'Plano Premium ⭐' : subscriptionTier === 'pro' ? 'Plano Profissional' : 'Plano Gratuito'})
              </span>
            )}
            {user.role === 'a' && (
              <span className="text-[#4cc3d1] font-bold">Órgão Regulador DTP</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
