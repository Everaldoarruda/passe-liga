import type { Jogador } from '@prisma/client';
import { LINEUP_SIZE } from '../domain/lineup';
import { byCriteria } from '../players/player-list';
import { toPlayerResponse } from '../players/player.presenter';

// Os titulares saem na ordem do elenco (RN11); complete = 5 titulares com formação salva
export function toLineupResponse(clubId: number, formation: string | null, players: Jogador[]) {
  const ordered = players
    .map(toPlayerResponse)
    .sort(byCriteria([{ field: 'position', descending: false }]));
  return {
    club_id: clubId,
    formation,
    complete: formation !== null && ordered.length === LINEUP_SIZE,
    players: ordered,
  };
}