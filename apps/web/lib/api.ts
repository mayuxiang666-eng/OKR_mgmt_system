export type UiHealthStatus = 'onTrack' | 'atRisk' | 'offTrack';

export interface Objective {
  id: string;
  title: string;
  category: string;
  priority: string;
  progressCached: number;
  confidenceCached: number;
  status: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  lastReviewDate?: string | null;
  plannedNextReviewDate?: string | null;
  owner?: { id: string; displayName: string; email: string } | null;
  keyResults?: KeyResult[];
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  metricType: string;
  target: number;
  baseline?: number | null;
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
  ownerUserId?: string;
}

export interface UpdateObjectiveInput {
  title?: string;
  category?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'behind';
  startDate?: string;
  dueDate?: string;
  description?: string;
  lastReviewDate?: string;
  plannedNextReviewDate?: string;
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

export interface UpdateKeyResultInput {
  title?: string;
  target?: number;
  baseline?: number;
  current?: number;
  forecast?: number;
  confidence?: number;
  unit?: string;
  weight?: number;
  status?: 'on_track' | 'at_risk' | 'off_track';
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

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  deptId?: string | null;
}

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  role: string;
  email: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'modification' | 'deadline';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const API_BASE = '/backend-api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
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

export function updateObjective(id: string, input: UpdateObjectiveInput) {
  return request<Objective>(`/objectives/${id}`, {
    method: 'PATCH',
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

export function updateKeyResult(id: string, input: UpdateKeyResultInput) {
  return request<KeyResult>(`/key-results/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteKeyResult(id: string) {
  return request<{ id: string; deleted: boolean }>(`/key-results/${id}`, {
    method: 'DELETE',
  });
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

export function deleteObjective(id: string) {
  return request<{ id: string; deleted: boolean }>(`/objectives/${id}`, {
    method: 'DELETE',
  });
}

export function loginWithPassword(input: LoginInput) {
  return request<AuthResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function registerWithPassword(input: RegisterInput) {
  return request<AuthResult>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listUsers() {
  return request<AuthUser[]>('/auth/users');
}

export function listNotifications(userId: string) {
  return request<Notification[]>(`/notifications?userId=${encodeURIComponent(userId)}`);
}

export function markNotificationRead(id: string) {
  return request<Notification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead(userId: string) {
  return request<{ count: number }>(`/notifications/read-all?userId=${encodeURIComponent(userId)}`, {
    method: 'PATCH',
  });
}
