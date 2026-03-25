'use client';

import React from 'react';
import { X, Download, Monitor, Target, ArrowLeft } from 'lucide-react';
import { Objective } from '../lib/types';
import { useI18n } from '../lib/i18n';

interface Props {
  obj: Objective;
  onClose: () => void;
  onDownload: () => void;
}

export default function PPTPreviewModal({ obj, onClose, onDownload }: Props) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-2 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-[98vw] max-w-[1600px] overflow-hidden flex flex-col h-[98vh] border border-gray-100 relative">
        
        {/* Header - Pinned Top */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Monitor className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('detailPreviewPpt')}</h3>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate max-w-sm">{obj.title || "OKR"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              {t('detailExportPpt')}
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('detailBackToExplorer')}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-gray-100/50 flex flex-col items-center justify-center p-4 md:p-8 min-h-0 relative">
          
          {/* Aspect Ratio Box (Slide Shell) */}
          <div className="w-full max-w-[1400px] max-h-full aspect-[16/9] bg-white shadow-2xl border border-gray-300 pointer-events-none select-none overflow-hidden flex flex-col justify-center items-center relative">
            
            {/* Slide Body - Replicating the 4-box layout from route.ts */}
            <div className="absolute inset-[4%] grid grid-cols-2 grid-rows-2 gap-[2%]">
              
              {/* Box 1: Focus Current Month */}
              <div className="flex flex-col border border-gray-200 bg-[#FFFBEB] overflow-hidden">
                <div className="bg-[#F59E0B] py-[1%] px-[3%] shrink-0">
                  <span className="text-white font-bold text-[1.1vw]">Focus Item _ Current Month</span>
                </div>
                <div className="flex-1 p-[3%] overflow-hidden">
                   <p className="text-gray-800 text-[1vw] leading-tight whitespace-pre-wrap">{obj.currentMonthFocus || "No focus items set."}</p>
                </div>
              </div>

              {/* Box 2: OKR Distribution */}
              <div className="flex flex-col border border-gray-200 bg-[#FFFBEB] overflow-hidden">
                 <div className="bg-[#F59E0B] py-[1%] px-[3%] shrink-0">
                  <span className="text-white font-bold text-[1.1vw]">OKR Distribution ({obj.cycle || ""})</span>
                </div>
                <div className="flex-1 p-[3%] overflow-hidden">
                   <p className="text-gray-900 font-bold text-[1vw] mb-[1%] underline decoration-[#F59E0B] decoration-1">Objectives:</p>
                   <p className="text-blue-700 font-bold text-[1vw] mb-[2%] line-clamp-2">{obj.title}</p>
                   <p className="text-gray-900 font-bold text-[0.9vw] mb-[1%] underline decoration-[#F59E0B] decoration-1">Key Results:</p>
                   <div className="space-y-[0.5%] overflow-hidden">
                      {(obj.keyResults || []).slice(0, 5).map((kr, i) => (
                        <div key={kr.id} className="text-[0.85vw] text-gray-700 flex justify-between gap-2">
                          <span className="truncate">{i+1}. {kr.title}</span>
                          <span className="font-bold text-gray-900 shrink-0">{kr.confidenceScore ?? 5}/10</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Box 3: Focus Next Month */}
              <div className="flex flex-col border border-gray-200 bg-[#FFFBEB] overflow-hidden">
                <div className="bg-[#F59E0B] py-[1%] px-[3%] shrink-0">
                  <span className="text-white font-bold text-[1.1vw]">Focus Item _ x + 1 Month</span>
                </div>
                <div className="flex-1 p-[3%] overflow-hidden">
                   <p className="text-gray-800 text-[1vw] leading-tight whitespace-pre-wrap">{obj.nextMonthFocus || "No forward plan submitted."}</p>
                </div>
              </div>

              {/* Box 4: Status Indicators */}
              <div className="flex flex-col border border-gray-200 bg-[#FFFBEB] overflow-hidden">
                <div className="bg-[#F59E0B] py-[1%] px-[3%] shrink-0">
                  <span className="text-white font-bold text-[1.1vw]">Status Indicators</span>
                </div>
                <div className="flex-1 p-[3%] overflow-hidden">
                   <p className="text-gray-800 text-[1vw] leading-tight whitespace-pre-wrap">{obj.statusIndicators || "No indicators captured."}</p>
                </div>
              </div>

            </div>

            {/* Platform Footer Mark */}
            <div className="absolute bottom-[2%] right-[2%] opacity-30 flex items-center gap-[0.5%]">
                <Target className="w-[1.2vw] h-[1.2vw] text-gray-600" />
                <span className="text-[0.8vw] font-bold text-gray-600">合肥工厂 OKR 平台</span>
            </div>
          </div>

          {/* Floating Control Bar at Bottom */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/95 backdrop-blur-sm border border-orange-100 shadow-xl px-2 py-2 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
             <button 
               onClick={onClose}
               className="flex items-center gap-2 px-5 py-2 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-all"
             >
               <ArrowLeft className="w-4 h-4" />
               {t('detailBackToExplorer')}
             </button>
             <div className="w-px h-6 bg-gray-200 mx-1" />
             <button 
               onClick={onDownload}
               className="flex items-center gap-2 px-6 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
             >
               <Download className="w-4 h-4" />
               {t('detailExportPpt')}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
