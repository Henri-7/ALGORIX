import type { SortId, SortStep, Metrics, Operation } from '../engine/types';

/** Every event owns its snapshot. No renderer or timer is involved in computation. */
export function sortingTimeline(id: SortId, input: readonly number[]): SortStep[] {
  const a = [...input],
    steps: SortStep[] = [],
    settled = new Set<number>();
  const metrics: Metrics = { comparisons: 0, swaps: 0, writes: 0 };
  let pivot: number | null = null;
  const emit = (operation: Operation, active: number[], line: number, message: string) => {
    steps.push({
      id: steps.length,
      family: 'sorting',
      values: [...a],
      active: [...active],
      settled: [...settled],
      pivot,
      operation,
      line,
      message,
      metrics: { ...metrics },
    });
  };
  const compare = (i: number, j: number, line: number) => {
    metrics.comparisons++;
    emit(
      'comparacao',
      [i, j],
      line,
      `Comparando ${a[i]} (índice ${i}) com ${a[j]} (índice ${j}). ${a[i]! > a[j]! ? 'O primeiro valor é maior.' : 'O primeiro valor é menor ou igual.'}`,
    );
    return a[i]! - a[j]!;
  };
  const swap = (i: number, j: number, line: number) => {
    if (i === j) return;
    const x = a[i]!,
      y = a[j]!;
    [a[i], a[j]] = [y, x];
    metrics.swaps++;
    metrics.writes += 2;
    emit(
      'troca',
      [i, j],
      line,
      `Trocamos ${x} e ${y} entre os índices ${i} e ${j}. Uma troca realiza duas escritas no array.`,
    );
  };
  emit('inicio', [], 0, `Entrada com ${a.length} elementos. A ordenação será crescente.`);
  if (id === 'bubble-sort') {
    for (let end = a.length - 1; end > 0; end--) {
      let changed = false;
      for (let i = 0; i < end; i++)
        if (compare(i, i + 1, 3) > 0) {
          swap(i, i + 1, 4);
          changed = true;
        }
      settled.add(end);
      emit('selecao', [end], 5, `O valor ${a[end]} chegou à posição definitiva ${end}.`);
      if (!changed) {
        emit('selecao', [], 6, 'Nenhuma troca nesta passagem: o restante já está ordenado.');
        break;
      }
    }
  } else if (id === 'selection-sort') {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++)
        if (compare(j, min, 3) < 0) {
          min = j;
          emit('selecao', [min], 4, `${a[min]} é o menor valor encontrado nesta passagem.`);
        }
      swap(i, min, 5);
      settled.add(i);
      emit('selecao', [i], 6, `O menor valor restante, ${a[i]}, está na posição definitiva ${i}.`);
    }
  } else if (id === 'insertion-sort') {
    for (let i = 1; i < a.length; i++) {
      const key = a[i]!;
      let j = i - 1;
      emit('selecao', [i], 2, `Guardamos a chave ${key} para inseri-la no prefixo ordenado.`);
      while (j >= 0) {
        metrics.comparisons++;
        emit(
          'comparacao',
          [j],
          3,
          `Comparando ${a[j]} com a chave ${key}, guardada fora do array.`,
        );
        if (a[j]! <= key) break;
        a[j + 1] = a[j]!;
        metrics.writes++;
        emit(
          'escrita',
          [j, j + 1],
          4,
          `Deslocamos ${a[j]} uma posição à direita. A chave ${key} permanece guardada.`,
        );
        j--;
      }
      a[j + 1] = key;
      metrics.writes++;
      emit(
        'escrita',
        [j + 1],
        5,
        `Inserimos a chave ${key} no índice ${j + 1}. O prefixo até ${i} está ordenado, mas ainda pode mudar.`,
      );
    }
  } else if (id === 'merge-sort') {
    const merge = (lo: number, hi: number) => {
      if (hi - lo <= 1) return;
      const mid = Math.floor((lo + hi) / 2);
      emit(
        'selecao',
        Array.from({ length: hi - lo }, (_, k) => lo + k),
        2,
        `Dividimos o intervalo [${lo}, ${hi - 1}] em duas metades.`,
      );
      merge(lo, mid);
      merge(mid, hi);
      const left = a.slice(lo, mid),
        right = a.slice(mid, hi);
      let i = 0,
        j = 0,
        k = lo;
      while (i < left.length || j < right.length) {
        let fromLeft: boolean;
        if (i < left.length && j < right.length) {
          metrics.comparisons++;
          emit(
            'comparacao',
            [k],
            4,
            `Nos buffers auxiliares, comparamos ${left[i]} e ${right[j]}. Em empate, a metade esquerda vem primeiro.`,
          );
          fromLeft = left[i]! <= right[j]!;
        } else fromLeft = i < left.length;
        a[k] = fromLeft ? left[i++]! : right[j++]!;
        metrics.writes++;
        emit(
          'escrita',
          [k],
          5,
          `Escrevemos ${a[k]} no índice ${k} a partir do buffer auxiliar. Isto é uma escrita, não uma troca.`,
        );
        k++;
      }
    };
    merge(0, a.length);
  } else {
    const quick = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        settled.add(lo);
        return;
      }
      pivot = hi;
      emit('selecao', [hi], 2, `Escolhemos ${a[hi]} como pivô (último elemento do intervalo).`);
      let boundary = lo;
      for (let j = lo; j < hi; j++)
        if (compare(j, hi, 4) <= 0) {
          swap(boundary, j, 5);
          boundary++;
        }
      swap(boundary, hi, 6);
      pivot = boundary;
      settled.add(boundary);
      emit(
        'selecao',
        [boundary],
        6,
        `O pivô ${a[boundary]} está em sua posição definitiva ${boundary}.`,
      );
      pivot = null;
      quick(lo, boundary - 1);
      quick(boundary + 1, hi);
    };
    quick(0, a.length - 1);
  }
  pivot = null;
  a.forEach((_, i) => settled.add(i));
  emit(
    'concluido',
    [],
    7,
    `Ordenação concluída. ${metrics.comparisons} comparações, ${metrics.swaps} trocas e ${metrics.writes} escritas no array principal.`,
  );
  return steps;
}
