# ALGORIX

**Visualize. Entenda. Domine.**

Laboratório interativo, em português brasileiro, para investigar algoritmos reais através de snapshots reversíveis, pseudocódigo sincronizado e métricas de operações.

O objetivo do ALGORIX é transformar conceitos de computação em experiências visuais que conectam cada operação à lógica do algoritmo. Todos os fontes, configurações e comandos da aplicação estão na raiz deste repositório.

## Executar localmente

Requer **Node.js 22.13 ou superior** (recomendado: uma versão LTS atual) e npm.

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173`. As fontes estão incluídas no bundle; a aplicação não depende de CDN, login, backend ou API externa para funcionar.

```sh
npm test             # testes de algoritmos, player e interfaces
npm run test:watch   # desenvolvimento dos testes
npm run lint        # ESLint + TypeScript + regras de hooks
npm run build       # verificação TypeScript strict e build Vite
npm run preview     # servir dist/ localmente
```

## Disponível nesta versão

- Landing page editorial com demonstração executável do Bubble Sort.
- Catálogo pesquisável, com filtros, aplicações, vantagens e limitações.
- **Ordenação:** Bubble, Selection, Insertion, Merge e Quick Sort.
- **Busca:** linear e binária; validação explícita de ordem crescente.
- **Árvores:** BST e AVL com inserção, busca, remoção, quatro percursos e rotações reais.
- **Grafos:** editor SVG, BFS, DFS e Dijkstra com fila/pilha, distâncias e caminhos.
- Player: reproduzir, pausar, continuar, avançar, retroceder, reiniciar, velocidade e seleção de etapa.
- Entrada manual e geradores: aleatório, crescente, decrescente, quase ordenado e repetidos.
- Comparação com entrada compartilhada, modo sincronizado e controles independentes.
- Explicações específicas, linha ativa de pseudocódigo e complexidades teóricas.
- Layout responsivo, menu compacto, painel educativo recolhível, foco visível, feedback textual e suporte a movimento reduzido.
- Preferência de velocidade em `localStorage`, com recuperação se o armazenamento estiver indisponível.

### Rotas

| Rota                                | Experiência                              |
| ----------------------------------- | ---------------------------------------- |
| `/`                                 | Apresentação e demonstração interativa   |
| `/algoritmos`                       | Catálogo com filtros persistidos na URL  |
| `/laboratorio`                      | Abre Bubble Sort                         |
| `/laboratorio/ordenacao/:algorithm` | Cinco ordenações                         |
| `/laboratorio/busca/:algorithm`     | Duas buscas                              |
| `/laboratorio/arvores/:algorithm`   | `bst` e `avl`                            |
| `/laboratorio/grafos/:algorithm`    | `bfs`, `dfs` e `dijkstra`                |
| `/comparar`                         | Comparação lado a lado                   |
| `/sobre`                            | Conceito, escopo e critérios de precisão |

## Tecnologias e arquitetura

React, Vite, TypeScript strict (incluindo `noUncheckedIndexedAccess`), Tailwind CSS 4, React Router, Lucide React, Motion, Vitest, React Testing Library e ESLint. Fontes locais: Space Grotesk, Inter e JetBrains Mono. Lockfile incluído para instalações reproduzíveis.

```text
src/
  algorithms/     # funções puras de ordenação, busca, árvores e grafos
  engine/         # união discriminada de snapshots e hook do player
  components/     # visualização, controles, entradas, navegação e painel
  features/       # páginas carregadas sob demanda
  data/           # metadados educativos e pseudocódigo
  lib/            # validação e geração de entradas
  styles/         # tokens, estilos e breakpoints
  tests/          # invariantes e interações reais
```

Os tokens de identidade estão no bloco `@theme` de `src/styles/global.css`. Cobre queimado `#C96A2B` e azul petróleo claro `#3FA7B5` são as cores de identidade; âmbar indica comparação, verde conclusão e vermelho erro/remoção. `BrandMark` e `Logo` compartilham o símbolo vetorial de percurso modular, também usado como favicon. Consulte o [relatório de identidade visual](docs/identidade-visual.md) para paleta, contraste, arquivos e validação.

### Motor e timeline

1. Uma função pura recebe a entrada e produz uma timeline determinística.
2. Cada etapa guarda uma cópia própria dos valores e métricas, operação, elementos ativos, linha de código e explicação.
3. Tipos específicos `SortStep`, `SearchStep`, `TreeStep` e `GraphStep` discriminam as famílias sem um objeto cheio de campos opcionais.
4. O player mantém apenas posição, reprodução e velocidade. Um único timeout avança a posição e é cancelado no cleanup, pausa ou alteração de velocidade.
5. A identidade da sessão muda ao aplicar entrada, alvo ou algoritmo. Isso desmonta a sessão anterior, elimina seu timer e reinicia a timeline. Editar o rascunho pausa e reinicia a reprodução antes da aplicação.
6. A visualização representa somente o snapshot selecionado; retroceder não reexecuta operações nem modifica contadores.

