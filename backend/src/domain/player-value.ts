import { divideRounded, MIN_VALUE_CENTS } from './money';

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

export interface Attributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

// Pesos de cada atributo por posição, em % (cada linha soma 100)
const WEIGHTS: Record<Position, Attributes> = {
  GOL: { pace: 10, shooting: 0, passing: 20, dribbling: 0, defending: 40, physical: 30 },
  ZAG: { pace: 10, shooting: 0, passing: 15, dribbling: 0, defending: 45, physical: 30 },
  LAT: { pace: 25, shooting: 0, passing: 20, dribbling: 15, defending: 25, physical: 15 },
  MEI: { pace: 10, shooting: 15, passing: 35, dribbling: 25, defending: 5, physical: 10 },
  ATA: { pace: 20, shooting: 40, passing: 10, dribbling: 20, defending: 0, physical: 10 },
};

export function overall(position: Position, attributes: Attributes): number {
  const weights = WEIGHTS[position];
  const sum = (Object.keys(weights) as (keyof Attributes)[]).reduce(
    (total, key) => total + attributes[key] * weights[key],
    0,
  );
  return divideRounded(sum, 100);
}

// Quantos pontos do overall caem dentro da faixa (from, to]
function pointsInBand(value: number, from: number, to: number): number {
  return Math.min(Math.max(value - from, 0), to - from);
}

export function baseValueCents(overallValue: number, potential: number, age: number): number {
  // 0,50 por ponto de 41 a 60; 2,00 de 61 a 75; 6,00 de 76 a 99 (em centavos)
  const part =
    50 * pointsInBand(overallValue, 40, 60) +
    200 * pointsInBand(overallValue, 60, 75) +
    600 * pointsInBand(overallValue, 75, 99);

  const value = age <= 21 ? divideRounded(part * (100 + potential - overallValue), 100) : part;
  return Math.max(value, MIN_VALUE_CENTS);
}
