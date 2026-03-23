export interface ObjectiveNode {
  id: string;
  title: string;
  progress: number;
  children?: ObjectiveNode[];
}

export interface AlignmentTreeProps {
  data: ObjectiveNode[];
  onLink?: (parentId: string, childId: string) => void;
  onExpand?: (id: string) => void;
}

export function AlignmentTree({ data }: AlignmentTreeProps) {
  return (
    <div className="space-y-2">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}

function TreeNode({ node, depth }: { node: ObjectiveNode; depth: number }) {
  return (
    <div style={{ marginLeft: `${depth * 12}px` }}>
      <div className="card mb-2">
        <div className="text-white font-medium">{node.title}</div>
        <div className="text-xs text-slate-400">Progress: {Math.round(node.progress * 100)}%</div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-4 border-l border-slate-700 pl-3 space-y-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
