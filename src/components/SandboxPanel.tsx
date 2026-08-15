import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowNodeData, SimulationResult, ValidationIssue } from '../types/workflow';
import { simulateWorkflow } from '../api/mockApi';
import { validateWorkflow } from '../utils/validation';

interface SandboxPanelProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  open: boolean;
  onClose: () => void;
}

export function SandboxPanel({ nodes, edges, open, onClose }: SandboxPanelProps) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [running, setRunning] = useState(false);

  if (!open) return null;

  const runSimulation = async () => {
    setRunning(true);
    setResult(null);
    const validation = validateWorkflow(nodes, edges);
    setIssues(validation);

    // Structural errors block simulation entirely - no point calling the
    // mock API with a graph that has no valid Start node, for example.
    const blockingErrors = validation.filter((i) => i.severity === 'error');
    if (blockingErrors.length > 0) {
      setRunning(false);
      return;
    }

    const res = await simulateWorkflow(nodes, edges);
    setResult(res);
    setRunning(false);
  };

  return (
    <div className="sandbox-overlay">
      <div className="sandbox-panel">
        <div className="node-panel-header">
          <h3>Workflow Sandbox</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <p className="sidebar-hint">
          Serializes the current graph, validates its structure, then sends it to the mock
          <code> /simulate</code> endpoint.
        </p>

        <button className="primary-btn" onClick={runSimulation} disabled={running}>
          {running ? 'Running…' : 'Run Simulation'}
        </button>

        {issues.length > 0 && (
          <div className="issues-list">
            {issues.map((issue, i) => (
              <div key={i} className={`issue issue-${issue.severity}`}>
                {issue.severity === 'error' ? '⛔' : '⚠️'} {issue.message}
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="timeline">
            <h4>{result.success ? '✅ Execution log' : '❌ Execution stopped'}</h4>
            {result.steps.map((step, i) => (
              <div key={i} className={`timeline-step timeline-${step.status}`}>
                <div className="timeline-dot" />
                <div>
                  <div className="timeline-label">{step.label}</div>
                  <div className="timeline-message">{step.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
