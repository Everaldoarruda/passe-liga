import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Jogador } from '@prisma/client';
import { lockClub } from '../common/club-lock';
import { Formation, formationFits } from '../domain/lineup';
import type { Position } from '../domain/player-value';
import { PrismaService } from '../prisma/prisma.service';
import { parseLineup } from './lineup-input';
import { toLineupResponse } from './lineup.presenter';

@Injectable()
export class LineupService {
  constructor(private readonly prisma: PrismaService) {}

  async get(clubId: number) {
    const club = await this.prisma.clube.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Clube não encontrado.');

    const rows = await this.prisma.escalacao.findMany({
      where: { clubeId: clubId },
      include: { jogador: true },
    });
    return toLineupResponse(club.id, club.formacao, rows.map((row) => row.jogador));
  }

  async replace(clubId: number, body: unknown) {
    const input = parseLineup(body);

    return this.prisma.$transaction(async (tx) => {
      await lockClub(tx, clubId);

      const players = await tx.jogador.findMany({
        where: { id: { in: input.playerIds }, excluidoEm: null },
      });
      if (players.length !== input.playerIds.length) {
        throw new NotFoundException('Jogador não encontrado.');
      }
      this.assertEligible(players, clubId, input.formation);

      await tx.escalacao.deleteMany({ where: { clubeId: clubId } });
      await tx.escalacao.createMany({
        data: input.playerIds.map((jogadorId) => ({ clubeId: clubId, jogadorId })),
      });
      await tx.clube.update({ where: { id: clubId }, data: { formacao: input.formation } });

      return toLineupResponse(clubId, input.formation, players);
    });
  }

  private assertEligible(players: Jogador[], clubId: number, formation: Formation): void {
    if (players.some((player) => player.clubeId !== clubId)) {
      throw new ConflictException('Todos os titulares precisam ser do elenco do clube.');
    }
    if (players.some((player) => player.condicao === 'DOENTE')) {
      throw new ConflictException('Jogador DOENTE não pode ser escalado.');
    }
    const positions = players.map((player) => player.posicao as Position);
    if (!formationFits(formation, positions)) {
      throw new ConflictException(`As posições não fecham a formação ${formation}.`);
    }
  }
}