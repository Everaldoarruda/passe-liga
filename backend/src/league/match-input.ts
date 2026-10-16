import { asObject, Body } from '../common/body';
import { fail } from '../common/fail';
import { MAX_ID } from '../common/limits';

export interface MatchInput {
  homeClubId: number;
  awayClubId: number;
}

function readClubId(body: Body, field: string): number {
  const value = body[field];
  if (value === undefined || value === null) return fail(`O campo ${field} é obrigatório.`);
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > MAX_ID) {
    return fail(`O campo ${field} deve ser um inteiro positivo.`);
  }
  return value;
}

export function parseMatch(raw: unknown): MatchInput {
  const body = asObject(raw);
  const homeClubId = readClubId(body, 'home_club_id');
  const awayClubId = readClubId(body, 'away_club_id');
  if (homeClubId === awayClubId) return fail('O mandante e o visitante devem ser clubes diferentes.');
  return { homeClubId, awayClubId };
}