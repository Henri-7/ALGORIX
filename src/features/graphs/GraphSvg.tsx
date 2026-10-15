import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { GraphEdge, GraphNode, GraphStep } from '../../algorithms/graphs/model';
import { SvgViewport } from '../../components/network/SvgViewport';
export type EditMode = 'move' | 'connect';
interface Drag {
  id: string;
  pointer: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  moved: boolean;
}
function geometry(edge: GraphEdge, nodes: GraphNode[], reciprocal: boolean) {
  const a = nodes.find((n) => n.id === edge.from)!,
    b = nodes.find((n) => n.id === edge.to)!,
    dx = b.x - a.x,
    dy = b.y - a.y,
    d = Math.max(1, Math.hypot(dx, dy));
  const sx = a.x + (dx / d) * 29,
    sy = a.y + (dy / d) * 29,
    ex = b.x - (dx / d) * 31,
    ey = b.y - (dy / d) * 31;
  const cx = (a.x + b.x) / 2 - (dy / d) * (reciprocal ? 42 : 0),
    cy = (a.y + b.y) / 2 + (dx / d) * (reciprocal ? 42 : 0);
  return {
    path: reciprocal ? `M${sx},${sy} Q${cx},${cy} ${ex},${ey}` : `M${sx},${sy} L${ex},${ey}`,
    x: (sx + ex) / 4 + cx / 2,
    y: (sy + ey) / 4 + cy / 2,
  };
}
export function GraphSvg({
  step,
  mode,
  selectedNode,
  selectedEdge,
  anchor,
  focusNode,
  onNode,
  onEdge,
  onMove,
  onInteraction,
}: {
  step: GraphStep;
  mode: EditMode;
  selectedNode: string;
  selectedEdge: string;
  anchor: string | null;
  focusNode?: string | null;
  onNode: (id: string) => void;
  onEdge: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onInteraction: () => void;
}) {
  const arrow = useId().replace(/:/g, ''),
    reduce = useReducedMotion(),
    dragRef = useRef<Drag | null>(null),
    nodeRefs = useRef(new Map<string, SVGGElement>()),
    [drag, setDrag] = useState<Drag | null>(null);
  useEffect(() => {
    if (focusNode) nodeRefs.current.get(focusNode)?.focus({ preventScroll: true });
  }, [focusNode]);
  const nodes = step.graph.nodes.map((n) =>
    drag?.id === n.id ? { ...n, x: drag.x, y: drag.y } : n,
  );
  const toPoint = (e: PointerEvent<SVGGElement>) => {
    const svg = e.currentTarget.ownerSVGElement!,
      matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(matrix.inverse());
  };
  const pointerDown = (e: PointerEvent<SVGGElement>, n: GraphNode) => {
    if (mode !== 'move' || e.button !== 0 || dragRef.current) return;
    onInteraction();
    const p = toPoint(e);
    dragRef.current = {
      id: n.id,
      pointer: e.pointerId,
      x: n.x,
      y: n.y,
      startX: p.x - n.x,
      startY: p.y - n.y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const pointerMove = (e: PointerEvent<SVGGElement>) => {
    const d = dragRef.current;
    if (!d || d.pointer !== e.pointerId) return;
    const p = toPoint(e),
      x = Math.max(35, Math.min(765, p.x - d.startX)),
      y = Math.max(35, Math.min(465, p.y - d.startY));
    const next = { ...d, x, y, moved: d.moved || Math.hypot(x - d.x, y - d.y) > 2 };
    dragRef.current = next;
    setDrag(next);
  };
  const pointerEnd = (e: PointerEvent<SVGGElement>, cancel = false) => {
    const d = dragRef.current;
    if (!d || d.pointer !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setDrag(null);
    if (!cancel && d.moved) onMove(d.id, d.x, d.y);
  };
  return (
    <SvgViewport width={800} height={500} label="Editor visual do grafo">
      <title>
        Grafo {step.graph.directed ? 'direcionado' : 'não direcionado'}: {nodes.length} nós e{' '}
        {step.graph.edges.length} arestas.
      </title>
      <defs>
        <marker
          id={arrow}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L8,4 L0,8 z" className="graph-arrow" />
        </marker>
      </defs>
      {step.graph.edges.map((edge) => {
        const geo = geometry(
          edge,
          nodes,
          step.graph.directed &&
            step.graph.edges.some((e) => e.from === edge.to && e.to === edge.from),
        );
        const inPath = step.path.some(
          (id, i) =>
            i > 0 &&
            ((step.path[i - 1] === edge.from && id === edge.to) ||
              (!step.graph.directed && step.path[i - 1] === edge.to && id === edge.from)),
        );
        const a = nodes.find((n) => n.id === edge.from)!,
          b = nodes.find((n) => n.id === edge.to)!;
        return (
          <g
            key={edge.id}
            className={`graph-edge-group ${selectedEdge === edge.id ? 'selected' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`Aresta ${a.label} ${step.graph.directed ? 'para' : 'com'} ${b.label}, peso ${edge.weight}`}
            onClick={() => onEdge(edge.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEdge(edge.id);
              }
            }}
          >
            <path d={geo.path} className="edge-hit-area" />
            <path
              d={geo.path}
              className={`network-edge ${inPath ? 'path' : step.activeEdge === edge.id ? 'active' : ''}`}
              markerEnd={step.graph.directed ? `url(#${arrow})` : undefined}
            />
            <rect
              className="edge-label-bg"
              x={geo.x - 24}
              y={geo.y - 12}
              width="48"
              height="23"
              rx="5"
            />
            <text className="edge-label" x={geo.x} y={geo.y + 4} textAnchor="middle">
              {edge.weight}
            </text>
          </g>
        );
      })}
      {nodes.map((n) => {
        const state = step.path.includes(n.id)
          ? 'found'
          : step.current === n.id
            ? 'current'
            : step.finished.includes(n.id)
              ? 'finished'
              : step.discovery.includes(n.id)
                ? 'visited'
                : '';
        return (
          <g
            key={n.id}
            ref={(element) => {
              if (element) nodeRefs.current.set(n.id, element);
              else nodeRefs.current.delete(n.id);
            }}
            transform={`translate(${n.x} ${n.y})`}
            className={`network-node graph-node ${state} ${n.id === selectedNode || n.id === anchor ? 'selected' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`Nó ${n.label}${n.id === step.source ? ', origem' : ''}${n.id === step.target ? ', destino' : ''}`}
            onPointerDown={(e) => pointerDown(e, n)}
            onPointerMove={pointerMove}
            onPointerUp={(e) => pointerEnd(e)}
            onPointerCancel={(e) => pointerEnd(e, true)}
            onClick={() => onNode(n.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNode(n.id);
              }
              const shifts: Record<string, [number, number]> = {
                ArrowLeft: [-10, 0],
                ArrowRight: [10, 0],
                ArrowUp: [0, -10],
                ArrowDown: [0, 10],
              };
              const delta = shifts[e.key];
              if (mode === 'move' && delta) {
                e.preventDefault();
                onMove(n.id, n.x + delta[0], n.y + delta[1]);
              }
            }}
          >
            <motion.circle
              r="26"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.15 }}
            />
            <text textAnchor="middle" dominantBaseline="central">
              {n.label}
            </text>
            {(n.id === step.source || n.id === step.target) && (
              <text className="node-caption" textAnchor="middle" y="-39">
                {n.id === step.source ? 'ORIGEM' : ''}
                {n.id === step.source && n.id === step.target ? ' / ' : ''}
                {n.id === step.target ? 'DESTINO' : ''}
              </text>
            )}
            {step.family === 'graph-dijkstra' && (
              <text className="node-caption" textAnchor="middle" y="43">
                d: {Number.isFinite(step.distances[n.id]) ? step.distances[n.id] : '∞'}
              </text>
            )}
          </g>
        );
      })}
      {!nodes.length && (
        <text x="400" y="230" textAnchor="middle" className="empty-svg">
          Grafo vazio. Use “Adicionar nó” para começar.
        </text>
      )}
    </SvgViewport>
  );
}
