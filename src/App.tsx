import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { NodePanel } from './components/NodePanel';
import { SandboxPanel } from './components/SandboxPanel';
import { useWorkflowStore } from './hooks/useWorkflowStore';
import { fetchAutomations } from './api/mockApi';
import { AutomationAction } from './types/workflow';
import { getNodeIssues } from './utils/validation';
import { downloadWorkflowJson, parseWorkflowJson } from './utils/importExport';
import { WORKFLOW_TEMPLATES } from './utils/templates';

export default function App() {
  const {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    setSelectedNodeId,
    undo,
    redo,
    canUndo,
    canRedo,
    loadGraph,
    addTemplate,
    autoLayout,
  } = useWorkflowStore();

  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the mock automation catalog once on mount (GET /automations).
  useEffect(() => {
    fetchAutomations().then(setActions);
  }, []);

  // Recomputed on every graph change - cheap enough for prototype-scale
  // graphs, and keeps the canvas highlighting always in sync without any
  // extra invalidation logic.
  const issuesByNode = useMemo(() => getNodeIssues(nodes, edges), [nodes, edges]);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    try {
      const text = await file.text();
      const { nodes: importedNodes, edges: importedEdges } = parseWorkflowJson(text);
      loadGraph(importedNodes, importedEdges);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import workflow.');
    }
  };

  const handleUseTemplate = (templateId: string) => {
    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const { nodes: tNodes, edges: tEdges } = template.build();
    addTemplate(tNodes, tEdges);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>HR Workflow Designer</h1>
        <div className="header-actions">
          <button className="icon-toolbtn" onClick={undo} disabled={!canUndo} title="Undo">↶ Undo</button>
          <button className="icon-toolbtn" onClick={redo} disabled={!canRedo} title="Redo">↷ Redo</button>
          <div className="header-divider" />
          <button className="icon-toolbtn" onClick={autoLayout} disabled={nodes.length === 0} title="Auto-arrange nodes">
            ⇥ Auto-layout
          </button>
          <div className="header-divider" />
          <button className="icon-toolbtn" onClick={() => downloadWorkflowJson(nodes, edges)} disabled={nodes.length === 0}>
            ⬇ Export JSON
          </button>
          <button className="icon-toolbtn" onClick={handleImportClick}>⬆ Import JSON</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleFileSelected}
          />
          <div className="header-divider" />
          <button className="primary-btn" onClick={() => setSandboxOpen(true)}>
            ▶ Test Workflow
          </button>
        </div>
      </header>

      {importError && (
        <div className="issue issue-error" style={{ margin: '8px 20px' }}>
          ⛔ {importError}
        </div>
      )}

      <div className="app-body">
        <Sidebar onUseTemplate={handleUseTemplate} />

        <ReactFlowProvider>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onAddNode={addNode}
            onSelectNode={setSelectedNodeId}
            issuesByNode={issuesByNode}
          />
        </ReactFlowProvider>

        <NodePanel
          node={selectedNode}
          actions={actions}
          onChange={updateNodeData}
          onDelete={deleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      <SandboxPanel nodes={nodes} edges={edges} open={sandboxOpen} onClose={() => setSandboxOpen(false)} />
    </div>
  );
}
