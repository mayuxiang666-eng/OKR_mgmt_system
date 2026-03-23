"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KRCard } from '../../../../../components/KRCard';
import { CheckinEditor } from '../../../../../components/CheckinEditor';
import { CommentThread } from '../../../../../components/CommentThread';
import { createCheckin, getKeyResult, normalizeProgress, toUiHealthStatus, updateKrProgress } from '../../../../../lib/api';

export default function KrDetailPage({ params }: { params: { objectiveId: string; krId: string } }) {
  const queryClient = useQueryClient();

  const krQuery = useQuery({
    queryKey: ['kr', params.krId],
    queryFn: () => getKeyResult(params.krId),
  });

  const checkinMutation = useMutation({
    mutationFn: createCheckin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['kr', params.krId] });
      await queryClient.invalidateQueries({ queryKey: ['objective', params.objectiveId] });
      await queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: (payload: { current?: number; forecast?: number; confidence?: number }) => updateKrProgress(params.krId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['kr', params.krId] });
      await queryClient.invalidateQueries({ queryKey: ['objective', params.objectiveId] });
      await queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });

  const kr = krQuery.data;

  if (krQuery.isLoading) {
    return <div className="text-slate-300">Loading KR...</div>;
  }

  if (krQuery.isError || !kr) {
    return <div className="text-red-400">KR not found or failed to load.</div>;
  }

  return (
    <div className="space-y-4">
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
      <CheckinEditor
        krId={kr.id}
        current={kr.current ?? undefined}
        forecast={kr.forecast ?? undefined}
        confidence={kr.confidence}
        onSubmit={async (payload) => {
          await checkinMutation.mutateAsync({
            krId: payload.krId,
            current: payload.current,
            forecast: payload.forecast,
            confidence: payload.confidence,
            risk: payload.risk,
            blocker: payload.blocker,
            comment: payload.comment,
          });

          await progressMutation.mutateAsync({
            current: payload.current,
            forecast: payload.forecast,
            confidence: payload.confidence,
          });
        }}
      />
      {(checkinMutation.isError || progressMutation.isError) && (
        <div className="text-red-400 text-sm">Failed to submit updates. Please retry.</div>
      )}
      <CommentThread comments={[]} />
    </div>
  );
}
