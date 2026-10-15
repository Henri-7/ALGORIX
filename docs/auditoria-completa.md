# Auditoria completa do ALGORIX

Verificação realizada em 14/10/2026, no código local e no preview do build de produção (`http://127.0.0.1:4175/`).

## Resultado

**216 testes passaram em 8 arquivos, sem falhas ou testes pendentes. ESLint passou sem avisos. TypeScript strict e build Vite passaram. `npm audit --json` retornou zero vulnerabilidades conhecidas.** Os 149 testes anteriores foram preservados; foram acrescentados 67 testes de auditoria. Não houve alteração de dependências, lockfile, configurações de build, cores, fontes, composição das páginas ou módulos disponíveis.

As evidências reproduzíveis estão em [auditoria-testes.json](auditoria-testes.json), [auditoria-verificacoes.json](auditoria-verificacoes.json) e [auditoria-evidencias/navegador.json](auditoria-evidencias/navegador.json). O primeiro arquivo contém as asserções e resultados individuais; o segundo registra comandos, hashes SHA-256, rotas e assets servidos; o terceiro registra medições reais das páginas e mensagens de console do navegador.

## Estado encontrado ao retomar

- `src/tests/audit-algorithms.test.ts` e `src/tests/audit-interface.test.tsx` tinham **0 bytes**. Não havia testes implementados nesses dois arquivos para descartar ou recriar.
- A execução inicial apresentou **149 testes aprovados em seis arquivos e dois arquivos de suíte com falha**, exclusivamente por estarem vazios.
- `src/lib/input.ts` ainda convertia tokens diretamente com `Number()`. Isso permitia zeros implícitos em delimitadores nas extremidades, formatos não decimais e uma entrada composta apenas por separadores.
- O Git já continha alterações da implementação/consolidação anterior. Elas foram preservadas, sem reset, limpeza, commit ou alteração do histórico.
- Um inventário de 53 arquivos de código/configuração foi salvo antes das correções em `C:/Users/Micro/.codex/backups/algorix-auditoria/baseline-20261014-200108.json`. A comparação final identificou 43 arquivos idênticos e os dez arquivos descritos abaixo como alterados nesta auditoria. A documentação e as evidências produzidas depois do inventário não entram nessa contagem.

## Problemas reproduzidos e corrigidos

| Área | Antes | Correção e evidência |
| --- | --- | --- |
| Entrada manual | `1, 2,` virava `[1, 2, 0]`; `,` virava zeros; separadores externos também afetavam o limite de tamanho. | Tokens vazios são ignorados; ausência de valores é rejeitada. Sinais, negativos, repetidos e delimitadores já aceitos continuam funcionando. Testes incluem os 32 valores reais e os extremos −999/999. |
| Formato dos inteiros | `0x10`, `0b11`, `0o10`, `1e2` e `1.0` eram convertidos silenciosamente. | A entrada textual exige inteiros decimais, com sinal opcional. O erro aparece sem substituir a entrada válida aplicada. |
| Gerador | Tamanhos não finitos podiam gerar array vazio ou ser limitados silenciosamente. | A função recusa `NaN` e infinitos. A interface já validava tamanho; a proteção agora também está na função. Limitação e arredondamento de tamanhos finitos foram preservados. |
| Player universal | Uma timeline com zero ou um snapshot podia ficar com `playing=true` sem transição possível. | Reproduzir não inicia uma timeline sem transições. A navegação normal, velocidade, persistência e cleanup continuam cobertos pela suíte anterior. |
| Menu móvel | Navegar pelo logotipo mantinha o menu aberto na nova página. | O estado do cabeçalho é reiniciado por caminho da rota. Teste DOM e navegação real confirmaram o fechamento. |
| Seleção de grafo | Selecionar nó/aresta pelos formulários não pausava a reprodução, apesar da orientação da interface. | As duas seleções chamam a pausa. A seleção não cancela a timeline; edições continuam invalidando a execução. |
| Teclado no SVG | Mover um nó remontava a sessão e perdia o foco, interrompendo o uso contínuo das setas. | A identidade do nó a focar acompanha a mudança e o SVG restaura seu foco sem rolar a página. Duas setas consecutivas foram verificadas no navegador: A passou de X=100 para X=120 com foco preservado. |
| Arraste | Botão secundário iniciava movimento; soltar outro ponteiro podia confirmar o arraste ativo. | Apenas o botão principal inicia o arraste; início e término respeitam a identidade do ponteiro. Testes verificam rascunho, confirmação, cancelamento e ponteiros distintos. |
| Informação de Dijkstra | A lista de não finalizados dizia estar em ordem de seleção, mas os itens eram exibidos por criação. | O rótulo agora descreve a ordem de criação. A seleção efetiva do mínimo por varredura e o desempate permanecem corretos. |
| Fila do percurso em largura de árvore | O array guardava também os nós já consumidos, embora a interface declarasse fila auxiliar O(w). | A fila remove entradas consumidas, mantendo somente a fronteira. Os resultados dos quatro percursos continuam passando. Snapshots e sequência de saída são instrumentação/resultado, separados da fila auxiliar. |
| Ajuda de rota inválida | A mensagem ainda dizia que o catálogo tinha sete algoritmos. | A ajuda direciona ao catálogo sem número fixo; o catálogo possui doze destinos. |
| Home móvel | O brilho decorativo extrapolava a página: largura de conteúdo 372 px para área útil de 360 px no viewport de 375 px. | O alcance horizontal do brilho foi limitado às margens móveis. Nova medição: conteúdo e área útil de 360 px, sem rolagem horizontal. A grade, tipografia, cores e componentes foram preservados. |

