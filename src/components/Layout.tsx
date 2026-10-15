import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
function SiteHeader() {
  const [menu, setMenu] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav aria-label="Navegação principal" className={menu ? 'main-nav open' : 'main-nav'}>
          <NavLink onClick={() => setMenu(false)} to="/algoritmos">
            Algoritmos
          </NavLink>
          <NavLink onClick={() => setMenu(false)} to="/laboratorio">
            Laboratório
          </NavLink>
          <NavLink onClick={() => setMenu(false)} to="/comparar">
            Comparar
          </NavLink>
          <NavLink onClick={() => setMenu(false)} to="/sobre">
            Sobre
          </NavLink>
        </nav>
        <Link className="button header-cta" to="/laboratorio">
          Abrir laboratório <ArrowUpRight size={15} />
        </Link>
        <button
          className="icon-button mobile-menu"
          aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader key={pathname} />
      <Outlet />
      <footer className="site-footer">
        <Logo />
        <p>Algoritmos e estruturas de dados.</p>
        <Link to="/sobre">
          Sobre o projeto <ArrowUpRight size={14} />
        </Link>
      </footer>
    </>
  );
}