As animações são uma transição visual entre snapshots. A fonte da verdade é sempre a etapa selecionada. Sem animação automática contínua na landing; o visitante inicia a demonstração.

### Semântica das métricas

- **Comparações:** uma comparação entre dois valores/chave por evento. Busca binária conta uma inspeção comparativa do alvo com o centro, independentemente de quantos operadores JavaScript implementam essa decisão.
- **Trocas:** intercâmbio entre dois índices diferentes; auto-trocas são omitidas.
- **Escritas:** atribuições no array principal. Uma troca implica duas escritas. Buffers do Merge Sort, armazenamento da chave e snapshots não entram no contador.
- **Etapas:** número de eventos após o snapshot inicial. Seleções e conclusão também são eventos, portanto etapa não equivale a uma unidade universal de trabalho.
- A memória dos snapshots e o tempo de renderização não fazem parte das complexidades teóricas apresentadas.
- Quick Sort usa Lomuto e pivô final: pior caso quadrático e pilha O(n); média O(log n) de pilha para entradas em ordem aleatória. Merge Sort desempata pela esquerda e é estável.
- Insertion Sort e Merge Sort podem apresentar valores temporariamente repetidos no array principal enquanto a chave/buffers guardam valores; as mensagens explicam as operações.

No comparador, os dois algoritmos recebem cópias da **mesma entrada**. No modo sincronizado, ambos avançam um evento por tick; o que termina antes permanece no último snapshot. No independente, cada painel pode ser pausado, acelerado e navegado separadamente. A duração de animações **não é benchmark**.

## Testes e verificação

A suíte cobre arrays vazios, unitários, negativos, repetidos, ordenados e invertidos; 100 entradas determinísticas adicionais por ordenação; resultado final, snapshots independentes, posições definitivas e incrementos das métricas. Busca cobre resultados, ausência, extremos, intervalos e rejeição de entrada binária desordenada.

Os testes de player usam timers falsos para verificar pausa, continuação, navegação, reset, limites, alteração de velocidade, persistência e cleanup. Testes de integração verificam cancelamento ao editar entradas/trocar algoritmo, pseudocódigo sincronizado, validação, filtros e timelines independentes.

**Auditoria de 14/10/2026:** 216 testes aprovados, ESLint e build de produção aprovados, com inspeção no navegador integrado em desktop/mobile. O [relatório completo](docs/auditoria-completa.md) registra correções, resultados por módulo, hashes, verificações HTTP e capturas. Arraste físico em aparelho real, leitores de tela e outros motores de navegador não foram validados.

O [refinamento posterior da interface](docs/refinamento-interface.md) registra a
limpeza editorial, os ajustes de leitura e a remoção dos anúncios de módulos
futuros. Essa etapa foi validada com testes, lint e build; não teve inspeção
renderizada em navegador.

## Publicação estática

`npm run build` gera `dist/`. Publique esse diretório em um host estático com fallback de rotas para `index.html` (SPA com BrowserRouter). Exemplo de regra para hosts que aceitam `_redirects`: `/* /index.html 200`. Para hospedar em subdiretório, ajuste `base` do Vite e `basename` do BrowserRouter. Esta entrega é local e não foi publicada automaticamente.

O arquivo `.openai/hosting.json` é um vínculo de hospedagem preexistente, preservado nesta consolidação. Ele não participa dos scripts de desenvolvimento ou build do ALGORIX e não foi reconfigurado para publicar esta aplicação. Verifique o destino desse vínculo antes de utilizá-lo em uma publicação; nenhum serviço externo foi alterado.

## Limitações e próximos passos

Esta versão implementa o escopo prioritário, o comparador e os módulos de árvores e grafos. Consulte [o relatório técnico dos novos módulos](docs/arvores-grafos.md) para operações, arquitetura, limites e verificações.

- Limite visual: 32 inteiros entre −999 e 999. Entradas vazias são suportadas no motor e testadas; a interface exige ao menos um número.
- Barras negativas usam altura absoluta, rótulo com sinal e contorno tracejado; não há eixo numérico negativo.
- Busca binária retorna uma ocorrência, não necessariamente a primeira. O custo O(n) da validação prévia não integra a timeline de busca.
- Árvores: até 31 nós, inteiros de −999 a 999, sem duplicados; BST limitada a 8 níveis para legibilidade.
- Grafos: até 16 nós e 48 arestas, pesos entre 0 e 9999, sem laços ou arestas paralelas. Grafos direcionados aceitam conexões recíprocas.
- Próximas melhorias: exportação de execuções e testes de navegador em CI.

## Referências de configuração

- [Vite — guia oficial](https://vite.dev/guide/)
- [Tailwind CSS — integração com Vite](https://tailwindcss.com/docs/installation/using-vite)
