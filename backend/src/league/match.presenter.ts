import type { Clube, DueloPartida, Partida } from '@prisma/client';
import { formatBrasilia } from '../domain/brasilia-date';
import { matchResult } from '../domain/match';

type MatchHeader = Partida & { mandante: Clube; visitante: Clube };
type MatchDetails = MatchHeader & { duelos: DueloPartida[] };

function toDuelResponse(duel: DueloPartida) {
  return {
    order: duel.ordem,
    attacking_club_id: duel.clubeAtacanteId,
    attacker: {
      player_id: duel.atacanteId,
      player_name: duel.nomeAtacante,
      position: duel.posicaoAtacante,
      condition: duel.condicaoAtacante,
      attribute: duel.atributoAtaque,
      value: duel.valorAtaque,
    },
    defender: {
      player_id: duel.defensorId,
      player_name: duel.nomeDefensor,
      position: duel.posicaoDefensor,
      condition: duel.condicaoDefensor,
      attribute: duel.atributoDefesa,
      value: duel.valorDefesa,
    },
    goal: duel.gol,
  };
}

export function toMatchSummary(match: MatchHeader) {
  return {
    id: match.id,
    played_at: formatBrasilia(match.jogadaEm),
    home: {
      club_id: match.mandanteId,
      club_name: match.mandante.nome,
      formation: match.formacaoMandante,
      goals: match.golsMandante,
    },
    away: {
      club_id: match.visitanteId,
      club_name: match.visitante.nome,
      formation: match.formacaoVisitante,
      goals: match.golsVisitante,
    },
    result: matchResult(match.golsMandante, match.golsVisitante),
  };
}

export function toMatchResponse(match: MatchDetails) {
  return { ...toMatchSummary(match), duels: match.duelos.map(toDuelResponse) };
}
