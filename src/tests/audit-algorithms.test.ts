import { describe, expect, it } from 'vitest';
import { generateInput, MAX_SIZE, parseInput, type Pattern } from '../lib/input';
import { sortingTimeline } from '../algorithms/sorting';
import { searchingTimeline } from '../algorithms/searching';
import type { SortId } from '../engine/types';
import { emptyTree, type TreeKind, type TreeState } from '../algorithms/trees/model';
import { treeTimeline } from '../algorithms/trees/timeline';
import { treeCode } from '../features/trees/content';
import { addEdge, addNode, emptyGraph, type GraphState } from '../algorithms/graphs/model';
import { graphTimeline } from '../algorithms/graphs/timeline';

describe('auditoria das fronteiras de entrada', () => {
  it.each([
    ['1, 2,', [1, 2]],
    [',1, 2', [1, 2]],
    [' ; -999, +999; 0, ', [-999, 999, 0]],
    ['1,, 2;;;3\n\t4', [1, 2, 3, 4]],
    ['-0, +0, 0002', [-0, 0, 2]],
  ] as const)('não transforma delimitadores em zero: %s', (text, expected) => {
    expect(parseInput(text)).toEqual(expected);
  });
  it.each([
    ',',
    '; , \n',
    '0x10',
    '0b11',
    '0o10',
    '1e2',
    '1.0',
    '2.',
    '.0',
    'NaN',
    'Infinity',
    '+',
    '--1',
    '1_000',
    '999999999999999999999',
    '1, a, 2',
  ])('recusa entrada sem inteiros decimais válidos: %s', (text) => {
    expect(() => parseInput(text)).toThrow();
  });
  it('conta valores reais no limite e preserva extremos e repetições', () => {
    const text = Array.from({ length: MAX_SIZE }, (_, i) => (i % 2 ? '999' : '-999')).join(',');
    expect(parseInput(`,${text};`)).toHaveLength(MAX_SIZE);
    expect(() => parseInput(`${text},0`)).toThrow('32');
  });
  it.each([NaN, Infinity, -Infinity])('gerador recusa tamanho não finito %s', (size) => {
    expect(() => generateInput(size, 'aleatorio')).toThrow();
  });
  it.each<Pattern>(['aleatorio', 'crescente', 'decrescente', 'quase', 'repetidos'])(
    'gerador mantém inteiros e limites: %s',
    (pattern) => {
      for (const size of [-10, 2, 3.9, 32, 100]) {
        const values = generateInput(size, pattern);
        expect(values).toHaveLength(Math.max(2, Math.min(32, Math.floor(size))));
        expect(values.every((v) => Number.isInteger(v) && v >= 5 && v <= 99)).toBe(true);
        if (pattern === 'quase') {
          const sorted = [...values].sort((a, b) => a - b);
          expect(values.filter((v, i) => v !== sorted[i]).length).toBeLessThanOrEqual(2);
        }
      }
    },
  );
});

describe('auditoria de ordenações e buscas', () => {
  it.each<SortId>(['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort'])(
    'caso visual máximo e isolamento profundo: %s',
    (id) => {
      const input = Array.from({ length: 32 }, (_, i) => 31 - i);
      const steps = sortingTimeline(id, input);
      const last = steps.at(-1)!;
      expect(last.values).toEqual([...input].reverse());
      expect(last.settled.slice().sort((a, b) => a - b)).toEqual(
        Array.from({ length: 32 }, (_, i) => i),
      );
      if (['bubble-sort', 'selection-sort', 'insertion-sort', 'quick-sort'].includes(id))
        expect(last.metrics.comparisons).toBe((32 * 31) / 2);
      const copy = structuredClone(last);
      // Deliberately bypass the readonly API to test runtime snapshot isolation.
      Reflect.set(steps[0]!.values, '0', 100);
      Reflect.set(steps[0]!.active, '0', 100);
      Reflect.set(steps[0]!.settled, '0', 100);
      Reflect.set(steps[0]!.metrics, 'comparisons', -1);
      expect(last).toEqual(copy);
    },
  );
  it('confere ambas as buscas em todas as sequências crescentes de até 6 elementos em cinco chaves', () => {
    let cases = 0;
    const check = (values: number[], minimum: number) => {
      for (let target = -3; target <= 3; target++) {
        const linear = searchingTimeline('busca-linear', values, target).at(-1)!;
        const binary = searchingTimeline('busca-binaria', values, target);
        const expected = values.indexOf(target);
        expect(linear.found).toBe(expected < 0 ? null : expected);
        const found = binary.at(-1)!.found;
        expect(found === null ? -1 : values[found]).toBe(expected < 0 ? -1 : target);
        for (const step of binary) {
          expect(step.metrics.comparisons).toBeLessThanOrEqual(
            Math.ceil(Math.log2(values.length + 1)),
          );
          if (expected >= 0 && step.found === null)
            expect(values.slice(step.left, step.right + 1)).toContain(target);
        }
        cases++;
      }
      if (values.length === 6) return;
      for (let v = minimum; v <= 2; v++) check([...values, v], v);
    };
    check([], -2);
    expect(cases).toBe(3234);
  });
});

