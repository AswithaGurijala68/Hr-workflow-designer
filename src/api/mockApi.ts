// Mock API layer. In a real app this would be fetch() calls to a backend;
// here we simulate network latency with setTimeout so the rest of the app
// (loading states, async hooks) behaves exactly like it would against a real API.
// This isolation means swapping in a real backend later only touches this file.

import { Node, Edge } from 'reactflow';
import {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  WorkflowNodeData,
} from '../types/workflow';

const MOCK_ACTIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field'] },
  { id: 'notify_slack', label: 'Notify Slack Channel', params: ['channel', 'message'] },
];

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// GET /automations
export async function fetchAutomations(): Promise<AutomationAction[]> {
  return delay(MOCK_ACTIONS);
}

// POST /simulate
// Accepts the full workflow graph and returns a mock step-by-step execution log.
// This is intentionally simple logic - the goal is to demonstrate the contract
// (graph in, ordered execution steps out), not build a real workflow engine.
export async function simulateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Promise<SimulationResult> {
  const steps: SimulationStep[] = [];

  const startNode = nodes.find((n) => n.data.kind === 'start');
  if (!startNode) {
    return delay({
      success: false,
      steps: [
        {
          nodeId: 'unknown',
          label: 'Validation',
          status: 'error',
          message: 'No Start node found - cannot execute workflow.',
        },
      ],
    });
  }

  // Walk the graph breadth-first from the start node, following edges in order.
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    steps.push(describeStep(node));

    const outgoing = edges.filter((e) => e.source === nodeId);
    if (outgoing.length === 0 && node.data.kind !== 'end') {
      steps.push({
        nodeId,
        label: node.data.title ?? node.id,
        status: 'warning',
        message: 'Dead end: node has no outgoing connection.',
      });
    }
    outgoing.forEach((e) => queue.push(e.target));
  }

  const unreached = nodes.filter((n) => !visited.has(n.id));
  unreached.forEach((n) => {
    steps.push({
      nodeId: n.id,
      label: labelFor(n.data),
      status: 'warning',
      message: 'Node is not reachable from the Start node.',
    });
  });

  const success = !steps.some((s) => s.status === 'error');
  return delay({ success, steps }, 600);
}

function labelFor(data: WorkflowNodeData): string {
  return data.kind === 'end' ? 'End' : data.title;
}

function describeStep(node: Node<WorkflowNodeData>): SimulationStep {
  const data = node.data;
  switch (data.kind) {
    case 'start':
      return { nodeId: node.id, label: data.title || 'Start', status: 'ok', message: 'Workflow initiated.' };
    case 'task':
      return {
        nodeId: node.id,
        label: data.title || 'Task',
        status: data.assignee ? 'ok' : 'warning',
        message: data.assignee
          ? `Task assigned to ${data.assignee}${data.dueDate ? ` (due ${data.dueDate})` : ''}.`
          : 'Task has no assignee set.',
      };
    case 'approval':
      return {
        nodeId: node.id,
        label: data.title || 'Approval',
        status: 'ok',
        message: `Routed to ${data.approverRole || 'an approver'} (auto-approve threshold: ${data.autoApproveThreshold}).`,
      };
    case 'automatedStep':
      return {
        nodeId: node.id,
        label: data.title || 'Automated Step',
        status: data.actionId ? 'ok' : 'warning',
        message: data.actionId ? `Executed action "${data.actionId}".` : 'No action selected.',
      };
    case 'end':
      return {
        nodeId: node.id,
        label: 'End',
        status: 'ok',
        message: data.endMessage || 'Workflow completed.',
      };
  }
}
