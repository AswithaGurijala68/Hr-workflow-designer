import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeKind, WorkflowNodeData } from '../types/workflow';
import { StartNode } from './nodes/StartNode';
import { TaskNode } from './nodes/TaskNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { AutomatedStepNode } from './nodes/AutomatedStepNode';
import { EndNode } from './nodes/EndNode';

interface CanvasProps {
  nodes: Node<WorkflowNodeData>[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onAddNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  onSelectNode: (nodeId: string | null) => void;
  issuesByNode?: Map<string, 'error' | 'warning'>;
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onSelectNode,
  issuesByNode,
}: CanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // Registered once - defining this inline in render would cause React Flow
  // to think node types changed on every render and warn/re-mount nodes.
  const nodeTypes = useMemo(
    () => ({
      start: StartNode,
      task: TaskNode,
      approval: ApprovalNode,
      automatedStep: AutomatedStepNode,
      end: EndNode,
    }),
    []
  );

  // Annotate each node with a className reflecting its validation severity,
  // WITHOUT mutating the stored node data - this is purely a render-time
  // decoration so undo/redo and export/import stay clean of UI-only state.
  const decoratedNodes = useMemo(() => {
    if (!issuesByNode || issuesByNode.size === 0) return nodes;
    return nodes.map((n) => {
      const severity = issuesByNode.get(n.id);
      return severity ? { ...n, className: `rf-issue-${severity}` } : n;
    });
  }, [nodes, issuesByNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData('application/reactflow') as NodeKind;
      if (!kind || !wrapperRef.current || !rfInstance.current) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = rfInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      onAddNode(kind, position);
    },
    [onAddNode]
  );

  return (
    <div className="canvas-wrapper" ref={wrapperRef}>
      <ReactFlow
        nodes={decoratedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={(instance) => (rfInstance.current = instance)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
