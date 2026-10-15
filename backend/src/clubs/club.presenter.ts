import type { Clube, Jogador } from '@prisma/client';
import { fromCents, toCents } from '../domain/money';
import type { PlayerResponse } from '../players/player.presenter';

export type ClubWithPlayers = Clube & { jogadores: Jogador[] };

export function toClubSummary(club: Clube, players: PlayerResponse[]) {
  const cashCents = toCents(Number(club.caixa));
  const squadCents = players.reduce((sum, p) => sum + toCents(p.market_value), 0);
  return {
    id: club.id,
    name: club.nome,
    acronym: club.sigla,
    cash: fromCents(cashCents),
    squad_value: fromCents(squadCents),
    net_worth: fromCents(cashCents + squadCents),
  };
}