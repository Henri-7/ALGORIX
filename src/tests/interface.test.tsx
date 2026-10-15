import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Laboratory from '../features/Laboratory';
import Catalog from '../features/Catalog';
import Comparison from '../features/Comparison';
function lab(path = '/laboratorio/ordenacao/bubble-sort') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/laboratorio/:category/:algorithm" element={<Laboratory />} />
      </Routes>
    </MemoryRouter>,
  );
}
describe('laboratório integrado', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());
  it('avança, retrocede e sincroniza visualização e pseudocódigo', () => {
    lab();
    const before = screen.getByRole('img').getAttribute('aria-label');
    fireEvent.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    expect(screen.getByRole('img')).toHaveAccessibleName(/Comparando 42/);
    expect(document.querySelector('[aria-current="step"]')).toHaveTextContent(
      'comparar A[i] com A[i+1]',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(before);
  });
  it('editar e aplicar dados cancela a execução anterior', () => {
    lab();
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    act(() => vi.advanceTimersByTime(650));
    fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
      target: { value: '3, 1, 2' },
    });
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('img')).toHaveAccessibleName(/Valores: 3, 1, 2/);
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
  });
  it('trocar algoritmo cancela execução e volta à etapa inicial', () => {
    lab();
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    act(() => vi.advanceTimersByTime(650));
    fireEvent.click(screen.getAllByRole('link', { name: 'Merge Sort' })[0]!);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Merge Sort');
    expect(screen.getByLabelText('Etapa da execução')).toHaveValue('0');
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeInTheDocument();
  });
  it('busca binária exige ordenação explícita', () => {
    lab('/laboratorio/busca/busca-binaria');
    fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
      target: { value: '9, 1, 5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('ordem crescente');
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar entrada' }));
    expect(screen.getByRole('img')).toHaveAccessibleName(/Valores: 1, 5, 9/);
  });
  it('mostra erros sem substituir entrada válida', () => {
    lab();
    const before = screen.getByRole('img').getAttribute('aria-label');
    fireEvent.change(screen.getByLabelText('Valores separados por vírgulas'), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(before);
  });
});
it('catálogo filtra por nome e categoria', () => {
  render(
    <MemoryRouter>
      <Catalog />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Buscar algoritmos' }), {
    target: { value: 'binaria' },
  });
  expect(screen.getByRole('heading', { name: 'Busca Binária' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Bubble Sort' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Ordenação' }));
  expect(screen.getByText('Nenhum algoritmo encontrado')).toBeInTheDocument();
});
it('comparador usa a mesma entrada e permite timelines independentes', () => {
  render(<Comparison />);
  const [a, b] = screen.getAllByRole('img');
  expect(a?.getAttribute('aria-label')).toBe(b?.getAttribute('aria-label'));
  fireEvent.click(screen.getByRole('button', { name: 'Próxima etapa' }));
  expect(screen.getByLabelText('Etapa da execução')).toHaveValue('1');
  fireEvent.change(screen.getByLabelText('Modo de execução'), { target: { value: 'true' } });
  const nextButtons = screen.getAllByRole('button', { name: 'Próxima etapa' });
  fireEvent.click(nextButtons[0]!);
  const sliders = screen.getAllByLabelText('Etapa da execução');
  expect(sliders[0]).toHaveValue('1');
  expect(sliders[1]).toHaveValue('0');
});
