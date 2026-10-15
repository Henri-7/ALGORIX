import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { balance, treeEdge, type TreeStep } from '../../algorithms/trees/model';
import { layoutTree } from '../../algorithms/trees/layout';
import { SvgViewport } from '../../components/network/SvgViewport';
function NodePresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <g aria-hidden={!present}>{children}</g>;
}
export function TreeSvg({ step, avl }: { step: TreeStep; avl: boolean }) {
  const layout = layoutTree(step.tree),
    reduce = useReducedMotion(),
    transition = { duration: reduce ? 0 : 0.15, ease: 'easeInOut' as const };
  const nodes = Object.values(step.tree.nodes);
  return (
    <>
      <SvgViewport
        width={layout.width}
        height={layout.height}
        left={layout.left}
        label="Visualização da árvore"
      >
        <title>
          Árvore: {nodes.length} nós. {step.message}
        </title>
        <AnimatePresence>
          {nodes.flatMap((n) =>
            [n.left, n.right]
              .filter((id): id is string => !!id)
              .map((id) => {
                const a = layout.positions[n.id]!,
                  b = layout.positions[id]!;
                return (
                  <motion.line
                    key={treeEdge(n.id, id)}
                    className={`network-edge ${step.activeEdges.includes(treeEdge(n.id, id)) ? 'active' : ''}`}
                    initial={{ x1: a.x, y1: a.y, x2: a.x, y2: a.y, opacity: 0 }}
                    animate={{ x1: a.x, y1: a.y + 25, x2: b.x, y2: b.y - 25, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                  />
                );
              }),
          )}
        </AnimatePresence>
        <AnimatePresence>
          {nodes.map((n) => {
            const p = layout.positions[n.id]!,
              state =
                step.found === n.id
                  ? 'found'
                  : step.operation === 'Remover' && step.participants.includes(n.id)
                    ? 'removing'
                    : step.current === n.id
                      ? step.operation === 'Comparação'
                        ? 'comparing'
                        : 'current'
                      : step.participants.includes(n.id)
                        ? 'participant'
                        : step.visited.includes(n.id)
                          ? 'visited'
                          : '';
            return (
              <NodePresence key={n.id}>
                <motion.g
                  className={`network-node ${state}`}
                  initial={{ x: p.x, y: p.y, opacity: 0, scale: 0.8 }}
                  animate={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={transition}
                  role="img"
                  aria-label={`Valor ${n.value}${n.parent ? '' : ', raiz'}, altura ${n.height}${avl ? `, fator ${balance(step.tree, n.id)}` : ''}`}
                >
                  <circle r="25" />
                  <text textAnchor="middle" dominantBaseline="central">
                    {n.value}
                  </text>
                  {!n.parent && (
                    <text className="node-caption" textAnchor="middle" y="-38">
                      RAIZ
                    </text>
                  )}
                  {avl && (
                    <text className="node-caption" textAnchor="middle" y="43">
                      h{n.height} · f{balance(step.tree, n.id)}
                    </text>
                  )}
                  {step.found === n.id && (
                    <text className="node-badge" x="26" y="-20">
                      ✓
                    </text>
                  )}
                </motion.g>
              </NodePresence>
            );
          })}
        </AnimatePresence>
        {!nodes.length && (
          <text
            className="empty-svg"
            x={layout.left + layout.width / 2}
            y="160"
            textAnchor="middle"
          >
            Árvore vazia. Insira o primeiro valor.
          </text>
        )}
      </SvgViewport>
      <details className="network-text-data">
        <summary>Representação textual da árvore ({nodes.length} nós)</summary>
        <ul>
          {nodes.map((n) => (
            <li key={n.id}>
              {n.value}
              {!n.parent ? ' (raiz)' : ''} · esquerda:{' '}
              {n.left ? step.tree.nodes[n.left]!.value : 'vazia'} · direita:{' '}
              {n.right ? step.tree.nodes[n.right]!.value : 'vazia'} · altura {n.height}
              {avl ? ` · fator ${balance(step.tree, n.id)}` : ''}
            </li>
          ))}
        </ul>
        {!nodes.length && <p>Não há nós.</p>}
      </details>
    </>
  );
}
