import { Node } from 'reactflow';
import { AutomationAction, WorkflowNodeData } from '../types/workflow';
import { StartNodeForm } from './forms/StartNodeForm';
import { TaskNodeForm } from './forms/TaskNodeForm';
import { ApprovalNodeForm } from './forms/ApprovalNodeForm';
import { AutomatedStepNodeForm } from './forms/AutomatedStepNodeForm';
import { EndNodeForm } from './forms/EndNodeForm';

interface NodePanelProps {
  node: Node<WorkflowNodeData> | null;
  actions: AutomationAction[];
  onChange: (nodeId: string, data: WorkflowNodeData) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

// This component's only job is routing: given the selected node's `kind`,
// render the matching form. The switch is exhaustive over the discriminated
// union, so adding a 6th node type later would cause a TS error here until
// a case is added - the type system keeps this file honest.
export function NodePanel({ node, actions, onChange, onDelete, onClose }: NodePanelProps) {
  if (!node) {
    return (
      <aside className="node-panel node-panel-empty">
        <p>Select a node to edit its configuration.</p>
      </aside>
    );
  }

  const data = node.data;

  const renderForm = () => {
    switch (data.kind) {
      case 'start':
        return <StartNodeForm data={data} onChange={(d) => onChange(node.id, d)} />;
      case 'task':
        return <TaskNodeForm data={data} onChange={(d) => onChange(node.id, d)} />;
      case 'approval':
        return <ApprovalNodeForm data={data} onChange={(d) => onChange(node.id, d)} />;
      case 'automatedStep':
        return <AutomatedStepNodeForm data={data} actions={actions} onChange={(d) => onChange(node.id, d)} />;
      case 'end':
        return <EndNodeForm data={data} onChange={(d) => onChange(node.id, d)} />;
    }
  };

  return (
    <aside className="node-panel">
      <div className="node-panel-header">
        <h3>Edit node</h3>
        <button className="icon-btn" onClick={onClose}>✕</button>
      </div>
      {renderForm()}
      <button className="danger-btn" onClick={() => onDelete(node.id)}>Delete node</button>
    </aside>
  );
}
