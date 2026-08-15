import { NodeProps } from 'reactflow';
import { NodeShell } from './NodeShell';
import { EndNodeData } from '../../types/workflow';

export function EndNode({ data }: NodeProps<EndNodeData>) {
  return (
    <NodeShell color="#ef4444" icon="🏁" title="End" subtitle={data.endMessage} showSourceHandle={false} />
  );
}
