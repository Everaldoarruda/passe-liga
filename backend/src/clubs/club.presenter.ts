import type { Clube, Contrato, Jogador } from '@prisma/client';
import { fromCents, toCents } from '../domain/money';
import type { PlayerResponse } from '../players/player.presenter';
import { formatBrasilia } from '../domain/brasilia-date';
import { penaltyRate, remainingDays } from '../domain/trade';


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
export function toContract(contract: Contrato, now: Date) {
  const days = remainingDays(contract.fidelidadeAte, now);
  return {
    purchase_value: Number(contract.valorCompra),
    loyalty_until: formatBrasilia(contract.fidelidadeAte),
    remaining_days: days,
    penalty_rate: penaltyRate(days),
  };
}