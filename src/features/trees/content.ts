import {
  emptyTree,
  type TreeAction,
  type TreeKind,
  type TreeState,
  type TreeStep,
} from '../../algorithms/trees/model';
import { treeTimeline } from '../../algorithms/trees/timeline';
export const treeActions: Record<TreeAction, string> = {
  insert: 'Inserção',
  search: 'Busca',
  remove: 'Remoção',
  inorder: 'Em ordem',
  preorder: 'Pré-ordem',
  postorder: 'Pós-ordem',
  levelorder: 'Em largura',
};
export function treeCode(action: TreeAction, kind: TreeKind) {
  const tail = [
    'atualizar alturas no caminho ancestral',
    kind === 'avl' ? 'se |altura(esq) − altura(dir)| > 1:' : 'BST: não aplicar balanceamento',
    kind === 'avl' ? '  aplicar rotação LL, RR, LR ou RL' : 'continuar até a raiz',
    'retornar resultado',
  ];
  if (action === 'levelorder')
    return [
      'fila ← [raiz], se a árvore não estiver vazia',
      'enquanto fila não estiver vazia:',
      '  retirar primeiro e visitar',
      '  enfileirar filhos: esquerda, depois direita',
      'continuar pela fila',
      'cada nó entra uma vez',
      'fila vazia encerra o percurso',
      'altura não é alterada',
      'nenhuma rotação',
      'resultado ← sequência de visitas',
      'retornar resultado',
    ];
  if (['inorder', 'preorder', 'postorder'].includes(action)) {
    const order =
      action === 'inorder'
        ? ['percorrer esquerda', 'visitar nó', 'percorrer direita']
        : action === 'preorder'
          ? ['visitar nó', 'percorrer esquerda', 'percorrer direita']
          : ['percorrer esquerda', 'percorrer direita', 'visitar nó'];
    return [
      'receber raiz e sequência vazia',
      'entrar no nó; se vazio, retornar',
      ...order,
      'retornar ao pai',
      'cada nó é visitado uma vez',
      'altura não é alterada',
      'nenhuma rotação',
      'resultado ← sequência de visitas',
      'retornar resultado',
    ];
  }
  return [
    'receber raiz e valor',
    'comparar valor com nó atual',
    'se diferente: seguir esquerda ou direita',
    action === 'insert'
      ? 'se vazio: criar nó; rejeitar duplicado'
      : action === 'search'
        ? 'igual: encontrado; ligação vazia: ausente'
        : 'encontrar nó e identificar número de filhos',
    action === 'remove'
      ? 'com dois filhos: mínimo da subárvore direita'
      : 'continuar o caminho de busca',
    action === 'remove' ? 'selecionar sucessor em ordem' : 'preservar identidades existentes',
    action === 'remove'
      ? 'transferir valor e retirar sucessor; ou ligar filho'
      : 'preservar a propriedade de busca',
    ...tail,
  ];
}
export function initialTree(kind: TreeKind, values = [50, 30, 70, 20, 40, 60, 80]) {
  return values.reduce((t, v) => treeTimeline(t, kind, 'insert', v).at(-1)!.tree, emptyTree());
}
export function idleTreeStep(tree: TreeState): TreeStep {
  return {
    family: 'tree',
    id: 0,
    tree,
    current: null,
    found: null,
    activeEdges: [],
    visited: [],
    participants: [],
    output: [],
    metrics: { comparisons: 0, rotations: 0 },
    line: 0,
    operation: 'Pronto',
    message:
      'Escolha uma operação. A raiz está no topo; valores menores ficam à esquerda, maiores à direita.',
  };
}
