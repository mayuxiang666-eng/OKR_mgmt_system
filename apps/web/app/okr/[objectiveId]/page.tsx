"use client";

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KRCard } from '../../../components/KRCard';
import { ObjectiveCard } from '../../../components/ObjectiveCard';
import { createKeyResult, getObjective, normalizeProgress, toUiHealthStatus } from '../../../lib/api';

export default function ObjectiveDetailPage({ params }: { params: { objectiveId: string } }) {
  const queryClient = useQueryClient();
  const [krTitle, setKrTitle] = useState('');
  const [metricType, setMetricType] = useState('percentage');
  const [target, setTarget] = useState('');
  const [baseline, setBaseline] = useState('');
  const [error, setError] = useState<string | null>(null);

  const objectiveQuery = useQuery({
    queryKey: ['objective', params.objectiveId],
    queryFn: () => getObjective(params.objectiveId),
  });

  const createKrMutation = useMutation({
    mutationFn: createKeyResult,
    onSuccess: async () => {
      setKrTitle('');
      setTarget('');
      setBaseline('');
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['objective', params.objectiveId] });
      await queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: (mutationError: Error) => setError(mutationError.message || 'Failed to create KR'),
  });

  const objective = objectiveQuery.data;

  const onCreateKr = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedTarget = Number(target);
    const parsedBaseline = baseline ? Number(baseline) : undefined;

    if (!krTitle.trim()) {
      setError('KR title is required');
      return;
    }
    if (Number.isNaN(parsedTarget)) {
      setError('Target must be a valid number');
      return;
    }

    createKrMutation.mutate({
      objectiveId: params.objectiveId,
      title: krTitle.trim(),
      metricType,
      target: parsedTarget,
      baseline: parsedBaseline,
      confidence: 0.6,
      weight: 1,
    });
  };

  if (objectiveQuery.isLoading) {
    return <div className="text-slate-300">Loading objective...</div>;
  }

  if (objectiveQuery.isError || !objective) {
    return <div className="text-red-400">Objective not found or failed to load.</div>;
  }

  return (
    <div className="space-y-4">
      <ObjectiveCard
        id={objective.id}
        title={objective.title}
        owner={objective.owner?.displayName}
        progress={normalizeProgress(objective.progressCached)}
        confidence={objective.confidenceCached || 0}
        status={toUiHealthStatus(objective.status)}
        priority={objective.priority}
      />

      <form className="card space-y-3" onSubmit={onCreateKr}>
        <h3 className="text-white text-lg">Add Key Result</h3>
        <input
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          placeholder="e.g. Scrap rate from 4.8% to 3.2%"
          value={krTitle}
          onChange={(event) => setKrTitle(event.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            value={metricType}
            onChange={(event) => setMetricType(event.target.value)}
          >
            <option value="percentage">percentage</option>
            <option value="number">number</option>
            <option value="index_score">index_score</option>
            <option value="milestone">milestone</option>
          </select>
          <input
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            placeholder="Target"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          />
          <input
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            placeholder="Baseline (optional)"
            value={baseline}
            onChange={(event) => setBaseline(event.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-sm disabled:opacity-50"
          disabled={createKrMutation.isPending}
        >
          {createKrMutation.isPending ? 'Creating...' : 'Add KR'}
        </button>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(objective.keyResults || []).map((kr) => (
          <Link key={kr.id} href={`/okr/${params.objectiveId}/kr/${kr.id}`}>
            <KRCard
              id={kr.id}
              title={kr.title}
              metricType={kr.metricType}
              target={kr.target}
              current={kr.current ?? undefined}
              forecast={kr.forecast ?? undefined}
              progress={normalizeProgress(kr.progress)}
              confidence={kr.confidence}
              status={toUiHealthStatus(kr.status)}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
