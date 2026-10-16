import type { Jogador, Prisma } from '@prisma/client';
import type { PlayerCondition } from '../domain/market-value';
import type { Duel, Fielded } from '../domain/match';
import type { Position } from '../domain/player-value';

export function toFielded(row: Jogador): Fielded {
  return {
    id: row.id,
    name: row.nome,
    position: row.posicao as Position,
    condition: row.condicao as PlayerCondition,
    pace: row.velocidade,
    shooting: row.finalizacao,
    passing: row.passe,
    dribbling: row.drible,
    defending: row.defesa,
    physical: row.fisico,
  };
}

export function toDuelData(matchId: number, duel: Duel): Prisma.DueloPartidaCreateManyInput {
  return {
    partidaId: matchId,
    ordem: duel.order,
    clubeAtacanteId: duel.attackingClubId,
    atacanteId: duel.attacker.playerId,
    defensorId: duel.defender.playerId,
    nomeAtacante: duel.attacker.playerName,
    nomeDefensor: duel.defender.playerName,
    posicaoAtacante: duel.attacker.position,
    posicaoDefensor: duel.defender.position,
    condicaoAtacante: duel.attacker.condition,
    condicaoDefensor: duel.defender.condition,
    atributoAtaque: duel.attacker.attribute,
    atributoDefesa: duel.defender.attribute,
    valorAtaque: duel.attacker.value,
    valorDefesa: duel.defender.value,
    gol: duel.goal,
  };
}
