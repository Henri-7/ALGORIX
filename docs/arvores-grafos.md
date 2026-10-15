# Árvores e grafos — implementação

## Funcionalidades

BST e AVL permitem inserir, buscar e remover valores, incluindo a raiz e os três casos de remoção. Duplicados são recusados. A remoção com dois filhos transfere o valor do sucessor e remove sua identidade em uma única alteração estrutural. Os percursos em ordem, pré-ordem, pós-ordem e por nível mostram resultados incrementais. A AVL mantém alturas e fatores reais, executa LL, RR, LR e RL e rebalanceia também após remoções. Exemplos permitem preparar as quatro rotações.

O layout SVG usa posições distintas por ordem simétrica e profundidade, com raiz centralizada, identidades estáveis e transições de nós/arestas. Zoom, ajuste à largura e rolagem permitem explorar árvores grandes. Há representação textual e respeito a movimento reduzido. Nós em animação de saída são excluídos da árvore de acessibilidade.

O editor de grafos permite adicionar/remover nós, arrastar, mover com setas ou coordenadas, criar conexões por dois cliques ou formulário, remover arestas e editar pesos. Suporta direção, conexões recíprocas curvas e exemplos simples, cíclicos, desconexos, ponderados e com múltiplos caminhos. Ao converter para não direcionado, conexões recíprocas são unificadas com o menor peso.

BFS mostra fila e descoberta; DFS mostra a pilha de chamadas, descoberta e finalização separadas. Dijkstra mostra distâncias, predecessores, relaxamentos, infinito para inalcançáveis e o caminho até o destino. Origem igual ao destino resulta em custo zero. Pesos negativos, não finitos ou vazios são recusados. Pesos zero são aceitos. BFS/DFS ignoram pesos; o caminho BFS minimiza o número de arestas.

## Integração e execução

Os módulos reutilizam `usePlayback` e `PlaybackControls` sem alterar o motor dos arrays. Os snapshots de árvores e grafos têm modelos próprios tipados; não são adaptados artificialmente a barras. Cada operação pura gera uma timeline independente, determinística e reversível, com explicação e linha de pseudocódigo.

Em árvores, uma operação parte do estado visível concluído. Enquanto não chega à última etapa, novas mutações ficam bloqueadas. Cancelar restaura a entrada da operação; reiniciar volta ao snapshot inicial; concluir permite encadear a próxima operação. Retroceder nunca reaplica mutações.

Em grafos, alterações de estrutura, peso, posição, origem ou destino invalidam a execução. Trocar algoritmo desmonta a sessão anterior. Seleções pausam a reprodução; alterações remontam a sessão e eliminam o timeout anterior. A posição de arraste é um rascunho visual até soltar o ponteiro.

## Complexidades e convenções

- Altura da árvore vazia: 0; altura da folha: 1. Fator AVL: altura esquerda menos altura direita.
- BST: operações O(h), pior caso O(n). AVL: O(log n). Percursos: O(n).
- BFS e DFS: O(V + E), considerando listas de adjacência preparadas. A preparação ordena vizinhos por identidade de criação para garantir desempates estáveis.
- Dijkstra usa seleção linear do mínimo, portanto O(V² + E), sem alegar uso de heap. Empates usam a identidade de criação; um caminho de mesmo custo não substitui o predecessor existente.
- A memória total do grafo com adjacência é O(V + E). Os custos de snapshots, cópias de fronteiras, alturas de exibição, mensagens, preparação e animação não integram as complexidades do algoritmo central.
- Rotação dupla conta duas rotações primitivas. Comparações de árvore contam inspeções de chave; métricas de grafo contam inspeções de arestas e relaxamentos bem-sucedidos.

## Arquivos

Criados:

- `src/algorithms/trees/{model,timeline,layout}.ts`: modelo, operações e layout.
- `src/algorithms/graphs/{model,examples,timeline}.ts`: edição, exemplos e algoritmos.
- `src/features/trees/{TreeLaboratory,TreeSvg}.tsx` e `content.ts`.
- `src/features/graphs/{GraphLaboratory,GraphEditor,GraphSvg}.tsx` e `content.ts`.
- `src/components/network/{ExecutionPanel,SvgViewport}.tsx` e `src/components/LaboratoryNavigation.tsx`.
- `src/data/{catalog,networkAlgorithms}.ts` e `src/styles/networks.css`.
- `src/tests/{trees,graphs,network-interface}.test.ts[x]` e este relatório.

Modificados: `src/main.tsx` (rotas sob demanda), `src/features/Laboratory.tsx` (navegação compartilhada), `src/features/{Catalog,Home,About}.tsx` (acesso e descrição dos módulos), `src/styles/global.css` (quebra de linha dos filtros) e `README.md`.

Ordenações, buscas, comparador, controles e hook de reprodução permanecem com suas implementações existentes. Nenhuma dependência foi adicionada.

## Verificação e limites

A suíte cobre invariantes de BST, alturas, ponteiros parentais, sucessores, quatro percursos e quatro rotações. Sequências determinísticas de inserções/remoções verificam AVL após cada operação. Grafos cobrem edição, direção, ciclos, componentes desconexos, pesos zero, empates e distâncias comparadas com Bellman–Ford em 30 grafos gerados. Testes de interface verificam encadeamento, cancelamento, rewind, pseudocódigo, validação e troca de algoritmo.

Resultado da implementação inicial em 14/10/2026: **149 testes passaram em 6 arquivos**, incluindo os 82 testes anteriores e 67 novos. `npm run lint` passou sem avisos. `npm run build` passou, incluindo `tsc --noEmit`, e gerou `dist/` com os módulos carregados sob demanda. O preview do build retornou HTTP 200 nas cinco novas rotas, home, catálogo, ordenação e comparação. HTTP 200 verifica entrega e fallback SPA, não a renderização visual. A [auditoria posterior](auditoria-completa.md) ampliou o total para 216 testes e incluiu inspeção em navegador e correções complementares.

Limites deliberados: 31 nós por árvore, até 8 níveis em BST e valores inteiros de −999 a 999; 16 nós/48 arestas por grafo e pesos de 0 a 9999. Laços e arestas paralelas não são aceitos. Sessões não persistem ao sair da rota; apenas a preferência de velocidade usa o armazenamento existente. Não há execução no servidor nem publicação automática.

Na implementação inicial não havia navegador conectado. A auditoria posterior verificou telas e fluxos em navegador integrado, com evidências no relatório acima. Permanecem sem validação física o arraste em aparelho real, leitores de tela e o comportamento em outros motores de navegador.

## Referências consultadas

[AlgoAnim — BST](https://algoanim.ide.sk/index.php?page=showanim&id=44) e [USF — BST Visualization](https://www.cs.usfca.edu/~galles/visualization/BST.html) foram consultadas como referências educativas. A implementação, os modelos e o desenho SVG são próprios, sem iframe ou cópia de código/layout. A consulta textual às páginas não equivale a uma avaliação interativa das referências.
