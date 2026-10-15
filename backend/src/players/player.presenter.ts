import type { Jogador} from '@prisma/client';
import { fromCents, toCents } from '../domain/money';
import { marketValueCents, PlayerCondition } from '../domain/market-value';
import { overall, Position } from '../domain/player-value';

export function toPlayerResponse(row: Jogador) {
  const position = row.posicao as Position;
  const condition = row.condicao as PlayerCondition;
  const baseValue = Number(row.valorBase);

  return {
    id: row.id,
    name: row.nome,
    position,
    agility: row.agilidade,
    age: row.idade,
    condition,
    base_value: baseValue,
    market_value: fromCents(marketValueCents(toCents(baseValue), condition, row.agilidade, row.idade)),
    pace: row.velocidade,
    shooting: row.finalizacao,
    passing: row.passe,
    dribbling: row.drible,
    defending: row.defesa,
    physical: row.fisico,
    potential: row.potencial,
    overall: overall(position, {
      pace: row.velocidade,
      shooting: row.finalizacao,
      passing: row.passe,
      dribbling: row.drible,
      defending: row.defesa,
      physical: row.fisico,
    }),
    club_id: row.clubeId,
  };
}
export type PlayerResponse = ReturnType<typeof toPlayerResponse>;