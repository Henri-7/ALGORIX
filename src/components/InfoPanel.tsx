import { Code2, Lightbulb } from 'lucide-react';
import type { Algorithm } from '../data/algorithms';
import type { Step } from '../engine/types';
export function InfoPanel({ algorithm, step }: { algorithm: Algorithm; step: Step }) {
  return (
    <aside className="info-panel">
      <section className="step-explanation">
        <div className="eyebrow">
          <Lightbulb size={15} /> ETAPA ATUAL
        </div>
        <p aria-live="polite" aria-atomic="true">
          {step.message}
        </p>
        <span className={`operation-tag ${step.operation}`}>
          {step.operation === 'comparacao'
            ? 'Comparação'
            : step.operation === 'selecao'
              ? 'Seleção'
              : step.operation === 'concluido'
                ? 'Concluído'
                : step.operation === 'inicio'
                  ? 'Pronto para começar'
                  : step.operation === 'troca'
                    ? 'Troca'
                    : 'Escrita'}
        </span>
      </section>
      <section className="code-panel">
        <h3>
          <Code2 size={16} /> Pseudocódigo <span>PT-BR</span>
        </h3>
        <ol>
          {algorithm.code.map((line, i) => (
            <li
              key={i}
              className={step.line === i ? 'current-line' : ''}
              aria-current={step.line === i ? 'step' : undefined}
            >
              <span>{i + 1}</span>
              <code>{line}</code>
            </li>
          ))}
        </ol>
      </section>
      <section className="complexity">
        <h3>Complexidade teórica</h3>
        <dl>
          <div>
            <dt>Melhor caso</dt>
            <dd>{algorithm.best}</dd>
          </div>
          <div>
            <dt>Caso médio</dt>
            <dd>{algorithm.average}</dd>
          </div>
          <div>
            <dt>Pior caso</dt>
            <dd>{algorithm.worst}</dd>
          </div>
          <div>
            <dt>Espaço auxiliar</dt>
            <dd>{algorithm.space}</dd>
          </div>
          <div>
            <dt>Estável</dt>
            <dd>{algorithm.stable}</dd>
          </div>
        </dl>
        <p>Custos do algoritmo, sem incluir snapshots e interface.</p>
      </section>
      <details className="educational">
        <summary>Entenda este algoritmo</summary>
        <h4>Como funciona</h4>
        <p>{algorithm.how}</p>
        <h4>Quando usar</h4>
        <p>{algorithm.use}</p>
        <h4>Vantagens</h4>
        <p>{algorithm.advantage}</p>
        <h4>Limitações</h4>
        <p>{algorithm.limitation}</p>
      </details>
    </aside>
  );
}
