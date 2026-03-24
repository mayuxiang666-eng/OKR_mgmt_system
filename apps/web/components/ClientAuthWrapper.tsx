'use client';

import { useEffect } from 'react';
import { AppLanguage, useOkrStore } from '../lib/store';
import { listObjectives } from '../lib/api';
import { Objective as UiObjective, OkrProgress } from '../lib/types';
import { decodeObjectiveMeta } from '../lib/objectiveDetails';
import Login from './Login';
import Sidebar from './Sidebar';
import Topnav from './Topnav';

type ApiObjective = {
  id: string;
  title: string;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  cycleId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  progressCached?: number | null;
  confidenceCached?: number | null;
  description?: string | null;
  lastReviewDate?: string | null;
  plannedNextReviewDate?: string | null;
  owner?: { displayName?: string | null } | null;
  keyResults?: Array<{
    id: string;
    title?: string | null;
    current?: number | null;
    target?: number | null;
    unit?: string | null;
    progress?: number | null;
    status?: string | null;
    confidence?: number | null;
  }>;
};

function mapStatus(status?: string | null): OkrProgress {
  const v = (status || '').toLowerCase();
  if (v === 'completed') return 'Completed';
  if (v === 'in_progress') return 'In progress';
  if (v === 'behind') return 'Behind';
  if (v === 'blocked' || v === 'off_track') return 'Blocked';
  return 'Not started';
}

function mapPriority(priority?: string | null): string {
  const v = (priority || '').toLowerCase();
  if (v === 'critical') return 'Critical';
  if (v === 'high') return 'High';
  if (v === 'low') return 'Low';
  return 'Medium';
}

function toPercent(value?: number | null): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  const raw = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function dateOnly(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function mapApiObjectiveToUi(api: ApiObjective, fallbackUser: string | null): UiObjective {
  const { meta, legacyNotes } = decodeObjectiveMeta(api.description);

  return {
    id: api.id,
    title: api.title || '(Untitled)',
    category: api.category || 'Department',
    priority: mapPriority(api.priority),
    status: mapStatus(api.status),
    cycle: api.cycleId || 'Current Cycle',
    assignedTo: meta.assignedTo || api.owner?.displayName || fallbackUser || 'Unassigned',
    startDate: dateOnly(api.startDate),
    dueDate: dateOnly(api.dueDate),
    progress: toPercent(api.progressCached),
    businessNeeds: meta.businessNeeds || '',
    confidenceScore: Math.max(0, Math.min(10, Math.round((api.confidenceCached ?? 0.5) * 10))),
    notes: meta.notes ?? legacyNotes,
    statusIndicators: meta.statusIndicators || '',
    currentMonthFocus: meta.currentMonthFocus || '',
    nextMonthFocus: meta.nextMonthFocus || '',
    lastReviewDate: dateOnly(api.lastReviewDate),
    plannedNextReviewDate: dateOnly(api.plannedNextReviewDate),
    reviewComment: meta.reviewComment || '',
    history: meta.history || [],
    keyResults: (api.keyResults || []).map((kr) => ({
      id: kr.id,
      title: kr.title || '(Untitled KR)',
      currentValue: Number(kr.current ?? 0),
      targetValue: Number(kr.target ?? 100),
      unit: kr.unit || '%',
      progress: toPercent(kr.progress),
      status: mapStatus(kr.status),
      confidenceScore: Math.max(0, Math.min(10, Math.round((kr.confidence ?? 0.5) * 10))),
    })),
  };
}

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser, replaceObjectives, setLanguage } = useOkrStore();
  useEffect(() => {
    const saved = window.localStorage.getItem('app_language');
    if (saved === 'en' || saved === 'zh') {
      setLanguage(saved as AppLanguage);
    }
  }, [setLanguage]);

  useEffect(() => {
    if (!currentUser) return;

    let disposed = false;

    const syncFromDb = async () => {
      try {
        const apiObjectives = (await listObjectives()) as unknown as ApiObjective[];
        if (disposed) return;
        const mapped = apiObjectives.map((item) => mapApiObjectiveToUi(item, currentUser));
        replaceObjectives(mapped);
      } catch (error) {
        // Keep current in-memory data when backend fetch fails.
        console.error('Failed to sync objectives from database:', error);
      }
    };

    void syncFromDb();
    const timer = setInterval(() => {
      void syncFromDb();
    }, 5000);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [currentUser, replaceObjectives]);

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-[#FDFCFB] font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topnav />
        <main className="flex-1 overflow-y-auto px-10 py-8 scroll-smooth relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}


