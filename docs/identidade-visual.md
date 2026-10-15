# ALGORIX — identidade cobre e petróleo

Atualização aplicada em 14/10/2026 ao projeto existente. Nome, assinatura, tipografias, rotas, composição das páginas e funcionalidades foram preservados.

## Símbolo: percurso modular

O novo desenho usa três blocos quadrados e duas ligações ortogonais. Os blocos representam estados de dados; o percurso representa a passagem por etapas e a iteração de um algoritmo. A composição assimétrica em cobre e petróleo substitui o antigo A triangular com pontos circulares.

O símbolo foi desenhado diretamente em SVG, sem biblioteca de ícones, imagem gerada ou referência gráfica externa. Não utiliza cérebro, molécula, chip ou circuito decorativo. O `viewBox` de 40 × 40 e as ligações de quatro unidades evitam detalhes excessivamente finos em reduções.

- **Fonte única:** `public/brand/algorix-symbol.svg`.
- **Símbolo reduzido:** componente `BrandMark`, com imagem decorativa por padrão e alternativa textual opcional para uso isolado.
- **Marca completa:** componente `Logo`, que combina `BrandMark` com a wordmark ALGORIX e mantém o link acessível de início.
- **Favicon:** o próprio SVG canônico, referenciado por `index.html`. Não há uma segunda cópia de sua geometria.

Header e footer receberam o novo símbolo por meio de `Logo`. A sidebar mantém seus ícones de categorias e recebe a nova identidade pelos tokens, sem inclusão de um logotipo onde antes não existia. Landing, laboratórios e demais páginas herdam a marca e o tema compartilhados.

## Paleta oficial

As treze cores-base ficam no `@theme` de `src/styles/global.css`:

| Uso | Token | Cor |
| --- | --- | --- |
| Fundo principal | `--color-bg` | `#0E1117` |
| Fundo secundário | `--color-secondary` | `#141922` |
| Superfície | `--color-surface` | `#1A202B` |
| Superfície elevada | `--color-elevated` | `#222A36` |
| Bordas | `--color-border` | `#313B49` |
| Identidade primária | `--color-primary` | `#C96A2B` |
| Identidade complementar | `--color-accent` | `#3FA7B5` |
| Texto principal | `--color-ink` | `#F3F5F7` |
| Texto secundário | `--color-muted` | `#B4BDC9` |
| Tom discreto | `--color-subtle` | `#7E8A9B` |
| Comparação / atenção | `--color-amber` | `#E9B44C` |
| Erro / remoção | `--color-danger` | `#E06C75` |
| Sucesso / encontrado | `--color-success` | `#57C785` |

`secondary` continua designando o fundo secundário, conforme a arquitetura anterior. A cor complementar da marca usa o nome `accent`, substituindo o antigo token que tinha nome de matiz. As legendas também usam nomes de estado, sem referências a violeta.

Hover, textos de destaque, preenchimentos dos gráficos e transparências são derivados dessas cores por `color-mix()`. Os hardcodes anteriores de fundos, bordas, barras, badges, navegação ativa, seleção, progresso e pseudocódigo foram substituídos por referências ao tema. A sombra usa um token preto neutro. O SVG portátil contém somente os dois valores oficiais da marca, e o metadado do navegador contém o fundo oficial.

O cobre aparece em CTAs, progresso, navegação ativa e destaques. As superfícies continuam neutras; barras em repouso, estados visitados e detalhes informativos usam petróleo. Comparações usam âmbar, resultados usam verde, erros e remoções usam vermelho. O símbolo permanece pequeno nas áreas existentes, sem ocupar grandes fundos com cobre.

## Contraste e acessibilidade

Foram necessários ajustes além da substituição literal das cores:

- Cobre oficial como texto pequeno sobre `surface` resulta em aproximadamente **4,34:1**, e sobre `elevated`, **3,84:1**. Por isso, textos pequenos de identidade usam `primary-text`, derivado de 75% cobre e 25% texto principal. Os fundos dos CTAs permanecem no cobre oficial.
- Texto escuro sobre o CTA cobre: **5,02:1**.
- Texto de destaque sobre a linha ativa do pseudocódigo: aproximadamente **5,33:1**.
- `subtle-text`, derivado do tom discreto, garante aproximadamente **4,75:1** mesmo sobre a superfície elevada. O tom discreto oficial continua disponível para contornos e elementos auxiliares.
- Marcadores de pivô/conclusão usam texto escuro sobre as barras preenchidas; no preenchimento de sucesso, a relação é aproximadamente **4,68:1**.
- Inputs e selects usam contornos mais claros. O foco de teclado permanece com contorno cobre de dois pixels; a leitura desse estilo foi confirmada no navegador.
- `BrandMark` dentro da wordmark é decorativo, evitando repetir o nome para leitores de tela. O nome acessível do link de início foi preservado.
- Remover nós/arestas recebe a classe visual `danger`; o nó em uma etapa de remoção e sua indicação no painel recebem o vermelho semântico. A lógica da operação não mudou.

