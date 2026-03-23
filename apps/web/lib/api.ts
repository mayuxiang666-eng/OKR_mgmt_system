export type UiHealthStatus = 'onTrack' | 'atRisk' | 'offTrack';

export interface Objective {
  id: string;
  title: string;
  category: string;
  priority: string;
  progressCached: number;
  confidenceCached: number;
  status: string;
  owner?: { id: string; displayName: string; email: string } | null;
  keyResults?: KeyResult[];
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  metricType: string;
  target: number;
  current?: number | null;
  forecast?: number | null;
  progress: number;
  confidence: number;
  status: string;
  unit?: string | null;
  weight: number;
}

export interface CreateObjectiveInput {
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  startDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface CreateKrInput {
  objectiveId: string;
  title: string;
  metricType: string;
  target: number;
  baseline?: number;
  current?: number;
  confidence?: number;
  weight?: number;
  unit?: string;
}

export interface CreateCheckinInput {
  krId: string;
  current?: number;
  forecast?: number;
  confidence?: number;
  risk?: 'on_track' | 'at_risk' | 'off_track';
  blocker?: string;
  comment?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function toUiHealthStatus(status: string): UiHealthStatus {
  if (status === 'on_track') {
    return 'onTrack';
  }
  if (status === 'at_risk') {
    return 'atRisk';
  }
  return 'offTrack';
}

export function normalizeProgress(value: number | undefined | null): number {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 0;
  }
  if (value > 1) {
    return Math.min(1, value / 100);
  }
  if (value < 0) {
    return 0;
  }
  return value;
}

export function listObjectives(cycleId?: string) {
  const query = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : '';
  return request<Objective[]>(`/objectives${query}`);
}

export function getObjective(id: string) {
  return request<Objective>(`/objectives/${id}`);
}

export function createObjective(input: CreateObjectiveInput) {
  return request<Objective>('/objectives', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createKeyResult(input: CreateKrInput) {
  return request<KeyResult>('/key-results', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getKeyResult(id: string) {
  return request<KeyResult>(`/key-results/${id}`);
}

export function createCheckin(input: CreateCheckinInput) {
  return request('/checkins', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateKrProgress(id: string, payload: { current?: number; forecast?: number; confidence?: number }) {
  return request<KeyResult>(`/key-results/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
