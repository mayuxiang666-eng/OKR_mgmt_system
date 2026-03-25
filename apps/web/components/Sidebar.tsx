'use client';

import Link from 'next/link';
import { LayoutDashboard, HelpCircle, LogOut, Plus, PieChart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useOkrStore } from '../lib/store';
import { useI18n } from '../lib/i18n';

export default function Sidebar() {
  const pathname = usePathname();
  const { setNewObjModalOpen } = useOkrStore();
  const { t } = useI18n();

  const navItems = [
    { href: '/', label: t('navExplorer'), icon: LayoutDashboard },
    { href: '/leadership', label: t('navLeadership'), icon: PieChart },
  ];

  return (
    <aside className="w-64 bg-[#FAFAFA] border-r border-gray-200 h-screen flex flex-col shrink-0 z-20">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8B5F2E] rounded flex items-center justify-center text-white font-bold transition-transform hover:scale-110 shadow-sm shadow-orange-900/20">
            H
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">{t('appTitle')}</h1>
            <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/okr' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'bg-white text-[#8B5F2E] font-semibold shadow-sm border border-gray-100/50'
                  : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8B5F2E] rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#8B5F2E]' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="text-[13px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-[#FAFAFA] space-y-4">
        <button
          onClick={() => setNewObjModalOpen(true)}
          className="w-full bg-[#D97706] hover:bg-[#B45309] text-white py-2.5 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          {t('newObjective')}
        </button>
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 w-full text-left rounded-md transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">{t('helpCenter')}</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 w-full text-left rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">{t('logOut')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
