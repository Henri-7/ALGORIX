import { describe, expect, it } from 'vitest';
import {
  addEdge,
  addNode,
  cloneGraph,
  emptyGraph,
  moveNode,
  removeEdge,
  removeNode,
  setDirection,
  setWeight,
  validateGraph,
  type GraphAlgorithm,
} from '../algorithms/graphs/model';
import { exampleGraph } from '../algorithms/graphs/examples';
import { graphTimeline } from '../algorithms/graphs/timeline';
function small(directed = false) {
  let g = emptyGraph(directed);
  for (let i = 0; i < 4; i++) g = addNode(g);
  return g;
}
describe('editor lógico de grafos', () => {
  it('insere nós com identidades únicas, move e remove com arestas incidentes', () => {
    let g = small();
    const old = cloneGraph(g);
    g = addEdge(g, 'v1', 'v2', 2);
    g = moveNode(g, 'v1', 350, 250);
    expect(old.nodes[0]!.x).not.toBe(350);
    expect(g.nodes[0]!.x).toBe(350);
    g = removeNode(g, 'v2');
    expect(g.edges).toHaveLength(0);
    g = addNode(g);
    expect(g.nodes.at(-1)?.id).toBe('v5');
    expect(() => moveNode(g, 'v1', NaN, 0)).toThrow();
    expect(() => removeNode(g, 'ausente')).toThrow();
  });
  it('insere, edita e remove conexões sem mutar a entrada', () => {
    const initial = small(),
      g = addEdge(initial, 'v1', 'v2', 3),
      next = setWeight(g, 'e1', 0);
    expect(initial.edges).toHaveLength(0);
    expect(g.edges[0]!.weight).toBe(3);
    expect(next.edges[0]!.weight).toBe(0);
    expect(removeEdge(next, 'e1').edges).toHaveLength(0);
    expect(() => setWeight(g, 'x', 1)).toThrow();
  });
  it('valida laços, duplicadas, endpoints e limites', () => {
    let g = small();
    g = addEdge(g, 'v1', 'v2', 1);
    expect(() => addEdge(g, 'v1', 'v1', 1)).toThrow('Laços');
    expect(() => addEdge(g, 'v2', 'v1', 1)).toThrow('já existe');
    expect(() => addEdge(g, 'v1', 'x', 1)).toThrow();
    for (let i = 4; i < 16; i++) g = addNode(g);
    expect(() => addNode(g)).toThrow('Limite');
    let dense = emptyGraph();
    for (let i = 0; i < 16; i++) dense = addNode(dense);
    for (let i = 1; i <= 16 && dense.edges.length < 48; i++)
      for (let j = i + 1; j <= 16 && dense.edges.length < 48; j++)
        dense = addEdge(dense, `v${i}`, `v${j}`, 1);
    expect(() => addEdge(dense, 'v15', 'v16', 1)).toThrow('Limite');
  });
  it('converte recíprocas para não direcionadas usando menor peso', () => {
    let g = small(true);
    g = addEdge(g, 'v1', 'v2', 5);
    g = addEdge(g, 'v2', 'v1', 2);
    const converted = setDirection(g, false);
    expect(converted.edges).toHaveLength(1);
    expect(converted.edges[0]!.weight).toBe(2);
    expect(g.edges).toHaveLength(2);
    expect(setDirection(converted, true).edges[0]?.from).toBe('v1');
  });
  it.each([-1, NaN, Infinity, -Infinity, 10000])(
    'rejeita peso %s no editor e no motor',
    (weight) => {
      expect(() => addEdge(small(), 'v1', 'v2', weight)).toThrow();
      const g = addEdge(small(), 'v1', 'v2', 1);
      g.edges[0]!.weight = weight;
      expect(() => graphTimeline(g, 'dijkstra', 'v1', 'v2')).toThrow();
    },
  );
  it('rejeita identidades e conexões inconsistentes', () => {
    const g = small();
    g.nodes.push({ ...g.nodes[0]! });
    expect(() => validateGraph(g)).toThrow();
    const invalid = addEdge(small(), 'v1', 'v2', 1);
    invalid.nodes = invalid.nodes.filter((n) => n.id !== 'v2');
    expect(() => validateGraph(invalid)).toThrow();
  });
});
describe('BFS', () => {
  it('fila e ordem de descoberta seguem largura; caminho ignora pesos', () => {
    const g = exampleGraph('simple'),
      steps = graphTimeline(g, 'bfs', 'v1', 'v6'),
      end = steps.at(-1)!;
    expect(end.discovery).toEqual(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']);
    expect(end.path).toEqual(['v1', 'v3', 'v5', 'v6']);
    expect(steps.find((s) => s.operation === 'Descoberta')!.frontier).toEqual(['v1']);
    const paths = graphTimeline(exampleGraph('paths'), 'bfs', 'v1', 'v6');
    expect(paths.at(-1)!.path).toEqual(['v1', 'v6']);
  });
  it('não visita componentes desconectados', () => {
    const end = graphTimeline(exampleGraph('disconnected'), 'bfs', 'v1', 'v6').at(-1)!;
    expect(end.discovery).toEqual(['v1', 'v2', 'v4']);
    expect(end.path).toEqual([]);
    expect(end.message).toContain('inalcançável');
  });
});
describe('DFS recursiva', () => {
  it('ciclos são visitados uma única vez e retornos têm pilha fiel', () => {
    const steps = graphTimeline(exampleGraph('cycle'), 'dfs', 'v1', 'v6'),
      end = steps.at(-1)!;
    expect(end.discovery).toEqual(['v1', 'v2', 'v4', 'v6', 'v5', 'v3']);
    expect(end.finished).toEqual(['v3', 'v5', 'v6', 'v4', 'v2', 'v1']);
    expect(new Set(end.discovery).size).toBe(6);
    expect(end.frontier).toEqual([]);
    for (let i = 1; i < steps.length; i++) {
      const s = steps[i]!,
        p = steps[i - 1]!;
      if (s.operation === 'Retorno') expect(s.frontier).toEqual(p.frontier.slice(0, -1));
    }
  });
  it('não confunde descoberta com finalização em grafo desconectado', () => {
    const s = graphTimeline(exampleGraph('disconnected'), 'dfs', 'v1', null).at(-1)!;
    expect(s.discovery).toEqual(['v1', 'v2', 'v4']);
    expect(s.finished).toEqual(['v4', 'v2', 'v1']);
  });
});
describe('Dijkstra', () => {
  it('calcula caminho ponderado mínimo e registra relaxamentos reais', () => {
    const steps = graphTimeline(exampleGraph('paths'), 'dijkstra', 'v1', 'v6'),
      end = steps.at(-1)!;
    expect(end.path).toEqual(['v1', 'v3', 'v2', 'v4', 'v6']);
    if (end.family !== 'graph-dijkstra') throw new Error('Família incorreta');
    expect(end.distances.v6).toBe(6);
    expect(end.metrics.relaxations).toBe(steps.filter((s) => s.operation === 'Relaxamento').length);
    steps.forEach((s, i) => {
      if (i && s.family === 'graph-dijkstra') {
        const p = steps[i - 1]!;
        if (p.family === 'graph-dijkstra')
          for (const id in s.distances)
            expect(s.distances[id]!).toBeLessThanOrEqual(p.distances[id]!);
      }
    });
  });
  it('trata destino inalcançável e origem igual a destino', () => {
    const g = exampleGraph('disconnected'),
      absent = graphTimeline(g, 'dijkstra', 'v1', 'v6').at(-1)!;
    expect(absent.path).toEqual([]);
    if (absent.family === 'graph-dijkstra') expect(absent.distances.v6).toBe(Infinity);
    const same = graphTimeline(g, 'dijkstra', 'v1', 'v1').at(-1)!;
    expect(same.path).toEqual(['v1']);
    if (same.family === 'graph-dijkstra') expect(same.distances.v1).toBe(0);
  });
  it('desempata pela ordem de criação e aceita peso zero', () => {
    let g = small(true);
    for (const [a, b, w] of [
      [1, 3, 1],
      [1, 2, 1],
      [2, 4, 0],
      [3, 4, 0],
    ])
      g = addEdge(g, `v${a}`, `v${b}`, w!);
    const end = graphTimeline(g, 'dijkstra', 'v1', 'v4').at(-1)!;
    expect(end.path).toEqual(['v1', 'v2', 'v4']);
    expect(end.finished).toEqual(['v1', 'v2', 'v3', 'v4']);
  });
  it('confere distâncias contra Bellman-Ford em 30 grafos variados', () => {
    let seed = 123;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed;
    };
    for (let trial = 0; trial < 30; trial++) {
      let g = emptyGraph(trial % 2 === 0);
      for (let i = 0; i < 8; i++) g = addNode(g);
      for (let i = 1; i <= 8; i++)
        for (let j = i + 1; j <= 8; j++)
          if (random() % 3 === 0) g = addEdge(g, `v${i}`, `v${j}`, random() % 10);
      const expected: Record<string, number> = Object.fromEntries(
        g.nodes.map((n) => [n.id, n.id === 'v1' ? 0 : Infinity]),
      );
      for (let i = 0; i < g.nodes.length - 1; i++)
        for (const e of g.edges) {
          expected[e.to] = Math.min(expected[e.to]!, expected[e.from]! + e.weight);
          if (!g.directed)
            expected[e.from] = Math.min(expected[e.from]!, expected[e.to]! + e.weight);
        }
      const end = graphTimeline(g, 'dijkstra', 'v1', 'v8').at(-1)!;
      if (end.family === 'graph-dijkstra') expect(end.distances).toEqual(expected);
    }
  });
});
describe.each<GraphAlgorithm>(['bfs', 'dfs', 'dijkstra'])('%s snapshots', (algorithm) => {
  it('são determinísticos, independentes e preservam entrada', () => {
    const g = exampleGraph('weighted', true),
      before = cloneGraph(g),
      steps = graphTimeline(g, algorithm, 'v1', 'v6');
    expect(g).toEqual(before);
    expect(graphTimeline(g, algorithm, 'v1', 'v6')).toEqual(steps);
    steps.forEach((s, i) => {
      expect(s.id).toBe(i);
      expect(s.line).toBeLessThan(8);
      expect(new Set(s.discovery).size).toBe(s.discovery.length);
      if (i) {
        expect(s.graph).not.toBe(steps[i - 1]!.graph);
        expect(s.graph.nodes[0]).not.toBe(steps[i - 1]!.graph.nodes[0]);
      }
    });
  });
  it('respeita direção das arestas', () => {
    let g = small(true);
    g = addEdge(g, 'v1', 'v2', 1);
    expect(graphTimeline(g, algorithm, 'v2', 'v1').at(-1)!.path).toEqual([]);
    expect(graphTimeline(setDirection(g, false), algorithm, 'v2', 'v1').at(-1)!.path).toEqual([
      'v2',
      'v1',
    ]);
  });
  it('valida grafo vazio e seleção inexistente', () => {
    expect(() => graphTimeline(emptyGraph(), algorithm, '', '')).toThrow('vazio');
    expect(() => graphTimeline(small(), algorithm, 'ausente', null)).toThrow('origem');
    expect(() => graphTimeline(small(), algorithm, 'v1', 'ausente')).toThrow('destino');
  });
});
