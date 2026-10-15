import {
  cloneGraph,
  validateGraph,
  type GraphAlgorithm,
  type GraphState,
  type GraphStep,
} from './model';
export function graphTimeline(
  input: GraphState,
  algorithm: GraphAlgorithm,
  source: string,
  target: string | null,
): GraphStep[] {
  validateGraph(input);
  if (!input.nodes.length) throw new Error('O grafo está vazio. Adicione nós antes de executar.');
  if (!input.nodes.some((n) => n.id === source)) throw new Error('Selecione uma origem existente.');
  if (target && !input.nodes.some((n) => n.id === target))
    throw new Error('Selecione um destino existente.');
  const graph = cloneGraph(input),
    steps: GraphStep[] = [],
    discovery: string[] = [],
    finished: string[] = [],
    frontier: string[] = [];
  const predecessors: Record<string, string | null> = {},
    distances: Record<string, number> = {},
    metrics = { edgeChecks: 0, relaxations: 0 };
  let current: string | null = null,
    activeEdge: string | null = null;
  const path: string[] = [];
  const label = (id: string) => graph.nodes.find((n) => n.id === id)!.label;
  const order = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });
  const neighbors: Record<string, { node: string; edge: string; weight: number }[]> = {};
  for (const n of graph.nodes) {
    neighbors[n.id] = [];
    distances[n.id] = Infinity;
    predecessors[n.id] = null;
  }
  for (const e of graph.edges) {
    neighbors[e.from]!.push({ node: e.to, edge: e.id, weight: e.weight });
    if (!graph.directed) neighbors[e.to]!.push({ node: e.from, edge: e.id, weight: e.weight });
  }
  Object.values(neighbors).forEach((list) => list.sort((a, b) => order(a.node, b.node)));
  const emit = (operation: string, line: number, message: string) => {
    const base = {
      id: steps.length,
      graph: cloneGraph(graph),
      source,
      target,
      operation,
      line,
      message,
      current,
      activeEdge,
      discovery: [...discovery],
      finished: [...finished],
      frontier: [...frontier],
      predecessors: { ...predecessors },
      path: [...path],
      metrics: { ...metrics },
    };
    steps.push(
      algorithm === 'dijkstra'
        ? { ...base, family: 'graph-dijkstra', algorithm, distances: { ...distances } }
        : { ...base, family: 'graph-traversal', algorithm },
    );
  };
  emit(
    'Pronto',
    0,
    `Origem ${label(source)}. Vizinhos e empates seguem a ordem de criação dos nós.${algorithm !== 'dijkstra' ? ' Os pesos são ignorados neste percurso.' : ''}`,
  );
  if (algorithm === 'bfs') {
    const seen = new Set([source]);
    discovery.push(source);
    frontier.push(source);
    const queue = [source];
    let head = 0;
    emit('Descoberta', 1, `${label(source)} é descoberto e entra na fila.`);
    while (head < queue.length) {
      current = queue[head++]!;
      activeEdge = null;
      frontier.splice(0, frontier.length, ...queue.slice(head));
      emit('Retirar da fila', 2, `Retiramos ${label(current)} do início da fila (FIFO).`);
      for (const n of neighbors[current]!) {
        activeEdge = n.edge;
        metrics.edgeChecks++;
        emit(
          'Inspecionar aresta',
          3,
          `De ${label(current)}, analisamos ${label(n.node)}${seen.has(n.node) ? ': já descoberto, não entra novamente na fila' : ': ainda não descoberto'}.`,
        );
        if (!seen.has(n.node)) {
          seen.add(n.node);
          discovery.push(n.node);
          predecessors[n.node] = current;
          emit('Descoberta', 4, `${label(n.node)} é descoberto a partir de ${label(current)}.`);
          queue.push(n.node);
          frontier.push(n.node);
          emit(
            'Enfileirar',
            5,
            `${label(n.node)} entra no fim da fila. Fila: ${frontier.map(label).join(' → ')}.`,
          );
        }
      }
      finished.push(current);
      activeEdge = null;
      emit('Finalização', 6, `Todos os vizinhos de ${label(current)} foram inspecionados.`);
    }
  } else if (algorithm === 'dfs') {
    const seen = new Set<string>();
    const visit = (id: string) => {
      seen.add(id);
      discovery.push(id);
      frontier.push(id);
      current = id;
      emit(
        'Descoberta',
        1,
        `Entramos em ${label(id)}. Pilha de chamadas: ${frontier.map(label).join(' → ')}.`,
      );
      for (const n of neighbors[id]!) {
        current = id;
        activeEdge = n.edge;
        metrics.edgeChecks++;
        emit(
          'Inspecionar aresta',
          2,
          `Inspecionamos ${label(id)} → ${label(n.node)}. ${seen.has(n.node) ? 'Já descoberto: evitamos repetir a exploração.' : 'Ainda não descoberto.'}`,
        );
        if (!seen.has(n.node)) {
          predecessors[n.node] = id;
          emit(
            'Aprofundar',
            3,
            `Chamamos a exploração de ${label(n.node)} antes de continuar os demais vizinhos de ${label(id)}.`,
          );
          visit(n.node);
        }
      }
      current = id;
      activeEdge = null;
      finished.push(id);
      emit(
        'Finalização',
        4,
        `Finalizamos ${label(id)}: todos os seus vizinhos já foram explorados.`,
      );
      frontier.pop();
      emit(
        'Retorno',
        5,
        `Retornamos de ${label(id)}${frontier.length ? ` para ${label(frontier.at(-1)!)}` : '; a pilha de chamadas ficou vazia'}.`,
      );
    };
    visit(source);
  } else {
    distances[source] = 0;
    discovery.push(source);
    frontier.push(source);
    emit(
      'Inicializar distâncias',
      1,
      `${label(source)} recebe distância 0. Os demais começam com infinito.`,
    );
    const done = new Set<string>();
    while (true) {
      const candidates = graph.nodes.filter(
        (n) => !done.has(n.id) && Number.isFinite(distances[n.id]),
      );
      if (!candidates.length) break;
      let minimum = candidates[0]!;
      for (const n of candidates)
        if (
          distances[n.id]! < distances[minimum.id]! ||
          (distances[n.id] === distances[minimum.id] && order(n.id, minimum.id) < 0)
        )
          minimum = n;
      current = minimum.id;
      frontier.splice(0, frontier.length, ...candidates.map((n) => n.id));
      activeEdge = null;
      emit(
        'Selecionar mínimo',
        2,
        `${label(current)} tem a menor distância provisória: ${distances[current]}. Seleção por varredura dos nós não finalizados.`,
      );
      // Scanning selection (rather than a heap) is explicit in the complexity metadata.
      for (const n of neighbors[current]!) {
        activeEdge = n.edge;
        metrics.edgeChecks++;
        emit(
          'Inspecionar aresta',
          3,
          `Analisamos ${label(current)} → ${label(n.node)}, peso ${n.weight}${done.has(n.node) ? '. Destino já finalizado.' : '.'}`,
        );
        if (done.has(n.node)) continue;
        const candidate = distances[current]! + n.weight;
        emit(
          'Comparar distância',
          4,
          `Via ${label(current)}: ${distances[current]} + ${n.weight} = ${candidate}; distância atual de ${label(n.node)}: ${Number.isFinite(distances[n.node]) ? distances[n.node] : '∞'}.`,
        );
        if (candidate < distances[n.node]!) {
          distances[n.node] = candidate;
          predecessors[n.node] = current;
          metrics.relaxations++;
          if (!discovery.includes(n.node)) discovery.push(n.node);
          frontier.splice(
            0,
            frontier.length,
            ...graph.nodes
              .filter((v) => !done.has(v.id) && Number.isFinite(distances[v.id]))
              .map((v) => v.id),
          );
          emit(
            'Relaxamento',
            5,
            `Melhoramos ${label(n.node)} para ${candidate}. Seu predecessor agora é ${label(current)}.`,
          );
        }
      }
      done.add(current);
      finished.push(current);
      frontier.splice(frontier.indexOf(current), 1);
      activeEdge = null;
      emit(
        'Finalização',
        6,
        `A distância de ${label(current)} (${distances[current]}) é definitiva, pois todos os pesos são não negativos.`,
      );
    }
  }
  current = null;
  activeEdge = null;
  frontier.length = 0;
  if (target && discovery.includes(target)) {
    let id: string | null = target;
    while (id) {
      path.unshift(id);
      id = predecessors[id] ?? null;
    }
  }
  const unreachable = graph.nodes.length - discovery.length;
  const result = target
    ? path.length
      ? `Caminho ${path.map(label).join(' → ')}${algorithm === 'dijkstra' ? `; distância mínima ${distances[target]}` : algorithm === 'bfs' ? `; mínimo de ${path.length - 1} arestas (pesos ignorados)` : '; caminho de exploração, sem garantia de mínimo'}.`
      : `Destino ${label(target)} inalcançável a partir de ${label(source)}.`
    : 'Exploração concluída.';
  emit(
    'Concluído',
    7,
    `${result} ${unreachable ? `${unreachable} nó(s) não alcançado(s) pela origem.` : 'Todos os nós são alcançáveis pela origem.'}`,
  );
  return steps;
}
