export const MAX_SIZE = 32;
export const INITIAL_VALUES = [42, 18, 65, 29, 53, 12, 78, 36, 91, 24, 58, 45];
export type Pattern = 'aleatorio' | 'crescente' | 'decrescente' | 'quase' | 'repetidos';
export function parseInput(text: string): number[] {
  const tokens = text
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (!tokens.length) throw new Error('Insira pelo menos um número.');
  if (tokens.length > MAX_SIZE) throw new Error(`Use no máximo ${MAX_SIZE} valores.`);
  if (tokens.some((token) => !/^[+-]?\d+$/.test(token)))
    throw new Error('Use números inteiros entre −999 e 999, separados por vírgulas.');
  const values = tokens.map(Number);
  if (values.some((v) => !Number.isInteger(v) || Math.abs(v) > 999))
    throw new Error('Use números inteiros entre −999 e 999, separados por vírgulas.');
  return values;
}
export function generateInput(size: number, pattern: Pattern): number[] {
  if (!Number.isFinite(size)) throw new Error('O tamanho deve ser um número finito.');
  const n = Math.max(2, Math.min(MAX_SIZE, Math.floor(size)));
  const a = Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 95));
  if (pattern === 'repetidos') return a.map((v) => ((v % 5) + 1) * 15);
  if (pattern !== 'aleatorio') a.sort((x, y) => x - y);
  if (pattern === 'decrescente') a.reverse();
  if (pattern === 'quase' && n > 2) [a[1], a[n - 2]] = [a[n - 2]!, a[1]!];
  return a;
}
