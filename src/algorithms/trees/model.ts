export type TreeKind = 'bst' | 'avl';
export type TreeAction =
  'insert' | 'search' | 'remove' | 'inorder' | 'preorder' | 'postorder' | 'levelorder';
export interface TreeNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  parent: string | null;
  height: number;
}
export interface TreeState {
  root: string | null;
  nodes: Record<string, TreeNode>;
  nextId: number;
}
export interface TreeStep {
  family: 'tree';
  id: number;
  tree: TreeState;
  operation: string;
  line: number;
  message: string;
  current: string | null;
  visited: string[];
  activeEdges: string[];
  found: string | null;
  participants: string[];
  output: number[];
  metrics: { comparisons: number; rotations: number };
}
export const TREE_LIMIT = 31;
export const TREE_DEPTH_LIMIT = 8;
export const emptyTree = (): TreeState => ({ root: null, nodes: {}, nextId: 1 });
export function cloneTree(tree: TreeState): TreeState {
  return {
    root: tree.root,
    nextId: tree.nextId,
    nodes: Object.fromEntries(Object.entries(tree.nodes).map(([id, n]) => [id, { ...n }])),
  };
}
export const treeEdge = (a: string, b: string) => `${a}:${b}`;
export function height(tree: TreeState, id: string | null): number {
  return id ? tree.nodes[id]!.height : 0;
}
export function balance(tree: TreeState, id: string): number {
  const n = tree.nodes[id]!;
  return height(tree, n.left) - height(tree, n.right);
}
export function refreshHeights(tree: TreeState, id = tree.root): number {
  if (!id) return 0;
  const n = tree.nodes[id]!;
  n.height = 1 + Math.max(refreshHeights(tree, n.left), refreshHeights(tree, n.right));
  return n.height;
}
export function assertTreeValue(value: number) {
  if (!Number.isInteger(value) || Math.abs(value) > 999)
    throw new Error('Use um inteiro entre −999 e 999.');
}
