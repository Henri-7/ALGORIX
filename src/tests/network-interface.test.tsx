import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TreeLaboratory from '../features/trees/TreeLaboratory';
import GraphLaboratory from '../features/graphs/GraphLaboratory';
function renderTree(kind = 'bst') {
  return render(
    <MemoryRouter initialEntries={[`/laboratorio/arvores/${kind}`]}>
      <Routes>
        <Route path="/laboratorio/arvores/:algorithm" element={<TreeLaboratory />} />
      </Routes>
    </MemoryRouter>,
  );
}
function renderGraph(kind = 'bfs') {
  return render(
    <MemoryRouter initialEntries={[`/laboratorio/grafos/${kind}`]}>
      <Routes>
        <Route path="/laboratorio/grafos/:algorithm" element={<GraphLaboratory />} />
      </Routes>
    </MemoryRouter>,
  );
}
function endTimeline() {
  const slider = screen.getByLabelText('Etapa da execução');
  fireEvent.change(slider, { target: { value: slider.getAttribute('max') } });
}
describe('árvores integradas ao player', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());
  it('inserção mostra entrada original, bloqueia mutações e só usa resultado após conclusão', () => {
    renderTree();
    fireEvent.change(screen.getByLabelText('Valor da árvore'), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));
    expect(screen.queryByRole('img', { name: /Valor 45/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inserir' })).toBeDisabled();
    endTimeline();
    expect(screen.getByRole('img', { name: /Valor 45/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inserir' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Valor da árvore'), { target: { value: '46' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));
    expect(screen.getByRole('img', { name: /Valor 45/ })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Valor 46/ })).not.toBeInTheDocument();
    endTimeline();
    expect(screen.getByRole('img', { name: /Valor 46/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar execução' }));
    expect(screen.queryByRole('img', { name: /Valor 46/ })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Valor 45/ })).toBeInTheDocument();
  });
  it('retrocede snapshots, sincroniza linha e cancela sem timer antigo', () => {
    renderTree();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    expect(document.querySelector('[aria-current="step"]')).toHaveTextContent('comparar valor');
    fireEvent.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    act(() => vi.advanceTimersByTime(650));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar operação' }));
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole('img', { name: /Valor 45/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
  });
  it('percurso produz sequência real e duplicados não alteram estrutura', () => {
    renderTree();
    fireEvent.click(screen.getByRole('button', { name: 'Em ordem' }));
    endTimeline();
    expect(screen.getByRole('region', { name: 'Resultado do percurso' })).toHaveTextContent(
      '20 → 30 → 40 → 50 → 60 → 70 → 80',
    );
    fireEvent.change(screen.getByLabelText('Valor da árvore'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));
    endTimeline();
    expect(screen.getByText(/50 já existe/, { selector: 'p' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Visualização da árvore' })).getAllByRole('img'),
    ).toHaveLength(7);
  });
  it('AVL permite preparar LR, mostra duas rotações e busca após a inserção', () => {
    renderTree('avl');
    fireEvent.change(screen.getByLabelText('Exemplo'), { target: { value: 'LR' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gerar exemplo' }));
    fireEvent.change(screen.getByLabelText('Valor da árvore'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));
    endTimeline();
    expect(
      screen.getByRole('img', { name: 'Valor 20, raiz, altura 2, fator 0' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/20 inserido. 2 rotações/, { selector: 'p' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    endTimeline();
    expect(
      screen.getByText(/20 encontrado após 1 comparações/, { selector: 'p' }),
    ).toBeInTheDocument();
  });
  it('trocar BST por AVL cancela a operação em andamento', () => {
    renderTree();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    fireEvent.click(screen.getAllByRole('link', { name: 'AVL' })[0]!);
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Árvore AVL');
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
    expect(screen.queryByRole('img', { name: /Valor 45/ })).not.toBeInTheDocument();
  });
  it('limpa a árvore e trata operação em árvore vazia', () => {
    renderTree();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar árvore' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    endTimeline();
    expect(screen.getByText(/a árvore está vazia/, { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Valor 50/ })).not.toBeInTheDocument();
  });
});
describe('editor e player de grafos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());
  it('executa BFS, mostra fila e volta ao snapshot anterior', () => {
    renderGraph();
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    expect(screen.getByLabelText('Fronteira da execução')).toHaveTextContent('A');
    fireEvent.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(screen.getByLabelText('Fronteira da execução')).toHaveTextContent('Vazia');
    endTimeline();
    expect(screen.getByText(/Caminho A → B → D → F/)).toBeInTheDocument();
  });
  it('editar peso cancela uma execução sem deixar timers', () => {
    renderGraph('dijkstra');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    act(() => vi.advanceTimersByTime(650));
    fireEvent.change(screen.getByLabelText('Novo peso'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar peso' }));
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
    expect(screen.getByRole('button', { name: 'Aresta A com B, peso 9' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar execução' })).not.toBeInTheDocument();
  });
  it('modo conectar cria uma aresta real e rejeita duplicadas', () => {
    renderGraph();
    fireEvent.change(screen.getByLabelText('Modo de interação'), { target: { value: 'connect' } });
    fireEvent.click(screen.getByRole('button', { name: 'Nó A, origem' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nó F, destino' }));
    expect(screen.getByRole('button', { name: 'Aresta A com F, peso 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nó A, origem' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nó F, destino' }));
    expect(screen.getByRole('alert')).toHaveTextContent('já existe');
  });
  it('recusa peso negativo e trata o grafo vazio', () => {
    renderGraph('dijkstra');
    fireEvent.change(screen.getByLabelText('Novo peso'), { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar peso' }));
    expect(screen.getByRole('alert')).toHaveTextContent('finito entre 0');
    fireEvent.click(screen.getByRole('button', { name: 'Limpar grafo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    expect(screen.getByRole('alert')).toHaveTextContent('vazio');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar nó' }));
    expect(screen.getByRole('button', { name: /Nó G, origem/ })).toBeInTheDocument();
  });
  it('recalcula Dijkstra ao mudar destino para origem', () => {
    renderGraph('dijkstra');
    fireEvent.change(screen.getByLabelText('Destino da execução'), { target: { value: 'v1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    endTimeline();
    expect(screen.getByText(/Caminho A; distância mínima 0/)).toBeInTheDocument();
  });
  it('troca algoritmo e origem sem manter timers da execução anterior', () => {
    renderGraph();
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    fireEvent.click(screen.getAllByRole('link', { name: 'DFS' })[0]!);
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar execução' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    fireEvent.change(screen.getByLabelText('Origem da execução'), { target: { value: 'v3' } });
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('button', { name: 'Nó C, origem' })).toBeInTheDocument();
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
  });
});
