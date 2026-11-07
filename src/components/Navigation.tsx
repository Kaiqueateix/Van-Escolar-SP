import React from 'react';
import { UserRole } from '../types';
import {
  Search,
  Navigation as NavIcon,
  CreditCard,
  MessageSquare,
  Users,
  Briefcase,
  Route,
  DollarSign,
  Wrench,
  ShieldCheck,
  MoreHorizontal,
  UserCheck
} from 'lucide-react';

interface NavigationProps {
  role: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadChat?: number;
  newOpportunitiesCount?: number;
  pendingDocsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  role,
  currentTab,
  onSelectTab,
  unreadChat = 0,
  newOpportunitiesCount = 0,
  pendingDocsCount = 0,
}) => {
  if (role === 'c') {
    // Parent / Family Tabs
    const items = [
      { id: 'b', label: 'Buscar', icon: Search },
      { id: 'l', label: 'Rastrear', icon: NavIcon },
      { id: 'k', label: 'Embarques', icon: UserCheck },
      { id: 'p', label: 'Pagar', icon: CreditCard },
      { id: 'c', label: 'Chat', icon: MessageSquare, badge: unreadChat },
      { id: 'o', label: 'Mais', icon: MoreHorizontal }
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#16232f] border-t border-[#d6dee6] dark:border-[#26384a] pb-safe shadow-lg">
        <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex items-center justify-around px-1 py-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-xl transition relative ${
                  isActive
                    ? 'text-[#10263b] dark:text-[#ffc400] font-black'
                    : 'text-[#5d6f80] dark:text-[#93a5b5] hover:text-[#10263b] font-bold'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0.5 w-6 h-1 bg-[#ffc400] rounded-full" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1 -right-2 bg-[#c93c3c] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight truncate max-w-[56px] text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  if (role === 't') {
    // Transporter Tabs
    const items = [
      { id: 'opp', label: 'Oportunidades', icon: Briefcase, badge: newOpportunitiesCount },
      { id: 'k', label: 'Alunos', icon: Users },
      { id: 'r', label: 'Rotas', icon: Route },
      { id: 'p', label: 'Finanças', icon: DollarSign },
      { id: 'v', label: 'Minha Van', icon: Wrench },
      { id: 'm', label: 'Mais', icon: MoreHorizontal }
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#16232f] border-t border-[#d6dee6] dark:border-[#26384a] pb-safe shadow-lg">
        <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex items-center justify-around px-1 py-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-xl transition relative ${
                  isActive
                    ? 'text-[#10263b] dark:text-[#ffc400] font-black'
                    : 'text-[#5d6f80] dark:text-[#93a5b5] hover:text-[#10263b] font-bold'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0.5 w-6 h-1 bg-[#ffc400] rounded-full" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1 -right-2 bg-[#ffc400] text-[#10263b] text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight truncate max-w-[56px] text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Admin Tabs
  const items = [
    { id: 'adm_dash', label: 'Painel', icon: ShieldCheck },
    { id: 'adm_docs', label: 'Verificações', icon: UserCheck, badge: pendingDocsCount },
    { id: 'adm_users', label: 'Usuários', icon: Users },
    { id: 'adm_reports', label: 'Denúncias', icon: MoreHorizontal }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#16232f] border-t border-[#d6dee6] dark:border-[#26384a] pb-safe shadow-lg">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex items-center justify-around px-1 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-xl transition relative ${
                isActive
                  ? 'text-[#0f7f8c] dark:text-[#4cc3d1] font-black'
                  : 'text-[#5d6f80] dark:text-[#93a5b5] hover:text-[#10263b] font-bold'
              }`}
            >
              {isActive && (
                <span className="absolute top-0.5 w-6 h-1 bg-[#0f7f8c] rounded-full" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-[#c93c3c] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
