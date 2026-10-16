import { compareNames } from '../common/text';
import type { PlayerCondition } from './market-value';
import { divideRounded } from './money';
import { POSITIONS } from './player-enums';
import type { Attributes, Position } from './player-value';

export type AttributeName = 'shooting' | 'passing' | 'dribbling' | 'defending';
export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export interface Fielded extends Attributes {
  id: number;
  name: string;
  position: Position;
  condition: PlayerCondition;
}

export interface Team {
  clubId: number;
  players: Fielded[];
}

export interface DuelSide {
  playerId: number;
  playerName: string;
  position: Position;
  condition: PlayerCondition;
  attribute: AttributeName;
  value: number;
}

export interface Duel {
  order: number;
  attackingClubId: number;
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
}

export interface MatchOutcome {
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
  duels: Duel[];
}

const SQUAD_SIZE = 5;

// [atacante, defensor] pelo índice no elenco ordenado:
// 0 = goleiro; 1 a 4 = jogadores de linha, do mais recuado ao mais avançado
const PAIRINGS: readonly (readonly [number, number])[] = [
  [4, 0],
  [3, 1],
  [2, 2],
];

// Titular MAL_CONDICIONADO joga com 85% do atributo, arredondado com meio para cima
export function effectiveValue(player: Fielded, attribute: AttributeName): number {
  const value = player[attribute];
  return player.condition === 'MAL_CONDICIONADO' ? divideRounded(value * 85, 100) : value;
}

function attackAttribute(position: Position): AttributeName {
  switch (position) {
    case 'ATA':
      return 'shooting';
    case 'MEI':
      return 'passing';
    case 'ZAG':
    case 'LAT':
      return 'dribbling';
    default:
      throw new Error('O goleiro não ataca.');
  }
}

// Ordem do elenco: posição (GOL, ZAG, LAT, MEI, ATA), nome e id
function compareSquad(a: Fielded, b: Fielded): number {
  return (
    POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position) ||
    compareNames(a.name, b.name) ||
    a.id - b.id
  );
}

function orderedSquad(team: Team): Fielded[] {
  const squad = [...team.players].sort(compareSquad);
  if (squad.length !== SQUAD_SIZE || squad[0].position !== 'GOL') {
    throw new Error('A escalação precisa ter 5 titulares, com um goleiro.');
  }
  return squad;
}

function side(player: Fielded, attribute: AttributeName): DuelSide {
  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    condition: player.condition,
    attribute,
    value: effectiveValue(player, attribute),
  };
}

function attacks(attacking: Fielded[], defending: Fielded[], clubId: number, firstOrder: number): Duel[] {
  return PAIRINGS.map(([attackerIndex, defenderIndex], i) => {
    const attacker = attacking[attackerIndex];
    const attack = side(attacker, attackAttribute(attacker.position));
    const defense = side(defending[defenderIndex], 'defending');
    return {
      order: firstOrder + i,
      attackingClubId: clubId,
      attacker: attack,
      defender: defense,
      goal: attack.value > defense.value, // empate não é gol
    };
  });
}

export function matchResult(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals > awayGoals) return 'MANDANTE';
  if (homeGoals < awayGoals) return 'VISITANTE';
  return 'EMPATE';
}

export function playMatch(home: Team, away: Team): MatchOutcome {
  const homeSquad = orderedSquad(home);
  const awaySquad = orderedSquad(away);
  const duels = [
    ...attacks(homeSquad, awaySquad, home.clubId, 1),
    ...attacks(awaySquad, homeSquad, away.clubId, 4),
  ];
  const homeGoals = duels.slice(0, 3).filter((duel) => duel.goal).length;
  const awayGoals = duels.slice(3).filter((duel) => duel.goal).length;
  return { homeGoals, awayGoals, result: matchResult(homeGoals, awayGoals), duels };
}