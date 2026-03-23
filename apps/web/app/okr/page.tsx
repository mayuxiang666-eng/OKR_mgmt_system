"use client";

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlignmentTree } from '../../components/AlignmentTree';
import { ObjectiveCard } from '../../components/ObjectiveCard';
import { createObjective, listObjectives, normalizeProgress, toUiHealthStatus } from '../../lib/api';

export default function OkrTreePage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Department');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [error, setError] = useState<string | null>(null);

  const objectivesQuery = useQuery({
    queryKey: ['objectives'],
    queryFn: () => listObjectives(),
  });

  const createObjectiveMutation = useMutation({
    mutationFn: createObjective,
    onSuccess: async () => {
      setTitle('');
      setCategory('Department');
      setPriority('high');
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message || 'Failed to create objective');
    },
  });

  const treeData = useMemo(() => {
    const objectives = objectivesQuery.data || [];
    return objectives.map((objective) => ({
      id: objective.id,
      title: objective.title,
      progress: normalizeProgress(objective.progressCached),
      children: [],
    }));
  }, [objectivesQuery.data]);

  const onCreateObjective = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Objective title is required');
      return;
    }

    createObjectiveMutation.mutate({
      title: title.trim(),
      category,
      priority,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-white font-semibold">OKR Alignment Tree</h2>

      <form className="card space-y-3" onSubmit={onCreateObjective}>
        <h3 className="text-lg text-white">Create Objective</h3>
        <input
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
          placeholder="e.g. Q3 reduce die-casting scrap cost"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="Department">Department</option>
            <option value="Individual_Team">Individual_Team</option>
            <option value="Individual_Performance">Individual_Performance</option>
            <option value="Process_maturity">Process_maturity</option>
          </select>
          <select
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            value={priority}
            onChange={(event) => setPriority(event.target.value as 'critical' | 'high' | 'medium' | 'low')}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            type="submit"
            className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-sm disabled:opacity-50"
            disabled={createObjectiveMutation.isPending}
          >
            {createObjectiveMutation.isPending ? 'Creating...' : 'Add Objective'}
          </button>
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </form>

      <div className="card">
        <h3 className="text-lg text-white mb-3">Alignment Tree</h3>
        {objectivesQuery.isLoading && <div className="text-slate-400 text-sm">Loading objectives...</div>}
        {objectivesQuery.isError && <div className="text-red-400 text-sm">Failed to load objectives.</div>}
        {!objectivesQuery.isLoading && !objectivesQuery.isError && <AlignmentTree data={treeData} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(objectivesQuery.data || []).map((objective) => (
          <Link key={objective.id} href={`/okr/${objective.id}`}>
            <ObjectiveCard
              id={objective.id}
              title={objective.title}
              owner={objective.owner?.displayName}
              progress={normalizeProgress(objective.progressCached)}
              confidence={objective.confidenceCached || 0}
              status={toUiHealthStatus(objective.status)}
              priority={objective.priority}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
