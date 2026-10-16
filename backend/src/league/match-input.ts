import { asObject, readId } from '../common/body';
import { fail } from '../common/fail';

export interface MatchInput {
  homeClubId: number;
  awayClubId: number;
}

export function parseMatch(raw: unknown): MatchInput {
  const body = asObject(raw);
  const homeClubId = readId(body, 'home_club_id');
  const awayClubId = readId(body, 'away_club_id');
  if (homeClubId === awayClubId) return fail('O mandante e o visitante devem ser clubes diferentes.');
  return { homeClubId, awayClubId };
}
