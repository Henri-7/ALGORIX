import { motion, useReducedMotion } from 'motion/react';
import type { Step } from '../engine/types';
export function Visualization({ step, small = false }: { step: Step; small?: boolean }) {
  const max = Math.max(1, ...step.values.map(Math.abs));
  const reduceMotion = useReducedMotion();
  return (
    <div
      className={`visualization ${small ? 'small' : ''}`}
      role="img"
      aria-label={`Valores: ${step.values.join(', ')}. ${step.message}`}
    >
      <div className="chart-grid" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="bars" aria-hidden="true">
        {step.values.map((value, i) => {
          const active = step.active.includes(i);
          const done = step.family === 'sorting' ? step.settled.includes(i) : step.found === i;
          const pivot = step.family === 'sorting' && step.pivot === i;
          const discarded = step.family === 'searching' && (i < step.left || i > step.right);
          const visited = step.family === 'searching' && step.visited.includes(i);
          const state = done
            ? 'done'
            : active
              ? step.operation === 'comparacao'
                ? 'comparing'
                : 'moving'
              : pivot
                ? 'pivot'
                : visited
                  ? 'visited'
                  : '';
          return (
            <div className={`bar-column ${discarded ? 'discarded' : ''}`} key={i}>
              <div className="bar-space">
                <motion.div
                  className={`bar ${state} ${value < 0 ? 'negative' : ''}`}
                  animate={{ height: `${(Math.abs(value) / max) * 82}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.15 }}
                >
                  <span className="bar-value">{value}</span>
                  {pivot && <span className="bar-marker">P</span>}
                  {done && !small && <span className="bar-marker">✓</span>}
                </motion.div>
              </div>
              <span className="bar-index">{i}</span>
              {step.family === 'searching' && (
                <span className="bound-label">
                  {i === step.left && 'E'}
                  {i === step.right && 'D'}
                  {active && ' · M'}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {step.values.length === 0 && <p>Entrada vazia.</p>}
    </div>
  );
}
export function Legend({ search = false }: { search?: boolean }) {
  return (
    <div className="legend">
      <span>
        <i className="unvisited" />
        Não visitado
      </span>
      <span>
        <i className="amber" />
        Comparando
      </span>
      <span>
        <i className={search ? 'accent' : 'primary'} />
        {search ? 'Visitado' : 'Movendo / pivô'}
      </span>
      <span>
        <i className="green" />
        {search ? 'Encontrado' : 'Concluído'}
      </span>
    </div>
  );
}
export function Metrics({ step }: { step: Step }) {
  return (
    <div className="metrics">
      {[
        ['Comparações', step.metrics.comparisons],
        ['Trocas', step.metrics.swaps],
        ['Escritas', step.metrics.writes],
      ].map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{String(value).padStart(2, '0')}</strong>
        </div>
      ))}
    </div>
  );
}
