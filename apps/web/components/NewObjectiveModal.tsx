'use client';

import { useOkrStore } from '../lib/store';
import { useState, useEffect } from 'react';
import { X, Plus, Trash, ChevronDown } from 'lucide-react';
import { OkrCategory, OkrPriority } from '../lib/types';
import { createKeyResult, createObjective } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { encodeObjectiveMeta } from '../lib/objectiveDetails';

export default function NewObjectiveModal() {
  const { objectives, isNewObjModalOpen, setNewObjModalOpen, addObjective, users, currentUser } = useOkrStore();
  const { t } = useI18n();
  
  // Extract unique categories for suggestions
  const existingCategories = Array.from(new Set(objectives.map(o => o.category))).filter((x): x is string => !!x).sort();
  
  const currentYear = new Date().getFullYear();
  const defaultCycles = [
    `Q1 ${currentYear}`,
    `Q2 ${currentYear}`,
    `Q3 ${currentYear}`,
    `Q4 ${currentYear}`,
    `Q1 ${currentYear + 1}`
  ];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OkrCategory>('');
  const [area, setArea] = useState<string>('');
  const [priority, setPriority] = useState<OkrPriority>('Medium');
  const [cycle, setCycle] = useState(defaultCycles[0]);
  const [assignedTo, setAssignedTo] = useState<string[]>([currentUser?.displayName || (users[0] ? users[0].displayName : 'Unassigned')]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isCrossOkr, setIsCrossOkr] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  
  // Update default assignedTo when modal opens or currentUser changes
  useEffect(() => {
    if (isNewObjModalOpen) {
      setAssignedTo([currentUser?.displayName || 'Unassigned']);
    }
  }, [isNewObjModalOpen, currentUser]);

  // Dynamic KRs state
  const [krs, setKrs] = useState([{ title: '', targetValue: 100, unit: '%', confidenceScore: 5, businessNeed: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isNewObjModalOpen) return null;

  const handleAddKr = () => {
    setKrs([...krs, { title: '', targetValue: 100, unit: '%', confidenceScore: 5, businessNeed: '' }]);
  };

  const handleRemoveKr = (index: number) => {
    setKrs(krs.filter((_, i) => i !== index));
  };

  const handleKrChange = (index: number, field: string, value: any) => {
    const updated = [...krs];
    updated[index] = { ...updated[index], [field]: value };
    setKrs(updated);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const normalizedPriority = (() => {
      const value = (priority || '').toLowerCase();
      if (value === 'critical') return 'critical' as const;
      if (value === 'high') return 'high' as const;
      if (value === 'low') return 'low' as const;
      return 'medium' as const;
    })();

    const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];
    const effectiveDueDate = dueDate || new Date().toISOString().split('T')[0];

    try {
      const primaryOwnerName = assignedTo[0];
      const primaryOwner = users.find(u => u.displayName === primaryOwnerName);
      const ownerUserId = primaryOwner?.id;

      const finalCategory = isCrossOkr ? 'Cross-OKR' : category;

      const metaDescription = encodeObjectiveMeta({
        assignedTo: assignedTo.join(' ; '),
        notes: '',
        businessNeeds: '',
        statusIndicators: '',
        currentMonthFocus: '',
        nextMonthFocus: '',
      });

      const createdObjective = await createObjective({
        title: title.trim(),
        category: finalCategory,
        area: area || undefined,
        priority: normalizedPriority,
        startDate: effectiveStartDate,
        dueDate: effectiveDueDate,
        ownerUserId,
        description: metaDescription,
      });

      const validKrs = krs.filter((kr) => kr.title.trim() !== '');
      await Promise.all(
        validKrs.map((kr) =>
          createKeyResult({
            objectiveId: createdObjective.id,
            title: kr.title,
            metricType: 'manual',
            target: Number(kr.targetValue) || 100,
            current: 0,
            unit: kr.unit || 'pts',
            confidence: Math.max(0, Math.min(1, (Number(kr.confidenceScore) || 5) / 10)),
            weight: 1,
          }),
        ),
      );

      const generatedKrs = validKrs.map((kr, idx) => ({
        id: `${createdObjective.id}-kr-${idx + 1}`,
        title: kr.title,
        status: 'Not started' as const,
        priority,
        category,
        assignedTo: assignedTo.join(' ; '),
        startDate: effectiveStartDate,
        dueDate: effectiveDueDate,
        currentValue: 0,
        targetValue: Number(kr.targetValue) || 100,
        unit: kr.unit || 'pts',
        progress: 0,
        confidenceScore: Number(kr.confidenceScore) || 5,
        businessNeed: kr.businessNeed || '',
        beforeText: kr.businessNeed || '',
      }));

      // Keep legacy local-state pages in sync while persisting to backend.
      addObjective({
        id: createdObjective.id,
        title,
        category: finalCategory,
        area,
        priority,
        cycle,
        assignedTo: assignedTo.join(' ; '),
        startDate: effectiveStartDate,
        dueDate: effectiveDueDate,
        status: 'Not started',
        progress: 0,
        keyResults: generatedKrs,
        businessNeeds: '',
        confidenceScore: 3,
        notes: isCrossOkr ? '[Cross-OKR]' : '',
        statusIndicators: '',
        currentMonthFocus: '',
        nextMonthFocus: '',
        lastReviewDate: '',
        plannedNextReviewDate: '',
        reviewComment: '',
        history: [],
      });

      setTitle('');
      setCategory('');
      setArea('');
      setPriority('Medium');
      setAssignedTo([currentUser?.displayName || (users[0] ? users[0].displayName : 'Unassigned')]);
      setStartDate('');
      setDueDate('');
      setIsCrossOkr(false);
      setKrs([{ title: '', targetValue: 100, unit: '%', confidenceScore: 5, businessNeed: '' }]);

      setNewObjModalOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create objective in database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col my-8 max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA] shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Create New Objective</h2>
          <button type="button" onClick={() => setNewObjModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
          {/* Header properties */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Objective / Title</label>
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scale Engineering Throughput..."
                className="w-full bg-gray-50 border border-gray-200 rounded-md py-3 px-4 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 focus:bg-white transition-colors" 
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Assigned To (Multi-Select)</label>
                <div className="relative mb-2">
                  <input 
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name..."
                    className="w-full bg-white border border-gray-200 rounded-md py-1.5 px-3 text-xs focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 h-24 overflow-y-auto">
                  {users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                    <label key={u.id} className="flex items-center gap-2 mb-1 p-1 hover:bg-gray-100 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={assignedTo.includes(u.displayName)} 
                        onChange={(e) => {
                          if (e.target.checked) setAssignedTo([...assignedTo, u.displayName]);
                          else setAssignedTo(assignedTo.filter(a => a !== u.displayName));
                        }} 
                        className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
                      />
                      <span className="text-sm font-medium text-gray-900">{u.displayName}</span>
                    </label>
                  ))}
                  {users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                    <p className="text-[10px] text-gray-400 text-center py-2">No users found</p>
                  )}
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Category</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Department"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 text-gray-900 font-medium" 
                  />
                  <datalist id="category-suggestions">
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Priority</label>
                <div className="relative">
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as OkrPriority)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 cursor-pointer text-gray-900 font-medium">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Cycle</label>
                <div className="relative">
                  <select 
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 cursor-pointer text-gray-900 font-medium">
                    {defaultCycles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Area</label>
                <div className="relative">
                  <input
                    type="text"
                    list="area-suggestions"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Mixing 密炼"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 text-gray-900 font-medium"
                  />
                  <datalist id="area-suggestions">
                    <option value="Mixing 密炼" />
                    <option value="Hot preparation 热准备" />
                    <option value="Curing 硫化" />
                    <option value="Tire Building 成型" />
                    <option value="Final finishing 终检" />
                  </datalist>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Start Date</label>
                <input 
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 text-gray-900 font-medium" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 block">Due Date</label>
                <input 
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 text-gray-900 font-medium" 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2 px-1 bg-orange-50/50 rounded-lg border border-orange-100/50">
              <input 
                id="is-cross-okr"
                type="checkbox" 
                checked={isCrossOkr} 
                onChange={(e) => setIsCrossOkr(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
              />
              <label htmlFor="is-cross-okr" className="text-sm font-bold text-[#D97706] cursor-pointer">
                {t('isCrossOkr')}
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">Key Results</h3>
              <button 
                type="button" 
                onClick={handleAddKr}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
                <Plus className="w-3.5 h-3.5"/> Add Another
              </button>
            </div>
            
            <div className="space-y-4">
              {krs.map((kr, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                  {/* ── Business Need — shown FIRST, before KR title ── */}
                  <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-sm shrink-0">{idx + 1}</div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Business Need / Problem (KR {idx + 1})</p>
                    </div>
                    <textarea
                      rows={2}
                      value={kr.businessNeed || ''}
                      onChange={(e) => handleKrChange(idx, 'businessNeed', e.target.value)}
                      placeholder={`Why is this needed? What problem does KR ${idx + 1} solve? → auto-fills the "Before" section in the result report.`}
                      className="w-full bg-white border border-amber-200 rounded-md py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none placeholder-gray-400"
                    />
                  </div>

                  {/* ── KR Title + Difficulty ─────────────────────── */}
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Key Result {idx + 1}</p>
                      <input
                        required
                        placeholder="e.g. Reduce execution time by 50%"
                        value={kr.title}
                        onChange={(e) => handleKrChange(idx, 'title', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 placeholder-gray-400"
                      />
                    </div>
                    <div className="shrink-0 pt-5">
                      <label className="flex flex-col items-center gap-1 text-[10px] font-bold text-[#D97706] uppercase tracking-wider">
                        Difficulty
                        <span className="text-[9px] text-gray-400 font-normal">0=Hard · 10=Easy</span>
                        <input
                          type="number" min="0" max="10"
                          value={kr.confidenceScore ?? 5}
                          onChange={(e) => handleKrChange(idx, 'confidenceScore', Number(e.target.value))}
                          className="w-16 bg-orange-50 border border-orange-200 rounded-md py-1.5 px-2 text-sm font-bold text-center text-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50"
                        />
                      </label>
                    </div>
                    {krs.length > 1 && (
                      <button type="button" onClick={() => handleRemoveKr(idx)}
                        className="shrink-0 pt-5 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
          
          {submitError && <div className="text-sm text-red-600 -mt-2">{submitError}</div>}

          <div className="pt-8 flex justify-end gap-3 shrink-0 border-t border-gray-100 mt-8">
            <button 
              type="button" 
              onClick={() => setNewObjModalOpen(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#D97706] rounded-md hover:bg-[#B45309] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {isSubmitting ? 'Saving...' : 'Save Objective & Key Results'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





