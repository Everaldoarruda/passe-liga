export const MIN_VALUE_CENTS = 100; // 1.00

export function divideRounded(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}
export const toCents = (value: number): number => Math.round(value * 100);

export const fromCents = (cents: number): number => cents / 100;
// Para mensagens: 13058 => "130,58"; 13057.5 => "130,575"
export const formatMoney = (cents: number): string =>
  (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
