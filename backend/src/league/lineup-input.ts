import { asObject, Body } from '../common/body';
import { fail } from '../common/fail';
import { MAX_ID } from '../common/limits';
import { Formation, FORMATIONS, LINEUP_SIZE } from '../domain/lineup';

export interface LineupInput {
  formation: Formation;
  playerIds: number[];
}

function readFormation(body: Body): Formation {
  const value = body.formation;
  if (value === undefined || value === null) return fail('O campo formation é obrigatório.');
  if (typeof value !== 'string' || !FORMATIONS.includes(value as Formation)) {
    return fail('O campo formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1.');
  }
  return value as Formation;
}

function readPlayerIds(body: Body): number[] {
  const value = body.player_ids;
  if (value === undefined || value === null) return fail('O campo player_ids é obrigatório.');
  if (!Array.isArray(value)) return fail('O campo player_ids deve ser uma lista.');
  if (value.length !== LINEUP_SIZE) return fail('O campo player_ids deve ter exatamente 5 ids.');
  const valid = value.every(
    (id) => typeof id === 'number' && Number.isInteger(id) && id >= 1 && id <= MAX_ID,
  );
  if (!valid) return fail('Os ids de player_ids devem ser inteiros positivos.');
  if (new Set(value).size !== value.length) return fail('Os ids de player_ids não podem se repetir.');
  return value as number[];
}

export function parseLineup(raw: unknown): LineupInput {
  const body = asObject(raw);
  return { formation: readFormation(body), playerIds: readPlayerIds(body) };
}