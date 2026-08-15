import { useCallback, useRef, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from 'reactflow';
import { nanoid } from 'nanoid';
import { NodeKind, WorkflowNodeData } from '../types/workflow';
import { getAutoLayout } from '../utils/autoLayout';

// Default data for each node type when it's first dropped on the canvas.
function createDefaultData(kind: NodeKind): WorkflowNodeData {
  switch (kind) {
    case 'start':
      return { kind: 'start', title: 'Start', metadata: [] };
    case 'task':
      return {
        kind: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      };
    case 'approval':
      return { kind: 'approval', title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automatedStep':
      return { kind: 'automatedStep', title: 'Automated Step', actionId: '', params: {} };
    case 'end':
      return { kind: 'end', endMessage: 'Workflow complete', summaryFlag: false };
  }
}

interface Snapshot {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

const HISTORY_LIMIT = 50;

// One hook, one responsibility: own the graph (nodes + edges), the
// currently-selected node, and undo/redo history, and expose the small set
// of operations the rest of the app needs. Canvas, Sidebar, and NodePanel
// never touch React Flow's raw setState directly - they all go through here.
export function useWorkflowStore() {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Undo/redo: two stacks of past/future snapshots. We deliberately do NOT
  // snapshot on every incremental change (e.g. every pixel of a node drag) -
  // `commit()` is called explicitly at meaningful action boundaries so the
  // history stays coarse-grained and useful (one undo = one user intent).
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  const [historyTick, setHistoryTick] = useState(0); // forces re-render so undo/redo buttons can enable/disable

  const commit = useCallback((currentNodes: Node<WorkflowNodeData>[], currentEdges: Edge[]) => {
    past.current = [...past.current, { nodes: currentNodes, edges: currentEdges }].slice(-HISTORY_LIMIT);
    future.current = [];
    setHistoryTick((t) => t + 1);
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Only commit history when a drag *finishes* (not on every mousemove frame)
      // or when a node is removed.
      const dragEnd = changes.some((c) => c.type === 'position' && c.dragging === false);
      const removal = changes.some((c) => c.type === 'remove');
      if (dragEnd || removal) commit(nodes, edges);
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [nodes, edges, commit]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) commit(nodes, edges);
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [nodes, edges, commit]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      commit(nodes, edges);
      setEdges((eds) => addEdge({ ...connection, animated: false }, eds));
    },
    [nodes, edges, commit]
  );

  const addNode = useCallback(
    (kind: NodeKind, position: { x: number; y: number }) => {
      commit(nodes, edges);
      const id = nanoid(8);
      const newNode: Node<WorkflowNodeData> = {
        id,
        type: kind,
        position,
        data: createDefaultData(kind),
      };
      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(id);
    },
    [nodes, edges, commit]
  );

  // Form fields fire onChange on every keystroke. Committing history on every
  // keystroke would make undo useless (one undo per character). Instead we
  // only commit if the last edit was to a different node, or it's been a
  // while since the last edit to this same node - giving roughly one undo
  // step per "editing session" on a field rather than per character.
  const lastEdit = useRef<{ nodeId: string; time: number } | null>(null);
  const updateNodeData = useCallback(
    (nodeId: string, data: WorkflowNodeData) => {
      const now = Date.now();
      const shouldCommit =
        !lastEdit.current || lastEdit.current.nodeId !== nodeId || now - lastEdit.current.time > 800;
      if (shouldCommit) commit(nodes, edges);
      lastEdit.current = { nodeId, time: now };
      setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data } : n)));
    },
    [nodes, edges, commit]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      commit(nodes, edges);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId((sel) => (sel === nodeId ? null : sel));
    },
    [nodes, edges, commit]
  );

  const undo = useCallback(() => {
    const previous = past.current[past.current.length - 1];
    if (!previous) return;
    past.current = past.current.slice(0, -1);
    future.current = [{ nodes, edges }, ...future.current];
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setSelectedNodeId(null);
    setHistoryTick((t) => t + 1);
  }, [nodes, edges]);

  const redo = useCallback(() => {
    const next = future.current[0];
    if (!next) return;
    future.current = future.current.slice(1);
    past.current = [...past.current, { nodes, edges }];
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedNodeId(null);
    setHistoryTick((t) => t + 1);
  }, [nodes, edges]);

  const loadGraph = useCallback(
    (newNodes: Node<WorkflowNodeData>[], newEdges: Edge[]) => {
      commit(nodes, edges);
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNodeId(null);
    },
    [nodes, edges, commit]
  );

  const addTemplate = useCallback(
    (templateNodes: Node<WorkflowNodeData>[], templateEdges: Edge[]) => {
      commit(nodes, edges);
      // Offset the template so repeated drops don't stack exactly on top of each other.
      const offsetX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.position.x)) + 260 : 0;
      const offsetNodes = templateNodes.map((n) => ({ ...n, position: { x: n.position.x + offsetX, y: n.position.y } }));
      setNodes((nds) => nds.concat(offsetNodes));
      setEdges((eds) => eds.concat(templateEdges));
    },
    [nodes, edges, commit]
  );

  const autoLayout = useCallback(() => {
    commit(nodes, edges);
    setNodes((nds) => getAutoLayout(nds, edges));
  }, [nodes, edges, commit]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return {
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
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    loadGraph,
    addTemplate,
    autoLayout,
    historyTick, // exposed only so consumers re-render when history changes; not otherwise meaningful
  };
}
