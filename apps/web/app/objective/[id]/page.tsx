'use client';

import { useOkrStore } from '../../../lib/store';
import { notFound } from 'next/navigation';
import { Target, ArrowLeft, Calendar, User, AlignLeft, AlertTriangle, Plus, Trash, CheckCircle2, ChevronRight, Edit3, Save, X, Download, ExternalLink, Clock, History, TrendingUp, MessageSquare, Monitor } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { KeyResult } from '../../../lib/types';
import KRDetailModal from '../../../components/KRDetailModal';
import PPTPreviewModal from '../../../components/PPTPreviewModal';
import { useI18n } from '../../../lib/i18n';
import { getObjective, createKeyResult, deleteKeyResult as deleteKeyResultRequest, updateKeyResult as updateKeyResultRequest, updateObjective as updateObjectiveRequest } from '../../../lib/api';
import { encodeObjectiveMeta } from '../../../lib/objectiveDetails';

export default function ObjectiveDashboardPage({ params }: { params: { id: string } }) {
  const { objectives, addCheckIn, addKr, updateKr, deleteKr, updateObjective: updateObjectiveLocal, currentUser, users, addObjective } = useOkrStore();
  const { t } = useI18n();
  const obj = objectives.find(o => o.id === params.id);
  
  const [isEditingKrs, setIsEditingKrs] = useState(false);
  const [localKrs, setLocalKrs] = useState<KeyResult[]>([]);
  const [selectedKr, setSelectedKr] = useState<{ kr: KeyResult; idx: number } | null>(null);
  
  // Details Editor State
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [localDetails, setLocalDetails] = useState({
    businessNeeds: '',
    assignedTo: '',
    startDate: '',
    dueDate: '',
    notes: '',
    statusIndicators: '',
    currentMonthFocus: '',
    nextMonthFocus: '',
    lastReviewDate: '',
    plannedNextReviewDate: '',
    reviewComment: '',
    category: '', 
    isCrossOkr: false,
  });

  const [isPreviewingPpt, setIsPreviewingPpt] = useState(false);

  const handleExportPpt = async () => {
    if (!obj) return;
    try {
      const res = await fetch('/api/export-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanTitle = (obj.title || 'OKR').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      a.href = url;
      a.download = `OKR_Export_${cleanTitle}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(t('detailExportPptFailed'));
    }
  };

  // Checkin State
  const [newProgress, setNewProgress] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<string>('In progress');
  const [comment, setComment] = useState('');
  const [isSavingKrs, setIsSavingKrs] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (obj && !isEditingDetails) {
      setLocalDetails({
        businessNeeds: obj.businessNeeds || '',
        assignedTo: obj.assignedTo || '',
        startDate: obj.startDate || '',
        dueDate: obj.dueDate || '',
        notes: obj.notes || '',
        statusIndicators: obj.statusIndicators || '',
        currentMonthFocus: obj.currentMonthFocus || '',
        nextMonthFocus: obj.nextMonthFocus || '',
        lastReviewDate: obj.lastReviewDate || '',
        plannedNextReviewDate: obj.plannedNextReviewDate || '',
        reviewComment: obj.reviewComment || '',
        category: obj.category || '',
        isCrossOkr: obj.category === 'Cross-OKR',
      });
    }
  }, [obj, isEditingDetails]);

  const [isPageLoading, setIsPageLoading] = useState(!obj);

  useEffect(() => {
    if (!obj && params.id) {
      const fetchMissing = async () => {
        try {
          const fetched = await getObjective(params.id) as any;
          addObjective(fetched);
        } catch (err) {
          console.error('Failed to fetch missing objective:', err);
        } finally {
          setIsPageLoading(false);
        }
      };
      fetchMissing();
    } else if (obj) {
      setIsPageLoading(false);
    }
  }, [obj, params.id, addObjective]);
  
  const chartData = useMemo(() => {
    const data = [];
    const weeks = 8;
    const currentProg = obj?.progress || 0;
    
    for (let i = 1; i <= weeks; i++) {
       let historicalVal = null;
       let projectionVal = null;

       if (i === 1) historicalVal = Math.max(0, currentProg - 40);
       else if (i === 2) historicalVal = Math.max(0, currentProg - 30);
       else if (i === 3) historicalVal = Math.max(0, currentProg - 20);
       else if (i === 4) historicalVal = Math.max(0, currentProg - 10);
       else if (i === 5) historicalVal = currentProg; // Today
       else projectionVal = Math.min(100, currentProg + ((100 - currentProg) / (weeks - 5)) * (i - 5));

       data.push({ name: `W${i}`, actual: historicalVal, projection: projectionVal });
    }
    return data;
  }, [obj?.progress]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#D97706]/20 border-t-[#D97706] rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  if (!obj) return notFound();

  const statusText = (status: string) => {
    if (status === 'Completed') return t('statusCompleted');
    if (status === 'In progress') return t('statusInProgress');
    if (status === 'Behind') return t('statusBehind');
    if (status === 'Blocked') return t('blocked');
    return t('statusNotStarted');
  };

  const priorityText = (priority: string) => {
    if (priority === 'Critical') return t('priorityCritical');
    if (priority === 'High') return t('priorityHigh');
    if (priority === 'Medium') return t('priorityMedium');
    return t('priorityLow');
  };

  // Load Krs to local state when editing begins
  const startEditingKrs = () => {
    setLocalKrs(JSON.parse(JSON.stringify(obj.keyResults)));
    setIsEditingKrs(true);
  };

  const handleLocalKrChange = (index: number, field: string, value: any) => {
    const updated = [...localKrs];
    updated[index] = { ...updated[index], [field]: value };
    setLocalKrs(updated);
  };

  const saveKrs = async () => {
    if (!obj) return;

    setIsSavingKrs(true);
    try {
      const validKrs = localKrs
        .filter((kr) => kr.title.trim() !== '')
        .map((kr) => {
          const calculatedProgress = Math.min(100, Math.max(0, Math.round((Number(kr.currentValue) / (Number(kr.targetValue) || 1)) * 100)));
          return { ...kr, progress: calculatedProgress };
        });

      const existingIds = new Set(obj.keyResults.map((kr) => kr.id));
      const nextIds = new Set(validKrs.filter((kr) => !kr.id.startsWith('new-')).map((kr) => kr.id));
      const idsToDelete = Array.from(existingIds).filter((id) => !nextIds.has(id));

      if (idsToDelete.length > 0) {
        await Promise.all(idsToDelete.map((id) => deleteKeyResultRequest(id)));
      }

      const persisted: KeyResult[] = [];

      for (const kr of validKrs) {
        if (kr.id.startsWith('new-')) {
          const created = await createKeyResult({
            objectiveId: obj.id,
            title: kr.title,
            metricType: 'manual',
            target: Number(kr.targetValue) || 100,
            current: Number(kr.currentValue) || 0,
            confidence: Math.max(0, Math.min(1, (Number(kr.confidenceScore) || 5) / 10)),
            weight: 1,
            unit: kr.unit || '%',
          });

          persisted.push({
            ...kr,
            id: created.id,
            progress: Math.min(100, Math.max(0, Math.round((Number(kr.currentValue) / (Number(kr.targetValue) || 1)) * 100))),
          });
          continue;
        }

        await updateKeyResultRequest(kr.id, {
          title: kr.title,
          target: Number(kr.targetValue) || 100,
          current: Number(kr.currentValue) || 0,
          confidence: Math.max(0, Math.min(1, (Number(kr.confidenceScore) || 5) / 10)),
          unit: kr.unit || '%',
        });

        persisted.push(kr);
      }

      const avgProgress = persisted.length > 0
        ? Math.round(persisted.reduce((acc, kr) => acc + kr.progress, 0) / persisted.length)
        : 0;

      updateObjectiveLocal(obj.id, { keyResults: persisted, progress: avgProgress });
      setIsEditingKrs(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save key results to database');
    } finally {
      setIsSavingKrs(false);
    }
  };

  const saveDetails = async () => {
    if (!obj) return;

    const changes: string[] = [];
    if (localDetails.businessNeeds !== obj.businessNeeds) changes.push(`${t('detailBusinessNeeds')}:\n"${localDetails.businessNeeds || t('detailCleared')}"`);
    if (localDetails.assignedTo !== obj.assignedTo) changes.push(`${t('assignedTo')}: ${localDetails.assignedTo}`);
    if (localDetails.startDate !== obj.startDate) changes.push(`${t('detailStartDate')}: ${localDetails.startDate || t('detailCleared')}`);
    if (localDetails.dueDate !== obj.dueDate) changes.push(`${t('detailDueDate')}: ${localDetails.dueDate || t('detailCleared')}`);
    if (localDetails.notes !== obj.notes) changes.push(`${t('detailNotes')}:\n"${localDetails.notes || t('detailCleared')}"`);
    if (localDetails.statusIndicators !== obj.statusIndicators) changes.push(`${t('detailStatusIndicators')}:\n"${localDetails.statusIndicators || t('detailCleared')}"`);
    if (localDetails.currentMonthFocus !== obj.currentMonthFocus) changes.push(`${t('detailFocusCurrentMonth')}:\n"${localDetails.currentMonthFocus || t('detailCleared')}"`);
    if (localDetails.nextMonthFocus !== obj.nextMonthFocus) changes.push(`${t('detailFocusNextMonth')}:\n"${localDetails.nextMonthFocus || t('detailCleared')}"`);
    if (localDetails.lastReviewDate !== obj.lastReviewDate) changes.push(`${t('detailLatestReviewPast')}: ${localDetails.lastReviewDate || t('detailCleared')}`);
    if (localDetails.plannedNextReviewDate !== obj.plannedNextReviewDate) changes.push(`${t('detailPlannedNextReview')}: ${localDetails.plannedNextReviewDate || t('detailCleared')}`);
    if (localDetails.reviewComment !== obj.reviewComment) changes.push(`${t('detailLeadershipComment')}:\n"${localDetails.reviewComment || t('detailCleared')}"`);
    if (localDetails.isCrossOkr !== (obj.category === 'Cross-OKR')) changes.push(`${t('isCrossOkr')}: ${localDetails.isCrossOkr ? 'Yes' : 'No'}`);

    const newHistory = [...(obj.history || [])];
    if (changes.length > 0) {
      newHistory.unshift({
        id: `log-${Date.now()}`,
        type: 'field-update',
        author: currentUser?.displayName || 'Current User',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        comment: `${t('detailUpdatedStrategicFields')}\n• ${changes.join('\n\n• ')}`,
      });
    }

    setIsSavingDetails(true);
    try {
      const metaDescription = encodeObjectiveMeta({
        assignedTo: localDetails.assignedTo,
        businessNeeds: localDetails.businessNeeds,
        notes: localDetails.notes,
        statusIndicators: localDetails.statusIndicators,
        currentMonthFocus: localDetails.currentMonthFocus,
        nextMonthFocus: localDetails.nextMonthFocus,
        reviewComment: localDetails.reviewComment,
        history: newHistory,
      });

      await updateObjectiveRequest(obj.id, {
        startDate: localDetails.startDate || undefined,
        dueDate: localDetails.dueDate || undefined,
        description: metaDescription,
        lastReviewDate: localDetails.lastReviewDate || undefined,
        plannedNextReviewDate: localDetails.plannedNextReviewDate || undefined,
        category: localDetails.isCrossOkr ? 'Cross-OKR' : (obj.category === 'Cross-OKR' ? 'Department' : obj.category),
      });

      updateObjectiveLocal(obj.id, { ...localDetails, history: newHistory });
      setIsEditingDetails(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save objective details to database');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      addCheckIn(obj.id, newProgress, comment, newStatus);
      setNewProgress(0);
      setComment('');
      setIsSubmitting(false);
    }, 400);
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Completed': return "bg-green-100 text-green-700";
      case 'In progress': return "bg-blue-100 text-blue-700";
      case 'Blocked':
      case 'Behind': return "bg-red-100 text-red-700";
      case 'Not started':
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch(priority) {
      case 'Critical': return "text-red-700 border-red-200";
      case 'High': return "text-orange-600 border-orange-200";
      case 'Medium': return "text-blue-600 border-blue-200";
      case 'Low': return "text-gray-500 border-gray-200";
      default: return "";
    }
  };


  return (
    <>
    <div className="max-w-[1400px] mx-auto pb-24">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#D97706] mb-6 transition-colors shadow-sm rounded-md border border-transparent hover:border-orange-100 hover:bg-orange-50 px-2 py-1 -ml-2">
            <ArrowLeft className="w-3.5 h-3.5"/> {t('detailBackToExplorer')}
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
             <Link href="/" className="hover:text-[#D97706] transition-colors">{obj.category} {obj.cycle}</Link>
             <span>&gt;</span>
             <span className="truncate max-w-sm">{obj.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPreviewingPpt(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-50 text-[#D97706] font-bold rounded-lg shadow-sm border border-orange-200 transition-all">
            <Monitor className="w-4 h-4" />
            {t('detailPreviewPpt')}
          </button>
          <button 
            onClick={() => handleExportPpt()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-[#D97706] hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all">
            <Download className="w-4 h-4" />
            {t('detailExportPpt')}
          </button>
        </div>
        </div>

        <div className="flex justify-between items-start gap-4 mb-10">
          <div className="max-w-4xl">
            {obj.businessNeeds && !isEditingDetails && (
              <div className="mb-4 bg-orange-50/50 border border-orange-100/50 rounded-lg p-5">
                <p className="text-[10px] font-bold text-[#D97706] tracking-wider uppercase mb-2">{t('detailBusinessNeeds')}</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{obj.businessNeeds}</p>
              </div>
            )}
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {obj.title}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
             <span className={cn("px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs uppercase tracking-wider", getStatusClasses(obj.status))}>
               {statusText(obj.status)}
             </span>
             <span className={cn("px-3 py-1 border font-bold rounded-full text-xs uppercase tracking-wider", getPriorityClasses(obj.priority))}>
               {priorityText(obj.priority)}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Charts & Check-in */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-6">{t('detailExecutionProgress')}</p>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">{obj.progress}</span>
                    <span className="text-sm font-bold text-gray-400">%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xl font-bold text-gray-900">100</span>
                    <span className="text-sm font-bold text-gray-400">%</span>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full transition-all duration-1000" style={{ width: `${obj.progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" id="key-results">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-gray-400" />
                {t('detailKeyResults')} ({obj.keyResults.length})
              </h2>
              {!isEditingKrs ? (
                <button onClick={startEditingKrs} className="text-sm font-bold text-[#D97706] hover:bg-orange-50 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors">
                  <Edit3 className="w-4 h-4" /> {t('detailEditQuantityContent')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingKrs(false)} className="text-sm font-semibold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">{t('cancel')}</button>
                  <button onClick={saveKrs} className="text-sm font-bold text-white bg-[#D97706] hover:bg-[#B45309] px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm"><Save className="w-4 h-4" /> {t('save')}</button>
                </div>
              )}
            </div>
            
            <div className="p-0">
              {isEditingKrs ? (
                <div className="p-6 space-y-4 bg-orange-50/30">
                  {localKrs.map((kr, idx) => (
                    <div key={kr.id} className="flex flex-col md:flex-row gap-3 items-start bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border flex items-center justify-center text-gray-400 font-bold shrink-0 mt-1">{idx + 1}</div>
                      <div className="flex-1 w-full space-y-3">
                        <input value={kr.title} onChange={(e) => handleLocalKrChange(idx, 'title', e.target.value)} className="w-full bg-gray-50 border rounded-md py-2.5 px-3 text-sm focus:ring-2 focus:ring-[#D97706]/50 outline-none font-medium" />
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-500">{t('detailCurrent')}: <input type="number" value={kr.currentValue} onChange={(e) => handleLocalKrChange(idx, 'currentValue', Number(e.target.value))} className="w-20 border rounded px-2 py-1 outline-none" /></label>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-500">{t('target')}: <input type="number" value={kr.targetValue} onChange={(e) => handleLocalKrChange(idx, 'targetValue', Number(e.target.value))} className="w-20 border rounded px-2 py-1 outline-none" /></label>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-500">{t('detailUnit')}: <input value={kr.unit} onChange={(e) => handleLocalKrChange(idx, 'unit', e.target.value)} className="w-16 border rounded px-2 py-1 outline-none" /></label>
                          <label className="flex items-center gap-2 text-xs font-bold text-[#D97706]">{t('detailDifficulty')}: <input type="number" min="0" max="10" value={kr.confidenceScore ?? 5} onChange={(e) => handleLocalKrChange(idx, 'confidenceScore', Number(e.target.value))} className="w-16 border border-orange-200 bg-orange-50 rounded px-2 py-1 outline-none text-[#D97706]" /></label>
                        </div>
                      </div>
                      <button onClick={() => setLocalKrs(localKrs.filter((_, i) => i !== idx))} className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash className="w-4 h-4"/></button>
                    </div>
                  ))}
                  <button onClick={() => setLocalKrs([...localKrs, { id: `new-${Date.now()}`, title: '', currentValue: 0, targetValue: 100, unit: '%', progress: 0, confidenceScore: 5 }])} className="w-full border-2 border-dashed border-gray-200 hover:border-[#D97706] hover:bg-orange-50 text-gray-500 hover:text-[#D97706] rounded-xl py-4 flex justify-center gap-2 font-bold transition-colors">
                    <Plus className="w-5 h-5"/> {t('detailAddAnotherKr')}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {obj.keyResults.map((kr, idx) => (
                    <div key={kr.id} className="p-5 hover:bg-orange-50/30 transition-colors flex gap-4 cursor-pointer group" onClick={() => setSelectedKr({ kr, idx })}>
                      <div className="w-8 h-8 rounded-full bg-orange-50 border-orange-100 text-[#D97706] flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[15px] font-semibold text-gray-900 leading-relaxed">{kr.title}</h4>
                          <span className="text-xs font-bold text-[#D97706] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><ExternalLink className="w-3 h-3" />{t('detailViewDetails')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(100, (kr.currentValue/kr.targetValue)*100)}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-gray-500 tracking-wider w-20">
                             {kr.currentValue} / {kr.targetValue} {kr.unit}
                           </span>
                           <span className="text-sm font-black text-gray-800 shrink-0 w-12 text-right">
                             {kr.confidenceScore ?? 5}/10
                           </span>
                           {(kr.beforeText || kr.afterText || (kr.images && kr.images.length > 0)) && (
                             <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{t('detailHasResults')}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 lg:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-8">{t('detailExecutionTrajectory')}</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} itemStyle={{ color: '#111827' }} />
                  <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="projection" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4" id="checkin">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">{t('detailCheckinHistory')}</p>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
               <div className="p-6 border-b border-gray-100 bg-[#FAFAFA] flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-sm"><Target className="w-4 h-4"/></div>
                 <h3 className="font-bold text-gray-900">{t('detailRecordNewUpdate')}</h3>
               </div>
               <form onSubmit={handleCheckIn} className="p-6 md:p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('detailNewProgress')}</label>
                     <input type="number" required max="100" min="0" value={newProgress} onChange={e => setNewProgress(Number(e.target.value))} className="w-full border bg-gray-50 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#D97706]/50 font-bold outline-none" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('detailStatusDeclaration')}</label>
                     <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full border bg-gray-50 rounded-lg py-3 px-4 outline-none font-bold">
                       <option value="Completed">{t('statusCompleted')}</option><option value="In progress">{t('statusInProgress')}</option><option value="Behind">{t('statusBehind')}</option><option value="Blocked">{t('blocked')}</option>
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('detailConfidenceComments')}</label>
                   <textarea required value={comment} onChange={e => setComment(e.target.value)} className="w-full border bg-gray-50 rounded-lg py-3 px-4 outline-none h-24 resize-none font-medium"></textarea>
                 </div>
                 <div className="flex justify-end">
                   <button disabled={isSubmitting} type="submit" className="bg-[#D97706] text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm">{t('detailPublishUpdate')}</button>
                 </div>
               </form>
            </div>
            
            <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-4 before:block before:w-0.5 before:bg-gradient-to-b before:from-orange-100 before:via-gray-100 before:to-transparent ml-4">
              {obj.history?.length === 0 ? (
                <div className="py-8 pl-12 text-sm text-gray-400 italic flex items-center gap-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Clock className="w-5 h-5 text-gray-300" />
                  {t('detailNoCheckinHistory')}
                </div>
              ) : (
                obj.history?.map((log, i) => (
                  <div key={log.id} className="relative pl-12 group">
                    {/* Timeline Marker */}
                    <div className={cn(
                      "absolute left-0 top-6 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                      log.type === 'field-update' ? "bg-blue-500 text-white" : "bg-[#D97706] text-white"
                    )}>
                      {log.type === 'field-update' ? (
                        <History className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div className={cn(
                      "bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all p-6",
                      log.type === 'field-update' ? "border-blue-100 bg-blue-50/10" : "border-gray-100"
                    )}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex justify-center items-center text-sm font-black shadow-inner">
                            {log.author.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-gray-900 leading-none mb-1">{log.author}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {log.timestamp}
                            </div>
                          </div>
                        </div>

                        {log.type !== 'field-update' && log.status && (
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100/50">
                            {log.value !== undefined && (
                              <div className="px-3 py-1 bg-white rounded-lg shadow-sm">
                                <span className="text-lg font-black text-gray-900">{log.value}</span>
                                <span className="text-[10px] font-bold text-gray-400 ml-0.5">%</span>
                              </div>
                            )}
                            <span className={cn("px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg", getStatusClasses(log.status))}>
                              {statusText(log.status)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        {log.type === 'field-update' ? (
                          <div className="pl-4 border-l-2 border-blue-200">
                             <p className="text-sm font-medium leading-relaxed text-blue-900 whitespace-pre-wrap">{log.comment}</p>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                             <MessageSquare className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                             <p className="text-[15px] font-medium leading-relaxed text-gray-600 whitespace-pre-wrap">{log.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Meta Info Panel with Editing Support */}
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold text-gray-900">{t('detailExecutionSpecs')}</h2>
            {!isEditingDetails ? (
              <button onClick={() => setIsEditingDetails(true)} className="text-xs font-bold text-[#D97706] hover:bg-orange-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> {t('detailEditSpecs')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditingDetails(false)} className="text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"><X className="w-3.5 h-3.5" /></button>
                <button onClick={saveDetails} className="text-xs font-bold text-white bg-[#D97706] hover:bg-[#B45309] px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm"><Save className="w-3.5 h-3.5" /> {t('save')}</button>
              </div>
            )}
          </div>

          <div className={cn("rounded-xl border shadow-sm overflow-hidden", isEditingDetails ? "border-[#D97706]/50 shadow-orange-900/10" : "bg-white border-gray-100")}>
             <div className="px-5 py-3 border-b border-gray-100 bg-[#FAFAFA] flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t('detailMetaDetails')}</h3>
             </div>
             <div className="p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">{t('assignedTo')}</p>
                  {isEditingDetails ? (
                    <>
                      <div className="relative mb-2 mt-2">
                        <input 
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search name..."
                          className="w-full bg-white border border-gray-200 rounded-md py-1 px-3 text-xs focus:ring-1 focus:ring-orange-400 outline-none"
                        />
                      </div>
                      <div className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 h-32 overflow-y-auto">
                        {users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase())).map(u => {
                          const assignedList = (localDetails.assignedTo || '').split(' ; ').map(s => s.trim()).filter(Boolean);
                          const isChecked = assignedList.includes(u.displayName);
                          return (
                            <label key={u.id} className="flex items-center gap-2 mb-1 p-1 hover:bg-gray-100 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={(e) => {
                                  let newList;
                                  if (e.target.checked) {
                                    newList = [...assignedList, u.displayName];
                                  } else {
                                    newList = assignedList.filter(name => name !== u.displayName);
                                  }
                                  setLocalDetails({ ...localDetails, assignedTo: newList.join(' ; ') });
                                }} 
                                className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
                              />
                              <span className="text-sm font-medium text-gray-900">{u.displayName}</span>
                            </label>
                          );
                        })}
                        {users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                          <p className="text-[10px] text-gray-400 text-center py-2">No users found</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><User className="w-4 h-4 text-gray-400"/> {obj.assignedTo}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 pb-1">
                  {isEditingDetails ? (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={localDetails.isCrossOkr} 
                        onChange={e => setLocalDetails({ ...localDetails, isCrossOkr: e.target.checked })} 
                        className="w-4 h-4 rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
                      />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#D97706] transition-colors">{t('isCrossOkr')}</span>
                    </label>
                  ) : obj.category === 'Cross-OKR' ? (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                      <span className="text-xs font-black text-[#D97706] uppercase tracking-wider">{t('isCrossOkr')}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-4 border-t border-gray-50 pt-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">{t('detailStartDate')}</p>
                    {isEditingDetails ? (
                      <input type="date" value={localDetails.startDate} onChange={e => setLocalDetails({ ...localDetails, startDate: e.target.value })} className="w-full border rounded outline-none p-1 text-sm font-semibold" />
                    ) : (
                      <p className="text-sm font-semibold flex items-center gap-1.5 text-gray-900"><Calendar className="w-3.5 h-3.5 text-gray-400"/> {obj.startDate || '--'}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[#D97706] tracking-wider uppercase mb-1">{t('detailDueDate')}</p>
                    {isEditingDetails ? (
                      <input type="date" value={localDetails.dueDate} onChange={e => setLocalDetails({ ...localDetails, dueDate: e.target.value })} className="w-full border rounded outline-none p-1 text-sm font-semibold text-[#D97706]" />
                    ) : (
                      <p className="text-sm font-bold flex items-center gap-1.5 text-[#D97706]"><Calendar className="w-3.5 h-3.5 text-orange-400"/> {obj.dueDate || '--'}</p>
                    )}
                  </div>
                </div>
             </div>
          </div>

          <div className={cn("rounded-xl border shadow-sm overflow-hidden", isEditingDetails ? "border-[#D97706]/50 shadow-orange-900/10" : "bg-white border-orange-100 shadow-orange-900/5")}>
             <div className="px-5 py-3 border-b border-orange-50 bg-orange-50/30 flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5 text-[#D97706]" />
                <h3 className="text-xs font-bold text-[#D97706] tracking-wider uppercase">{t('detailExecutionNotes')}</h3>
             </div>
             <div className="p-5 space-y-5">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2">{t('detailBusinessNeeds')}</span>
                  {isEditingDetails ? (
                    <textarea value={localDetails.businessNeeds} onChange={e => setLocalDetails({ ...localDetails, businessNeeds: e.target.value })} className="w-full border bg-white p-2 text-sm rounded outline-none min-h-[60px]" placeholder={t('detailBusinessNeedsPlaceholder')} />
                  ) : (
                    <p className="text-sm font-medium text-gray-700 italic">{obj.businessNeeds || t('detailNoBusinessNeeds')}</p>
                  )}
                </div>
                <div className="border-t border-gray-50 pt-4">
                  <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2">{t('detailNotes')}</span>
                  {isEditingDetails ? (
                    <textarea value={localDetails.notes} onChange={e => setLocalDetails({ ...localDetails, notes: e.target.value })} className="w-full border bg-white p-2 text-sm rounded outline-none min-h-[80px]" placeholder={t('detailNotesPlaceholder')} />
                  ) : (
                    <p className="text-sm font-medium text-gray-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-gray-100 italic">{obj.notes || t('detailNoNotes')}</p>
                  )}
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2">{t('detailStatusIndicators')}</span>
                  {isEditingDetails ? (
                    <textarea value={localDetails.statusIndicators} onChange={e => setLocalDetails({ ...localDetails, statusIndicators: e.target.value })} className="w-full border bg-white p-2 text-sm rounded outline-none min-h-[80px]" placeholder={t('detailStatusIndicatorsPlaceholder')} />
                  ) : (
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{obj.statusIndicators || t('detailNoIndicators')}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                   <div>
                     <span className="inline-block px-2 py-0.5 bg-orange-100 text-[#D97706] border border-orange-200 rounded text-[10px] font-bold tracking-wider uppercase mb-2">{t('detailFocusCurrentMonth')}</span>
                     {isEditingDetails ? (
                       <textarea value={localDetails.currentMonthFocus} onChange={e => setLocalDetails({ ...localDetails, currentMonthFocus: e.target.value })} className="w-full border bg-white p-2 text-sm rounded outline-none min-h-[100px]" placeholder={t('detailFocusCurrentMonthPlaceholder')} />
                     ) : (
                       <p className="text-sm font-medium text-gray-700 leading-relaxed border-l-2 border-[#D97706] pl-3 whitespace-pre-wrap">{obj.currentMonthFocus || t('detailNoFocusCurrentMonth')}</p>
                     )}
                   </div>
                   <div>
                     <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-bold tracking-wider uppercase mb-2">{t('detailFocusNextMonth')}</span>
                     {isEditingDetails ? (
                       <textarea value={localDetails.nextMonthFocus} onChange={e => setLocalDetails({ ...localDetails, nextMonthFocus: e.target.value })} className="w-full border bg-white p-2 text-sm rounded outline-none min-h-[100px]" placeholder={t('detailFocusNextMonthPlaceholder')} />
                     ) : (
                       <p className="text-sm font-medium text-gray-700 leading-relaxed border-l-2 border-amber-500 pl-3 whitespace-pre-wrap">{obj.nextMonthFocus || t('detailNoForwardPlan')}</p>
                     )}
                   </div>
                </div>
             </div>
          </div>

          <div className={cn("rounded-xl border shadow-sm overflow-hidden", isEditingDetails ? "border-[#D97706]/50 shadow-orange-900/10" : "bg-[#FAF8F5] border-teal-100")}>
             <div className="px-5 py-3 border-b border-teal-100 bg-teal-50/50 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <h3 className="text-xs font-bold text-teal-700 tracking-wider uppercase">{t('detailFormalReviews')}</h3>
             </div>
             <div className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">{t('detailLatestReviewPast')}</p>
                  {isEditingDetails ? (
                    <input type="date" value={localDetails.lastReviewDate} onChange={e => setLocalDetails({ ...localDetails, lastReviewDate: e.target.value })} className="w-full border rounded outline-none p-1 text-sm font-semibold" />
                  ) : (
                    <p className="text-sm font-bold text-gray-900">{obj.lastReviewDate || t('detailNeverReviewed')}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">{t('detailPlannedNextReview')}</p>
                  {isEditingDetails ? (
                    <input type="date" value={localDetails.plannedNextReviewDate} onChange={e => setLocalDetails({ ...localDetails, plannedNextReviewDate: e.target.value })} className="w-full border rounded outline-none p-1 text-sm font-semibold" />
                  ) : (
                    <p className="text-sm font-bold text-gray-900">{obj.plannedNextReviewDate || t('detailUnscheduled')}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">{t('detailLeadershipComment')}</p>
                  {isEditingDetails ? (
                    <textarea value={localDetails.reviewComment} onChange={e => setLocalDetails({ ...localDetails, reviewComment: e.target.value })} className="w-full border bg-white p-2 text-sm rounded outline-none min-h-[80px]" placeholder={t('detailLeadershipCommentPlaceholder')} />
                  ) : (
                    <div className="bg-white border border-gray-100 p-3 rounded-lg text-sm text-gray-600 italic font-medium">{obj.reviewComment || t('detailNoLeadershipComment')}</div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    {selectedKr && (
      <KRDetailModal
        kr={selectedKr.kr}
        krIndex={selectedKr.idx}
        objectiveTitle={obj?.title || ''}
        onClose={() => setSelectedKr(null)}
        onSave={(updated) => {
          if (obj) updateKr(obj.id, updated.id, updated);
          setSelectedKr(null);
        }}
      />
    )}
      {isPreviewingPpt && obj && (
        <PPTPreviewModal 
          obj={obj} 
          onClose={() => setIsPreviewingPpt(false)} 
          onDownload={() => handleExportPpt()} 
        />
      )}
    </>
  );
}






