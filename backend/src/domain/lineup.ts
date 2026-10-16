import type { Position } from './player-value';

export type Formation = '3-1' | '2-2' | '2-1-1' | '1-2-1';

export const LINEUP_SIZE = 5;

interface Sectors {
  defense: number;
  midfield: number;
  attack: number;
}

// O goleiro fica fora da conta: são os 4 jogadores de linha por setor
const SECTORS: Record<Formation, Sectors> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

export const FORMATIONS = Object.keys(SECTORS) as Formation[];

export function formationFits(formation: Formation, positions: Position[]): boolean {
  if (positions.length !== LINEUP_SIZE) return false;
  const count = (wanted: Position[]) => positions.filter((p) => wanted.includes(p)).length;
  const sectors = SECTORS[formation];
  return (
    count(['GOL']) === 1 &&
    count(['ZAG', 'LAT']) === sectors.defense &&
    count(['MEI']) === sectors.midfield &&
    count(['ATA']) === sectors.attack
  );
}
