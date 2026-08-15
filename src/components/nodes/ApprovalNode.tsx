import { NodeProps } from 'reactflow';
import { NodeShell } from './NodeShell';
import { ApprovalNodeData } from '../../types/workflow';

export function ApprovalNode({ data }: NodeProps<ApprovalNodeData>) {
  return (
    <NodeShell color="#f59e0b" icon="✅" title={data.title || 'Approval'} subtitle={data.approverRole || 'Approver'}>
      {data.autoApproveThreshold > 0 && <div>Auto-approve ≥ {data.autoApproveThreshold}</div>}
    </NodeShell>
  );
}
