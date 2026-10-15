import type { SearchId, SearchStep } from '../engine/types';
export function searchingTimeline(
  id: SearchId,
  input: readonly number[],
  target: number,
): SearchStep[] {
  if (id === 'busca-binaria' && input.some((v, i) => i > 0 && v < input[i - 1]!))
    throw new Error(
      'A busca binária exige valores em ordem crescente. Ordene a entrada antes de continuar.',
    );
  const steps: SearchStep[] = [],
    visited: number[] = [];
  let left = 0,
    right = input.length - 1,
    comparisons = 0,
    found: number | null = null;
  const emit = (
    active: number[],
    line: number,
    message: string,
    operation: SearchStep['operation'],
  ) =>
    steps.push({
      id: steps.length,
      family: 'searching',
      values: [...input],
      active,
      line,
      message,
      operation,
      metrics: { comparisons, swaps: 0, writes: 0 },
      visited: [...visited],
      left,
      right,
      found,
      target,
    });
  emit([], 0, `Vamos procurar o valor ${target}. Os índices começam em zero.`, 'inicio');
  if (id === 'busca-linear') {
    for (let i = 0; i < input.length; i++) {
      comparisons++;
      visited.push(i);
      emit(
        [i],
        2,
        `Visitamos o índice ${i}: ${input[i]} ${input[i] === target ? 'é igual' : 'é diferente'} ao alvo ${target}.`,
        'comparacao',
      );
      if (input[i] === target) {
        found = i;
        break;
      }
    }
  } else {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      comparisons++;
      visited.push(mid);
      emit(
        [mid],
        3,
        `Intervalo [${left}, ${right}]. O centro é ${mid}, com valor ${input[mid]}. Comparamos com ${target}.`,
        'comparacao',
      );
      if (input[mid] === target) {
        found = mid;
        break;
      }
      if (input[mid]! < target) {
        left = mid + 1;
        emit(
          [],
          5,
          `${input[mid]} é menor que ${target}. Descartamos os índices até ${mid}; o limite esquerdo agora é ${left}.`,
          'selecao',
        );
      } else {
        right = mid - 1;
        emit(
          [],
          6,
          `${input[mid]} é maior que ${target}. Descartamos os índices a partir de ${mid}; o limite direito agora é ${right}.`,
          'selecao',
        );
      }
    }
  }
  emit(
    found === null ? [] : [found],
    found === null ? 7 : 4,
    found === null
      ? `O valor ${target} não está na entrada. Busca encerrada após ${comparisons} comparações.`
      : `Encontramos ${target} no índice ${found}, após ${comparisons} comparações.`,
    'concluido',
  );
  return steps;
}
