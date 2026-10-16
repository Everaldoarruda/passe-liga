import { asObject, Body, readChoice, readRequired } from '../common/body';
import { fail } from '../common/fail';
import { isId } from '../common/limits';
import { Formation, FORMATIONS, LINEUP_SIZE } from '../domain/lineup';

export interface LineupInput {
  formation: Formation;
  playerIds: number[];
}

function readPlayerIds(body: Body): number[] {
  const value = readRequired(body, 'player_ids');
  if (!Array.isArray(value)) return fail('O campo player_ids deve ser uma lista.');
  if (value.length !== LINEUP_SIZE) return fail('O campo player_ids deve ter exatamente 5 ids.');
  if (!value.every(isId)) return fail('Os ids de player_ids devem ser inteiros positivos.');
  if (new Set(value).size !== value.length) return fail('Os ids de player_ids não podem se repetir.');
  return value as number[];
}

export function parseLineup(raw: unknown): LineupInput {
  const body = asObject(raw);
  return {
    formation: readChoice(
      body,
      'formation',
      FORMATIONS,
      'O campo formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1.',
    ),
    playerIds: readPlayerIds(body),
  };
}
