import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './styles/global.css';
import Layout from './components/Layout';
const Home = lazy(() => import('./features/Home'));
const Laboratory = lazy(() => import('./features/Laboratory'));
const Catalog = lazy(() => import('./features/Catalog'));
const Comparison = lazy(() => import('./features/Comparison'));
const About = lazy(() => import('./features/About'));
const TreeLaboratory = lazy(() => import('./features/trees/TreeLaboratory'));
const GraphLaboratory = lazy(() => import('./features/graphs/GraphLaboratory'));
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="loading" role="status">
              Preparando seu laboratório…
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="algoritmos" element={<Catalog />} />
              <Route
                path="laboratorio"
                element={<Navigate replace to="/laboratorio/ordenacao/bubble-sort" />}
              />
              <Route path="laboratorio/:category/:algorithm" element={<Laboratory />} />
              <Route
                path="laboratorio/arvores"
                element={<Navigate replace to="/laboratorio/arvores/bst" />}
              />
              <Route path="laboratorio/arvores/:algorithm" element={<TreeLaboratory />} />
              <Route
                path="laboratorio/grafos"
                element={<Navigate replace to="/laboratorio/grafos/bfs" />}
              />
              <Route path="laboratorio/grafos/:algorithm" element={<GraphLaboratory />} />
              <Route path="comparar" element={<Comparison />} />
              <Route path="sobre" element={<About />} />
              <Route
                path="*"
                element={
                  <main id="conteudo" className="empty-state">
                    <h1>Esta página não foi encontrada.</h1>
                    <Link className="button primary" to="/">
                      Voltar ao início
                    </Link>
                  </main>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>,
);
