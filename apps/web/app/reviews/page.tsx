import { CommentThread } from '../../components/CommentThread';

export default function ReviewsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-white font-semibold">Quarterly Reviews</h2>
      <div className="card space-y-2">
        <div className="text-white">FY26 Q1 Review</div>
        <div className="text-slate-300 text-sm">Score: 0.8 | Reviewer: Ops Director</div>
        <div className="text-slate-200 text-sm">Comment: Good trend; tighten SPC alarms.</div>
      </div>
      <CommentThread comments={[]} />
    </div>
  );
}
