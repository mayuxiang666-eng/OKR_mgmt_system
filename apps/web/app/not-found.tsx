'use client';

import Link from 'next/link';
import { useI18n } from '../lib/i18n';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-[#D97706]" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{t('notFoundTitle')}</h1>
      <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed text-lg">
        {t('notFoundMessage')}
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 px-8 py-4 bg-[#D97706] text-white font-bold rounded-xl hover:bg-[#B45309] transition-all shadow-lg shadow-orange-900/20 hover:shadow-orange-900/30 hover:-translate-y-1 active:translate-y-0"
      >
        <Home className="w-5 h-5" />
        {t('backHome')}
      </Link>
      
      <div className="mt-12 pt-8 border-t border-gray-100/50 w-full max-w-xs mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-300">合肥工厂 OKR 平台</p>
      </div>
    </div>
  );
}
