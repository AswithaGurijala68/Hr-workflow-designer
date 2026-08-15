// Central type definitions for the workflow domain.
// Keeping these in one file means every node/form/hook shares one source of truth.

export type NodeKind =
  | 'start'
  | 'task'
  | 'approval'
  | 'automatedStep'
  | 'end';

export interface KeyValuePair {
  key: string;
  value: string;
}

// --- Per-node-type data shapes -------------------------------------------

export interface StartNodeData {
  kind: 'start';
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  kind: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  kind: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedStepNodeData {
  kind: 'automatedStep';
  title: string;
  actionId: string; // references AutomationAction.id from the mock API
  params: Record<string, string>; // dynamic, based on the chosen action's param list
}

export interface EndNodeData {
  kind: 'end';
  endMessage: string;
  summaryFlag: boolean;
}

// Discriminated union - lets TypeScript narrow the correct shape based on `kind`.
export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

// --- Mock API shapes -------------------------------------------------------

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  label: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
}

// --- Validation --------------------------------------------------------

export interface ValidationIssue {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}
