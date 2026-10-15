import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import {
  balance,
  emptyTree,
  height,
  TREE_LIMIT,
  type TreeAction,
  type TreeKind,
  type TreeState,
  type TreeStep,
} from '../../algorithms/trees/model';
import { treeTimeline } from '../../algorithms/trees/timeline';
import { usePlayback } from '../../engine/usePlayback';
import { PlaybackControls } from '../../components/PlaybackControls';
import { ExecutionPanel } from '../../components/network/ExecutionPanel';
import { LabSidebar, MobileAlgorithms } from '../../components/LaboratoryNavigation';
import { idleTreeStep, initialTree, treeActions, treeCode } from './content';
import { TreeSvg } from './TreeSvg';
import '../../styles/networks.css';

interface TreeRun {
  base: TreeState;
  steps: TreeStep[] | null;
  action: TreeAction;
  value: number;
  revision: number;
}
function TreeSession({
  kind,
  run,
  onStart,
  onReplace,
  onCancel,
}: {
  kind: TreeKind;
  run: TreeRun;
  onStart: (tree: TreeState, action: TreeAction, value: number) => void;
  onReplace: (tree: TreeState) => void;
  onCancel: () => void;
}) {
  const steps = run.steps ?? [idleTreeStep(run.base)],
    player = usePlayback(steps.length),
    step = steps[player.index]!;
  const busy = !!run.steps && player.index !== player.last;
  const [value, setValue] = useState(String(run.value)),
    [error, setError] = useState(''),
    [panel, setPanel] = useState(true),
    [preset, setPreset] = useState('balanced');
  const start = (action: TreeAction) => {
    if (busy) return;
    const number = Number(value);
    if (
      ['insert', 'remove', 'search'].includes(action) &&
      (!value.trim() || !Number.isInteger(number) || Math.abs(number) > 999)
    ) {
      setError('Informe um inteiro entre −999 e 999.');
      return;
    }
    setError('');
    onStart(step.tree, action, ['insert', 'remove', 'search'].includes(action) ? number : 0);
  };
  const presets: Record<string, number[]> = {
    balanced: [50, 30, 70, 20, 40, 60, 80],
    LL: [30, 20],
    RR: [10, 20],
    LR: [30, 10],
    RL: [10, 30],
  };
  return (
    <>
      <div className="lab-heading">
        <div>
          <div className="eyebrow">
            LABORATÓRIO <ChevronRight size={12} /> ÁRVORES
          </div>
          <h1>
            {kind === 'bst' ? 'Árvore Binária de Busca' : 'Árvore AVL'}
            <span className="badge">{kind.toUpperCase()}</span>
          </h1>
          <p>
            {kind === 'bst'
              ? 'Cada comparação escolhe um ramo. Sem garantia de balanceamento.'
              : 'Alturas, fatores e rotações mantêm o caminho de busca curto.'}
          </p>
        </div>
        <button
          className="icon-button"
          aria-label={panel ? 'Recolher painel educativo' : 'Mostrar painel educativo'}
          aria-expanded={panel}
          onClick={() => setPanel(!panel)}
        >
          {panel ? <PanelRightClose /> : <PanelRightOpen />}
        </button>
      </div>
      <nav className="network-tabs" aria-label="Tipo de árvore">
        <Link className={kind === 'bst' ? 'active' : ''} to="/laboratorio/arvores/bst">
          BST
        </Link>
        <Link className={kind === 'avl' ? 'active' : ''} to="/laboratorio/arvores/avl">
          AVL
        </Link>
        <span>
          {kind === 'avl' ? 'Operações: O(log n)' : 'Operações: O(h), pior O(n)'} · até {TREE_LIMIT}{' '}
          nós
        </span>
      </nav>
      <div className={`lab-workspace network-workspace ${panel ? '' : 'wide'}`}>
        <div className="workspace-main">
          <section className="network-operation-panel">
            <fieldset disabled={busy}>
              <legend>Operações na árvore</legend>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  start('insert');
                }}
                className="network-form"
              >
                <label>
                  Valor
                  <input
                    aria-label="Valor da árvore"
                    type="number"
                    min="-999"
                    max="999"
                    step="1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </label>
                <button className="button primary" type="submit">
                  Inserir
                </button>
                <button className="button" type="button" onClick={() => start('search')}>
                  Buscar
                </button>
                <button className="button danger" type="button" onClick={() => start('remove')}>
                  Remover
                </button>
              </form>
              <div className="network-traversals">
                <span>Percorrer</span>
                {(['inorder', 'preorder', 'postorder', 'levelorder'] as const).map((a) => (
                  <button className="button" key={a} onClick={() => start(a)}>
                    {treeActions[a]}
                  </button>
                ))}
              </div>
              <div className="network-form secondary-operations">
                <label>
                  Exemplo
                  <select value={preset} onChange={(e) => setPreset(e.target.value)}>
                    <option value="balanced">Árvore equilibrada</option>
                    {kind === 'avl' && (
                      <>
                        <option value="LL">Base LL · insira 10</option>
                        <option value="RR">Base RR · insira 30</option>
                        <option value="LR">Base LR · insira 20</option>
                        <option value="RL">Base RL · insira 20</option>
                      </>
                    )}
                  </select>
                </label>
                <button
                  className="button"
                  onClick={() => onReplace(initialTree(kind, presets[preset]!))}
                >
                  Gerar exemplo
                </button>
                <button
                  className="button"
                  onClick={() => onReplace({ ...emptyTree(), nextId: step.tree.nextId })}
                >
                  Limpar árvore
                </button>
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            {busy ? (
              <div className="network-notice">
                <p>
                  Conclua a timeline para usar o resultado na próxima operação. Cancelar restaura a
                  árvore inicial.
                </p>
                <button className="button" onClick={onCancel}>
                  Cancelar operação
                </button>
              </div>
            ) : (
              <p className="network-help">
                Valores únicos · altura: vazia = 0, folha = 1 · uma nova operação começa no
                resultado exibido.
              </p>
            )}
          </section>
          <section className="visual-panel">
            <div className="visual-panel-heading">
              <span>
                <i className={`status-dot ${player.playing ? 'live' : ''}`} />
                {run.steps
                  ? `${treeActions[run.action]} · ${player.playing ? 'executando' : player.index === player.last ? 'concluída' : 'pausada'}`
                  : 'Pronto para explorar'}
              </span>
              <span className="mono">
                {player.index} / {player.last} etapas
              </span>
            </div>
            <TreeSvg step={step} avl={kind === 'avl'} />
            <div className="legend">
              <span>
                <i className="primary" />
                Ativo
              </span>
              <span>
                <i className="amber" />
                Comparação
              </span>
              <span>
                <i />
                Visitado
              </span>
              <span>
                <i className="green" />
                Encontrado / inserido
              </span>
            </div>
            <fieldset className="player-fieldset" disabled={!run.steps}>
              <PlaybackControls player={player} />
            </fieldset>
          </section>
          <div className="network-metrics">
            <div>
              <span>Nós</span>
              <strong>{Object.keys(step.tree.nodes).length}</strong>
            </div>
            <div>
              <span>Altura</span>
              <strong>{height(step.tree, step.tree.root)}</strong>
            </div>
            <div>
              <span>Comparações</span>
              <strong>{step.metrics.comparisons}</strong>
            </div>
            <div>
              <span>Rotações</span>
              <strong>{step.metrics.rotations}</strong>
            </div>
            {kind === 'avl' && (
              <div>
                <span>Fator do nó ativo</span>
                <strong>
                  {step.current && step.tree.nodes[step.current]
                    ? balance(step.tree, step.current)
                    : '—'}
                </strong>
              </div>
            )}
          </div>
          <section className="network-output" aria-label="Resultado do percurso">
            <h3>Sequência de visita</h3>
            <p>
              {step.output.length
                ? step.output.join(' → ')
                : 'Execute um percurso para acompanhar a sequência, nó a nó.'}
            </p>
          </section>
        </div>
        {panel && (
          <ExecutionPanel step={step} code={treeCode(run.action, kind)}>
            <section className="complexity">
              <h3>Complexidade da estrutura</h3>
              <dl>
                <div>
                  <dt>Inserir / buscar / remover</dt>
                  <dd>{kind === 'avl' ? 'O(log n)' : 'O(h); pior O(n)'}</dd>
                </div>
                <div>
                  <dt>Percursos</dt>
                  <dd>O(n)</dd>
                </div>
                <div>
                  <dt>Memória da operação</dt>
                  <dd>O(h); largura O(w)</dd>
                </div>
              </dl>
              <p>
                h = altura; w = maior largura. Memória da árvore O(n). Snapshots e layout não estão
                incluídos.
              </p>
            </section>
            <details className="educational">
              <summary>Entenda esta estrutura</summary>
              <h4>Como funciona</h4>
              <p>
                Esquerda contém valores menores; direita contém valores maiores. Duplicados são
                rejeitados. Uma BST pode virar uma cadeia; na AVL, fatores entre −1 e 1 garantem
                altura logarítmica.
              </p>
              <h4>Remoção com dois filhos</h4>
              <p>
                Selecionamos o menor nó da subárvore direita. Seu valor é transferido ao nó
                original; a identidade do sucessor é removida e seu filho direito é ligado ao pai. A
                transferência e a retirada são uma alteração atômica do snapshot.
              </p>
              <h4>Quando usar</h4>
              <p>
                Índices ordenados em memória, consultas e enumeração de chaves. AVL oferece caminhos
                curtos em troca de manutenção de alturas e rotações.
              </p>
              <h4>Vocabulário</h4>
              <p>
                Raiz: nó sem pai. Pai e filho: nós ligados em níveis consecutivos. Folha: nó sem
                filhos. Profundidade: número de arestas desde a raiz. Altura: níveis até a folha
                mais distante. Fator: altura esquerda menos direita. Rotação: mudança de ligações
                que preserva a ordem.
              </p>
              <h4>Reprodução e confirmação</h4>
              <p>
                Avance até o fim antes de outra operação. Retroceder ou reiniciar reabre a
                exploração da operação e bloqueia novas alterações. Cancelar descarta a operação e
                restaura sua entrada. Trocar BST/AVL carrega um exemplo independente.
              </p>
            </details>
          </ExecutionPanel>
        )}
      </div>
    </>
  );
}
function TreeWorkspace({ kind }: { kind: TreeKind }) {
  const [run, setRun] = useState<TreeRun>(() => ({
    base: initialTree(kind),
    steps: null,
    action: 'insert',
    value: 45,
    revision: 0,
  }));
  return (
    <TreeSession
      key={run.revision}
      kind={kind}
      run={run}
      onStart={(tree, action, value) =>
        setRun((r) => ({
          base: tree,
          steps: treeTimeline(tree, kind, action, value),
          action,
          value,
          revision: r.revision + 1,
        }))
      }
      onReplace={(tree) =>
        setRun((r) => ({ ...r, base: tree, steps: null, revision: r.revision + 1 }))
      }
      onCancel={() => setRun((r) => ({ ...r, steps: null, revision: r.revision + 1 }))}
    />
  );
}
export default function TreeLaboratory() {
  const { algorithm } = useParams();
  const kind = algorithm === 'avl' ? 'avl' : 'bst';
  return (
    <main id="conteudo" className="lab-layout">
      <LabSidebar />
      <div className="lab-content">
        <MobileAlgorithms />
        {algorithm === 'bst' || algorithm === 'avl' ? (
          <TreeWorkspace key={kind} kind={kind} />
        ) : (
          <div className="empty-state">
            <h1>Árvore não encontrada</h1>
            <Link className="button" to="/laboratorio/arvores/bst">
              Abrir BST
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
