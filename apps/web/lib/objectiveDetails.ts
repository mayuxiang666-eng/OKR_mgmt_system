import type { CheckInHistory } from './types';

export const OBJECTIVE_META_PREFIX = 'OKR_META_V1:';

export type ObjectiveMeta = {
  assignedTo?: string;
  businessNeeds?: string;
  notes?: string;
  statusIndicators?: string;
  currentMonthFocus?: string;
  nextMonthFocus?: string;
  reviewComment?: string;
  history?: CheckInHistory[];
};

export function encodeObjectiveMeta(meta: ObjectiveMeta): string {
  const safeMeta: ObjectiveMeta = {
    ...meta,
    history: (meta.history || []).slice(0, 100),
  };
  return `${OBJECTIVE_META_PREFIX}${JSON.stringify(safeMeta)}`;
}

export function decodeObjectiveMeta(description?: string | null): { meta: ObjectiveMeta; legacyNotes: string } {
  if (!description) return { meta: {}, legacyNotes: '' };

  if (description.startsWith(OBJECTIVE_META_PREFIX)) {
    const raw = description.slice(OBJECTIVE_META_PREFIX.length);
    try {
      const parsed = JSON.parse(raw) as ObjectiveMeta;
      return { meta: parsed || {}, legacyNotes: '' };
    } catch {
      return { meta: {}, legacyNotes: '' };
    }
  }

  // Backward compatibility: old records used plain text description as notes.
  return { meta: {}, legacyNotes: description };
}