A verificação das cores computadas não encontrou falhas de contraste nos textos HTML habilitados examinados na home, catálogo, laboratório de ordenação, busca, AVL, grafos e comparador. Ela considera tamanho de fonte e composição dos fundos. SVGs, elementos decorativos, estados desabilitados e conteúdo propositalmente descartado não integram essa contagem; contornos e marcadores relevantes foram conferidos separadamente. Isso não constitui certificação integral de acessibilidade.

## Arquivos criados e alterados

| Arquivo | Alteração |
| --- | --- |
| `src/components/BrandMark.tsx` | Novo componente do símbolo reduzido. |
| `public/brand/algorix-symbol.svg` | Novo desenho canônico da marca e favicon. |
| `src/components/Logo.tsx` | Reutiliza `BrandMark`; wordmark e comportamento preservados. |
| `index.html` | Novo favicon e `theme-color`. |
| `src/styles/global.css` | Paleta oficial, derivados, substituição dos hardcodes, estados e contraste. |
| `src/styles/networks.css` | Complementar petróleo e estado de remoção. |
| `src/components/Visualization.tsx` | Legendas coerentes com as cores dos estados. |
| `src/components/network/ExecutionPanel.tsx` | Cor semântica da etiqueta de remoção. |
| `src/features/trees/TreeSvg.tsx` | Classe visual do nó que será removido. |
| `src/features/trees/TreeLaboratory.tsx` | Legenda e botão de remoção. |
| `src/features/graphs/GraphLaboratory.tsx` | Nome neutro da classe da legenda. |
| `src/features/graphs/GraphEditor.tsx` | Botões de remoção com cor semântica. |
| `README.md` | Identidade atual e link para este relatório. |

Os algoritmos, modelos, hook de reprodução, entradas, comparador, dependências, configurações e os oito arquivos de testes permaneceram com suas implementações anteriores. O manifesto de verificação compara os hashes de **26 arquivos de núcleo/configuração** com o resultado da auditoria anterior.

## Limpeza

O arquivo antigo `public/favicon.svg` foi removido após a troca de sua referência no HTML. A geometria antiga foi retirada de `Logo`. Não existia manifest ou PNG de marca ativo para migrar; nenhum arquivo de configuração de hospedagem foi modificado.

A busca nos arquivos ativos de `src/`, `public/` e `index.html` não encontrou as cores-base antigas, nomes antigos de token/classe ou referências ao favicon anterior. O build foi regenerado, eliminando os bundles antigos de `dist/`.

Os relatórios e capturas da auditoria anterior em `docs/auditoria-*` foram preservados como registro histórico; eles não são assets utilizados pela interface. As capturas da nova identidade estão em `docs/identidade-evidencias/`.

## Validação

- `npm run lint`: aprovado, sem avisos.
- `npm test`: **216 testes aprovados em 8 arquivos**, sem alteração dos testes existentes.
- `npm run build`: aprovado; inclui TypeScript strict; **2.199 módulos** transformados e `dist/` atualizado.
- Prettier: aprovado nos arquivos TypeScript, TSX, CSS e HTML alterados. O SVG foi validado como XML.
- Treze tokens oficiais conferidos automaticamente; nenhuma referência antiga encontrada nos fontes ativos.
- SVG canônico servido com **HTTP 200** e `Content-Type: image/svg+xml`; header e footer carregaram a mesma imagem, e o favicon aponta para ela.
- Navegador integrado: revisão em **375, 768 e 1440 px**, incluindo menu móvel, sidebar, player, comparação, busca, árvore em remoção e Dijkstra concluído. A amostra móvel teve largura de conteúdo igual à área útil: **360 px**, sem transbordamento.
- Nenhum erro ou aviso no console capturado ao final da revisão.

Evidências:

- [Manifesto de cores e preservação](identidade-verificacao.json).
- [Contraste, metadados e medidas no navegador](identidade-evidencias/verificacao-navegador.json).
- [Home desktop](identidade-evidencias/home-desktop.jpg) e [home móvel](identidade-evidencias/home-mobile.jpg).
- [Árvore em remoção](identidade-evidencias/arvore-remocao.jpg).
- [Grafos](identidade-evidencias/grafos-desktop.jpg).
- [Ordenação](identidade-evidencias/ordenacao-comparacao.jpg) e [comparador](identidade-evidencias/comparador.jpg).
- [Catálogo em tablet](identidade-evidencias/catalogo-tablet.jpg) e [laboratório móvel](identidade-evidencias/laboratorio-mobile.jpg).

Não há pendência de integração identificada. A revisão visual foi feita no navegador Chromium integrado; outros navegadores, leitores de tela e a aparência do favicon em cada sistema operacional não foram avaliados fisicamente. A entrega permanece local, sem publicação externa.
