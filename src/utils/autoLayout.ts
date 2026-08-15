import dagre from 'dagre';
import { Node, Edge } from 'reactflow';
import { WorkflowNodeData } from '../types/workflow';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 70;

// Runs a left-to-right layered layout over the current graph and returns
// new node positions. Pure function - takes nodes/edges, returns nodes;
// doesn't touch React state itself, so it's easy to test or reuse.
export function getAutoLayout(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Node<WorkflowNodeData>[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const pos = graph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}
