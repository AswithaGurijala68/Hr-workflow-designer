import { Node, Edge } from 'reactflow';
import { ValidationIssue, WorkflowNodeData } from '../types/workflow';

export function validateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const startNodes = nodes.filter((n) => n.data.kind === 'start');
  if (startNodes.length === 0) {
    issues.push({ message: 'Workflow must have a Start node.', severity: 'error' });
  } else if (startNodes.length > 1) {
    issues.push({ message: 'Only one Start node is allowed.', severity: 'error' });
  }

  const endNodes = nodes.filter((n) => n.data.kind === 'end');
  if (endNodes.length === 0) {
    issues.push({ message: 'Workflow should have at least one End node.', severity: 'warning' });
  }

  // A Start node must have no incoming edges (it's the entry point).
  const startWithIncoming = startNodes.find((s) =>
    edges.some((e) => e.target === s.id)
  );
  if (startWithIncoming) {
    issues.push({
      nodeId: startWithIncoming.id,
      message: 'Start node cannot have an incoming connection.',
      severity: 'error',
    });
  }

  // Simple cycle detection via DFS - prevents infinite loops in simulation.
  if (hasCycle(nodes, edges)) {
    issues.push({ message: 'Workflow graph contains a cycle.', severity: 'error' });
  }

  return issues;
}

// Per-node severity map, used to highlight individual nodes directly on the
// canvas (border color) rather than only listing issues in the sandbox panel.
// Deliberately conservative: a node only gets flagged for problems specific
// to that node, so a single graph-level error (e.g. "no Start node") doesn't
// paint every node red.
export function getNodeIssues(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Map<string, 'error' | 'warning'> {
  const map = new Map<string, 'error' | 'warning'>();
  const startNode = nodes.find((n) => n.data.kind === 'start');

  if (startNode) {
    const reachable = new Set<string>();
    const queue = [startNode.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target));
    }
    nodes.forEach((n) => {
      if (!reachable.has(n.id)) map.set(n.id, 'warning');
    });

    if (edges.some((e) => e.target === startNode.id)) {
      map.set(startNode.id, 'error');
    }
  }

  nodes.forEach((n) => {
    const outgoing = edges.some((e) => e.source === n.id);
    if (!outgoing && n.data.kind !== 'end' && !map.has(n.id)) {
      map.set(n.id, 'warning'); // dead end
    }
    if (n.data.kind === 'task' && !n.data.assignee && !map.has(n.id)) {
      map.set(n.id, 'warning');
    }
    if (n.data.kind === 'automatedStep' && !n.data.actionId && !map.has(n.id)) {
      map.set(n.id, 'warning');
    }
  });

  return map;
}

function hasCycle(nodes: Node<WorkflowNodeData>[], edges: Edge[]): boolean {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => adjacency.get(e.source)?.push(e.target));

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true; // back-edge found -> cycle
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return nodes.some((n) => dfs(n.id));
}
