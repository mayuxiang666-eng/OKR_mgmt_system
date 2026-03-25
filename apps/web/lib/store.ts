import { create } from 'zustand';
import { Objective, KeyResult, Initiative, OkrProgress } from './types';
import { mockObjectives } from './mockData';
import { AuthUser, setAuthToken, Notification } from './api';

export type AppLanguage = 'zh' | 'en';

// Extract unique users
const uniqueUsers = Array.from(new Set(mockObjectives.map(o => o.assignedTo))).filter(u => u !== 'Unassigned' && u.trim() !== '');

interface OkrState {
  objectives: Objective[];
  users: AuthUser[];
  currentUser: AuthUser | null;
  token: string | null;
  searchQuery: string;
  isNewObjModalOpen: boolean;
  language: AppLanguage;

  login: (user: AuthUser, token: string, persist?: boolean) => void;
  logout: () => void;
  setSearchQuery: (q: string) => void;
  setLanguage: (lang: AppLanguage) => void;
  setNewObjModalOpen: (isOpen: boolean) => void;
  setUsers: (users: AuthUser[]) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
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

export const useOkrStore = create<OkrState>((set) => {
  const initialToken = typeof window !== 'undefined' ? window.localStorage.getItem('okr_token') : null;
  if (initialToken) setAuthToken(initialToken);

  return {
  objectives: mockObjectives,
  users: [],
  currentUser: (typeof window !== 'undefined' && window.localStorage.getItem('okr_user')) 
    ? (() => {
        const raw = window.localStorage.getItem('okr_user');
        try {
          return JSON.parse(raw!);
        } catch (e) {
          console.warn('Malformed user data in localStorage, clearing session.');
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('okr_user');
            window.localStorage.removeItem('okr_token');
          }
          return null;
        }
      })() 
    : null,
  token: initialToken,
  searchQuery: '',
  isNewObjModalOpen: false,
  language: 'zh', // Keep SSR and first client render identical; hydrate from localStorage after mount.

  login: (user, token, persist) => {
    setAuthToken(token);
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem('okr_user', JSON.stringify(user));
      window.localStorage.setItem('okr_token', token);
    }
    set({ currentUser: user, token });
  },
  logout: () => {
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('okr_user');
      window.localStorage.removeItem('okr_token');
    }
    set({ currentUser: null, token: null });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('app_language', lang);
    set({ language: lang });
  },
  setNewObjModalOpen: (isOpen) => set({ isNewObjModalOpen: isOpen }),
  setUsers: (users) => set({ users }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
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
        author: state.currentUser?.displayName || 'Current User',
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
  };
});

