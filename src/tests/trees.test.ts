import { describe, expect, it } from 'vitest';
import {
  balance,
  emptyTree,
  TREE_LIMIT,
  type TreeKind,
  type TreeState,
} from '../algorithms/trees/model';
import { treeTimeline } from '../algorithms/trees/timeline';
import { layoutTree } from '../algorithms/trees/layout';
function make(values: number[], kind: TreeKind = 'bst') {
  return values.reduce((t, v) => treeTimeline(t, kind, 'insert', v).at(-1)!.tree, emptyTree());
}
function validate(tree: TreeState, avl = false) {
  const seen = new Set<string>();
  const walk = (id: string | null, parent: string | null, lo: number, hi: number): number => {
    if (!id) return 0;
    expect(seen.has(id)).toBe(false);
    seen.add(id);
    const n = tree.nodes[id]!;
    expect(n).toBeDefined();
    expect(n.parent).toBe(parent);
    expect(n.value).toBeGreaterThan(lo);
    expect(n.value).toBeLessThan(hi);
    const l = walk(n.left, id, lo, n.value),
      r = walk(n.right, id, n.value, hi);
    expect(n.height).toBe(1 + Math.max(l, r));
    if (avl) expect(Math.abs(l - r)).toBeLessThanOrEqual(1);
    return n.height;
  };
  walk(tree.root, null, -Infinity, Infinity);
  expect(seen.size).toBe(Object.keys(tree.nodes).length);
}
describe.each<TreeKind>(['bst', 'avl'])('%s', (kind) => {
  it('insere à esquerda, à direita e na raiz, com identidades estáveis', () => {
    const a = make([50, 30, 70], kind),
      before = JSON.stringify(a),
      steps = treeTimeline(a, kind, 'insert', 40),
      end = steps.at(-1)!.tree;
    expect(end.nodes.n4?.parent).toBe('n2');
    expect(a.nodes.n4).toBeUndefined();
    expect(JSON.stringify(a)).toBe(before);
    expect(steps.some((s) => s.operation === 'Esquerda')).toBe(true);
    expect(steps.some((s) => s.operation === 'Direita')).toBe(true);
    steps.forEach((s, i) => {
      validate(s.tree);
      expect(s.id).toBe(i);
      expect(s.line).toBeLessThan(11);
      if (i) expect(s.tree.nodes).not.toBe(steps[i - 1]!.tree.nodes);
    });
    expect(treeTimeline(a, kind, 'insert', 40)).toEqual(steps);
    validate(end, kind === 'avl');
  });
  it('rejeita duplicados e valores inválidos', () => {
    const tree = make([50, 30, 70], kind);
    expect(treeTimeline(tree, kind, 'insert', 30).at(-1)!.tree).toEqual(tree);
    expect(() => treeTimeline(tree, kind, 'insert', NaN)).toThrow();
    expect(() => treeTimeline(tree, kind, 'insert', 1000)).toThrow();
  });
  it('busca valores existentes, ausentes e árvore vazia', () => {
    const tree = make([50, 30, 70], kind);
    expect(treeTimeline(tree, kind, 'search', 70).at(-1)?.found).toBe('n3');
    expect(treeTimeline(tree, kind, 'search', 71).at(-1)?.found).toBeNull();
    expect(treeTimeline(emptyTree(), kind, 'search', 1).at(-1)?.metrics.comparisons).toBe(0);
  });
  it.each([
    [50],
    [50, 30],
    [50, 30, 70],
    [50, 30, 70, 60, 80, 55, 65],
    [50, 30, 70, 60, 80, 55, 57],
  ])('remove a raiz em %j', (...values) => {
    const tree = make(values, kind),
      rootValue = tree.nodes[tree.root!]!.value;
    const result = treeTimeline(tree, kind, 'remove', rootValue);
    result.forEach((s) => validate(s.tree));
    validate(result.at(-1)!.tree, kind === 'avl');
    expect(
      Object.values(result.at(-1)!.tree.nodes)
        .map((n) => n.value)
        .sort((a, b) => a - b),
    ).toEqual(values.filter((v) => v !== rootValue).sort((a, b) => a - b));
  });
  it('remove folha, nó com um filho e valor ausente', () => {
    let tree = make([50, 30, 70, 60], kind);
    tree = treeTimeline(tree, kind, 'remove', 70).at(-1)!.tree;
    validate(tree, kind === 'avl');
    tree = treeTimeline(tree, kind, 'remove', 30).at(-1)!.tree;
    validate(tree, kind === 'avl');
    expect(treeTimeline(tree, kind, 'remove', 999).at(-1)!.tree).toEqual(tree);
  });
  it('executa quatro percursos com uma visita por nó', () => {
    const tree = make([50, 30, 70, 20, 40, 60, 80], kind);
    for (const [action, expected] of [
      ['inorder', [20, 30, 40, 50, 60, 70, 80]],
      ['preorder', [50, 30, 20, 40, 70, 60, 80]],
      ['postorder', [20, 40, 30, 60, 80, 70, 50]],
      ['levelorder', [50, 30, 70, 20, 40, 60, 80]],
    ] as const) {
      const steps = treeTimeline(tree, kind, action);
      expect(steps.at(-1)!.output).toEqual(expected);
      expect(steps.filter((s) => s.operation === 'Visita')).toHaveLength(7);
      expect(steps.at(-1)!.tree).toEqual(tree);
    }
  });
});
describe('AVL', () => {
  it.each([
    [[30, 20, 10], 'LL', 1],
    [[10, 20, 30], 'RR', 1],
    [[30, 10, 20], 'LR', 2],
    [[10, 30, 20], 'RL', 2],
  ] as const)('rotação %j', (values, rotation, count) => {
    const base = make([...values.slice(0, 2)], 'avl'),
      steps = treeTimeline(base, 'avl', 'insert', values[2]);
    const end = steps.at(-1)!;
    validate(end.tree, true);
    expect(end.tree.nodes[end.tree.root!]!.value).toBe(20);
    expect(end.metrics.rotations).toBe(count);
    expect(steps.some((s) => s.message.includes(`Caso ${rotation}`))).toBe(true);
    expect(steps.filter((s) => s.operation === 'Rotação')).toHaveLength(count);
  });
  it('rebalanceia remoções sucessivas e mantém alturas em sequências variadas', () => {
    for (let trial = 0; trial < 16; trial++) {
      const values = Array.from({ length: 25 }, (_, i) => i * 7 - 90).sort(
        (a, b) => (((a + 100) * (trial + 3)) % 29) - (((b + 100) * (trial + 3)) % 29),
      );
      let tree = emptyTree();
      for (const v of values) {
        tree = treeTimeline(tree, 'avl', 'insert', v).at(-1)!.tree;
        validate(tree, true);
      }
      for (const v of [...values].reverse()) {
        tree = treeTimeline(tree, 'avl', 'remove', v).at(-1)!.tree;
        validate(tree, true);
      }
      expect(tree.root).toBeNull();
    }
  });
  it('respeita limite de nós e fatores entre −1 e 1', () => {
    const tree = make(
      Array.from({ length: TREE_LIMIT }, (_, i) => i),
      'avl',
    );
    expect(treeTimeline(tree, 'avl', 'insert', 99).at(-1)!.tree).toEqual(tree);
    Object.keys(tree.nodes).forEach((id) =>
      expect(Math.abs(balance(tree, id))).toBeLessThanOrEqual(1),
    );
  });
});
it('layout reserva posições distintas e centraliza a raiz em árvores assimétricas', () => {
  for (const values of [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [8, 7, 6, 5, 4, 3, 2, 1],
    [8, 3, 12, 1, 4, 10, 14, 2, 5, 9, 11, 13],
  ]) {
    const tree = make(values),
      layout = layoutTree(tree),
      coords = Object.values(layout.positions);
    expect(new Set(coords.map((p) => `${p.x}:${p.y}`)).size).toBe(coords.length);
    expect(layout.positions[tree.root!]!.x).toBe(layout.left + layout.width / 2);
    for (const a of coords)
      for (const b of coords)
        if (a !== b && a.y === b.y) expect(Math.abs(a.x - b.x)).toBeGreaterThanOrEqual(78);
  }
});
it('BST limita profundidade e permanece não balanceada quando permitido', () => {
  const tree = make([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(tree.nodes[tree.root!]!.height).toBe(8);
  expect(treeTimeline(tree, 'bst', 'insert', 9).at(-1)!.tree).toEqual(tree);
});