function verifyTree(tree: TreeState, expected: Set<number>, avl: boolean) {
  const seen = new Set<string>();
  const walk = (id: string | null, parent: string | null, low: number, high: number): number => {
    if (!id) return 0;
    expect(seen.has(id)).toBe(false);
    seen.add(id);
    const n = tree.nodes[id]!;
    expect(n.parent).toBe(parent);
    expect(n.value > low && n.value < high).toBe(true);
    const l = walk(n.left, id, low, n.value),
      r = walk(n.right, id, n.value, high);
    expect(n.height).toBe(1 + Math.max(l, r));
    if (avl) expect(Math.abs(l - r)).toBeLessThanOrEqual(1);
    return n.height;
  };
  walk(tree.root, null, -Infinity, Infinity);
  expect(seen.size).toBe(Object.keys(tree.nodes).length);
  expect(
    Object.values(tree.nodes)
      .map((n) => n.value)
      .sort((a, b) => a - b),
  ).toEqual([...expected].sort((a, b) => a - b));
}

describe.each<TreeKind>(['bst', 'avl'])('auditoria mista %s', (kind) => {
  it('alterna inserção, remoção, busca, duplicados e reuso de posições contra um conjunto', () => {
    let seed = 20261014;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed;
    };
    let tree = emptyTree();
    const values = new Set<number>();
    for (let i = 0; i < 300; i++) {
      const value = (random() % 21) - 10;
      const action = random() % 3 === 0 ? 'remove' : 'insert';
      const original = structuredClone(tree);
      const steps = treeTimeline(tree, kind, action, value);
      const end = steps.at(-1)!;
      // Only the documented visual depth limit can refuse a distinct BST insertion here.
      if (action === 'remove') values.delete(value);
      else if (!end.message.includes('Limite')) values.add(value);
      verifyTree(end.tree, values, kind === 'avl');
      expect(tree).toEqual(original);
      expect(end.tree.nextId).toBeGreaterThanOrEqual(tree.nextId);
      for (const s of steps) {
        expect(treeCode(action, kind)[s.line]).toBeDefined();
        if (s.current) expect(s.tree.nodes[s.current]).toBeDefined();
        if (s.found) expect(s.tree.nodes[s.found]).toBeDefined();
      }
      tree = end.tree;
      const search = treeTimeline(tree, kind, 'search', value).at(-1)!;
      expect(search.found !== null).toBe(values.has(value));
    }
    expect(treeTimeline(tree, kind, 'inorder').at(-1)!.output).toEqual(
      [...values].sort((a, b) => a - b),
    );
  });
});

function oracleDistances(g: GraphState, source: string, weighted: boolean) {
  const distances: Record<string, number> = Object.fromEntries(
    g.nodes.map((n) => [n.id, n.id === source ? 0 : Infinity]),
  );
  for (let pass = 1; pass < g.nodes.length; pass++)
    for (const edge of g.edges) {
      const cost = weighted ? edge.weight : 1;
      distances[edge.to] = Math.min(distances[edge.to]!, distances[edge.from]! + cost);
      if (!g.directed)
        distances[edge.from] = Math.min(distances[edge.from]!, distances[edge.to]! + cost);
    }
  return distances;
}
describe('auditoria de grafos cíclicos e caminhos', () => {
  it('confere todas as origens em 24 grafos com ciclos, recíprocas, pesos zero e frações', () => {
    let seed = 214;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed;
    };
    for (let trial = 0; trial < 24; trial++) {
      let g = emptyGraph(trial % 2 === 0);
      for (let i = 0; i < 6; i++) g = addNode(g);
      for (let i = 1; i <= 6; i++)
        for (let j = 1; j <= 6; j++)
          if (i !== j && (g.directed || j > i) && random() % 3 === 0)
            g = addEdge(g, `v${i}`, `v${j}`, (random() % 10) / 2);
      for (const source of g.nodes) {
        const distances = oracleDistances(g, source.id, true),
          hops = oracleDistances(g, source.id, false);
        for (const algorithm of ['bfs', 'dfs', 'dijkstra'] as const) {
          const steps = graphTimeline(g, algorithm, source.id, 'v6');
          const end = steps.at(-1)!;
          expect(end.discovery.slice().sort()).toEqual(
            g.nodes
              .filter((n) => Number.isFinite(hops[n.id]))
              .map((n) => n.id)
              .sort(),
          );
          expect(end.finished.slice().sort()).toEqual(end.discovery.slice().sort());
          if (end.family === 'graph-dijkstra') expect(end.distances).toEqual(distances);
          if (Number.isFinite(hops.v6)) {
            expect(end.path[0]).toBe(source.id);
            expect(end.path.at(-1)).toBe('v6');
            let cost = 0;
            for (let i = 1; i < end.path.length; i++) {
              const a = end.path[i - 1],
                b = end.path[i];
              const edge = g.edges.find(
                (e) => (e.from === a && e.to === b) || (!g.directed && e.to === a && e.from === b),
              );
              expect(edge).toBeDefined();
              cost += edge!.weight;
            }
            if (algorithm === 'bfs') expect(end.path.length - 1).toBe(hops.v6);
            if (algorithm === 'dijkstra') expect(cost).toBe(distances.v6);
          } else expect(end.path).toEqual([]);
          expect(end.metrics.edgeChecks).toBe(
            steps.filter((s) => s.operation === 'Inspecionar aresta').length,
          );
          expect(end.frontier).toEqual([]);
        }
      }
    }
  });
});
