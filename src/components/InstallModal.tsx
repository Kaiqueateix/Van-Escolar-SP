import React, { useState } from 'react';
import { Smartphone, CheckCircle, ExternalLink, Shield, Bell, X, Copy, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { notifier } from '../services/notifications';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled, isIOS } = usePWAInstall();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pwa' | 'playstore' | 'appstore' | 'push'>('playstore');

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const testPush = async () => {
    const perm = await notifier.requestPermission();
    if (perm === 'granted') {
      notifier.notify(
        '🚐 Van Escolar SP - Notificação Ativa!',
        { body: 'A van de João Batista está chegando ao portão para o embarque de Lucas!' },
        'arrival'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16232f] text-[#10263b] dark:text-[#eaf0f5] w-full max-w-xl rounded-2xl shadow-2xl border border-[#d6dee6] dark:border-[#26384a] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#10263b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#ffc400] text-[#10263b] rounded-xl font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Publicação nas Lojas & PWA</h3>
              <p className="text-xs text-[#93a5b5]">Google Play Store, Apple App Store e Instalação Direta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#93a5b5] hover:text-white hover:bg-[#26384a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#d6dee6] dark:border-[#26384a] bg-[#eef2f5] dark:bg-[#0e1822]">
          <button
            onClick={() => setActiveTab('playstore')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              activeTab === 'playstore'
                ? 'border-[#ffc400] text-[#10263b] dark:text-[#ffc400] bg-white dark:bg-[#16232f]'
                : 'border-transparent text-[#5d6f80] dark:text-[#93a5b5]'
            }`}
          >
            Google Play Store
          </button>
          <button
            onClick={() => setActiveTab('appstore')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              activeTab === 'appstore'
                ? 'border-[#ffc400] text-[#10263b] dark:text-[#ffc400] bg-white dark:bg-[#16232f]'
                : 'border-transparent text-[#5d6f80] dark:text-[#93a5b5]'
            }`}
          >
            Apple App Store
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              activeTab === 'pwa'
                ? 'border-[#ffc400] text-[#10263b] dark:text-[#ffc400] bg-white dark:bg-[#16232f]'
                : 'border-transparent text-[#5d6f80] dark:text-[#93a5b5]'
            }`}
          >
            Instalar PWA
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              activeTab === 'push'
                ? 'border-[#ffc400] text-[#10263b] dark:text-[#ffc400] bg-white dark:bg-[#16232f]'
                : 'border-transparent text-[#5d6f80] dark:text-[#93a5b5]'
            }`}
          >
            Push Real-time
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          {/* TAB: GOOGLE PLAY STORE */}
          {activeTab === 'playstore' && (
            <div className="space-y-3">
              <div className="bg-[#1b8a52]/10 border border-[#1b8a52]/30 rounded-xl p-3 flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-[#1b8a52] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1b8a52]">Pronto para Google Play (TWA / AAB)</h4>
                  <p className="text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                    O aplicativo já possui todos os requisitos do Google Play: <b>manifest.json</b> completo, <b>ícones 192x192 e 512x512</b>, <b>Service Worker ativo</b> e modo <b>standalone</b>.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#5d6f80] dark:text-[#93a5b5]">
                  Passo a Passo para Gerar o Pacote (.AAB):
                </h5>
                <ol className="list-decimal pl-4 space-y-2 text-[#10263b] dark:text-[#eaf0f5] font-medium leading-relaxed">
                  <li>
                    Acesse <b>PWABuilder.com</b> (ferramenta oficial recomendada pelo Google) e insira a URL do app.
                  </li>
                  <li>
                    Clique em <b>Package for Stores → Android</b>.
                  </li>
                  <li>
                    Configure o Package ID: <code className="bg-[#eef2f5] dark:bg-[#0e1822] px-1 py-0.5 rounded font-mono">br.com.vanescolarsp.app</code>.
                  </li>
                  <li>
                    Baixe o arquivo <b>.aab</b> gerado e assinado digitalmente.
                  </li>
                  <li>
                    Faça upload no <b>Google Play Console</b> e publique em produção!
                  </li>
                </ol>
              </div>

              <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-xl border border-[#d6dee6] dark:border-[#26384a]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[11px]">Comando Alternativo via Terminal (Bubblewrap CLI):</span>
                  <button
                    onClick={() => copyText('npx @bubblewrap/cli init --manifest=manifest.webmanifest', 'bubble')}
                    className="flex items-center gap-1 text-[#0f7f8c] font-bold text-[11px] hover:underline"
                  >
                    {copiedSection === 'bubble' ? <Check className="w-3 h-3 text-[#1b8a52]" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="font-mono text-[10px] text-[#5d6f80] dark:text-[#93a5b5] overflow-x-auto p-1.5 bg-black/10 rounded">
npx @bubblewrap/cli init --manifest=manifest.webmanifest
npx @bubblewrap/cli build
                </pre>
              </div>
            </div>
          )}

          {/* TAB: APPLE APP STORE */}
          {activeTab === 'appstore' && (
            <div className="space-y-3">
              <div className="bg-[#0f7f8c]/10 border border-[#0f7f8c]/30 rounded-xl p-3 flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-[#0f7f8c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0f7f8c]">Pronto para Apple App Store (iOS)</h4>
                  <p className="text-[#5d6f80] dark:text-[#93a5b5] mt-0.5">
                    Possui suporte total a <b>apple-touch-icon.png</b>, meta tags <b>apple-mobile-web-app-capable</b>, Safe Area insets (entalhe do iPhone) e notificações WebKit Push.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#5d6f80] dark:text-[#93a5b5]">
                  Como Empacotar com Capacitor (Xcode / iOS):
                </h5>
                <ol className="list-decimal pl-4 space-y-2 text-[#10263b] dark:text-[#eaf0f5] font-medium leading-relaxed">
                  <li>
                    Instale o Capacitor no projeto para gerar o projeto nativo do Xcode:
                  </li>
                  <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-2 rounded-lg font-mono text-[11px]">
                    npm install @capacitor/core @capacitor/cli @capacitor/ios
                    <br />
                    npx cap init "Van Escolar SP" br.com.vanescolarsp.app
                    <br />
                    npm run build && npx cap add ios && npx cap open ios
                  </div>
                  <li>
                    Abra no <b>Xcode</b> no Mac, configure seu Certificado de Desenvolvedor Apple.
                  </li>
                  <li>
                    Envie para o <b>TestFlight</b> e submeta para revisão na <b>App Store Connect</b>.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: PWA DIRECT INSTALL */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="text-4xl mb-2">📲</div>
                <h4 className="text-sm font-extrabold">Instalação Imediata sem Lojas</h4>
                <p className="text-[#5d6f80] dark:text-[#93a5b5] text-xs max-w-sm mx-auto mt-1">
                  Funciona diretamente no navegador do seu smartphone como um aplicativo nativo completo, sem consumir espaço extra.
                </p>
              </div>

              {isInstalled ? (
                <div className="bg-[#1b8a52]/10 border border-[#1b8a52] text-[#1b8a52] p-3 rounded-xl font-bold text-center">
                  ✓ O aplicativo já está instalado no seu dispositivo!
                </div>
              ) : isInstallable ? (
                <button
                  onClick={install}
                  className="w-full bg-[#ffc400] text-[#10263b] font-black py-3 rounded-xl shadow-md text-sm hover:brightness-105 active:scale-95 transition"
                >
                  Instalar Van Escolar SP Agora
                </button>
              ) : isIOS ? (
                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3.5 rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-2">
                  <h5 className="font-extrabold text-xs">Como instalar no iPhone (Safari):</h5>
                  <p>1. Toque no botão de <b>Compartilhar</b> (ícone de quadrado com seta para cima) na barra inferior do Safari.</p>
                  <p>2. Role as opções e toque em <b>Adicionar à Tela de Início</b> (Add to Home Screen).</p>
                  <p>3. Toque em <b>Adicionar</b> no canto superior direito.</p>
                </div>
              ) : (
                <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 rounded-xl text-center text-[#5d6f80] dark:text-[#93a5b5]">
                  Abra este link no Google Chrome ou Safari do seu celular para instalar com 1 toque.
                </div>
              )}
            </div>
          )}

          {/* TAB: REAL-TIME PUSH */}
          {activeTab === 'push' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#ffc400]/10 border border-[#ffc400]/40 rounded-xl">
                <h4 className="font-black text-sm text-[#10263b] dark:text-[#ffc400] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#ffc400]" /> Notificações em Tempo Real
                </h4>
                <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] mt-1">
                  O sistema de notificações do Van Escolar SP dispara alertas imediatos com som e vibração para:
                </p>
                <ul className="list-disc pl-4 mt-2 space-y-1 text-xs">
                  <li>Van a 5 minutos da residência</li>
                  <li>Confirmação de embarque da criança</li>
                  <li>Chegada segura ao colégio</li>
                  <li>Desembarque autorizado</li>
                  <li>Avisos urgentes de trânsito ou atrasos</li>
                </ul>
              </div>

              <button
                onClick={testPush}
                className="w-full bg-[#10263b] hover:bg-[#1a3854] text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4 text-[#ffc400]" /> Testar Notificação de Chegada com Som
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#eef2f5] dark:bg-[#0e1822] p-3 border-t border-[#d6dee6] dark:border-[#26384a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-[#16232f] border border-[#d6dee6] dark:border-[#26384a] rounded-xl font-bold text-xs hover:bg-[#d6dee6] transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
