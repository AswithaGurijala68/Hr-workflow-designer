import { Node, Edge } from 'reactflow';
import { WorkflowNodeData } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  label: string;
  description: string;
  build: () => { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
}

// Each template returns a fresh set of nodes/edges (fresh IDs each call)
// so dropping the same template twice doesn't collide. These exist to
// satisfy the "Node templates" bonus requirement, and double as good demo
// content for a README screenshot or recording.
function withPrefix(prefix: string) {
  let counter = 0;
  return () => `${prefix}-${counter++}-${Date.now()}`;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'leave-approval',
    label: 'Leave Approval',
    description: 'Employee requests leave, manager approves, HRIS updated.',
    build: () => {
      const id = withPrefix('leave');
      const n1 = id(), n2 = id(), n3 = id(), n4 = id();
      const nodes: Node<WorkflowNodeData>[] = [
        { id: n1, type: 'start', position: { x: 0, y: 0 }, data: { kind: 'start', title: 'Leave Requested', metadata: [] } },
        { id: n2, type: 'approval', position: { x: 260, y: 0 }, data: { kind: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
        { id: n3, type: 'automatedStep', position: { x: 520, y: 0 }, data: { kind: 'automatedStep', title: 'Update HRIS', actionId: 'update_hris', params: { employeeId: '', field: 'leaveBalance' } } },
        { id: n4, type: 'end', position: { x: 780, y: 0 }, data: { kind: 'end', endMessage: 'Leave request processed', summaryFlag: true } },
      ];
      const edges: Edge[] = [
        { id: `${n1}-${n2}`, source: n1, target: n2 },
        { id: `${n2}-${n3}`, source: n2, target: n3 },
        { id: `${n3}-${n4}`, source: n3, target: n4 },
      ];
      return { nodes, edges };
    },
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    description: 'Collect documents, HR review task, send welcome email.',
    build: () => {
      const id = withPrefix('onboard');
      const n1 = id(), n2 = id(), n3 = id(), n4 = id();
      const nodes: Node<WorkflowNodeData>[] = [
        { id: n1, type: 'start', position: { x: 0, y: 0 }, data: { kind: 'start', title: 'New Hire Created', metadata: [] } },
        { id: n2, type: 'task', position: { x: 260, y: 0 }, data: { kind: 'task', title: 'Collect Documents', description: 'ID, tax forms, bank details', assignee: 'HR Ops', dueDate: '', customFields: [] } },
        { id: n3, type: 'automatedStep', position: { x: 520, y: 0 }, data: { kind: 'automatedStep', title: 'Send Welcome Email', actionId: 'send_email', params: { to: '', subject: 'Welcome aboard!' } } },
        { id: n4, type: 'end', position: { x: 780, y: 0 }, data: { kind: 'end', endMessage: 'Onboarding complete', summaryFlag: true } },
      ];
      const edges: Edge[] = [
        { id: `${n1}-${n2}`, source: n1, target: n2 },
        { id: `${n2}-${n3}`, source: n2, target: n3 },
        { id: `${n3}-${n4}`, source: n3, target: n4 },
      ];
      return { nodes, edges };
    },
  },
  {
    id: 'doc-verification',
    label: 'Document Verification',
    description: 'Task to submit docs, HRBP approval, generate confirmation doc.',
    build: () => {
      const id = withPrefix('docver');
      const n1 = id(), n2 = id(), n3 = id(), n4 = id(), n5 = id();
      const nodes: Node<WorkflowNodeData>[] = [
        { id: n1, type: 'start', position: { x: 0, y: 0 }, data: { kind: 'start', title: 'Verification Requested', metadata: [] } },
        { id: n2, type: 'task', position: { x: 260, y: 0 }, data: { kind: 'task', title: 'Submit Documents', description: '', assignee: 'Employee', dueDate: '', customFields: [] } },
        { id: n3, type: 'approval', position: { x: 520, y: 0 }, data: { kind: 'approval', title: 'HRBP Review', approverRole: 'HRBP', autoApproveThreshold: 0 } },
        { id: n4, type: 'automatedStep', position: { x: 780, y: 0 }, data: { kind: 'automatedStep', title: 'Generate Confirmation', actionId: 'generate_doc', params: { template: 'verification_confirmed', recipient: '' } } },
        { id: n5, type: 'end', position: { x: 1040, y: 0 }, data: { kind: 'end', endMessage: 'Verification complete', summaryFlag: false } },
      ];
      const edges: Edge[] = [
        { id: `${n1}-${n2}`, source: n1, target: n2 },
        { id: `${n2}-${n3}`, source: n2, target: n3 },
        { id: `${n3}-${n4}`, source: n3, target: n4 },
        { id: `${n4}-${n5}`, source: n4, target: n5 },
      ];
      return { nodes, edges };
    },
  },
];
