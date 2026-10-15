import type { GraphAlgorithm, GraphState, GraphStep } from '../../algorithms/graphs/model';
export const graphCode: Record<GraphAlgorithm, string[]> = {
  bfs: [
    'receber grafo e origem',
    'descobrir origem; fila ← [origem]',
    'enquanto fila: retirar primeiro nó',
    '  inspecionar cada vizinho, em ordem',
    '  se novo: descobrir; predecessor ← atual',
    '    adicionar vizinho ao fim da fila',
    '  finalizar nó atual',
    'recuperar caminho por predecessores',
  ],
  dfs: [
    'receber grafo; explorar(origem)',
    'descobrir nó; empilhar chamada',
    'para cada vizinho, em ordem:',
    '  se novo: predecessor ← nó; explorar(vizinho)',
    'finalizar nó após explorar seus vizinhos',
    'desempilhar chamada; retornar ao pai',
    'nós não alcançáveis permanecem não visitados',
    'recuperar caminho de exploração',
  ],
  dijkstra: [
    'receber grafo de pesos não negativos',
    'distância[origem] ← 0; demais ← ∞',
    'selecionar menor distância não finalizada',
    'inspecionar aresta; ignorar destino finalizado',
    'comparar distância atual + peso com destino',
    'se menor: atualizar distância e predecessor',
    'finalizar nó; repetir enquanto houver alcançáveis',
    'retornar distâncias e caminho por predecessores',
  ],
};
export function idleGraphStep(
  graph: GraphState,
  algorithm: GraphAlgorithm,
  source: string,
  target: string | null,
): GraphStep {
  const common = {
    id: 0,
    graph,
    source,
    target,
    operation: 'Pronto',
    line: 0,
    message:
      'Edite o grafo, escolha a origem e prepare uma execução. Qualquer edição cancela a timeline anterior.',
    current: null,
    activeEdge: null,
    discovery: [],
    finished: [],
    frontier: [],
    predecessors: {},
    path: [],
    metrics: { edgeChecks: 0, relaxations: 0 },
  };
  return algorithm === 'dijkstra'
    ? {
        ...common,
        family: 'graph-dijkstra',
        algorithm,
        distances: Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity])),
      }
    : { ...common, family: 'graph-traversal', algorithm };
}
