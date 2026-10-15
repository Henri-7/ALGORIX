import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Code2,
  GitBranch,
  Network,
  Search,
  SlidersHorizontal,
  Split,
} from 'lucide-react';
import { sortingTimeline } from '../algorithms/sorting';
import { usePlayback } from '../engine/usePlayback';
import { Visualization } from '../components/Visualization';
import { PlaybackControls } from '../components/PlaybackControls';
const demo = [38, 66, 24, 84, 47, 18, 58, 32, 75, 51];
function HeroDemo() {
  const steps = useMemo(() => sortingTimeline('bubble-sort', demo), []);
  const player = usePlayback(steps.length);
  const step = steps[player.index]!;
  return (
    <div className="hero-demo">
      <div className="demo-top">
        <span>laboratório / ordenação</span>
        <span className="live-label">
          <i /> INTERATIVO
        </span>
      </div>
      <div className="demo-title">
        <div>
          <span className="eyebrow">COMPARAÇÕES E TROCAS</span>
          <h2>
            Bubble Sort<span className="badge">O(n²)</span>
          </h2>
        </div>
        <ArrowDownUp size={20} />
      </div>
      <Visualization step={step} small />
      <div className="demo-explanation">
        <span className="mono">{String(player.index).padStart(2, '0')}</span>
        <p>{step.message}</p>
      </div>
      <PlaybackControls player={player} compact />
      <div className="demo-bottom">
        <span>
          <i className="status-dot" /> {step.metrics.comparisons} comparações · {step.metrics.swaps}{' '}
          trocas
        </span>
        <Link to="/laboratorio">
          Expandir laboratório <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <main id="conteudo" className="home-page">
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="small-line" /> LABORATÓRIO DE CIÊNCIA DA COMPUTAÇÃO
          </div>
          <h1>
            Entenda algoritmos <span>além do código.</span>
          </h1>
          <p>
            Visualize execuções passo a passo, investigue estruturas de dados e relacione cada
            operação à sua complexidade.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/laboratorio">
              Explorar laboratório <ArrowUpRight size={17} />
            </Link>
            <Link className="text-link" to="/algoritmos">
              Conhecer algoritmos <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="demo-index">
            <span>01 / EXECUÇÃO PASSO A PASSO</span>
            <Braces size={18} />
          </div>
          <HeroDemo />
          <p className="demo-caption">Avance, retroceda ou ajuste a velocidade.</p>
        </div>
      </section>
      <section className="explore-section page-width" id="explorar">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ÁREAS DE ESTUDO</div>
            <h2>
              Algoritmos e <span className="muted">estruturas de dados.</span>
            </h2>
          </div>
          <Link className="text-link" to="/algoritmos">
            Explorar catálogo <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          <Link className="category-tile sorting-tile" to="/algoritmos?categoria=Ordenação">
            <div className="category-top">
              <ArrowDownUp />
              <span>01 / ORDENAÇÃO</span>
              <ArrowUpRight size={18} />
            </div>
            <div className="mini-bars" aria-hidden="true">
              {[28, 48, 35, 74, 55, 92, 65, 100].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <h3>Ordenação</h3>
            <p>Compare estratégias, trocas e escritas sobre a mesma entrada.</p>
            <span className="category-count">
              5 algoritmos <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="category-tile search-tile" to="/algoritmos?categoria=Busca">
            <div className="category-top">
              <Search />
              <span>02 / BUSCA</span>
              <ArrowUpRight size={18} />
            </div>
            <div className="mini-search" aria-hidden="true">
              {[12, 24, 36, 48, 60].map((n, i) => (
                <span className={i === 2 ? 'selected' : ''} key={n}>
                  {n}
                  {i === 2 && <i />}
                </span>
              ))}
            </div>
            <h3>Busca</h3>
            <p>Investigue a busca linear e a redução de intervalos na busca binária.</p>
            <span className="category-count">
              2 algoritmos <ArrowRight size={14} />
            </span>
          </Link>
          <nav className="structures-panel" aria-label="Laboratórios de estruturas de dados">
            <h3 className="eyebrow">ESTRUTURAS E PERCURSOS</h3>
            {[
              {
                Icon: GitBranch,
                label: 'Árvores',
                description: 'BST e AVL · alturas, balanceamento e rotações',
                path: '/laboratorio/arvores/bst',
              },
              {
                Icon: Network,
                label: 'Grafos',
                description: 'BFS, DFS e Dijkstra · percursos e caminhos mínimos',
                path: '/laboratorio/grafos/bfs',
              },
            ].map(({ Icon, label, description, path }) => (
              <Link className="structure-link" key={path} to={path}>
                <Icon size={20} aria-hidden="true" />
                <span>
                  <strong>{label}</strong>
                  <span>{description}</span>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="understand-section page-width">
        <div className="step-illustration">
          <div className="eyebrow">
            <Code2 size={15} /> POR DENTRO DA OPERAÇÃO
          </div>
          <div className="value-swap">
            <span>42</span>
            <ArrowRight />
            <span>18</span>
          </div>
          <div className="sample-code">
            <span>03</span>
            <code>se A[i] &gt; A[i+1]:</code>
            <br />
            <span>04</span>
            <code className="highlight"> trocar(A[i], A[i+1])</code>
          </div>
          <p>
            42 é maior que 18. Uma troca coloca
            <br />
            os dois valores na ordem correta.
          </p>
        </div>
        <div className="understand-copy">
          <div className="eyebrow">DA EXECUÇÃO AO RACIOCÍNIO</div>
          <h2>
            Entenda cada operação.
            <br />
            <span className="muted">Não apenas o resultado.</span>
          </h2>
          <p>
            Conecte o que você vê ao que o código faz. A cada comparação, troca ou visita, uma
            explicação mostra o raciocínio por trás da decisão.
          </p>
          <div className="feature-line">
            <SlidersHorizontal size={20} />
            <div>
              <h3>Controle o aprendizado</h3>
              <p>Pause e revise etapas para examinar as mudanças nos dados.</p>
            </div>
          </div>
          <div className="feature-line">
            <Code2 size={20} />
            <div>
              <h3>Acompanhe o pseudocódigo</h3>
              <p>A linha ativa conecta a operação visual à lógica do algoritmo.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="compare-banner page-width">
        <div>
          <div className="eyebrow">
            <Split size={15} /> DUAS ESTRATÉGIAS. A MESMA ENTRADA.
          </div>
          <h2>
            O mesmo problema.
            <br />
            Diferentes caminhos.
          </h2>
          <p>
            Compare algoritmos lado a lado. Observe operações,
            <br />
            investigue complexidades e descubra os trade-offs.
          </p>
          <Link className="button" to="/comparar">
            Comparar algoritmos <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="compare-art" aria-label="Ilustração de duas estratégias de ordenação">
          <div>
            <span>Bubble Sort</span>
            <span>O(n²)</span>
          </div>
          <div className="comparison-track">
            {[18, 40, 27, 65, 35, 80, 52, 95].map((v, i) => (
              <i key={i} style={{ height: `${v}%` }} />
            ))}
          </div>
          <div>
            <span>Merge Sort</span>
            <span>O(n log n)</span>
          </div>
          <div className="comparison-track second">
            {[18, 27, 35, 40, 52, 65, 80, 95].map((v, i) => (
              <i key={i} style={{ height: `${v}%` }} />
            ))}
          </div>
          <small>Ilustração · Experimente uma comparação real no laboratório</small>
        </div>
      </section>
      <section className="final-cta page-width">
        <h2>
          Escolha uma entrada. <span>Investigue a execução.</span>
        </h2>
        <Link className="button primary" to="/laboratorio">
          Abrir laboratório <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}
