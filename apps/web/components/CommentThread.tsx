export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentThreadProps {
  comments: Comment[];
  onAdd?: (content: string) => void;
}

export function CommentThread({ comments }: CommentThreadProps) {
  return (
    <div className="card space-y-2">
      <div className="text-white font-medium">Comments</div>
      {comments.map((c) => (
        <div key={c.id} className="border border-slate-800 rounded p-2">
          <div className="text-xs text-slate-400">{c.author} - {c.createdAt}</div>
          <div className="text-slate-200 text-sm">{c.content}</div>
        </div>
      ))}
      {comments.length === 0 && <div className="text-slate-500 text-sm">No comments yet.</div>}
    </div>
  );
}
