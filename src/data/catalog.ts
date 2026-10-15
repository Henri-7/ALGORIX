import { algorithms, algorithmPath } from './algorithms';
import { networkAlgorithms } from './networkAlgorithms';
export const catalogEntries = [
  ...algorithms.map((a) => ({ ...a, path: algorithmPath(a) })),
  ...networkAlgorithms,
];
