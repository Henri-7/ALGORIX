import type { TreeState } from './model';
export interface NodePosition {
  x: number;
  y: number;
}
/** In-order ranks reserve a distinct horizontal slot per node; the root anchors the viewBox. */
export function layoutTree(tree: TreeState) {
  const positions: Record<string, NodePosition> = {};
  let rank = 0,
    depthMax = 0;
  const walk = (id: string | null, depth: number) => {
    if (!id) return;
    const n = tree.nodes[id]!;
    walk(n.left, depth + 1);
    positions[id] = { x: rank++ * 78, y: depth * 96 + 65 };
    depthMax = Math.max(depthMax, depth);
    walk(n.right, depth + 1);
  };
  walk(tree.root, 0);
  const rootX = tree.root ? positions[tree.root]!.x : 0;
  const extent = Math.max(rootX + 65, (rank - 1) * 78 - rootX + 65, 320);
  return {
    positions,
    width: extent * 2,
    height: Math.max(350, depthMax * 96 + 140),
    left: rootX - extent,
  };
}
