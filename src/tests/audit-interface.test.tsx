import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Laboratory from '../features/Laboratory';
import Comparison from '../features/Comparison';
import Catalog from '../features/Catalog';
import Home from '../features/Home';
import Layout from '../components/Layout';
import TreeLaboratory from '../features/trees/TreeLaboratory';
import GraphLaboratory from '../features/graphs/GraphLaboratory';
import { GraphSvg } from '../features/graphs/GraphSvg';
import { idleGraphStep } from '../features/graphs/content';
import { exampleGraph } from '../algorithms/graphs/examples';
import { usePlayback } from '../engine/usePlayback';
import { catalogEntries } from '../data/catalog';

function laboratory(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/laboratorio/arvores/:algorithm" element={<TreeLaboratory />} />
        <Route path="/laboratorio/grafos/:algorithm" element={<GraphLaboratory />} />
        <Route path="/laboratorio/:category/:algorithm" element={<Laboratory />} />
      </Routes>
    </MemoryRouter>,
  );
}
function finish(slider = screen.getByLabelText('Etapa da execução')) {
  fireEvent.change(slider, { target: { value: slider.getAttribute('max') } });
}
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('auditoria do fluxo de arrays', () => {
  it.each(['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort'])(
    'entrada, conclusão e retorno ao início: %s',
    (id) => {
      laboratory(`/laboratorio/ordenacao/${id}`);
      fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
        target: { value: '3, -1, 0, 3,' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
      expect(screen.getByRole('img')).toHaveAccessibleName(/Valores: 3, -1, 0, 3\./);
      finish();
      expect(screen.getByRole('img')).toHaveAccessibleName(/Valores: -1, 0, 3, 3\./);
      expect(screen.getByRole('button', { name: 'Próxima etapa' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Reiniciar execução' }));
      expect(screen.getByRole('img')).toHaveAccessibleName(/Valores: 3, -1, 0, 3\./);
    },
  );
  it('recusa notação não decimal sem substituir a entrada aplicada', () => {
    laboratory('/laboratorio/ordenacao/bubble-sort');
    const before = screen.getByRole('img').getAttribute('aria-label');
    fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
      target: { value: '0x10, 1e2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('inteiros');
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', before);
  });
  it.each(['busca-linear', 'busca-binaria'])(
    'alvo ausente, repetido e edição durante reprodução: %s',
    (id) => {
      laboratory(`/laboratorio/busca/${id}`);
      fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
        target: { value: '-1, 2, 2, 9' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
      fireEvent.change(screen.getByLabelText('Valor procurado'), { target: { value: '2' } });
      fireEvent.click(screen.getByRole('button', { name: 'Definir alvo' }));
      finish();
      expect(screen.getByRole('img')).toHaveAccessibleName(/Encontramos 2 no índice [12]/);
      fireEvent.click(screen.getByRole('button', { name: 'Repetir' }));
      fireEvent.change(screen.getByLabelText('Valor procurado'), { target: { value: '7' } });
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
      fireEvent.click(screen.getByRole('button', { name: 'Definir alvo' }));
      finish();
      expect(screen.getByRole('img')).toHaveAccessibleName(/7 não está na entrada/);
    },
  );
  it('geração binária não aplica valores desordenados implicitamente', () => {
    laboratory('/laboratorio/busca/busca-binaria');
    const before = screen.getByRole('img').getAttribute('aria-label');
    fireEvent.change(screen.getByLabelText('Distribuição'), { target: { value: 'decrescente' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gerar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Ordene');
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', before);
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar entrada' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('auditoria do comparador', () => {
  function smallComparison() {
    render(<Comparison />);
    fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
      target: { value: '1, 2, 3, 4' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    fireEvent.change(screen.getByLabelText('Algoritmo B'), { target: { value: 'selection-sort' } });
  }
  it('sincronização mantém algoritmo mais curto concluído enquanto o outro avança', () => {
    smallComparison();
    const slider = screen.getByLabelText('Etapa da execução');
    fireEvent.change(slider, { target: { value: '6' } });
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAccessibleName(/Ordenação concluída/);
    expect(images[1]).not.toHaveAccessibleName(/Ordenação concluída/);
    finish(slider);
    for (const img of images) expect(img).toHaveAccessibleName(/Ordenação concluída/);
  });
  it('controle geral independente pausa ambos e continua apenas o que não concluiu', () => {
    smallComparison();
    fireEvent.change(screen.getByLabelText('Modo de execução'), { target: { value: 'true' } });
    const sliders = screen.getAllByLabelText('Etapa da execução');
    finish(sliders[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Reproduzir' }).at(-1)!);
    act(() => vi.advanceTimersByTime(650));
    expect(sliders[0]).toHaveValue(sliders[0]!.getAttribute('max'));
    expect(sliders[1]).toHaveValue('1');
    fireEvent.click(screen.getAllByRole('button', { name: 'Pausar' }).at(-1)!);
    act(() => vi.advanceTimersByTime(5000));
    expect(sliders[1]).toHaveValue('1');
  });
  it('troca de modo, algoritmo e rascunho elimina timers em todos os painéis', () => {
    smallComparison();
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    fireEvent.change(screen.getByLabelText('Modo de execução'), { target: { value: 'true' } });
    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.getAllByLabelText('Etapa da execução').map((e) => (e as HTMLInputElement).value),
    ).toEqual(['0', '0', '0']);
    fireEvent.click(screen.getAllByRole('button', { name: 'Reproduzir' }).at(-1)!);
    fireEvent.change(screen.getByLabelText('Algoritmo A'), { target: { value: 'quick-sort' } });
    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.getAllByLabelText('Etapa da execução').map((e) => (e as HTMLInputElement).value),
    ).toEqual(['0', '0', '0']);
    fireEvent.click(screen.getAllByRole('button', { name: 'Reproduzir' }).at(-1)!);
    fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
      target: { value: '2, 1' },
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.getAllByLabelText('Etapa da execução').map((e) => (e as HTMLInputElement).value),
    ).toEqual(['0', '0', '0']);
  });
});

describe('auditoria de navegação e player', () => {
  it.each([0, 1])(
    'timeline sem transições (%i) nunca fica reproduzindo indefinidamente',
    (length) => {
      const { result } = renderHook(() => usePlayback(length));
      act(() => result.current.toggle());
      act(() => vi.advanceTimersByTime(10000));
      expect(result.current.playing).toBe(false);
      expect(result.current.index).toBe(0);
    },
  );
  it('catálogo expõe os doze destinos e filtros preservados na URL', () => {
    render(
      <MemoryRouter initialEntries={['/algoritmos?categoria=Grafos&q=profundidade']}>
        <Catalog />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: 'DFS — Busca em Profundidade' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Experimentar' })).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Buscar algoritmos'), { target: { value: '' } });
    expect(screen.getAllByRole('link', { name: 'Experimentar' })).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(
      screen.getAllByRole('link', { name: 'Experimentar' }).map((e) => e.getAttribute('href')),
    ).toEqual(catalogEntries.map((e) => e.path));
    expect(catalogEntries).toHaveLength(12);
  });
  it.each([
    '/laboratorio/arvores/inexistente',
    '/laboratorio/grafos/inexistente',
    '/laboratorio/busca/bubble-sort',
  ])('rota inválida apresenta recuperação: %s', (path) => {
    laboratory(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/não encontrad/);
  });
  it('demonstração da home espera ação do usuário e cancela timer ao desmontar', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const slider = screen.getByLabelText('Etapa da execução');
    act(() => vi.advanceTimersByTime(2000));
    expect(slider).toHaveValue('0');
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    act(() => vi.advanceTimersByTime(650));
    expect(slider).toHaveValue('1');
    unmount();
    act(() => vi.advanceTimersByTime(5000));
  });
  it('menu móvel fecha também ao navegar pelo logotipo', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/sobre']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<main id="conteudo">Conteúdo</main>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getAllByRole('link', { name: 'ALGORIX — início' })[0]!);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

describe('auditoria da edição de grafos', () => {
  it('seleção pelos formulários pausa a execução', () => {
    laboratory('/laboratorio/grafos/bfs');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    fireEvent.change(screen.getByLabelText('Aresta selecionada'), { target: { value: 'e2' } });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeInTheDocument();
  });
  it('setas movem nós, mantêm foco e atualizam coordenadas e arestas', () => {
    laboratory('/laboratorio/grafos/bfs');
    const a = screen.getByRole('button', { name: 'Nó A, origem' });
    a.focus();
    const path = screen
      .getByRole('button', { name: /Aresta A com B/ })
      .querySelector('path')!
      .getAttribute('d');
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    const moved = screen.getByRole('button', { name: 'Nó A, origem' });
    expect(moved).toHaveAttribute('transform', 'translate(110 250)');
    expect(moved).toHaveFocus();
    expect(screen.getByLabelText('Coordenada X')).toHaveValue(110);
    expect(
      screen.getByRole('button', { name: /Aresta A com B/ }).querySelector('path'),
    ).not.toHaveAttribute('d', path);
    fireEvent.keyDown(moved, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Nó A, origem' })).toHaveAttribute(
      'transform',
      'translate(120 250)',
    );
  });
  it('remoção da origem elimina arestas incidentes e repara seleções para nova execução', () => {
    laboratory('/laboratorio/grafos/dijkstra');
    fireEvent.click(screen.getByText('Selecionar, mover ou remover nó'));
    fireEvent.click(screen.getByRole('button', { name: 'Remover nó' }));
    expect(screen.queryByRole('button', { name: 'Nó A, origem' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aresta A com/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Origem da execução')).toHaveValue('v2');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    finish();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Repetir' })).toBeEnabled();
  });
  it('zoom tem limites e o desenho continua com nós acessíveis', () => {
    laboratory('/laboratorio/arvores/bst');
    for (let i = 0; i < 10; i++)
      fireEvent.click(screen.getByRole('button', { name: 'Aumentar zoom' }));
    expect(screen.getByRole('button', { name: 'Aumentar zoom' })).toBeDisabled();
    for (let i = 0; i < 10; i++)
      fireEvent.click(screen.getByRole('button', { name: 'Diminuir zoom' }));
    expect(screen.getByRole('button', { name: 'Diminuir zoom' })).toBeDisabled();
    expect(
      within(screen.getByRole('group', { name: 'Visualização da árvore' })).getAllByRole('img'),
    ).toHaveLength(7);
  });
});

describe('auditoria do contrato de arraste SVG', () => {
  function drawing() {
    class TestPointerEvent extends MouseEvent {
      readonly pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }
    vi.stubGlobal('PointerEvent', TestPointerEvent);
    const onMove = vi.fn();
    render(
      <GraphSvg
        step={idleGraphStep(exampleGraph('simple'), 'bfs', 'v1', 'v6')}
        mode="move"
        selectedNode="v1"
        selectedEdge=""
        anchor={null}
        onNode={() => {}}
        onEdge={() => {}}
        onMove={onMove}
        onInteraction={() => {}}
      />,
    );
    const node = screen.getByRole('button', { name: 'Nó A, origem' });
    const svg = node.closest('svg')!;
    Object.defineProperty(svg, 'getScreenCTM', { value: () => ({ inverse: () => ({}) }) });
    Object.defineProperty(svg, 'createSVGPoint', {
      value: () => ({
        x: 0,
        y: 0,
        matrixTransform() {
          return { x: this.x, y: this.y };
        },
      }),
    });
    Object.defineProperty(node, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(node, 'releasePointerCapture', { value: vi.fn() });
    return { node, onMove };
  }
  it('move o rascunho com arestas e só confirma ao soltar', () => {
    const { node, onMove } = drawing();
    fireEvent.pointerDown(node, { pointerId: 1, clientX: 100, clientY: 250, button: 0 });
    fireEvent.pointerMove(node, { pointerId: 1, clientX: 160, clientY: 300 });
    expect(node).toHaveAttribute('transform', 'translate(160 300)');
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.pointerUp(node, { pointerId: 1 });
    expect(onMove).toHaveBeenCalledExactlyOnceWith('v1', 160, 300);
  });
  it('cancelamento descarta o rascunho', () => {
    const { node, onMove } = drawing();
    fireEvent.pointerDown(node, { pointerId: 1, clientX: 100, clientY: 250, button: 0 });
    fireEvent.pointerMove(node, { pointerId: 1, clientX: 160, clientY: 300 });
    fireEvent.pointerCancel(node, { pointerId: 1 });
    expect(onMove).not.toHaveBeenCalled();
    expect(node).toHaveAttribute('transform', 'translate(100 250)');
  });
  it('botão secundário não inicia movimentação', () => {
    const { node, onMove } = drawing();
    fireEvent.pointerDown(node, { pointerId: 1, clientX: 100, clientY: 250, button: 2 });
    fireEvent.pointerMove(node, { pointerId: 1, clientX: 160, clientY: 300 });
    fireEvent.pointerUp(node, { pointerId: 1 });
    expect(onMove).not.toHaveBeenCalled();
  });
  it('soltar outro ponteiro não confirma o arraste ativo', () => {
    const { node, onMove } = drawing();
    fireEvent.pointerDown(node, { pointerId: 1, clientX: 100, clientY: 250, button: 0 });
    fireEvent.pointerMove(node, { pointerId: 1, clientX: 160, clientY: 300 });
    fireEvent.pointerUp(node, { pointerId: 2 });
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.pointerUp(node, { pointerId: 1 });
    expect(onMove).toHaveBeenCalledExactlyOnceWith('v1', 160, 300);
  });
});
