import { addEdge, addNode, emptyGraph, moveNode, type GraphState } from './model';
export const graphExamples = {
  simple: 'Grafo simples',
  cycle: 'Grafo com ciclo',
  disconnected: 'Grafo desconectado',
  weighted: 'Grafo ponderado',
  paths: 'Múltiplos caminhos',
} as const;
export type GraphExample = keyof typeof graphExamples;
export function exampleGraph(name: GraphExample, directed = false): GraphState {
  let g = emptyGraph(directed);
  for (let i = 0; i < 6; i++) g = addNode(g);
  const positions = [
    [100, 250],
    [280, 100],
    [280, 400],
    [500, 100],
    [500, 400],
    [700, 250],
  ];
  positions.forEach((p, i) => {
    g = moveNode(g, `v${i + 1}`, p[0]!, p[1]!);
  });
  const specs: Record<GraphExample, number[][]> = {
    simple: [
      [1, 2, 1],
      [1, 3, 1],
      [2, 4, 1],
      [3, 5, 1],
      [5, 6, 1],
    ],
    cycle: [
      [1, 2, 1],
      [2, 4, 1],
      [4, 6, 1],
      [6, 5, 1],
      [5, 3, 1],
      [3, 1, 1],
    ],
    disconnected: [
      [1, 2, 2],
      [2, 4, 1],
      [3, 5, 3],
      [5, 6, 2],
    ],
    weighted: [
      [1, 2, 4],
      [1, 3, 2],
      [3, 2, 1],
      [2, 4, 5],
      [3, 5, 7],
      [4, 6, 2],
      [5, 6, 1],
    ],
    paths: [
      [1, 2, 8],
      [1, 3, 2],
      [3, 2, 1],
      [2, 4, 2],
      [3, 5, 5],
      [5, 6, 2],
      [4, 6, 1],
      [1, 6, 20],
    ],
  };
  for (const [a, b, w] of specs[name]) g = addEdge(g, `v${a}`, `v${b}`, w!);
  return g;
}
