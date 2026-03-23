import { create } from 'zustand';
import { Objective, KeyResult, Initiative, OkrProgress } from './types';
import { mockObjectives } from './mockData';

// Extract unique users
const uniqueUsers = Array.from(new Set(mockObjectives.map(o => o.assignedTo))).filter(u => u !== 'Unassigned' && u.trim() !== '');

interface OkrState {
  objectives: Objective[];
  users: string[];
  currentUser: string | null;
  searchQuery: string;
  isNewObjModalOpen: boolean;
  
  login: (user: string) => void;
  logout: () => void;
  setSearchQuery: (q: string) => void;
  setNewObjModalOpen: (isOpen: boolean) => void;
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
  currentUser: null,
  searchQuery: '',
  isNewObjModalOpen: false,

  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setNewObjModalOpen: (isOpen) => set({ isNewObjModalOpen: isOpen }),

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
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
