import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { lockClub } from '../common/club-lock';
import { readIdParam } from '../common/query';
import { LINEUP_SIZE } from '../domain/lineup';
import { playMatch, Team } from '../domain/match';
import { PrismaService } from '../prisma/prisma.service';
import { parseMatch } from './match-input';
import { toDuelData, toFielded } from './match.mapper';
import { toMatchResponse, toMatchSummary } from './match.presenter';

const WITH_DETAILS = {
  mandante: true,
  visitante: true,
  duelos: { orderBy: { ordem: 'asc' } },
} satisfies Prisma.PartidaInclude;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async play(body: unknown) {
    const input = parseMatch(body);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const ids = [input.homeClubId, input.awayClubId].sort((a, b) => a - b);
      for (const id of ids) await lockClub(tx, id);

      const home = await this.loadTeam(tx, input.homeClubId);
      const away = await this.loadTeam(tx, input.awayClubId);
      const outcome = playMatch(home.team, away.team);

      const match = await tx.partida.create({
        data: {
          mandanteId: input.homeClubId,
          visitanteId: input.awayClubId,
          golsMandante: outcome.homeGoals,
          golsVisitante: outcome.awayGoals,
          formacaoMandante: home.formation,
          formacaoVisitante: away.formation,
          jogadaEm: now,
        },
      });
      await tx.dueloPartida.createMany({
        data: outcome.duels.map((duel) => toDuelData(match.id, duel)),
      });

      const saved = await tx.partida.findUniqueOrThrow({
        where: { id: match.id },
        include: WITH_DETAILS,
      });
      return toMatchResponse(saved);
    });
  }

  async list(rawQuery: Record<string, unknown>) {
    const clubId = readIdParam(rawQuery, 'club_id');
    if (clubId !== undefined) {
      const club = await this.prisma.clube.findUnique({ where: { id: clubId } });
      if (!club) throw new NotFoundException('Clube não encontrado.');
    }

    const rows = await this.prisma.partida.findMany({
      where: clubId === undefined ? undefined : { OR: [{ mandanteId: clubId }, { visitanteId: clubId }] },
      include: { mandante: true, visitante: true },
      orderBy: [{ jogadaEm: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toMatchSummary);
  }

  async findOne(id: number) {
    const match = await this.prisma.partida.findUnique({ where: { id }, include: WITH_DETAILS });
    if (!match) throw new NotFoundException('Partida não encontrada.');
    return toMatchResponse(match);
  }

  private async loadTeam(
    tx: Prisma.TransactionClient,
    clubId: number,
  ): Promise<{ formation: string; team: Team }> {
    const club = await tx.clube.findUniqueOrThrow({ where: { id: clubId } });
    const rows = await tx.escalacao.findMany({
      where: { clubeId: clubId },
      include: { jogador: true },
    });
    if (club.formacao === null || rows.length !== LINEUP_SIZE) {
      throw new ConflictException(`O clube ${club.nome} não tem a escalação completa.`);
    }
    return {
      formation: club.formacao,
      team: { clubId, players: rows.map((row) => toFielded(row.jogador)) },
    };
  }
}