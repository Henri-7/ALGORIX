import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { LabSidebar, MobileAlgorithms } from '../components/LaboratoryNavigation';
import { algorithms, type Algorithm } from '../data/algorithms';
import { INITIAL_VALUES } from '../lib/input';
import { sortingTimeline } from '../algorithms/sorting';
import { searchingTimeline } from '../algorithms/searching';
import type { SearchId, SortId } from '../engine/types';
import { usePlayback } from '../engine/usePlayback';
import { PlaybackControls } from '../components/PlaybackControls';
import { Legend, Metrics, Visualization } from '../components/Visualization';
import { InputEditor } from '../components/InputEditor';
import { InfoPanel } from '../components/InfoPanel';

function Session({
  algorithm,
  values,
  target,
  onApply,
  onTarget,
}: {
  algorithm: Algorithm;
  values: number[];
  target: number;
  onApply: (a: number[]) => void;
  onTarget: (n: number) => void;
}) {
  const steps = useMemo(
    () =>
      algorithm.category === 'Ordenação'
        ? sortingTimeline(algorithm.id as SortId, values)
        : searchingTimeline(algorithm.id as SearchId, values, target),
    [algorithm, values, target],
  );
  const player = usePlayback(steps.length),
    step = steps[player.index]!;
  const [panel, setPanel] = useState(true),
    [targetDraft, setTargetDraft] = useState(String(target)),
    [targetError, setTargetError] = useState('');
  return (
    <>
      <div className="lab-heading">
        <div>
          <div className="eyebrow">
            LABORATÓRIO <ChevronRight size={12} /> {algorithm.category.toUpperCase()}
          </div>
          <h1>
            {algorithm.name}
            <span className="badge">
              {algorithm.category === 'Ordenação' ? 'Ordenação' : 'Busca'}
            </span>
          </h1>
          <p>{algorithm.description}</p>
        </div>
        <button
          className="icon-button panel-toggle"
          aria-label={panel ? 'Recolher painel educativo' : 'Mostrar painel educativo'}
          aria-expanded={panel}
          onClick={() => setPanel(!panel)}
        >
          {panel ? <PanelRightClose /> : <PanelRightOpen />}
        </button>
      </div>
      <div className={`lab-workspace ${panel ? '' : 'wide'}`}>
        <div className="workspace-main">
          <section className="visual-panel">
            <div className="visual-panel-heading">
              <span>
                <i className={`status-dot ${player.playing ? 'live' : ''}`} />
                {player.playing
                  ? 'Executando'
                  : step.operation === 'concluido'
                    ? 'Execução concluída'
                    : 'Pronto para explorar'}
              </span>
              <span className="mono">{values.length} elementos</span>
            </div>
            <Visualization step={step} />
            <Legend search={algorithm.category === 'Busca'} />
            {algorithm.category === 'Busca' && (
              <p className="chart-note">
                Alvo: {target} · E = limite esquerdo · D = limite direito · M = índice analisado
              </p>
            )}
            {values.some((v) => v < 0) && (
              <p className="chart-note">
                Alturas representam o valor absoluto. Barras negativas têm contorno tracejado.
              </p>
            )}
            <PlaybackControls player={player} />
          </section>
          <Metrics step={step} />
          <InputEditor
            values={values}
            onApply={onApply}
            binary={algorithm.id === 'busca-binaria'}
            onEdit={player.reset}
          />
          {algorithm.category === 'Busca' && (
            <form
              className="target-form"
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(targetDraft);
                if (!targetDraft.trim() || !Number.isInteger(n) || Math.abs(n) > 999)
                  setTargetError('Use um inteiro entre −999 e 999.');
                else {
                  setTargetError('');
                  onTarget(n);
                }
              }}
            >
              <label htmlFor="target">Valor procurado</label>
              <input
                id="target"
                type="number"
                value={targetDraft}
                onChange={(e) => {
                  player.reset();
                  setTargetDraft(e.target.value);
                }}
              />
              <button className="button" type="submit">
                Definir alvo
              </button>
              {targetError && (
                <p role="alert" className="error-message">
                  {targetError}
                </p>
              )}
            </form>
          )}
          <div className="lab-footnote">
            <BookOpen size={16} />
            <p>Escritas contam atribuições no array principal; uma troca conta duas escritas.</p>
          </div>
        </div>
        {panel && <InfoPanel algorithm={algorithm} step={step} />}
      </div>
    </>
  );
}

function LabAlgorithm({ algorithm }: { algorithm: Algorithm }) {
  const [values, setValues] = useState(() =>
    algorithm.id === 'busca-binaria'
      ? [...INITIAL_VALUES].sort((a, b) => a - b)
      : [...INITIAL_VALUES],
  );
  const [target, setTarget] = useState(53),
    [revision, setRevision] = useState(0);
  return (
    <Session
      key={revision}
      algorithm={algorithm}
      values={values}
      target={target}
      onApply={(a) => {
        setValues(a);
        setRevision((r) => r + 1);
      }}
      onTarget={(n) => {
        setTarget(n);
        setRevision((r) => r + 1);
      }}
    />
  );
}
export default function Laboratory() {
  const { algorithm: id, category } = useParams();
  const selected = algorithms.find(
    (a) =>
      a.id === id &&
      (category === 'ordenacao'
        ? a.category === 'Ordenação'
        : category === 'busca' && a.category === 'Busca'),
  );
  return (
    <main id="conteudo" className="lab-layout">
      <LabSidebar />
      <div className="lab-content">
        <MobileAlgorithms />
        {selected ? (
          <LabAlgorithm key={selected.id} algorithm={selected} />
        ) : (
          <div className="empty-state">
            <h1>Algoritmo não encontrado</h1>
            <p>Escolha um dos algoritmos disponíveis no catálogo.</p>
            <Link className="button primary" to="/algoritmos">
              <ArrowLeft size={16} /> Ver algoritmos
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
