import { useState } from 'react';
import {
  addEdge,
  addNode,
  emptyGraph,
  GRAPH_EDGE_LIMIT,
  GRAPH_NODE_LIMIT,
  moveNode,
  removeEdge,
  removeNode,
  setDirection,
  setWeight,
  type GraphState,
} from '../../algorithms/graphs/model';
import { exampleGraph, graphExamples, type GraphExample } from '../../algorithms/graphs/examples';
import type { EditMode } from './GraphSvg';
interface Props {
  graph: GraphState;
  mode: EditMode;
  setMode: (mode: EditMode) => void;
  selectedNode: string;
  selectedEdge: string;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onChange: (g: GraphState, message: string) => void;
  onInteract: () => void;
  weight: string;
  setWeightDraft: (v: string) => void;
}
export function GraphEditor({
  graph,
  mode,
  setMode,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
  onChange,
  onInteract,
  weight,
  setWeightDraft,
}: Props) {
  const [from, setFrom] = useState(graph.nodes[0]?.id ?? ''),
    [to, setTo] = useState(graph.nodes[1]?.id ?? ''),
    [example, setExample] = useState<GraphExample>('weighted'),
    [error, setError] = useState('');
  const node = graph.nodes.find((n) => n.id === selectedNode),
    edge = graph.edges.find((e) => e.id === selectedEdge);
  const [x, setX] = useState(String(node?.x ?? 0)),
    [y, setY] = useState(String(node?.y ?? 0)),
    [edgeWeight, setEdgeWeight] = useState(String(edge?.weight ?? 1));
  const change = (fn: () => GraphState, message: string) => {
    onInteract();
    try {
      onChange(fn(), message);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };
  const readWeight = (s: string) => {
    if (!s.trim()) throw new Error('Informe um peso numérico.');
    return Number(s);
  };
  const label = (id: string) => graph.nodes.find((n) => n.id === id)?.label ?? '—';
  return (
    <section className="network-operation-panel graph-editor">
      <div className="section-label">
        <h3>Editor de grafos</h3>
        <span>
          Até {GRAPH_NODE_LIMIT} nós / {GRAPH_EDGE_LIMIT} arestas
        </span>
      </div>
      <div className="network-form">
        <button
          className="button"
          onClick={() =>
            change(() => addNode(graph), 'Nó adicionado. Você pode selecioná-lo e reposicioná-lo.')
          }
        >
          Adicionar nó
        </button>
        <label>
          Modo de interação
          <select
            aria-label="Modo de interação"
            value={mode}
            onChange={(e) => {
              onInteract();
              setMode(e.target.value as EditMode);
            }}
          >
            <option value="move">Selecionar / mover</option>
            <option value="connect">Conectar nós</option>
          </select>
        </label>
        <label>
          Direção
          <select
            aria-label="Direção do grafo"
            value={String(graph.directed)}
            onChange={(e) =>
              change(
                () => setDirection(graph, e.target.value === 'true'),
                e.target.value === 'true'
                  ? 'Grafo direcionado: cada aresta segue sua origem e destino cadastrados.'
                  : 'Grafo não direcionado: conexões recíprocas foram unificadas pelo menor peso.',
              )
            }
          >
            <option value="false">Não direcionado</option>
            <option value="true">Direcionado</option>
          </select>
        </label>
      </div>
      <p className="network-help">
        {mode === 'connect'
          ? 'Clique na origem e depois no destino. O peso abaixo será usado.'
          : 'Arraste um nó para movê-lo. Por teclado, selecione o nó e use as setas; ou edite X/Y abaixo.'}{' '}
        Ao retirar a direção, arestas recíprocas são unificadas pelo menor peso. Laços e arestas
        paralelas são proibidos.
      </p>
      <details open>
        <summary>Conexões</summary>
        <form
          className="network-form"
          onSubmit={(e) => {
            e.preventDefault();
            change(() => addEdge(graph, from, to, readWeight(weight)), 'Conexão criada.');
          }}
        >
          <label>
            De
            <select
              aria-label="Origem da conexão"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              <option value="">Selecione</option>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Para
            <select
              aria-label="Destino da conexão"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              <option value="">Selecione</option>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Peso
            <input
              aria-label="Peso da conexão"
              type="number"
              step="any"
              min="0"
              max="9999"
              value={weight}
              onChange={(e) => setWeightDraft(e.target.value)}
            />
          </label>
          <button className="button" type="submit">
            Criar aresta
          </button>
        </form>
        <div className="network-form">
          <label>
            Aresta selecionada
            <select
              aria-label="Aresta selecionada"
              value={selectedEdge}
              onChange={(e) => {
                onSelectEdge(e.target.value);
                setEdgeWeight(
                  String(graph.edges.find((item) => item.id === e.target.value)?.weight ?? 1),
                );
              }}
            >
              <option value="">Selecione</option>
              {graph.edges.map((e) => (
                <option key={e.id} value={e.id}>
                  {label(e.from)} {graph.directed ? '→' : '↔'} {label(e.to)} · {e.weight}
                </option>
              ))}
            </select>
          </label>
          <label>
            Novo peso
            <input
              aria-label="Novo peso"
              type="number"
              step="any"
              min="0"
              max="9999"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(e.target.value)}
            />
          </label>
          <button
            className="button"
            disabled={!edge}
            onClick={() =>
              change(
                () => setWeight(graph, selectedEdge, readWeight(edgeWeight)),
                'Peso atualizado. A execução anterior foi invalidada.',
              )
            }
          >
            Atualizar peso
          </button>
          <button
            className="button danger"
            disabled={!edge}
            onClick={() => change(() => removeEdge(graph, selectedEdge), 'Aresta removida.')}
          >
            Remover aresta
          </button>
        </div>
      </details>
      <details>
        <summary>Selecionar, mover ou remover nó</summary>
        <div className="network-form">
          <label>
            Nó
            <select
              aria-label="Nó selecionado"
              value={selectedNode}
              onChange={(e) => {
                onSelectNode(e.target.value);
                const n = graph.nodes.find((v) => v.id === e.target.value);
                setX(String(n?.x ?? 0));
                setY(String(n?.y ?? 0));
              }}
            >
              <option value="">Selecione</option>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            X
            <input
              aria-label="Coordenada X"
              type="number"
              value={x}
              onChange={(e) => setX(e.target.value)}
            />
          </label>
          <label>
            Y
            <input
              aria-label="Coordenada Y"
              type="number"
              value={y}
              onChange={(e) => setY(e.target.value)}
            />
          </label>
          <button
            className="button"
            disabled={!node}
            onClick={() =>
              change(() => {
                if (!x.trim() || !y.trim()) throw new Error('Informe X e Y.');
                return moveNode(graph, selectedNode, Number(x), Number(y));
              }, 'Nó reposicionado; as conexões acompanham sua posição.')
            }
          >
            Mover nó
          </button>
          <button
            className="button danger"
            disabled={!node}
            onClick={() =>
              change(
                () => removeNode(graph, selectedNode),
                'Nó e suas arestas incidentes removidos.',
              )
            }
          >
            Remover nó
          </button>
        </div>
      </details>
      <div className="network-form secondary-operations">
        <label>
          Exemplo
          <select value={example} onChange={(e) => setExample(e.target.value as GraphExample)}>
            {Object.entries(graphExamples).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button"
          onClick={() =>
            change(
              () => exampleGraph(example, graph.directed),
              'Exemplo carregado; seleções e execução atualizadas.',
            )
          }
        >
          Gerar exemplo
        </button>
        <button
          className="button"
          onClick={() =>
            change(
              () => ({
                ...emptyGraph(graph.directed),
                nextNodeId: graph.nextNodeId,
                nextEdgeId: graph.nextEdgeId,
              }),
              'Grafo limpo. Adicione nós para começar.',
            )
          }
        >
          Limpar grafo
        </button>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </section>
  );
}
