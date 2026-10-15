import { useState } from 'react';
import { Check, Shuffle } from 'lucide-react';
import { generateInput, MAX_SIZE, parseInput, type Pattern } from '../lib/input';
export function InputEditor({
  values,
  onApply,
  binary = false,
  onEdit,
}: {
  values: readonly number[];
  onApply: (a: number[]) => void;
  binary?: boolean;
  onEdit?: () => void;
}) {
  const [draft, setDraft] = useState(values.join(', ')),
    [size, setSize] = useState(values.length),
    [pattern, setPattern] = useState<Pattern>('aleatorio'),
    [error, setError] = useState('');
  const apply = (a: number[]) => {
    setError('');
    setDraft(a.join(', '));
    onApply(a);
  };
  return (
    <section className="input-editor">
      <div className="section-label">
        <h3>Dados de entrada</h3>
        <span>até {MAX_SIZE} elementos</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const a = parseInput(draft);
            if (binary && a.some((v, i) => i > 0 && v < a[i - 1]!))
              throw new Error('A busca binária exige ordem crescente. Use “Ordenar entrada”.');
            apply(a);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <label htmlFor="array-input">Valores separados por vírgulas</label>
        <div className="input-row">
          <input
            id="array-input"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError('');
              onEdit?.();
            }}
            spellCheck={false}
          />
          <button className="button" type="submit">
            <Check size={16} /> Aplicar
          </button>
        </div>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="generate-controls">
          <label>
            Tamanho{' '}
            <input
              aria-label="Tamanho da entrada"
              type="number"
              min="2"
              max={MAX_SIZE}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          <label className="pattern-label">
            Distribuição{' '}
            <select value={pattern} onChange={(e) => setPattern(e.target.value as Pattern)}>
              <option value="aleatorio">Aleatória</option>
              <option value="crescente">Crescente</option>
              <option value="decrescente">Decrescente</option>
              <option value="quase">Quase ordenada</option>
              <option value="repetidos">Valores repetidos</option>
            </select>
          </label>
          <button
            type="button"
            className="button"
            onClick={() => {
              if (!Number.isInteger(size) || size < 2 || size > MAX_SIZE) {
                setError(`Escolha um tamanho entre 2 e ${MAX_SIZE}.`);
                return;
              }
              const a = generateInput(size, pattern);
              if (binary && pattern !== 'crescente') {
                setDraft(a.join(', '));
                onEdit?.();
                setError('Entrada gerada. Ordene os valores antes de aplicar à busca binária.');
              } else apply(a);
            }}
          >
            <Shuffle size={15} /> Gerar
          </button>
          {binary && (
            <button
              className="button"
              type="button"
              onClick={() => {
                try {
                  apply(parseInput(draft).sort((a, b) => a - b));
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            >
              Ordenar entrada
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
