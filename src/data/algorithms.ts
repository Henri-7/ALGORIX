import type { AlgorithmId } from '../engine/types';
export interface Algorithm {
  id: AlgorithmId;
  name: string;
  category: 'Ordenação' | 'Busca';
  description: string;
  how: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: string;
  use: string;
  advantage: string;
  limitation: string;
  code: string[];
}
export const algorithms: Algorithm[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Ordenação',
    description: 'Pequenas trocas. Uma grande transformação.',
    how: 'Compara vizinhos e troca os que estão fora de ordem. A cada passagem, o maior valor restante chega ao fim. Para cedo se não houver trocas.',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: 'Sim',
    use: 'Aprender comparação e troca; verificar entradas pequenas quase ordenadas.',
    advantage: 'Simples e estável, com parada antecipada.',
    limitation: 'Muitas comparações e trocas em grandes entradas.',
    code: [
      'receber array A',
      'para fim de n−1 até 1:',
      '  mudou ← falso; para i de 0 até fim−1:',
      '    comparar A[i] com A[i+1]',
      '    se A[i] > A[i+1]: trocar; mudou ← verdadeiro',
      '  marcar fim como definitivo',
      '  se não mudou: encerrar',
      'retornar A ordenado',
    ],
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Ordenação',
    description: 'Encontre o menor. Coloque-o no lugar.',
    how: 'Percorre a região não ordenada procurando o menor valor, depois o troca com o primeiro elemento dessa região.',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: 'Não',
    use: 'Entradas pequenas em que reduzir a quantidade de trocas importa.',
    advantage: 'No máximo n−1 trocas.',
    limitation: 'Sempre faz comparações quadráticas; pode inverter valores iguais.',
    code: [
      'receber array A',
      'para i de 0 até n−2:',
      '  mínimo ← i; para j de i+1 até n−1:',
      '    comparar A[j] com A[mínimo]',
      '    se menor: mínimo ← j',
      '  trocar A[i] com A[mínimo] se distintos',
      '  marcar i como definitivo',
      'retornar A ordenado',
    ],
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Ordenação',
    description: 'Cada valor encontra seu espaço.',
    how: 'Guarda uma chave e desloca à direita os valores maiores no prefixo ordenado. Insere a chave no espaço aberto.',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: 'Sim',
    use: 'Pequenos lotes ou sequências quase ordenadas, como uma mão de cartas.',
    advantage: 'Adaptativo e estável; eficiente em entradas quase ordenadas.',
    limitation:
      'Deslocamentos quadráticos no pior caso. O array pode repetir um valor temporariamente enquanto a chave está guardada.',
    code: [
      'receber array A',
      'para i de 1 até n−1:',
      '  chave ← A[i]; j ← i−1',
      '  enquanto j ≥ 0 e A[j] > chave:',
      '    A[j+1] ← A[j]; j ← j−1',
      '  A[j+1] ← chave',
      '  continuar com a próxima chave',
      'retornar A ordenado',
    ],
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Ordenação',
    description: 'Divida o problema. Combine a solução.',
    how: 'Divide recursivamente o array e intercala metades ordenadas usando buffers auxiliares. Em empates, escolhe a metade esquerda.',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: 'Sim',
    use: 'Ordenação estável de registros, como pedidos agrupados por data.',
    advantage: 'Desempenho assintótico previsível e estabilidade.',
    limitation:
      'Precisa de memória auxiliar. As escritas exibidas contam apenas o array principal, não os buffers.',
    code: [
      'receber array A',
      'se intervalo tem até 1 elemento: retornar',
      'dividir intervalo ao meio',
      'ordenar recursivamente as duas metades',
      'comparar frentes dos buffers; preferir esquerda no empate',
      'escrever menor no array; avançar buffer escolhido',
      'repetir até esvaziar os dois buffers',
      'retornar A ordenado',
    ],
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Ordenação',
    description: 'Um pivô. Duas novas perspectivas.',
    how: 'Usa partição de Lomuto com o último elemento como pivô. Move valores menores ou iguais para a esquerda e ordena os dois lados recursivamente.',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(n)',
    stable: 'Não',
    use: 'Estudar particionamento e ordenação em memória. O caso médio supõe entradas em ordem aleatória.',
    advantage: 'Particiona no próprio array, sem buffers de intercalação.',
    limitation:
      'Pivô final degrada em entradas ordenadas ou com muitas repetições. Pilha média O(log n), pior O(n).',
    code: [
      'receber array A',
      'se intervalo tem até 1 elemento: retornar',
      'pivô ← A[fim]; limite ← início',
      'para j de início até fim−1:',
      '  comparar A[j] com pivô',
      '  se A[j] ≤ pivô: trocar com limite; limite++',
      'trocar pivô com limite; ordenar os dois lados',
      'retornar A ordenado',
    ],
  },
  {
    id: 'busca-linear',
    name: 'Busca Linear',
    category: 'Busca',
    description: 'Uma posição por vez. Nenhuma suposição.',
    how: 'Visita cada posição, da esquerda para a direita, até encontrar o alvo ou esgotar o array. Retorna a primeira ocorrência.',
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    stable: 'Não se aplica',
    use: 'Procurar um item em uma lista pequena ou não ordenada.',
    advantage: 'Funciona sem pré-processamento da entrada.',
    limitation: 'Pode visitar todos os elementos.',
    code: [
      'receber array A e alvo',
      'para i de 0 até n−1:',
      '  comparar A[i] com alvo',
      '  se iguais:',
      '    retornar índice encontrado',
      '  continuar para o próximo elemento',
      'fim do laço',
      'retornar não encontrado',
    ],
  },
  {
    id: 'busca-binaria',
    name: 'Busca Binária',
    category: 'Busca',
    description: 'Corte as possibilidades pela metade.',
    how: 'Em um array crescente, compara o alvo ao centro do intervalo. Descarta a metade que não pode conter o valor e repete.',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    stable: 'Não se aplica',
    use: 'Consultar valores em tabelas ordenadas com acesso direto por índice.',
    advantage: 'Reduz o intervalo a cada comparação.',
    limitation:
      'Exige entrada ordenada. Com duplicados, retorna uma ocorrência, não necessariamente a primeira. A validação da entrada custa O(n).',
    code: [
      'receber array crescente A e alvo',
      'esquerda ← 0; direita ← n−1',
      'enquanto esquerda ≤ direita:',
      '  meio ← ⌊(esquerda+direita)/2⌋; comparar',
      '  se A[meio] = alvo: retornar meio',
      '  se A[meio] < alvo: esquerda ← meio+1',
      '  senão: direita ← meio−1',
      'retornar não encontrado',
    ],
  },
];
export const sortingAlgorithms = algorithms.filter((a) => a.category === 'Ordenação');
export function algorithmPath(a: Algorithm) {
  return `/laboratorio/${a.category === 'Ordenação' ? 'ordenacao' : 'busca'}/${a.id}`;
}
