import { NodeKind } from '../types/workflow';
import { WORKFLOW_TEMPLATES } from '../utils/templates';

const PALETTE: { kind: NodeKind; label: string; icon: string }[] = [
  { kind: 'start', label: 'Start', icon: '🚀' },
  { kind: 'task', label: 'Task', icon: '📋' },
  { kind: 'approval', label: 'Approval', icon: '✅' },
  { kind: 'automatedStep', label: 'Automated Step', icon: '⚙️' },
  { kind: 'end', label: 'End', icon: '🏁' },
];

interface SidebarProps {
  onUseTemplate: (templateId: string) => void;
}

// Drag source: React Flow's recommended pattern is to stash the node type
// in the drag event's dataTransfer, then read it back in Canvas's onDrop.
export function Sidebar({ onUseTemplate }: SidebarProps) {
  const onDragStart = (event: React.DragEvent, kind: NodeKind) => {
    event.dataTransfer.setData('application/reactflow', kind);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <h3>Nodes</h3>
      <p className="sidebar-hint">Drag a node onto the canvas</p>
      {PALETTE.map((item) => (
        <div
          key={item.kind}
          className="palette-item"
          draggable
          onDragStart={(e) => onDragStart(e, item.kind)}
        >
          <span>{item.icon}</span> {item.label}
        </div>
      ))}

      <h3 className="sidebar-section-title">Templates</h3>
      <p className="sidebar-hint">Click to drop a prebuilt flow onto the canvas</p>
      {WORKFLOW_TEMPLATES.map((t) => (
        <div key={t.id} className="template-item" onClick={() => onUseTemplate(t.id)}>
          <div className="template-item-title">{t.label}</div>
          <div className="template-item-desc">{t.description}</div>
        </div>
      ))}
    </aside>
  );
}
