import {
  assertTreeValue,
  balance,
  cloneTree,
  height,
  refreshHeights,
  TREE_DEPTH_LIMIT,
  TREE_LIMIT,
  treeEdge,
  type TreeAction,
  type TreeKind,
  type TreeState,
  type TreeStep,
} from './model';

/** Instrumentation snapshots are independent; only mutations on `tree` are algorithmic work. */
export function treeTimeline(
  input: TreeState,
  kind: TreeKind,
  action: TreeAction,
  value = 0,
): TreeStep[] {
  assertTreeValue(value);
  const tree = cloneTree(input),
    steps: TreeStep[] = [],
    visited: string[] = [],
    output: number[] = [];
  const metrics = { comparisons: 0, rotations: 0 };
  let current: string | null = null,
    found: string | null = null,
    activeEdges: string[] = [],
    participants: string[] = [];
  const emit = (operation: string, line: number, message: string) => {
    const snapshot = cloneTree(tree);
    // Derived snapshot heights remain accurate even before ancestors have been updated by the algorithm.
    refreshHeights(snapshot);
    steps.push({
      family: 'tree',
      id: steps.length,
      tree: snapshot,
      operation,
      line,
      message,
      current,
      found,
      visited: [...visited],
      activeEdges: [...activeEdges],
      participants: [...participants],
      output: [...output],
      metrics: { ...metrics },
    });
  };
  const updateHeight = (id: string) => {
    const n = tree.nodes[id]!;
    n.height = 1 + Math.max(height(tree, n.left), height(tree, n.right));
  };
  const replace = (oldId: string, next: string | null) => {
    const n = tree.nodes[oldId]!,
      parent = n.parent;
    if (!parent) tree.root = next;
    else if (tree.nodes[parent]!.left === oldId) tree.nodes[parent]!.left = next;
    else tree.nodes[parent]!.right = next;
    if (next) tree.nodes[next]!.parent = parent;
  };
  const rotate = (id: string, direction: 'left' | 'right') => {
    const n = tree.nodes[id]!,
      childId = direction === 'right' ? n.left! : n.right!,
      child = tree.nodes[childId]!;
    const middle = direction === 'right' ? child.right : child.left;
    replace(id, childId);
    if (direction === 'right') {
      child.right = id;
      n.left = middle;
    } else {
      child.left = id;
      n.right = middle;
    }
    n.parent = childId;
    if (middle) tree.nodes[middle]!.parent = id;
    updateHeight(id);
    updateHeight(childId);
    metrics.rotations++;
    current = childId;
    participants = [id, childId];
    activeEdges = [treeEdge(childId, id)];
    emit(
      'Rotação',
      9,
      `Rotação à ${direction === 'right' ? 'direita' : 'esquerda'}: ${child.value} sobe e ${n.value} desce. As identidades dos nós e suas subárvores são preservadas.`,
    );
  };
  const rebalance = (path: string[]) => {
    for (const id of [...path].reverse()) {
      if (!tree.nodes[id]) continue;
      current = id;
      activeEdges = [];
      participants = [];
      updateHeight(id);
      const bf = balance(tree, id);
      emit(
        'Atualizar altura',
        7,
        `Altura de ${tree.nodes[id]!.value}: ${height(tree, id)}. Fator = altura esquerda − direita = ${bf}.`,
      );
      if (kind !== 'avl' || Math.abs(bf) <= 1) continue;
      const leftHeavy = bf > 1,
        child = leftHeavy ? tree.nodes[id]!.left! : tree.nodes[id]!.right!;
      const double = leftHeavy ? balance(tree, child) < 0 : balance(tree, child) > 0;
      const name = leftHeavy ? (double ? 'LR' : 'LL') : double ? 'RL' : 'RR';
      participants = [id, child];
      emit(
        'Desequilíbrio',
        8,
        `${tree.nodes[id]!.value} tem fator ${bf}. Caso ${name}: ${double ? 'duas rotações' : 'uma rotação'} restauram o balanceamento.`,
      );
      if (double) rotate(child, leftHeavy ? 'left' : 'right');
      rotate(id, leftHeavy ? 'right' : 'left');
    }
  };
  const finish = (message: string) => {
    current = found;
    activeEdges = [];
    participants = [];
    emit('Concluído', 10, message);
    return steps;
  };
  emit(
    'Pronto',
    0,
    'Estrutura inicial. Altura: árvore vazia = 0; folha = 1. Os valores são únicos.',
  );
  if (['inorder', 'preorder', 'postorder', 'levelorder'].includes(action)) {
    const visitLine =
      action === 'preorder' || action === 'levelorder' ? 2 : action === 'inorder' ? 3 : 4;
    const visit = (id: string) => {
      current = id;
      visited.push(id);
      output.push(tree.nodes[id]!.value);
      emit(
        'Visita',
        visitLine,
        `Visitamos ${tree.nodes[id]!.value}. Sequência: ${output.join(' → ')}.`,
      );
    };
    const walk = (id: string | null) => {
      if (!id) return;
      current = id;
      emit('Exploração', 1, `Entramos na subárvore de ${tree.nodes[id]!.value}.`);
      const n = tree.nodes[id]!;
      if (action === 'preorder') visit(id);
      if (n.left) {
        current = id;
        activeEdges = [treeEdge(id, n.left)];
        emit(
          'Esquerda',
          action === 'preorder' ? 3 : 2,
          `Exploramos o filho esquerdo de ${n.value}.`,
        );
        walk(n.left);
      }
      if (action === 'inorder') visit(id);
      if (n.right) {
        current = id;
        activeEdges = [treeEdge(id, n.right)];
        emit(
          'Direita',
          action === 'postorder' ? 3 : 4,
          `Exploramos o filho direito de ${n.value}.`,
        );
        walk(n.right);
      }
      if (action === 'postorder') visit(id);
      current = id;
      activeEdges = [];
      emit('Retorno', 5, `Concluímos a subárvore de ${n.value} e retornamos ao pai.`);
    };
    if (action === 'levelorder') {
      // Discard consumed entries so auxiliary queue storage tracks the frontier width.
      const queue = new Map<number, string>();
      let head = 0,
        tail = 0;
      if (tree.root) queue.set(tail++, tree.root);
      while (queue.size) {
        const id = queue.get(head)!;
        queue.delete(head++);
        visit(id);
        const n = tree.nodes[id]!;
        if (n.left) queue.set(tail++, n.left);
        if (n.right) queue.set(tail++, n.right);
        emit(
          'Fila',
          3,
          `Filhos adicionados da esquerda para a direita. Fila: ${
            [...queue.values()].map((x) => tree.nodes[x]!.value).join(', ') || 'vazia'
          }.`,
        );
      }
    } else walk(tree.root);
    return finish(
      output.length
        ? `Percurso concluído: ${output.join(' → ')}.`
        : 'Árvore vazia: não há nós para percorrer.',
    );
  }
  let id = tree.root;
  const path: string[] = [];
  while (id) {
    current = id;
    visited.push(id);
    path.push(id);
    metrics.comparisons++;
    const n = tree.nodes[id]!;
    emit(
      'Comparação',
      1,
      `Comparamos ${value} com ${n.value}: ${value === n.value ? 'valores iguais' : value < n.value ? 'o alvo é menor' : 'o alvo é maior'}.`,
    );
    if (value === n.value) break;
    const next = value < n.value ? n.left : n.right;
    activeEdges = next ? [treeEdge(id, next)] : [];
    emit(
      value < n.value ? 'Esquerda' : 'Direita',
      2,
      `${value} ${value < n.value ? '<' : '>'} ${n.value}: seguimos à ${value < n.value ? 'esquerda' : 'direita'}${next ? '.' : ', uma posição vazia.'}`,
    );
    id = next;
  }
  if (action === 'search') {
    found = id;
    return finish(
      id
        ? `${value} encontrado após ${metrics.comparisons} comparações.`
        : `${value} não encontrado. A busca terminou em uma ligação vazia${current ? ` de ${tree.nodes[current]!.value}` : ': a árvore está vazia'}.`,
    );
  }
  if (action === 'insert') {
    if (id)
      return finish(
        `${value} já existe. Valores duplicados não são permitidos; a árvore foi preservada.`,
      );
    if (Object.keys(tree.nodes).length >= TREE_LIMIT)
      return finish(`Limite de ${TREE_LIMIT} nós atingido. Remova um nó antes de inserir.`);
    if (kind === 'bst' && path.length >= TREE_DEPTH_LIMIT)
      return finish(
        `Limite visual de ${TREE_DEPTH_LIMIT} níveis atingido. Use AVL ou remova nós da cadeia.`,
      );
    const newId = `n${tree.nextId++}`,
      parent = path.at(-1) ?? null;
    tree.nodes[newId] = { id: newId, value, left: null, right: null, parent, height: 1 };
    if (!parent) tree.root = newId;
    else if (value < tree.nodes[parent]!.value) tree.nodes[parent]!.left = newId;
    else tree.nodes[parent]!.right = newId;
    current = newId;
    participants = [newId];
    activeEdges = parent ? [treeEdge(parent, newId)] : [];
    emit(
      'Inserção',
      3,
      `Inserimos ${value} ${parent ? `como filho de ${tree.nodes[parent]!.value}` : 'como raiz'}.`,
    );
    rebalance(path);
    found = newId;
    return finish(
      `${value} inserido. ${metrics.rotations} rotações; ${Object.keys(tree.nodes).length} nós na árvore.`,
    );
  }
  if (!id) return finish(`${value} não existe; nenhuma remoção foi feita.`);
  const target = tree.nodes[id]!;
  participants = [id];
  activeEdges = [];
  emit(
    'Remover',
    3,
    `Remover ${target.value}: ${target.left && target.right ? 'dois filhos; usaremos o sucessor em ordem' : target.left || target.right ? 'um filho; ele ocupará esta posição' : 'nó folha'}.`,
  );
  let removalId = id;
  if (target.left && target.right) {
    let successor = target.right;
    activeEdges = [treeEdge(id, successor)];
    emit(
      'Sucessor',
      4,
      'O sucessor é o menor valor da subárvore direita. Entramos nessa subárvore.',
    );
    while (tree.nodes[successor]!.left) {
      current = successor;
      visited.push(successor);
      path.push(successor);
      const next = tree.nodes[successor]!.left!;
      activeEdges = [treeEdge(successor, next)];
      emit(
        'Sucessor',
        4,
        `${tree.nodes[successor]!.value} tem filho esquerdo. Seguimos para ${tree.nodes[next]!.value}.`,
      );
      successor = next;
    }
    current = successor;
    participants = [id, successor];
    emit(
      'Sucessor selecionado',
      5,
      `${tree.nodes[successor]!.value} é o sucessor. Seu valor será transferido ao nó ${target.value}, cuja identidade ${id} permanece.`,
    );
    target.value = tree.nodes[successor]!.value;
    removalId = successor;
  } else path.pop();
  const removed = tree.nodes[removalId]!,
    replacement = removed.left ?? removed.right;
  replace(removalId, replacement);
  delete tree.nodes[removalId];
  current = replacement;
  participants = replacement ? [replacement] : [];
  activeEdges = [];
  emit(
    'Remoção',
    6,
    `Removemos a identidade ${removalId}${removalId !== id ? ` após transferir o valor do sucessor para ${id}` : ''}. ${replacement ? 'O filho ocupa a ligação liberada.' : 'A ligação ficou vazia.'}`,
  );
  rebalance(path);
  return finish(
    `${value} removido. A propriedade de busca${kind === 'avl' ? ' e o balanceamento AVL foram preservados' : ' foi preservada'}.`,
  );
}
