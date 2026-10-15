export const normalizeSpaces = (text: string): string =>
  text.replace(/ {2,}/g, ' ').replace(/^ | $/g, '');

export const hasControlCharacters = (text: string): boolean => /\p{Cc}/u.test(text);

// Minúsculas e sem acentos, para busca e ordenação por nome
export const normalizeForComparison = (text: string): string =>
  text.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

export function compareNames(a: string, b: string): number {
  const x = normalizeForComparison(a);
  const y = normalizeForComparison(b);
  return x < y ? -1 : x > y ? 1 : 0;
}