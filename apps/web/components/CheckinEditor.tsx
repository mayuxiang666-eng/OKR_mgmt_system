'use client';

import { useState } from 'react';

export interface CheckinEditorProps {
  krId: string;
  current?: number;
  forecast?: number;
  confidence?: number;
  onSubmit: (payload: {
    krId: string;
    current?: number;
    forecast?: number;
    confidence?: number;
    risk?: 'on_track' | 'at_risk' | 'off_track';
    blocker?: string;
    comment?: string;
  }) => Promise<void> | void;
}

export function CheckinEditor({ krId, current, forecast, confidence, onSubmit }: CheckinEditorProps) {
  const [currentValue, setCurrentValue] = useState(current?.toString() ?? '');
  const [forecastValue, setForecastValue] = useState(forecast?.toString() ?? '');
  const [confidenceValue, setConfidenceValue] = useState(confidence?.toString() ?? '');
  const [risk, setRisk] = useState<'on_track' | 'at_risk' | 'off_track'>('on_track');
  const [blocker, setBlocker] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        krId,
        current: currentValue ? Number(currentValue) : undefined,
        forecast: forecastValue ? Number(forecastValue) : undefined,
        confidence: confidenceValue ? Number(confidenceValue) : undefined,
        risk,
        blocker: blocker || undefined,
        comment: comment || undefined,
      });
      setComment('');
      setBlocker('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card space-y-3">
      <div className="text-white">Check-in for {krId}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          placeholder="Current"
          value={currentValue}
          onChange={(event) => setCurrentValue(event.target.value)}
        />
        <input
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          placeholder="Forecast"
          value={forecastValue}
          onChange={(event) => setForecastValue(event.target.value)}
        />
        <input
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          placeholder="Confidence (0-1)"
          value={confidenceValue}
          onChange={(event) => setConfidenceValue(event.target.value)}
        />
      </div>
      <select
        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
        value={risk}
        onChange={(event) => setRisk(event.target.value as 'on_track' | 'at_risk' | 'off_track')}
      >
        <option value="on_track">on_track</option>
        <option value="at_risk">at_risk</option>
        <option value="off_track">off_track</option>
      </select>
      <input
        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
        placeholder="Blocker (optional)"
        value={blocker}
        onChange={(event) => setBlocker(event.target.value)}
      />
      <textarea
        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
        placeholder="Comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <button className="px-3 py-1 bg-sky-600 rounded text-sm disabled:opacity-50" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
}