## Cobertura dos módulos

| Módulo | Verificações realizadas |
| --- | --- |
| Entrada e geradores | Delimitadores mistos, vazios, formatos inválidos, inteiros com sinais, limites, duplicados, cinco padrões de geração e tamanhos não finitos. |
| Cinco ordenações | Suíte anterior de resultados, métricas e snapshots; casos máximos de 32 elementos; contagens de comparação no pior caso aplicável; isolamento de arrays e métricas entre snapshots; fluxo de aplicação/conclusão/reset em cada algoritmo. |
| Duas buscas | Suíte anterior mais **3.234 combinações de sequência/alvo** para cada busca, cobrindo todas as sequências crescentes de até seis elementos em cinco chaves e sete alvos. Conferência de presença, índice, intervalo e limite logarítmico. Interface cobre duplicados, alvo ausente, edição durante reprodução e ordenação explícita da entrada binária. |
| Comparador | Entrada compartilhada; algoritmo curto permanece concluído enquanto o outro avança; controle geral no modo independente; pausa dos dois players; cancelamento ao trocar modo, algoritmo ou rascunho. No navegador, ambos ordenaram `[4,3,2,1]`; no modo independente, os sliders ficaram em `16 / 0 / 16`. |
| BST e AVL | Suíte anterior de inserção, busca, remoção, raiz/sucessor, quatro rotações, quatro percursos, alturas, ligações e layout. Novos testes executam **300 operações mistas por estrutura**, comparadas a um conjunto de valores. Invariantes e alturas são conferidos após cada operação; referências ativas e linhas de código também são verificadas. |
| Grafos e algoritmos | Suíte anterior de edição, direção, limites, ciclos, pesos zero, componentes e Bellman–Ford. Novos testes avaliam **24 grafos adicionais**, todas as seis origens e os três algoritmos: 432 timelines, incluindo ciclos, recíprocas, pesos zero e fracionários. Conferência independente de distâncias, alcance, caminhos, mínimo de arestas do BFS e contagem de inspeções. |
| Home, catálogo e navegação | Demonstração aguarda ação do usuário; desmontagem cancela timers; os doze links do catálogo correspondem aos metadados; filtros usam URL; recuperação de rotas inválidas; fechamento do menu móvel; conteúdo da página Sobre revisado. |
| Reprodução e acessibilidade | Testes existentes de timers, velocidade, armazenamento indisponível e cleanup; pseudocódigo sincronizado; rewind; cancelamento; foco de nós; formulários rotulados; controles e zoom acessíveis. |

## Testes e comandos finais

| Arquivo | Testes aprovados |
| --- | ---: |
| `algorithms.test.ts` | 69 |
| `playback.test.tsx` | 6 |
| `interface.test.tsx` | 7 |
| `trees.test.ts` | 28 |
| `graphs.test.ts` | 27 |
| `network-interface.test.tsx` | 12 |
| `audit-algorithms.test.ts` | 39 |
| `audit-interface.test.tsx` | 28 |
| **Total** | **216** |

