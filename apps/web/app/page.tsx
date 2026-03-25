'use client';

import { useOkrStore } from '../lib/store';
import { useState, useRef } from 'react';
import { ChevronDown, Target, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import Link from 'next/link';
import { deleteObjective as deleteObjectiveRequest } from '../lib/api';
import { useI18n } from '../lib/i18n';

export default function OKRExplorer() {
  const { objectives, searchQuery, setSearchQuery, deleteObjective, currentUser } = useOkrStore();
  const { t } = useI18n();

  const [selectedCycle, setSelectedCycle] = useState('All Cycles');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedOwner, setSelectedOwner] = useState('My Objectives');
  const [expandedObs, setExpandedObs] = useState<Set<string>>(new Set());

  // ── Chart filter state ────────────────────────────────────────────────────
  // statusFilter: 'onTrack' | 'atRisk' | 'offTrack' | null
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // themeFilter: theme name | null
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [showOnlyCrossOkr, setShowOnlyCrossOkr] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedObs);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedObs(next);
  };

  const scrollToList = () => {
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const availableCycles = ['All Cycles', ...Array.from(new Set(objectives.map(o => o.cycle)))];
  const availableCategories = ['All Categories', ...Array.from(new Set(objectives.map(o => o.category)))];
  const availableOwners = ['All Owners', 'My Objectives', ...Array.from(new Set(objectives.flatMap(o => (o.assignedTo || '').split(' ; '))))].filter(x => x);

  // ── Compute health stats for ALL objectives (ignore filters for chart) ──
  const allOkrCount = objectives.length;
  let allOnTrack = 0, allAtRisk = 0, allOffTrack = 0;
  let crossCount = 0, taskForceCount = 0;

  const themeStats: Record<string, { onTrack: number; atRisk: number; offTrack: number; total: number }> = {
    'Scrap Reduction': { onTrack: 0, atRisk: 0, offTrack: 0, total: 0 },
    'Process Maturity': { onTrack: 0, atRisk: 0, offTrack: 0, total: 0 },
    'Reliability / Stability': { onTrack: 0, atRisk: 0, offTrack: 0, total: 0 },
    'Digitalization & Smart Mfg': { onTrack: 0, atRisk: 0, offTrack: 0, total: 0 },
    'Team & Capability': { onTrack: 0, atRisk: 0, offTrack: 0, total: 0 },
    'Other Strategic Goals': { onTrack: 0, atRisk: 0, offTrack: 0, total: 0 },
  };

  // Map each objective to a status + theme + cross flag
  const objMeta: Record<string, { status: 'onTrack' | 'atRisk' | 'offTrack'; theme: string; isCross: boolean }> = {};

  objectives.forEach(obj => {
    // ── Traffic light based on manual status selector ───────────────────────
    // 🟢 On Track  : Completed, In progress
    // 🟡 At Risk   : Behind, Not started
    // 🔴 Off Track : Blocked
    let s: 'onTrack' | 'atRisk' | 'offTrack';
    if (obj.status === 'Completed' || obj.status === 'In progress') s = 'onTrack';
    else if (obj.status === 'Behind' || obj.status === 'Not started') s = 'atRisk';
    else if (obj.status === 'Blocked') s = 'offTrack';
    else s = 'offTrack'; // Default for safety

    if (s === 'onTrack') allOnTrack++;
    if (s === 'atRisk') allAtRisk++;
    if (s === 'offTrack') allOffTrack++;

    const searchStr = (obj.title + ' ' + obj.category + ' ' + (obj.notes || '')).toLowerCase();
    const isCross = obj.category === 'Cross-OKR' || searchStr.includes('cross') || (obj.assignedTo || '').includes(' ; ');
    if (isCross) crossCount++;
    if (searchStr.includes('task force') || searchStr.includes('committee') || obj.priority === 'Critical') taskForceCount++;

    let theme = 'Other Strategic Goals';
    if (searchStr.includes('scrap') || searchStr.includes('waste')) theme = 'Scrap Reduction';
    else if (searchStr.includes('process') || searchStr.includes('lean') || obj.category.includes('Process maturity')) theme = 'Process Maturity';
    else if (searchStr.includes('reliab') || searchStr.includes('stabil') || searchStr.includes('qual')) theme = 'Reliability / Stability';
    else if (searchStr.includes('digit') || searchStr.includes('smart') || searchStr.includes('system') || searchStr.includes('tool')) theme = 'Digitalization & Smart Mfg';
    else if (searchStr.includes('team') || searchStr.includes('train') || searchStr.includes('capab') || searchStr.includes('perform') || searchStr.includes('talent')) theme = 'Team & Capability';

    themeStats[theme][s]++;
    themeStats[theme].total++;
    objMeta[obj.id] = { status: s, theme, isCross };
  });

  const activeThemes = Object.entries(themeStats).filter(([_, d]) => d.total > 0).sort((a, b) => b[1].total - a[1].total);

  const displayCycle = (value: string) => (value === 'All Cycles' ? t('allCycles') : value);
  const displayCategory = (value: string) => (value === 'All Categories' ? t('allCategories') : value);
  const displayOwner = (value: string) => {
    if (value === 'All Owners') return t('allOwners');
    if (value === 'My Objectives') return t('myObjectives');
    return value;
  };

  // ── Click handlers ────────────────────────────────────────────────────────
  const handleDonutClick = (status: string) => {
    setStatusFilter(prev => prev === status ? null : status);
    setThemeFilter(null);
    scrollToList();
  };

  const handleBarClick = (theme: string, seg?: string) => {
    setThemeFilter(prev => prev === theme && !seg ? null : theme);
    if (seg) setStatusFilter(prev => prev === seg ? null : seg);
    scrollToList();
  };

  const clearChartFilter = () => { setStatusFilter(null); setThemeFilter(null); setShowOnlyCrossOkr(false); };

  // ── Filter list ───────────────────────────────────────────────────────────
  const filteredObjectives = objectives.filter(obj => {
    if (selectedCycle !== 'All Cycles' && obj.cycle !== selectedCycle) return false;
    if (selectedCategory !== 'All Categories' && obj.category !== selectedCategory) return false;
    if (selectedOwner === 'My Objectives') {
      if (!currentUser || !(obj.assignedTo || '').includes(currentUser.displayName)) return false;
    } else if (selectedOwner !== 'All Owners') {
      if (!(obj.assignedTo || '').includes(selectedOwner)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!obj.title.toLowerCase().includes(q) && !obj.keyResults.some(kr => kr.title.toLowerCase().includes(q))) return false;
    }
    // Chart filters
    const meta = objMeta[obj.id];
    if (statusFilter && meta?.status !== statusFilter) return false;
    if (themeFilter && meta?.theme !== themeFilter) return false;
    if (showOnlyCrossOkr && !meta?.isCross) return false;
    return true;
  });

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In progress': return 'bg-blue-100 text-blue-700';
      case 'Blocked': case 'Behind': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalOkr = allOkrCount;
  const activeFilter = statusFilter || themeFilter || showOnlyCrossOkr;

  const handleDeleteObjective = async (id: string, title: string) => {
    if (!confirm(`${t('deleteObjectiveConfirm')}\n\n${title}`)) return;

    try {
      await deleteObjectiveRequest(id);
      deleteObjective(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : t('deleteFailed')); 
    }
  };

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div className="flex justify-between items-start">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('explorerTitle')}</h1>
          <p className="text-gray-500">{t('explorerSubtitle')}</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           STRATEGIC OKR HEALTH  (moved to TOP)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t('strategicHealth')}</h2>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Click any segment to filter the OKR list below ↓</p>
          </div>
          <div className="flex gap-6 text-sm font-bold bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
            <div className="flex flex-col text-right">
              <span className="text-2xl font-black text-gray-900">{totalOkr}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('total')}</span>
            </div>
            <div className="w-px h-10 bg-gray-200 mt-1" />
            <button 
              onClick={() => { setShowOnlyCrossOkr(!showOnlyCrossOkr); setStatusFilter(null); setThemeFilter(null); scrollToList(); }}
              className={cn("flex flex-col text-right transition-all hover:scale-105 px-2 py-1 rounded-lg", showOnlyCrossOkr ? "bg-orange-100 ring-1 ring-orange-200" : "hover:bg-gray-100")}
            >
              <span className="text-2xl font-black text-[#D97706]">{crossCount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('crossOkr')}</span>
            </button>
            <div className="w-px h-10 bg-gray-200 mt-1" />
            <div className="flex flex-col text-right">
              <span className="text-2xl font-black text-blue-600">{taskForceCount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('taskForce')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── Donut chart ── */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 mb-4">
              <svg className="w-full h-full -rotate-90 transform drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="14" />
                {/* Off Track — clickable */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${(allOffTrack / totalOkr) * 251.2 || 0} 251.2`}
                  className={cn('transition-all duration-700 cursor-pointer', statusFilter === 'offTrack' ? 'opacity-100 stroke-[18]' : 'opacity-80 hover:opacity-100')}
                  onClick={() => handleDonutClick('offTrack')}
                />
                {/* At Risk — clickable */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${(allAtRisk / totalOkr) * 251.2 || 0} 251.2`}
                  strokeDashoffset={`-${(allOffTrack / totalOkr) * 251.2 || 0}`}
                  className={cn('transition-all duration-700 cursor-pointer', statusFilter === 'atRisk' ? 'opacity-100 stroke-[18]' : 'opacity-80 hover:opacity-100')}
                  onClick={() => handleDonutClick('atRisk')}
                />
                {/* On Track — clickable */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${(allOnTrack / totalOkr) * 251.2 || 0} 251.2`}
                  strokeDashoffset={`-${((allOffTrack + allAtRisk) / totalOkr) * 251.2 || 0}`}
                  className={cn('transition-all duration-700 cursor-pointer', statusFilter === 'onTrack' ? 'opacity-100 stroke-[18]' : 'opacity-80 hover:opacity-100')}
                  onClick={() => handleDonutClick('onTrack')}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-900">
                  {totalOkr > 0 ? Math.round((allOnTrack / totalOkr) * 100) : 0}%
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress High</span>
              </div>
            </div>

            {/* Legend — each row clickable */}
            <div className="w-full space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {([
                { key: 'onTrack', label: t('completedInProgress'), color: '#10B981', count: allOnTrack },
                { key: 'atRisk', label: t('behindNotStarted'), color: '#F59E0B', count: allAtRisk },
                { key: 'offTrack', label: t('blocked'), color: '#EF4444', count: allOffTrack },
              ] as const).map(item => (
                <button key={item.key} onClick={() => handleDonutClick(item.key)}
                  className={cn(
                    'w-full flex justify-between items-center text-sm font-bold px-2 py-1 rounded-lg transition-colors',
                    statusFilter === item.key ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-700'
                  )}>
                  <span className="flex items-center gap-2 text-[11px] leading-tight">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border shadow-sm text-xs">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Stacked bars ── */}
          <div className="col-span-1 lg:col-span-3">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('distributionByTheme')}</h3>
              <span className="text-xs font-semibold text-gray-400">Green: In Progress · Yellow: Behind/Not Started · Red: Blocked</span>
            </div>
            <div className="space-y-5">
              {activeThemes.map(([theme, data]) => (
                <div key={theme} className="w-full group">
                  <button
                    onClick={() => handleBarClick(theme)}
                    className={cn(
                      'w-full flex justify-between text-sm font-bold mb-1.5 text-left transition-colors',
                      themeFilter === theme ? 'text-[#D97706]' : 'text-gray-700 hover:text-gray-900'
                    )}>
                    <span>{theme}</span>
                    <span className={cn('px-2 py-0.5 rounded-md text-xs', themeFilter === theme ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-900')}>{data.total} OKRs</span>
                  </button>
                  <div className="w-full h-6 bg-gray-100 rounded-full flex overflow-hidden shadow-inner border border-gray-200/50">
                    {data.onTrack > 0 && (
                      <div onClick={() => handleBarClick(theme, 'onTrack')}
                        className="h-full bg-[#10B981] hover:brightness-110 cursor-pointer flex items-center justify-center text-[10px] text-white font-bold transition-all duration-700"
                        style={{ width: `${(data.onTrack / data.total) * 100}%` }} title={`${data.onTrack} ${t('completedInProgress')}`}>
                        {data.onTrack > 1 ? data.onTrack : ''}
                      </div>
                    )}
                    {data.atRisk > 0 && (
                      <div onClick={() => handleBarClick(theme, 'atRisk')}
                        className="h-full bg-[#F59E0B] hover:brightness-110 cursor-pointer flex items-center justify-center text-[10px] text-white font-bold transition-all duration-700"
                        style={{ width: `${(data.atRisk / data.total) * 100}%` }} title={`${data.atRisk} ${t('behindNotStarted')}`}>
                        {data.atRisk > 1 ? data.atRisk : ''}
                      </div>
                    )}
                    {data.offTrack > 0 && (
                      <div onClick={() => handleBarClick(theme, 'offTrack')}
                        className="h-full bg-[#EF4444] hover:brightness-110 cursor-pointer flex items-center justify-center text-[10px] text-white font-bold transition-all duration-700"
                        style={{ width: `${(data.offTrack / data.total) * 100}%` }} title={`${data.offTrack} ${t('blocked')}`}>
                        {data.offTrack > 1 ? data.offTrack : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {activeThemes.length === 0 && (
                <div className="text-center py-10 text-gray-400 font-medium text-sm border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                  Add OKRs to see theme distribution.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           OKR LIST header + filters
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={listRef}>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          {/* Active filter badge */}
          {activeFilter && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <span>
                {themeFilter && `${t('themeLabel')}: ${themeFilter}`}
                {themeFilter && statusFilter && ' · '}
                {statusFilter && `${t('statusLabel')}: ${statusFilter === 'onTrack' ? t('statusOnTrack') : statusFilter === 'atRisk' ? t('statusAtRisk') : t('statusOffTrack')}`}
              </span>
              <button onClick={clearChartFilter} className="ml-1 hover:text-orange-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1" />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('search')}</label>
            <input type="text" placeholder={t('searchObjectivesByTitle')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-52 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 transition-shadow" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('cycle')}</label>
            <div className="relative">
              <select value={selectedCycle} onChange={e => setSelectedCycle(e.target.value)} className="appearance-none w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 cursor-pointer">
                {availableCycles.map(c => <option key={c} value={c}>{displayCycle(c)}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('category')}</label>
            <div className="relative">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="appearance-none w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 cursor-pointer">
                {availableCategories.map(c => <option key={c} value={c}>{displayCategory(c)}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('assignedTo')}</label>
            <div className="relative">
              <select value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)} className="appearance-none w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 cursor-pointer">
                {availableOwners.map(c => <option key={c} value={c}>{displayOwner(c)}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── OKR Cards ── */}
        <div className="space-y-6">
          {filteredObjectives.length === 0 ? (
            <div className="bg-white border text-center border-gray-100 rounded-xl p-12 shadow-sm text-gray-500 flex flex-col items-center">
              <Target className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-semibold text-gray-700 text-lg">{t('noObjectives')}</p>
              <p className="text-sm">
                {activeFilter ? 'No OKRs match the selected chart filter. ' : ''}
                {t('noObjectivesHint')}
                {activeFilter && <button onClick={clearChartFilter} className="ml-1 text-orange-600 underline font-semibold">{t('clearChartFilter')}</button>}
              </p>
            </div>
          ) : (
            filteredObjectives.map((obj) => (
              <div key={obj.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex relative group">
                <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-[#D97706]" />
                <div className="p-6 flex-1 ml-1 relative">
                  <button
                    onClick={() => handleDeleteObjective(obj.id, obj.title)}
                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Objective">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-start mb-6 pr-12">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-[#D97706] shrink-0">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                            {obj.category} • {obj.cycle}
                            {objMeta[obj.id].isCross && (
                              <span className="ml-2 text-[9px] font-black text-[#D97706] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 uppercase tracking-widest leading-none translate-y-[-1px] inline-block">
                                Cross OKR
                              </span>
                            )}
                          </span>
                          <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded-sm', getPriorityClasses(obj.priority))}>{obj.priority}</span>
                        </div>
                        <Link href={`/objective/${obj.id}`} className="text-xl font-semibold text-gray-900 hover:text-[#D97706] transition-colors">
                          {obj.title}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">{t('assignedTo')}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="flex flex-col items-end">
                            {(() => {
                              // Split by standard semicolon, OR just a single owner name if no semicolon exists.
                              // Using a more robust split that handles variations in spacing.
                              const assignedStr = obj.assignedTo || '';
                              const owners = assignedStr.split(/\s*;\s*/).map(s => s.trim()).filter(Boolean);
                              
                              return (
                                <>
                                  <div className="flex -space-x-2 mb-1">
                                    {owners.slice(0, 4).map((owner, i) => (
                                      <div key={i} title={owner} className="w-6 h-6 bg-gray-800 border-2 border-white rounded-full text-white flex justify-center items-center text-[10px] font-bold uppercase shrink-0 shadow-sm transition-transform hover:z-10 hover:scale-110">
                                        {owner.charAt(0)}
                                      </div>
                                    ))}
                                    {owners.length > 4 && (
                                      <div className="w-6 h-6 bg-gray-200 border-2 border-white rounded-full text-gray-600 flex justify-center items-center text-[8px] font-bold shrink-0 shadow-sm">
                                        +{owners.length - 4}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[11px] font-semibold text-gray-600 truncate max-w-[150px]" title={obj.assignedTo}>
                                    {obj.assignedTo}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">PROGRESS</p>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden flex-1 shrink-0">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${obj.progress}%` }} />
                          </div>
                          <span className="text-sm font-bold min-w-8">{obj.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start pl-16 mb-6">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleExpand(obj.id); }}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#D97706] transition-colors py-1.5 px-3 rounded-full hover:bg-orange-50 border border-gray-200 hover:border-orange-200 shadow-sm">
                      {expandedObs.has(obj.id) ? t('collapseKeyResults') : `${t('viewKeyResults')} (${obj.keyResults.length})`}
                      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expandedObs.has(obj.id) ? 'rotate-180' : '')} />
                    </button>
                  </div>

                  {expandedObs.has(obj.id) && (
                    <div className="space-y-4 pl-16 pr-12 pb-6 border-t border-gray-50 pt-6">
                      {obj.keyResults.length === 0 ? (
                        <div className="text-sm text-gray-400 italic py-2">{t('noKeyResults')}</div>
                      ) : (
                        obj.keyResults.map((kr, krIdx) => (
                          <div key={kr.id} className={cn('pt-4', krIdx > 0 ? 'border-t border-gray-50' : 'pt-0')}>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex-1 pr-6">
                                <div className="text-[15px] font-medium text-gray-900 leading-snug break-words">{kr.title}</div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xs text-gray-500 font-medium">
                                    Current: {kr.currentValue} {kr.unit} • Target: {kr.targetValue} {kr.unit}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 shrink-0">
                                <div className="flex items-center gap-2 w-32">
                                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shrink-0">
                                    <div className={cn('h-full rounded-full transition-all duration-500', (obj.status === 'Behind' || obj.status === 'Blocked') ? 'bg-[#8B5F2E]' : 'bg-teal-600')} style={{ width: `${kr.progress}%` }} />
                                  </div>
                                  <span className="text-xs font-semibold w-10 text-right">{kr.progress}%</span>
                                </div>
                                <Link href={`/objective/${obj.id}#checkin`} className={cn('px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1.5 shrink-0',
                                  (obj.status === 'Behind' || obj.status === 'Blocked') ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')}>
                                  {(obj.status === 'Behind' || obj.status === 'Blocked') ? `! ${t('remediate')}` : t('updateStatus')}
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
