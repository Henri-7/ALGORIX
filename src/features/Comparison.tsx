import { useMemo, useState } from 'react';
import { Split } from 'lucide-react';
import { sortingAlgorithms, type Algorithm } from '../data/algorithms';
import { sortingTimeline } from '../algorithms/sorting';
import type { SortId } from '../engine/types';
import { usePlayback, type Playback } from '../engine/usePlayback';
import { PlaybackControls } from '../components/PlaybackControls';
import { Metrics, Visualization } from '../components/Visualization';
import { InputEditor } from '../components/InputEditor';
import { INITIAL_VALUES } from '../lib/input';

function ComparisonSession({
  left,
  right,
  values,
  independent,
}: {
  left: Algorithm;
  right: Algorithm;
  values: number[];
  independent: boolean;
}) {
  const timelines = useMemo(
    () => [sortingTimeline(left.id as SortId, values), sortingTimeline(right.id as SortId, values)],
    [left, right, values],
  );
  const sync = usePlayback(Math.max(timelines[0]!.length, timelines[1]!.length)),
    a = usePlayback(timelines[0]!.length),
    b = usePlayback(timelines[1]!.length);
  const global: Playback = independent
    ? {
        ...sync,
        playing: a.playing || b.playing,
        index: Math.max(a.index, b.index),
        speed: a.speed,
        toggle: () => {
          if (a.playing || b.playing) {
            if (a.playing) a.toggle();
            if (b.playing) b.toggle();
          } else {
            if (a.index < a.last) a.toggle();
            if (b.index < b.last) b.toggle();
            if (a.index === a.last && b.index === b.last) {
              a.toggle();
              b.toggle();
            }
          }
        },
        reset: () => {
          a.reset();
          b.reset();
        },
        next: () => {
          a.next();
          b.next();
        },
        previous: () => {
          a.previous();
          b.previous();
        },
        seek: (n) => {
          a.seek(n);
          b.seek(n);
        },
        setSpeed: (n) => {
          a.setSpeed(n);
          b.setSpeed(n);
        },
      }
    : sync;
  return (
    <>
      <div className="comparison-panels">
        {[left, right].map((algorithm, i) => {
          const timeline = timelines[i]!,
            p = independent ? (i === 0 ? a : b) : sync,
            index = Math.min(p.index, timeline.length - 1),
            step = timeline[index]!;
          return (
            <section className="comparison-panel" key={i}>
              <div className="visual-panel-heading">
                <h2>{algorithm.name}</h2>
                <span
                  className={index === timeline.length - 1 ? 'success-text mono' : 'mono muted'}
                >
                  {index === timeline.length - 1
                    ? 'Concluído'
                    : `${index} / ${timeline.length - 1} etapas`}
                </span>
              </div>
              <Visualization step={step} small />
              <div className="comparison-progress">
                <span style={{ width: `${(index / (timeline.length - 1)) * 100}%` }} />
              </div>
              <p className="comparison-explanation">{step.message}</p>
              <Metrics step={step} />
              {independent && <PlaybackControls player={p} compact />}
            </section>
          );
        })}
      </div>
      <PlaybackControls player={global} />
      <p className="comparison-disclaimer">
        {independent
          ? 'Cada painel tem sua própria timeline e controles. Os controles abaixo dos painéis permitem explorar ritmos diferentes; a barra geral controla ambos.'
          : 'Cada avanço executa uma etapa lógica de cada algoritmo. Quem termina primeiro permanece no resultado final.'}{' '}
        Etapas podem ter custos diferentes. A duração das animações não é um benchmark.
      </p>
      <div className="theory-table">
        <h2>Complexidade teórica</h2>
        <p>Complexidade teórica · separada das operações observadas acima</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Propriedade</th>
              <th scope="col">{left.name}</th>
              <th scope="col">{right.name}</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['Melhor caso', 'best'],
                ['Caso médio', 'average'],
                ['Pior caso', 'worst'],
                ['Espaço auxiliar (pior)', 'space'],
                ['Estabilidade', 'stable'],
              ] as const
            ).map(([label, key]) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                <td>{left[key]}</td>
                <td>{right[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export default function Comparison() {
  const [leftId, setLeft] = useState('bubble-sort'),
    [rightId, setRight] = useState('merge-sort'),
    [values, setValues] = useState([...INITIAL_VALUES]),
    [revision, setRevision] = useState(0),
    [independent, setIndependent] = useState(false);
  const left = sortingAlgorithms.find((a) => a.id === leftId)!,
    right = sortingAlgorithms.find((a) => a.id === rightId)!;
  return (
    <main id="conteudo" className="page-width comparison-page">
      <div className="eyebrow">
        <Split size={15} /> COMPARAÇÃO DE ALGORITMOS
      </div>
      <h1>
        Dois caminhos.<span className="muted"> Uma entrada.</span>
      </h1>
      <p className="page-lead">
        Observe como estratégias diferentes resolvem exatamente o mesmo problema.
      </p>
      <div className="comparison-selectors">
        <label>
          Algoritmo A
          <select value={leftId} onChange={(e) => setLeft(e.target.value)}>
            {sortingAlgorithms.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <span className="versus">×</span>
        <label>
          Algoritmo B
          <select value={rightId} onChange={(e) => setRight(e.target.value)}>
            {sortingAlgorithms.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Modo de execução
          <select
            value={String(independent)}
            onChange={(e) => setIndependent(e.target.value === 'true')}
          >
            <option value="false">Sincronizado por etapas</option>
            <option value="true">Reprodução independente</option>
          </select>
        </label>
      </div>
      <ComparisonSession
        key={`${leftId}:${rightId}:${revision}:${independent}`}
        left={left}
        right={right}
        values={values}
        independent={independent}
      />
      <InputEditor
        values={values}
        onEdit={() => setRevision((r) => r + 1)}
        onApply={(a) => {
          setValues(a);
          setRevision((r) => r + 1);
        }}
      />
    </main>
  );
}
