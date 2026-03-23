export type OkrStatus = 'On track' | 'At risk' | 'Behind' | 'Completed';
export type OkrCategory = 'Department' | 'Individual_Team' | 'Individual_Performance' | 'Process maturity' | string;
export type OkrPriority = 'Critical' | 'High' | 'Medium' | 'Low' | string;
export type OkrProgress = 'Not started' | 'In progress' | 'Completed' | 'Blocked' | 'Behind' | string;

export interface CheckInHistory {
  id: string;
  author: string;
  timestamp: string;
  value?: number;
  comment: string;
  status?: OkrProgress;
  type?: 'check-in' | 'field-update';
}

export interface Initiative {
  id: string;
  title: string;
  assignedTo: string;
  status: string;
  dueDate: string;
}

export interface KeyResult {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  status?: OkrProgress;
  confidenceScore?: number;
  // Business need / problem statement (filled at creation, becomes 'Before' in result doc)
  businessNeed?: string;
  // Before/After result documentation
  beforeText?: string;
  afterText?: string;
  images?: { id: string; dataUrl: string; label: string; section: 'before' | 'after' }[];
}

export interface Objective {
  id: string;
  title: string;
  category: OkrCategory;
  priority: OkrPriority;
  status: OkrProgress;
  cycle: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  progress: number;
  
  // Legacy fields shifted to Objective
  businessNeeds?: string;
  confidenceScore: number;
  notes: string;
  statusIndicators: string;
  planPlus1?: string;
  currentMonthFocus?: string;
  nextMonthFocus?: string;
  lastReviewDate: string;
  plannedNextReviewDate: string;
  reviewComment: string;
  history: CheckInHistory[];

  keyResults: KeyResult[];
}
