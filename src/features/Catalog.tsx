import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, ArrowDownUp, GitBranch, Network } from 'lucide-react';
import { catalogEntries } from '../data/catalog';
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const category = params.get('categoria') ?? 'Todos',
    query = params.get('q') ?? '';
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const filtered = catalogEntries.filter(
    (a) =>
      (category === 'Todos' || a.category === category) &&
      normalize(`${a.name} ${a.description} ${a.use}`).includes(normalize(query)),
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };
  return (
    <main id="conteudo" className="page-width catalog-page">
      <div className="eyebrow">CATÁLOGO</div>
      <h1>
        Algoritmos e <span className="muted">estruturas de dados.</span>
      </h1>
      <p className="page-lead">
        Consulte fundamentos, aplicações e complexidades. Abra o laboratório para investigar a
        execução.
      </p>
      <div className="catalog-toolbar">
        <div className="filter-tabs" aria-label="Filtrar categoria">
          {['Todos', 'Ordenação', 'Busca', 'Árvores', 'Grafos'].map((c) => (
            <button
              key={c}
              className={category === c ? 'active' : ''}
              onClick={() => update('categoria', c)}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar algoritmos"
            placeholder="Buscar um algoritmo..."
            value={query}
            onChange={(e) => update('q', e.target.value)}
          />
        </label>
      </div>
      <p className="result-count">{filtered.length} algoritmos disponíveis</p>
      <div className="catalog-list">
        {filtered.map((a, i) => (
          <article className="catalog-item" key={a.id}>
            <span className="catalog-number">{String(i + 1).padStart(2, '0')}</span>
            <div className="catalog-info">
              <div className="eyebrow">
                {a.category === 'Ordenação' ? (
                  <ArrowDownUp size={13} />
                ) : a.category === 'Árvores' ? (
                  <GitBranch size={13} />
                ) : a.category === 'Grafos' ? (
                  <Network size={13} />
                ) : (
                  <Search size={13} />
                )}{' '}
                {a.category}
              </div>
              <h2>{a.name}</h2>
              <p>{a.description}</p>
              <details>
                <summary>Como funciona e quando usar</summary>
                <p>{a.how}</p>
                <p>
                  <strong>Aplicação:</strong> {a.use}
                </p>
                <p>
                  <strong>Vantagem:</strong> {a.advantage}
                </p>
                <p>
                  <strong>Limitação:</strong> {a.limitation}
                </p>
              </details>
            </div>
            <div className="catalog-complexity">
              <span>Tempo · pior caso</span>
              <code>{a.worst}</code>
              <span>Espaço · {a.space}</span>
            </div>
            <Link className="button" to={a.path}>
              Experimentar <ArrowUpRight size={16} />
            </Link>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h2>Nenhum algoritmo encontrado</h2>
          <p>Tente outro termo ou altere o filtro de categoria.</p>
          <button className="button" onClick={() => setParams({})}>
            Limpar filtros
          </button>
        </div>
      )}
    </main>
  );
}
