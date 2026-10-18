import type { Position } from '../api/types';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'];

// Quantos jogadores de linha em cada setor, na ordem defesa, meio e ataque (RN19)
const SECTORS: Record<string, [number, number, number]> = {
  '3-1': [3, 0, 1],
  '2-2': [2, 0, 2],
  '2-1-1': [2, 1, 1],
  '1-2-1': [1, 2, 1],
};

export interface Slot {
  key: string;
  label: string;
  positions: Position[];
}

const repeat = (count: number, key: string, label: string, positions: Position[]): Slot[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `${key}${index + 1}`,
    label: `${label} ${index + 1}`,
    positions,
  }));

export function slotsFor(formation: string): Slot[] {
  const [defense, midfield, attack] = SECTORS[formation];
  return [
    { key: 'GOL', label: 'Goleiro', positions: ['GOL'] },
    ...repeat(defense, 'DEF', 'Defensor', ['ZAG', 'LAT']),
    ...repeat(midfield, 'MEI', 'Meia', ['MEI']),
    ...repeat(attack, 'ATA', 'Atacante', ['ATA']),
  ];
}
