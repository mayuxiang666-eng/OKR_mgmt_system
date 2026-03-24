import { create } from 'zustand';
import { Objective, KeyResult, Initiative, OkrProgress } from './types';
import { mockObjectives } from './mockData';

export type AppLanguage = 'zh' | 'en';

// Extract unique users
const uniqueUsers = Array.from(new Set(mockObjectives.map(o => o.assignedTo))).filter(u => u !== 'Unassigned' && u.trim() !== '');

interface OkrState {
  objectives: Objective[];
  users: string[];
  currentUser: string | null;
  searchQuery: string;
  isNewObjModalOpen: boolean;
  language: AppLanguage;

  login: (user: string, persist?: boolean) => void;
  logout: () => void;
  setSearchQuery: (q: string) => void;
  setLanguage: (lang: AppLanguage) => void;
  setNewObjModalOpen: (isOpen: boolean) => void;
  replaceObjectives: (objs: Objective[]) => void;
  addObjective: (obj: Objective) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  addCheckIn: (objId: string, newValue: number, comment: string, status: OkrProgress | string) => void;

  // Manage KRs within Objective
  addKr: (objId: string, kr: KeyResult) => void;
  updateKr: (objId: string, krId: string, updates: Partial<KeyResult>) => void;
  deleteKr: (objId: string, krId: string) => void;
}

export const useOkrStore = create<OkrState>((set) => ({
  objectives: mockObjectives,
  users: uniqueUsers,
  currentUser: typeof window !== 'undefined' ? window.localStorage.getItem('okr_user') : null,
  searchQuery: '',
  isNewObjModalOpen: false,
  // Keep SSR and first client render identical; hydrate from localStorage after mount.
  language: 'zh',

  login: (user, persist) => {
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem('okr_user', user);
    }
    set({ currentUser: user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('okr_user');
    }
    set({ currentUser: null });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('app_language', lang);
    set({ language: lang });
  },
  setNewObjModalOpen: (isOpen) => set({ isNewObjModalOpen: isOpen }),
  replaceObjectives: (objs) => set({ objectives: objs }),

  addObjective: (obj) => set((state) => ({
    objectives: [obj, ...state.objectives]
  })),

  updateObjective: (id, updates) => set((state) => ({
    objectives: state.objectives.map((o) =>
      o.id === id ? { ...o, ...updates } : o
    )
  })),

  deleteObjective: (id) => set((state) => ({
    objectives: state.objectives.filter(o => o.id !== id)
  })),

  addCheckIn: (objId, newValue, comment, reqStatus) => set((state) => ({
    objectives: state.objectives.map((obj) => {
      if (obj.id !== objId) return obj;

      const newHistoryItem = {
        id: `hist-${Date.now()}`,
        author: state.currentUser || 'Current User',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: newValue,
        comment: comment,
        status: reqStatus as OkrProgress,
      };

      return {
        ...obj,
        progress: newValue, // Assuming objective progress is manually logged here
        status: reqStatus as OkrProgress,
        history: [newHistoryItem, ...(obj.history || [])]
      };
    })
  })),

  addKr: (objId, kr) => set((state) => ({
    objectives: state.objectives.map(obj =>
      obj.id === objId ? { ...obj, keyResults: [...obj.keyResults, kr] } : obj
    )
  })),

  updateKr: (objId, krId, updates) => set((state) => ({
    objectives: state.objectives.map(obj =>
      obj.id === objId ? {
        ...obj,
        keyResults: obj.keyResults.map(kr => kr.id === krId ? { ...kr, ...updates } : kr)
      } : obj
    )
  })),

  deleteKr: (objId, krId) => set((state) => ({
    objectives: state.objectives.map(obj =>
      obj.id === objId ? {
        ...obj,
        keyResults: obj.keyResults.filter(kr => kr.id !== krId)
      } : obj
    )
  }))
}));

