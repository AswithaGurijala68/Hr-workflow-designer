import { NodeProps } from 'reactflow';
import { NodeShell } from './NodeShell';
import { TaskNodeData } from '../../types/workflow';

export function TaskNode({ data }: NodeProps<TaskNodeData>) {
  return (
    <NodeShell color="#3b82f6" icon="📋" title={data.title || 'Task'} subtitle="Human task">
      {data.assignee && <div>Assignee: {data.assignee}</div>}
      {data.dueDate && <div>Due: {data.dueDate}</div>}
    </NodeShell>
  );
}
