# HR Workflow Designer

A prototype HR workflow builder: drag nodes onto a canvas, wire them together,
configure each step, and simulate the resulting workflow end-to-end.

## How to run

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

To type-check and produce a production build:

```bash
npm run build
```

## Architecture

```
src/
  types/workflow.ts       # single source of truth: discriminated union of node data shapes
  api/mockApi.ts          # mock GET /automations and POST /simulate
  utils/validation.ts     # pure graph validation (start node, cycles, orphans, per-node issues)
  utils/autoLayout.ts     # dagre-based auto-arrange
  utils/templates.ts      # prebuilt workflow templates (leave/onboarding/doc verification)
  utils/importExport.ts   # JSON export/import (download + parse-with-validation)
  hooks/useWorkflowStore.ts  # owns nodes/edges/selection/history state and all mutations
  components/
    Sidebar.tsx            # draggable node palette
    Canvas.tsx              # React Flow wrapper (drag/drop, wiring, selection)
    NodePanel.tsx            # routes the selected node to its editing form
    SandboxPanel.tsx          # serializes graph -> validates -> calls /simulate -> renders log
    nodes/                     # one visual component per node type + shared NodeShell
    forms/                     # one editable form per node type + shared KeyValueEditor
```

### Design decisions

- **Discriminated union for node data** (`WorkflowNodeData` in `types/workflow.ts`).
  Every node's `data` object carries a `kind` field. This lets TypeScript narrow
  the type automatically in `NodePanel`'s switch statement, so each form gets
  fully-typed props with no casting. Adding a 6th node type means adding one
  variant to the union — the compiler then flags every switch that needs a new case.

- **Single state hook (`useWorkflowStore`)** instead of scattering `useState`
  calls across components. Canvas, Sidebar, and NodePanel are all "dumb" —
  they receive data and callbacks as props and never touch React Flow's
  raw state setters directly. This keeps the state-mutation logic in one
  testable place and makes it trivial to swap in a real backend later
  (persist on every `updateNodeData` call, for example).

- **Mock API isolated in `api/mockApi.ts`.** `fetchAutomations` and
  `simulateWorkflow` are the only two functions that "talk to the network."
  Everything else in the app is agnostic to whether that's a `setTimeout`
  mock or a real Express/FastAPI backend. `simulateWorkflow` walks the graph
  breadth-first from the Start node and returns an ordered step log —
  intentionally simple logic, since the goal was demonstrating the
  contract (graph in, ordered steps out) rather than a real workflow engine.

- **Validation is separated from simulation.** `utils/validation.ts` is pure,
  synchronous, and framework-agnostic (just takes nodes/edges, returns
  issues). The sandbox runs it before calling the mock API so structural
  errors (no Start node, a cycle) short-circuit without a wasted network
  round-trip.

- **Dynamic Automated Step form.** The Automated Step node's parameter
  inputs are generated from whichever mock action is currently selected
  (`AutomatedStepNodeForm`). Switching the action resets `params` to match
  the new action's expected fields — this was the trickiest "dynamic form"
  requirement in the spec.

- **Shared building blocks** (`NodeShell` for node visuals, `KeyValueEditor`
  for metadata/custom-field lists) avoid duplicating markup across 5 node
  types and 2 forms that need key-value pairs.

## What's implemented

**Core requirements**
- Drag-and-drop canvas with all 5 required node types (Start, Task, Approval,
  Automated Step, End)
- Edge connections, node/edge deletion, minimap, zoom controls
- Full editing forms for every node type, including the dynamic
  Automated-Step params
- Mock `GET /automations` and `POST /simulate` (see `api/mockApi.ts`)
- Sandbox panel: validates the graph (missing Start node, cycles, orphaned
  Start node with incoming edges, unreachable nodes) then shows a
  step-by-step execution timeline
- Fully typed with TypeScript strict mode; `npm run build` passes clean

**Bonus features**
- **Export / Import as JSON** — toolbar buttons serialize the graph to a
  downloadable `.json` file and reload one, with basic shape validation on
  import (`utils/importExport.ts`)
- **Undo / Redo** — a snapshot-based history stack in `useWorkflowStore`,
  throttled so a form edit doesn't spam history per keystroke and a node
  drag doesn't spam it per pixel
- **Auto-layout** — one click re-arranges all nodes left-to-right using
  `dagre` (`utils/autoLayout.ts`), useful after importing a file or dropping
  a template
- **Node templates** — three prebuilt flows (Leave Approval, Onboarding,
  Document Verification — matching the exact examples in the spec) that
  drop a fully-wired mini-workflow onto the canvas in one click
  (`utils/templates.ts`)
- **Visual validation on nodes** — beyond the sandbox's issue list, nodes
  with problems (unreachable from Start, dead ends, missing required
  fields) get a live red/amber outline directly on the canvas as you build
  (`getNodeIssues` in `utils/validation.ts`, applied via a decorated
  `className` in `Canvas.tsx`)

## What I'd add with more time

- Mini-map click-to-navigate on very large graphs
- Node version history (a changelog per node, not just global undo/redo)
- Persisting workflows to a real backend (would only require changes in
  `api/mockApi.ts` and the store — the rest of the app is already decoupled
  from where data lives)

## Assumptions

- No authentication or backend persistence, per the spec — state lives only
  in memory for the session.
- "Auto-validate Start Node must be first" is interpreted as: exactly one
  Start node, and it must have no incoming edges.
- The mock `/simulate` endpoint does a breadth-first walk rather than a
  strict topological execution, since the spec only asked for a
  representative step-by-step log, not real execution semantics.
