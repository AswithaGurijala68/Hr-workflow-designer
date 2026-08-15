import { NodeProps } from 'reactflow';
import { NodeShell } from './NodeShell';
import { AutomatedStepNodeData } from '../../types/workflow';

export function AutomatedStepNode({ data }: NodeProps<AutomatedStepNodeData>) {
  return (
    <NodeShell color="#a855f7" icon="⚙️" title={data.title || 'Automated Step'} subtitle={data.actionId || 'No action selected'} />
  );
}
