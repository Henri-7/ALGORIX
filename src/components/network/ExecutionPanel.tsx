import type { ReactNode } from 'react';
import { Code2, Lightbulb } from 'lucide-react';
export function ExecutionPanel({
  step,
  code,
  children,
}: {
  step: { message: string; line: number; operation: string };
  code: string[];
  children: ReactNode;
}) {
  return (
    <aside className="info-panel network-info">
      <section className="step-explanation">
        <div className="eyebrow">
          <Lightbulb size={15} /> ETAPA ATUAL
        </div>
        <p aria-live="polite" aria-atomic="true">
          {step.message}
        </p>
        <span className={`operation-tag ${step.operation.startsWith('Remo') ? 'removal' : ''}`}>
          {step.operation}
        </span>
      </section>
      <section className="code-panel">
        <h3>
          <Code2 size={16} />
          Pseudocódigo <span>PT-BR</span>
        </h3>
        <ol>
          {code.map((text, i) => (
            <li
              key={i}
              className={step.line === i ? 'current-line' : ''}
              aria-current={step.line === i ? 'step' : undefined}
            >
              <span>{i + 1}</span>
              <code>{text}</code>
            </li>
          ))}
        </ol>
      </section>
      {children}
    </aside>
  );
}
