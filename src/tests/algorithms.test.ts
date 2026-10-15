import { describe, expect, it } from 'vitest';
import { sortingTimeline } from '../algorithms/sorting';
import { searchingTimeline } from '../algorithms/searching';
import { parseInput, generateInput } from '../lib/input';
import { algorithms } from '../data/algorithms';
import type { SortId, SearchId } from '../engine/types';

const ids: SortId[] = [
  'bubble-sort',
  'selection-sort',
  'insertion-sort',
  'merge-sort',
  'quick-sort',
];
const inputs = [
  [],
  [4],
  [-4, -9, 0, 2, -1],
  [3, 1, 3, 1, 3],
  [1, 2, 3, 4],
  [5, 4, 3, 2, 1],
  [7, 2, 9, 0, 3, 8],
  [0, 0, 0],
];
describe.each(ids)('%s', (id) => {
  it.each(inputs.map((a, i) => [i, a] as const))(
    'ordena caso %i e preserva a entrada',
    (_, input) => {
      const original = [...input],
        timeline = sortingTimeline(id, input),
        sorted = [...input].sort((a, b) => a - b);
      expect(timeline.at(-1)?.values).toEqual(sorted);
      expect(timeline.at(-1)?.operation).toBe('concluido');
      expect(input).toEqual(original);
      expect(timeline[0]?.values).toEqual(input);
      const code = algorithms.find((a) => a.id === id)!.code;
      timeline.forEach((step, i) => {
        expect(step.id).toBe(i);
        expect(step.values).toHaveLength(input.length);
        expect(step.line).toBeLessThan(code.length);
        expect(step.line).toBeGreaterThanOrEqual(0);
        step.active.forEach((index) => {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(input.length);
        });
        step.settled.forEach((index) => expect(step.values[index]).toBe(sorted[index]));
        if (i) {
          const prev = timeline[i - 1]!;
          expect(step.values).not.toBe(prev.values);
          expect(step.metrics).not.toBe(prev.metrics);
          const comparisons = step.metrics.comparisons - prev.metrics.comparisons;
          const swaps = step.metrics.swaps - prev.metrics.swaps;
          const writes = step.metrics.writes - prev.metrics.writes;
          expect(comparisons).toBe(step.operation === 'comparacao' ? 1 : 0);
          expect(swaps).toBe(step.operation === 'troca' ? 1 : 0);
          expect(writes).toBe(
            step.operation === 'troca' ? 2 : step.operation === 'escrita' ? 1 : 0,
          );
          if (!['troca', 'escrita'].includes(step.operation))
            expect(step.values).toEqual(prev.values);
          if (step.operation === 'troca')
            expect([...step.values].sort((a, b) => a - b)).toEqual(
              [...prev.values].sort((a, b) => a - b),
            );
        }
      });
      expect(sortingTimeline(id, input)).toEqual(timeline);
    },
  );
  it('ordena 100 entradas determinísticas com negativos e repetições', () => {
    let seed = 1024;
    for (let trial = 0; trial < 100; trial++) {
      const a = Array.from({ length: trial % 33 }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return (seed % 101) - 50;
      });
      expect(sortingTimeline(id, a).at(-1)?.values).toEqual([...a].sort((x, y) => x - y));
    }
  });
});
it('métricas distinguem escrita, troca e comparação', () => {
  expect(sortingTimeline('bubble-sort', [2, 1]).at(-1)?.metrics).toEqual({
    comparisons: 1,
    swaps: 1,
    writes: 2,
  });
  expect(sortingTimeline('insertion-sort', [2, 1]).at(-1)?.metrics).toEqual({
    comparisons: 1,
    swaps: 0,
    writes: 2,
  });
  expect(sortingTimeline('merge-sort', [2, 1]).at(-1)?.metrics).toEqual({
    comparisons: 1,
    swaps: 0,
    writes: 2,
  });
  expect(sortingTimeline('bubble-sort', [1, 2, 3, 4]).at(-1)?.metrics.comparisons).toBe(3);
  expect(sortingTimeline('selection-sort', [1, 2, 3, 4]).at(-1)?.metrics.comparisons).toBe(6);
});
describe.each<SearchId>(['busca-linear', 'busca-binaria'])('%s', (id) => {
  it.each([
    [-9, 0],
    [2, 1],
    [30, 4],
    [99, null],
  ] as const)('busca %i', (target, expected) => {
    const input = [-9, 2, 4, 12, 30],
      timeline = searchingTimeline(id, input, target),
      last = timeline.at(-1)!;
    expect(last.found).toBe(expected);
    expect(last.operation).toBe('concluido');
    expect(last.metrics.comparisons).toBe(last.visited.length);
    expect(last.metrics.comparisons).toBeLessThanOrEqual(id === 'busca-binaria' ? 3 : input.length);
    timeline.forEach((step) => expect(step.values).toEqual(input));
    expect(searchingTimeline(id, input, target)).toEqual(timeline);
  });
  it('trata array vazio', () => {
    const last = searchingTimeline(id, [], 1).at(-1)!;
    expect(last.found).toBeNull();
    expect(last.metrics.comparisons).toBe(0);
  });
  it('trata um elemento', () => {
    expect(searchingTimeline(id, [1], 1).at(-1)?.found).toBe(0);
    expect(searchingTimeline(id, [1], 2).at(-1)?.found).toBeNull();
  });
});
it('rejeita entrada desordenada na busca binária', () =>
  expect(() => searchingTimeline('busca-binaria', [3, 1, 2], 2)).toThrow('ordem crescente'));
it('busca linear retorna a primeira ocorrência', () =>
  expect(searchingTimeline('busca-linear', [2, 3, 2], 2).at(-1)?.found).toBe(0));
it('busca binária reduz o intervalo sem perder o alvo', () => {
  const timeline = searchingTimeline('busca-binaria', [1, 3, 5, 7, 9, 11, 13], 13);
  const sizes = timeline.map((s) => s.right - s.left + 1);
  sizes.forEach((n, i) => {
    if (i) expect(n).toBeLessThanOrEqual(sizes[i - 1]!);
  });
  expect(timeline.at(-1)?.found).toBe(6);
});
describe('entrada', () => {
  it('aceita inteiros, negativos e delimitadores', () =>
    expect(parseInput(' -3, 0; 5 9 ')).toEqual([-3, 0, 5, 9]));
  it.each(['', '2, a', '1.5, 3', '1000', '-1000', Array(33).fill('1').join(',')])(
    'rejeita %s',
    (input) => expect(() => parseInput(input)).toThrow(),
  );
  it('gera padrões e respeita os limites', () => {
    const a = generateInput(32, 'crescente'),
      b = generateInput(32, 'decrescente');
    expect(a).toEqual([...a].sort((x, y) => x - y));
    expect(b).toEqual([...b].sort((x, y) => y - x));
    expect(generateInput(100, 'aleatorio')).toHaveLength(32);
    expect(new Set(generateInput(32, 'repetidos')).size).toBeLessThanOrEqual(5);
  });
});