- `npm run lint`: código de saída 0, com `--max-warnings 0`.
- `npm test`: código de saída 0; 8 arquivos, 216 aprovados, zero falhas.
- `npm run build`: código de saída 0; inclui `tsc --noEmit`; 2.198 módulos transformados e `dist/` gerado com páginas sob demanda.
- `npm audit --json`: código de saída 0; zero vulnerabilidades reportadas, incluindo dependências de desenvolvimento, na consulta desta sessão. Isso descreve os avisos conhecidos na data da consulta.
- Preview de produção: **20 URLs e os 35 assets de `dist/assets` retornaram HTTP 200**. Em rotas inexistentes, HTTP 200 é o fallback SPA; o conteúdo de página não encontrada foi conferido separadamente no navegador.
- Prettier: os dez arquivos de código alterados passaram na verificação de formato.

Para reproduzir o relatório JSON de testes diretamente no Windows, sem depender do encaminhamento de argumentos do npm:

```sh
node node_modules/vitest/vitest.mjs run --reporter=json --outputFile=docs/auditoria-testes.json
```

## Inspeção no navegador

Foi utilizado o navegador Chromium integrado, carregando o preview do build. Houve inspeção de telas nas larguras **375, 768, 1280 e 1440 px**, sem reformulação do design. As medições finais estão no JSON do navegador; nas amostras registradas, `scrollWidth` é igual a `clientWidth`.

Fluxos conferidos: entrada com vírgula final e negativos no Bubble Sort; rejeição de entrada binária desordenada e ordenação explícita; busca de 5 em `[1,5,9]` no índice 1 com uma comparação; AVL LR ao inserir 20 em `[30,10]`, resultando em raiz 20 e duas rotações; fila BFS inicialmente com A; DFS concluída com pilha vazia; Dijkstra no exemplo ponderado com caminho A → C → B → D → F e custo 10; comparação sincronizada/independente; menu móvel e recuperação da página inexistente. Não houve mensagens de erro ou aviso no console capturado ao final.

Evidências visuais:

- [Home móvel após correção](auditoria-evidencias/home-mobile.jpg).
- [AVL após rotação LR](auditoria-evidencias/avl-desktop.jpg).
- [Dijkstra móvel](auditoria-evidencias/dijkstra-mobile.jpg).
- [BFS em tablet](auditoria-evidencias/bfs-tablet.jpg).
- [Comparação em desktop](auditoria-evidencias/comparacao-desktop.jpg).

## Arquivos alterados nesta auditoria

- `src/lib/input.ts`: validação e tokens.
- `src/engine/usePlayback.ts`: timeline sem transições.
- `src/components/Layout.tsx`: ciclo de vida do menu por rota, com o mesmo HTML visual.
- `src/features/graphs/GraphLaboratory.tsx`: pausa por seleção, restauração de foco e rótulo da fronteira.
- `src/features/graphs/GraphSvg.tsx`: foco e contrato dos ponteiros.
- `src/algorithms/trees/timeline.ts`: fila com descarte das entradas consumidas.
- `src/features/Laboratory.tsx`: mensagem de recuperação sem contagem obsoleta.
- `src/styles/global.css`: somente a regra de alcance do brilho decorativo em telas móveis.
- Os dois arquivos `src/tests/audit-*.test.*`: 67 testes complementares.
- `README.md`, `docs/arvores-grafos.md`, este relatório e os artefatos de verificação: documentação atualizada.

Os seis arquivos anteriores de testes têm hashes idênticos aos do início desta auditoria. Ordenações, buscas, comparador, modelos de grafo, controles, tokens de identidade, dependências e configurações também foram preservados; a lista completa está no manifesto de hashes.

## Limites reais da verificação

Não foram encontrados problemas funcionais pendentes nos cenários exercitados. A auditoria não prova ausência de qualquer defeito possível. O contrato de arraste foi testado com eventos de ponteiro simulados e o movimento por teclado foi usado no navegador; arraste físico com mouse/toque em aparelho real não foi validado. Não houve sessão com leitor de tela, inspeção em Safari/Firefox ou avaliação quadro a quadro de todas as animações. As capturas comprovam estados e composição visual, sem substituir esses testes manuais.

Os limites de entrada do produto e o escopo dos módulos foram mantidos. Pilhas, filas e listas encadeadas como laboratórios independentes continuam planejadas; sua implementação não faz parte desta auditoria. Nenhuma publicação externa foi realizada.
