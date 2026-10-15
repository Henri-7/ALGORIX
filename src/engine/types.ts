export type SortId =
  'bubble-sort' | 'selection-sort' | 'insertion-sort' | 'merge-sort' | 'quick-sort';
export type SearchId = 'busca-linear' | 'busca-binaria';
export type AlgorithmId = SortId | SearchId;
export type Operation = 'inicio' | 'comparacao' | 'troca' | 'escrita' | 'selecao' | 'concluido';
export interface Metrics {
  comparisons: number;
  swaps: number;
  writes: number;
}
interface BaseStep {
  id: number;
  values: readonly number[];
  active: readonly number[];
  line: number;
  message: string;
  metrics: Readonly<Metrics>;
  operation: Operation;
}
export interface SortStep extends BaseStep {
  family: 'sorting';
  settled: readonly number[];
  pivot: number | null;
}
export interface SearchStep extends BaseStep {
  family: 'searching';
  visited: readonly number[];
  left: number;
  right: number;
  found: number | null;
  target: number;
}
export type Step = SortStep | SearchStep;
