import { Link } from 'react-router-dom';
import { ArrowUpRight, Braces, FlaskConical, Eye } from 'lucide-react';
export default function About() {
  return (
    <main id="conteudo" className="page-width about-page">
      <div className="eyebrow">POR TRÁS DO ALGORIX</div>
      <h1>
        Computação em etapas.
        <br />
        <span className="muted">Fundamentos em prática.</span>
      </h1>
      <p className="page-lead">
        Uma plataforma para estudantes, desenvolvedores e professores explorarem os fundamentos da
        computação através de experiências visuais.
      </p>
      <div className="about-principles">
        <article>
          <Eye />
          <h2>Visualize.</h2>
          <p>
            Acompanhe os dados enquanto mudam. Identifique comparações, movimentos e resultados com
            estados visuais e explicações textuais.
          </p>
        </article>
        <article>
          <Braces />
          <h2>Entenda.</h2>
          <p>
            Cada etapa vem de uma implementação real. A timeline guarda snapshots independentes para
            você voltar e investigar cada decisão.
          </p>
        </article>
        <article>
          <FlaskConical />
          <h2>Investigue.</h2>
          <p>
            Experimente entradas crescentes, invertidas e repetidas. Compare estratégias e relacione
            operações observadas à complexidade teórica.
          </p>
        </article>
      </div>
      <section className="about-details">
        <h2>Escopo da plataforma</h2>
        <p>
          Esta versão contém cinco algoritmos de ordenação, duas buscas, árvores BST e AVL, grafos
          com BFS, DFS e Dijkstra, catálogo e comparador. As preferências de velocidade são salvas
          apenas no seu navegador. Não há contas, backend ou coleta de dados pela aplicação.
        </p>
        <h3>Precisão antes de velocidade</h3>
        <p>
          Arrays são limitados a 32 inteiros; árvores, a 31 nós; grafos, a 16 vértices e 48 arestas.
          As métricas de ordenação medem comparações de valores, trocas e escritas no array
          principal. O tempo de uma animação não representa o tempo computacional do algoritmo. A
          memória da timeline não está incluída na complexidade espacial apresentada.
        </p>
        <Link className="button primary" to="/laboratorio">
          Abrir laboratório <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
