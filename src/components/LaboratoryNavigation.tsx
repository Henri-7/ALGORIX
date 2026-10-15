import { Link, NavLink } from 'react-router-dom';
import {
  ArrowDownUp,
  BookOpen,
  ChevronRight,
  GitBranch,
  Network,
  Search,
  Split,
} from 'lucide-react';
import { catalogEntries as laboratoryEntries } from '../data/catalog';
const categories = [
  { name: 'Ordenação', Icon: ArrowDownUp },
  { name: 'Busca', Icon: Search },
  { name: 'Árvores', Icon: GitBranch },
  { name: 'Grafos', Icon: Network },
];
export function LabSidebar() {
  return (
    <aside className="lab-sidebar">
      <Link className="sidebar-overview" to="/algoritmos">
        <BookOpen size={17} /> Visão geral
      </Link>
      <span className="sidebar-label">SEU LABORATÓRIO</span>
      {categories.map(({ name, Icon }) => (
        <div key={name} className="sidebar-group">
          <h3>
            <Icon size={16} />
            {name}
          </h3>
          {laboratoryEntries
            .filter((a) => a.category === name)
            .map((a) => (
              <NavLink key={a.id} to={a.path}>
                {a.id === 'bst'
                  ? 'BST'
                  : a.id === 'avl'
                    ? 'AVL'
                    : a.id === 'bfs'
                      ? 'BFS'
                      : a.id === 'dfs'
                        ? 'DFS'
                        : a.name}
                <ChevronRight size={13} />
              </NavLink>
            ))}
        </div>
      ))}
      <Link className="sidebar-overview" to="/comparar">
        <Split size={17} /> Comparação
      </Link>
    </aside>
  );
}
export function MobileAlgorithms() {
  return (
    <div className="mobile-algorithms">
      <span>Escolher algoritmo</span>
      <nav aria-label="Algoritmos">
        {laboratoryEntries.map((a) => (
          <NavLink key={a.id} to={a.path}>
            {a.id === 'bst' ? 'BST' : a.id === 'avl' ? 'AVL' : a.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
