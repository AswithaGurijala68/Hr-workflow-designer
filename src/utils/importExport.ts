import { Node, Edge } from 'reactflow';
import { WorkflowNodeData } from '../types/workflow';

export interface WorkflowFile {
  version: 1;
  exportedAt: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

export function downloadWorkflowJson(nodes: Node<WorkflowNodeData>[], edges: Edge[]) {
  const file: WorkflowFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workflow-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Minimal shape-checking on import - this is a prototype, not a hardened
// schema validator, but it prevents an obviously malformed file from
// silently corrupting canvas state.
export function parseWorkflowJson(text: string): { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('File does not look like a valid workflow export (missing nodes/edges arrays).');
  }
  const validKinds = ['start', 'task', 'approval', 'automatedStep', 'end'];
  for (const node of parsed.nodes) {
    if (!node.id || !node.data || !validKinds.includes(node.data.kind)) {
      throw new Error(`Node "${node.id ?? '?'}" has an invalid or missing data.kind.`);
    }
  }
  return { nodes: parsed.nodes, edges: parsed.edges };
}
