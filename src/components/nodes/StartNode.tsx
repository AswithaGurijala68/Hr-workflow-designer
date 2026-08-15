import { NodeProps } from 'reactflow';
import { NodeShell } from './NodeShell';
import { StartNodeData } from '../../types/workflow';

export function StartNode({ data }: NodeProps<StartNodeData>) {
  return (
    <NodeShell color="#22c55e" icon="🚀" title={data.title || 'Start'} subtitle="Entry point" showTargetHandle={false} />
  );
}
