'use client';

import { Search, Bell, LogOut, Languages } from 'lucide-react';
import { useOkrStore } from '../lib/store';
import { useI18n } from '../lib/i18n';

export default function Topnav() {
  const { currentUser, logout, searchQuery, setSearchQuery } = useOkrStore();
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm relative sticky top-0">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#D97706] transition-colors" />
          <input
            type="text"
            placeholder={t('searchObjectivesByTitle')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:bg-white transition-all placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          title={language === 'zh' ? t('switchToEnglish') : t('switchToChinese')}
        >
          <Languages className="w-3.5 h-3.5" />
          {language === 'zh' ? 'EN' : '中文'}
        </button>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D97706] rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-900">{currentUser}</p>
            <p className="text-xs text-gray-500 font-medium tracking-wide">{t('companyOrg')}</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-[#D97706] to-[#8B5F2E] rounded-full text-white flex items-center justify-center font-bold shadow-sm shadow-orange-900/20 text-sm">
            {currentUser?.charAt(0) || 'U'}
          </div>
          <button onClick={logout} className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50" title={t('signOut')}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

