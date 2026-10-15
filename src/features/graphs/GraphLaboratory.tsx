import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import {
  addEdge,
  moveNode,
  type GraphAlgorithm,
  type GraphState,
  type GraphStep,
} from '../../algorithms/graphs/model';
import { exampleGraph } from '../../algorithms/graphs/examples';
import { graphTimeline } from '../../algorithms/graphs/timeline';
import { networkAlgorithms } from '../../data/networkAlgorithms';
import { usePlayback } from '../../engine/usePlayback';
import { PlaybackControls } from '../../components/PlaybackControls';
import { LabSidebar, MobileAlgorithms } from '../../components/LaboratoryNavigation';
import { ExecutionPanel } from '../../components/network/ExecutionPanel';
import { GraphSvg, type EditMode } from './GraphSvg';
import { GraphEditor } from './GraphEditor';
import { graphCode, idleGraphStep } from './content';
import '../../styles/networks.css';

interface Scene {
  graph: GraphState;
  source: string;
  target: string | null;
  steps: GraphStep[] | null;
  revision: number;
  notice: string;
  selectedNode: string;
  selectedEdge: string;
  focusNode: string | null;
}
function GraphSession({
  scene,
  algorithm,
  mode,
  onMode,
  onChange,
  onEndpoints,
  onRun,
  onCancel,
}: {
  scene: Scene;
  algorithm: GraphAlgorithm;
  mode: EditMode;
  onMode: (m: EditMode) => void;
  onChange: (
    g: GraphState,
    message: string,
    node: string,
    edge: string,
    focusNode?: string,
  ) => void;
  onEndpoints: (source: string, target: string | null) => void;
  onRun: () => void;
  onCancel: () => void;
}) {
  const steps = scene.steps ?? [idleGraphStep(scene.graph, algorithm, scene.source, scene.target)],
    player = usePlayback(steps.length),
    step = steps[player.index]!;
  const [panel, setPanel] = useState(true),
    [selectedNode, setSelectedNode] = useState(scene.selectedNode),
    [selectedEdge, setSelectedEdge] = useState(scene.selectedEdge),
    [anchor, setAnchor] = useState<string | null>(null),
    [weight, setWeightDraft] = useState('1'),
    [error, setError] = useState('');
  const algorithmInfo = networkAlgorithms.find((a) => a.id === algorithm)!;
  const label = (id: string) => scene.graph.nodes.find((n) => n.id === id)?.label ?? '—';
  const change = (g: GraphState, message: string) =>
    onChange(g, message, selectedNode, selectedEdge);
  const pause = () => player.seek(player.index);
  const onNode = (id: string) => {
    pause();
    setSelectedNode(id);
    if (mode !== 'connect') return;
    if (!anchor) {
      setAnchor(id);
      setError('');
      return;
    }
    try {
      if (!weight.trim()) throw new Error('Informe o peso da conexão.');
      change(
        addEdge(scene.graph, anchor, id, Number(weight)),
        `Conexão ${label(anchor)} → ${label(id)} criada.`,
      );
      setAnchor(null);
    } catch (err) {
      setError((err as Error).message);
      setAnchor(null);
    }
  };
  const handleMove = (id: string, x: number, y: number) => {
    pause();
    onChange(
      moveNode(scene.graph, id, x, y),
      `Nó ${label(id)} reposicionado.`,
      id,
      selectedEdge,
      id,
    );
  };
  return (
    <>
      <div className="lab-heading">
        <div>
          <div className="eyebrow">
            LABORATÓRIO <ChevronRight size={12} /> GRAFOS
          </div>
          <h1>
            {algorithmInfo.name}
            <span className="badge">Grafos</span>
          </h1>
          <p>{algorithmInfo.description}</p>
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
      <nav className="network-tabs" aria-label="Algoritmo de grafo">
        {(['bfs', 'dfs', 'dijkstra'] as const).map((id) => (
          <Link
            key={id}
            className={algorithm === id ? 'active' : ''}
            to={`/laboratorio/grafos/${id}`}
          >
            {id === 'dijkstra' ? 'Dijkstra' : id.toUpperCase()}
          </Link>
        ))}
        <span>
          {scene.graph.directed ? 'Direcionado' : 'Não direcionado'} ·{' '}
          {algorithm === 'dijkstra' ? 'Pesos não negativos' : 'Pesos ignorados pelo percurso'}
        </span>
      </nav>
      <div className={`lab-workspace network-workspace ${panel ? '' : 'wide'}`}>
        <div className="workspace-main">
          <section className="network-operation-panel">
            <div className="network-form">
              <label>
                Origem
                <select
                  aria-label="Origem da execução"
                  value={scene.source}
                  onChange={(e) => onEndpoints(e.target.value, scene.target)}
                >
                  <option value="">Selecione</option>
                  {scene.graph.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Destino
                <select
                  aria-label="Destino da execução"
                  value={scene.target ?? ''}
                  onChange={(e) => onEndpoints(scene.source, e.target.value || null)}
                >
                  <option value="">Todos os alcançáveis</option>
                  {scene.graph.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button primary"
                onClick={() => {
                  try {
                    setError('');
                    onRun();
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
              >
                Preparar execução
              </button>
              {scene.steps && (
                <button className="button" onClick={onCancel}>
                  Cancelar execução
                </button>
              )}
            </div>
            <p className="network-help">
              Prepare a execução e use Reproduzir ou avance uma etapa. Edições, origem e destino
              invalidam a timeline anterior.
            </p>
            <p role="status" className="network-notice-text">
              {anchor
                ? `Conectar nós: origem ${label(anchor)} selecionada. Escolha o destino.`
                : scene.notice}
            </p>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
          </section>
          <section className="visual-panel">
            <div className="visual-panel-heading">
              <span>
                <i className={`status-dot ${player.playing ? 'live' : ''}`} />
                {player.playing
                  ? 'Executando'
                  : scene.steps
                    ? player.index === player.last
                      ? 'Execução concluída'
                      : 'Execução pausada'
                    : 'Edição do grafo'}
              </span>
              <span className="mono">
                {player.index} / {player.last} etapas
              </span>
            </div>
            <GraphSvg
              step={step}
              mode={mode}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              anchor={anchor}
              focusNode={scene.focusNode}
              onNode={onNode}
              onEdge={(id) => {
                pause();
                setSelectedEdge(id);
              }}
              onMove={handleMove}
              onInteraction={pause}
            />
            <div className="legend">
              <span>
                <i className="primary" />
                Atual
              </span>
              <span>
                <i />
                Descoberto
              </span>
              <span>
                <i className="amber" />
                Aresta analisada
              </span>
              <span>
                <i className="green" />
                Caminho
              </span>
            </div>
            <fieldset className="player-fieldset" disabled={!scene.steps}>
              <PlaybackControls player={player} />
            </fieldset>
          </section>
          <div className="network-metrics">
            <div>
              <span>Vértices / arestas</span>
              <strong>
                {scene.graph.nodes.length} / {scene.graph.edges.length}
              </strong>
            </div>
            <div>
              <span>Descobertos</span>
              <strong>{step.discovery.length}</strong>
            </div>
            <div>
              <span>Arestas analisadas</span>
              <strong>{step.metrics.edgeChecks}</strong>
            </div>
            <div>
              <span>Relaxamentos</span>
              <strong>{step.metrics.relaxations}</strong>
            </div>
          </div>
          <section className="network-output">
            <h3>
              {algorithm === 'bfs'
                ? 'Fila · próximo à esquerda'
                : algorithm === 'dfs'
                  ? 'Pilha de chamadas · topo à direita'
                  : 'Não finalizados · ordem de criação'}
            </h3>
            <p aria-label="Fronteira da execução">
              {step.frontier.map(label).join(' → ') || 'Vazia'}
            </p>
            <h3>Ordem de descoberta</h3>
            <p>{step.discovery.map(label).join(' → ') || 'Nenhum nó descoberto'}</p>
            <h3>Ordem de finalização</h3>
            <p>{step.finished.map(label).join(' → ') || 'Nenhum nó finalizado'}</p>
            {step.path.length > 0 && (
              <>
                <h3>
                  Caminho{' '}
                  {algorithm === 'dijkstra'
                    ? 'mínimo'
                    : algorithm === 'bfs'
                      ? 'com menos arestas'
                      : 'de exploração'}
                </h3>
                <p>
                  {step.path.map(label).join(' → ')}
                  {step.family === 'graph-dijkstra' && step.target
                    ? ` · custo ${step.distances[step.target]}`
                    : ''}
                </p>
              </>
            )}
          </section>
          <details className="network-text-data" open>
            <summary>Dados e estados dos vértices</summary>
            <div className="network-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nó</th>
                    <th>Estado</th>
                    <th>Predecessor</th>
                    {algorithm === 'dijkstra' && <th>Distância</th>}
                  </tr>
                </thead>
                <tbody>
                  {scene.graph.nodes.map((n) => (
                    <tr key={n.id}>
                      <th scope="row">{n.label}</th>
                      <td>
                        {step.current === n.id
                          ? 'Atual'
                          : step.finished.includes(n.id)
                            ? 'Finalizado'
                            : step.discovery.includes(n.id)
                              ? 'Descoberto'
                              : 'Não visitado'}
                        {n.id === scene.source ? ' · origem' : ''}
                        {n.id === scene.target ? ' · destino' : ''}
                      </td>
                      <td>{step.predecessors[n.id] ? label(step.predecessors[n.id]!) : '—'}</td>
                      {step.family === 'graph-dijkstra' && (
                        <td>
                          {Number.isFinite(step.distances[n.id]) ? step.distances[n.id] : '∞'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!scene.graph.nodes.length && <p>Grafo vazio.</p>}
          </details>
          <GraphEditor
            key={`${selectedNode}:${selectedEdge}`}
            graph={scene.graph}
            mode={mode}
            setMode={(m) => {
              onMode(m);
              setAnchor(null);
            }}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onSelectNode={(id) => {
              pause();
              setSelectedNode(id);
            }}
            onSelectEdge={(id) => {
              pause();
              setSelectedEdge(id);
            }}
            onChange={change}
            onInteract={pause}
            weight={weight}
            setWeightDraft={setWeightDraft}
          />
        </div>
        {panel && (
          <ExecutionPanel step={step} code={graphCode[algorithm]}>
            <section className="complexity">
              <h3>Complexidade</h3>
              <dl>
                <div>
                  <dt>Tempo</dt>
                  <dd>{algorithmInfo.worst}</dd>
                </div>
                <div>
                  <dt>Espaço, com adjacências</dt>
                  <dd>{algorithmInfo.space}</dd>
                </div>
              </dl>
              <p>
                V = vértices; E = arestas. Adjacências ordenadas são preparadas antes do percurso.
                Snapshots e desenho não estão incluídos.
              </p>
            </section>
            <details className="educational">
              <summary>Entenda o algoritmo</summary>
              <h4>Como funciona</h4>
              <p>{algorithmInfo.how}</p>
              <h4>Aplicações</h4>
              <p>{algorithmInfo.use}</p>
              <h4>Limitações</h4>
              <p>
                {algorithmInfo.limitation} Em empates de distância, Dijkstra mantém o primeiro
                predecessor; apenas melhorias estritas geram relaxamento.
              </p>
              <h4>Vocabulário</h4>
              <p>
                Vértice: nó da rede. Aresta: conexão entre nós. Direção: sentido permitido. Peso:
                custo de uma conexão. Caminho: sequência de conexões. Ciclo: caminho que retorna ao
                início. Descoberta inicia uma visita; finalização encerra seu processamento.
              </p>
              <p>
                Fila processa o primeiro a entrar (FIFO). Pilha retorna pela chamada mais recente
                (LIFO). Relaxar é melhorar uma distância provisória usando uma aresta.
              </p>
              <h4>Editar e reproduzir</h4>
              <p>
                Selecionar pausa; editar cancela a execução. Arestas acompanham o arraste. Trocar
                algoritmo carrega um exemplo independente. Dijkstra calcula todos os alcançáveis,
                mesmo quando há destino selecionado.
              </p>
            </details>
          </ExecutionPanel>
        )}
      </div>
    </>
  );
}
function GraphWorkspace({ algorithm }: { algorithm: GraphAlgorithm }) {
  const [scene, setScene] = useState<Scene>(() => ({
    graph: exampleGraph('weighted'),
    source: 'v1',
    target: 'v6',
    steps: null,
    revision: 0,
    notice: 'Exemplo ponderado carregado. Você pode editar os dados.',
    selectedNode: 'v1',
    selectedEdge: 'e1',
    focusNode: null,
  }));
  const [mode, setMode] = useState<EditMode>('move');
  return (
    <GraphSession
      key={scene.revision}
      scene={scene}
      algorithm={algorithm}
      mode={mode}
      onMode={setMode}
      onChange={(graph, notice, node, edge, focusNode) =>
        setScene((s) => ({
          ...s,
          graph,
          notice,
          focusNode: focusNode ?? null,
          source: graph.nodes.some((n) => n.id === s.source)
            ? s.source
            : (graph.nodes[0]?.id ?? ''),
          target: graph.nodes.some((n) => n.id === s.target) ? s.target : null,
          selectedNode: graph.nodes.some((n) => n.id === node) ? node : (graph.nodes[0]?.id ?? ''),
          selectedEdge: graph.edges.some((e) => e.id === edge) ? edge : (graph.edges[0]?.id ?? ''),
          steps: null,
          revision: s.revision + 1,
        }))
      }
      onEndpoints={(source, target) =>
        setScene((s) => ({
          ...s,
          source,
          target,
          focusNode: null,
          steps: null,
          revision: s.revision + 1,
          notice: 'Origem / destino atualizados. Prepare uma nova execução.',
        }))
      }
      onRun={() => {
        const steps = graphTimeline(scene.graph, algorithm, scene.source, scene.target);
        setScene((s) => ({
          ...s,
          steps,
          focusNode: null,
          revision: s.revision + 1,
          notice: 'Timeline preparada. Reproduza ou avance uma etapa.',
        }));
      }}
      onCancel={() =>
        setScene((s) => ({
          ...s,
          steps: null,
          focusNode: null,
          revision: s.revision + 1,
          notice: 'Execução cancelada. O grafo editável foi preservado.',
        }))
      }
    />
  );
}
export default function GraphLaboratory() {
  const { algorithm } = useParams();
  const valid = algorithm === 'bfs' || algorithm === 'dfs' || algorithm === 'dijkstra';
  return (
    <main id="conteudo" className="lab-layout">
      <LabSidebar />
      <div className="lab-content">
        <MobileAlgorithms />
        {valid ? (
          <GraphWorkspace key={algorithm} algorithm={algorithm} />
        ) : (
          <div className="empty-state">
            <h1>Algoritmo não encontrado</h1>
            <Link className="button" to="/laboratorio/grafos/bfs">
              Abrir BFS
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
