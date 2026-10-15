export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}
export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}
export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  nextNodeId: number;
  nextEdgeId: number;
}
export type GraphAlgorithm = 'bfs' | 'dfs' | 'dijkstra';
interface GraphStepBase {
  id: number;
  graph: GraphState;
  source: string;
  target: string | null;
  operation: string;
  line: number;
  message: string;
  current: string | null;
  activeEdge: string | null;
  discovery: string[];
  finished: string[];
  frontier: string[];
  predecessors: Record<string, string | null>;
  path: string[];
  metrics: { edgeChecks: number; relaxations: number };
}
export interface TraversalStep extends GraphStepBase {
  family: 'graph-traversal';
  algorithm: 'bfs' | 'dfs';
}
export interface DijkstraStep extends GraphStepBase {
  family: 'graph-dijkstra';
  algorithm: 'dijkstra';
  distances: Record<string, number>;
}
export type GraphStep = TraversalStep | DijkstraStep;
export const GRAPH_NODE_LIMIT = 16,
  GRAPH_EDGE_LIMIT = 48;
export const emptyGraph = (directed = false): GraphState => ({
  nodes: [],
  edges: [],
  directed,
  nextNodeId: 1,
  nextEdgeId: 1,
});
export const cloneGraph = (g: GraphState): GraphState => ({
  ...g,
  nodes: g.nodes.map((n) => ({ ...n })),
  edges: g.edges.map((e) => ({ ...e })),
});
export function validateWeight(weight: number) {
  if (!Number.isFinite(weight) || weight < 0 || weight > 9999)
    throw new Error('O peso deve ser um número finito entre 0 e 9999.');
}
export function addNode(input: GraphState): GraphState {
  if (input.nodes.length >= GRAPH_NODE_LIMIT)
    throw new Error(`Limite de ${GRAPH_NODE_LIMIT} nós atingido.`);
  const g = cloneGraph(input),
    n = g.nextNodeId++;
  const slots = Array.from({ length: GRAPH_NODE_LIMIT }, (_, i) => ({
    x: 85 + (i % 4) * 205,
    y: 65 + Math.floor(i / 4) * 110,
  }));
  const position =
    slots.find((p) => g.nodes.every((node) => Math.hypot(p.x - node.x, p.y - node.y) > 55)) ??
    slots[g.nodes.length]!;
  g.nodes.push({
    id: `v${n}`,
    label: n <= 26 ? String.fromCharCode(64 + n) : `N${n}`,
    ...position,
  });
  return g;
}
export function moveNode(input: GraphState, id: string, x: number, y: number): GraphState {
  if (!Number.isFinite(x) || !Number.isFinite(y))
    throw new Error('As coordenadas devem ser finitas.');
  const g = cloneGraph(input),
    node = g.nodes.find((n) => n.id === id);
  if (!node) throw new Error('Selecione um nó existente.');
  node.x = Math.max(35, Math.min(765, x));
  node.y = Math.max(35, Math.min(465, y));
  return g;
}
export function removeNode(input: GraphState, id: string): GraphState {
  if (!input.nodes.some((n) => n.id === id)) throw new Error('Selecione um nó existente.');
  return {
    ...cloneGraph(input),
    nodes: input.nodes.filter((n) => n.id !== id).map((n) => ({ ...n })),
    edges: input.edges.filter((e) => e.from !== id && e.to !== id).map((e) => ({ ...e })),
  };
}
export function addEdge(input: GraphState, from: string, to: string, weight: number): GraphState {
  validateWeight(weight);
  if (!input.nodes.some((n) => n.id === from) || !input.nodes.some((n) => n.id === to))
    throw new Error('Escolha origem e destino existentes.');
  if (from === to) throw new Error('Laços não são permitidos. Escolha dois nós diferentes.');
  if (input.edges.length >= GRAPH_EDGE_LIMIT)
    throw new Error(`Limite de ${GRAPH_EDGE_LIMIT} arestas atingido.`);
  if (
    input.edges.some(
      (e) =>
        (e.from === from && e.to === to) || (!input.directed && e.from === to && e.to === from),
    )
  )
    throw new Error('Essa conexão já existe. Edite seu peso na lista de arestas.');
  const g = cloneGraph(input);
  g.edges.push({ id: `e${g.nextEdgeId++}`, from, to, weight });
  return g;
}
export function removeEdge(input: GraphState, id: string): GraphState {
  if (!input.edges.some((e) => e.id === id)) throw new Error('Selecione uma aresta existente.');
  const g = cloneGraph(input);
  g.edges = g.edges.filter((e) => e.id !== id);
  return g;
}
export function setWeight(input: GraphState, id: string, weight: number): GraphState {
  validateWeight(weight);
  const g = cloneGraph(input),
    edge = g.edges.find((e) => e.id === id);
  if (!edge) throw new Error('Selecione uma aresta existente.');
  edge.weight = weight;
  return g;
}
export function setDirection(input: GraphState, directed: boolean): GraphState {
  const g = cloneGraph(input);
  g.directed = directed;
  if (!directed) {
    const unique: GraphEdge[] = [];
    for (const edge of g.edges) {
      const same = unique.find(
        (e) =>
          (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from),
      );
      if (same) same.weight = Math.min(same.weight, edge.weight);
      else unique.push(edge);
    }
    g.edges = unique;
  }
  return g;
}
export function validateGraph(g: GraphState) {
  if (g.nodes.length > GRAPH_NODE_LIMIT || g.edges.length > GRAPH_EDGE_LIMIT)
    throw new Error('O grafo ultrapassa o limite visual.');
  const nodes = new Set(g.nodes.map((n) => n.id));
  if (nodes.size !== g.nodes.length) throw new Error('Identidades de nós duplicadas.');
  const pairs = new Set<string>(),
    edgeIds = new Set<string>();
  for (const e of g.edges) {
    validateWeight(e.weight);
    if (!nodes.has(e.from) || !nodes.has(e.to) || e.from === e.to)
      throw new Error('Conexão inválida.');
    const pair = (g.directed ? [e.from, e.to] : [e.from, e.to].sort()).join(':');
    if (pairs.has(pair) || edgeIds.has(e.id)) throw new Error('Conexão duplicada.');
    pairs.add(pair);
    edgeIds.add(e.id);
  }
}
