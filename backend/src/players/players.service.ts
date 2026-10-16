import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { fromCents } from '../domain/money';
import { baseValueCents, overall } from '../domain/player-value';
import { PrismaService } from '../prisma/prisma.service';
import { ListPlayersQuery, parseListPlayersQuery } from './list-players-query';
import { listPlayers } from './player-list';
import { parseCondition, parseCreatePlayer, parseUpdatePlayer } from './player-input';
import { toPlayerResponse } from './player.presenter';
import { lockClub } from '../common/club-lock';

function clubFilter(query: ListPlayersQuery): number | null | { not: null } | undefined {
  if (query.clubId !== undefined) return query.clubId;
  if (query.free === undefined) return undefined;
  return query.free ? null : { not: null };
}

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: unknown) {
    const input = parseCreatePlayer(body);
    const overallValue = overall(input.position, input);
    const baseCents = baseValueCents(overallValue, input.potential, input.age);

    const row = await this.prisma.jogador.create({
      data: {
        nome: input.name,
        posicao: input.position,
        agilidade: input.agility,
        idade: input.age,
        valorBase: fromCents(baseCents),
        velocidade: input.pace,
        finalizacao: input.shooting,
        passe: input.passing,
        drible: input.dribbling,
        defesa: input.defending,
        fisico: input.physical,
        potencial: input.potential,
      },
    });
    return toPlayerResponse(row);
  }

  async list(rawQuery: Record<string, unknown>) {
    const query = parseListPlayersQuery(rawQuery);
    if (query.clubId !== undefined) await this.assertClubExists(query.clubId);

    const where = {
      excluidoEm: null,
      posicao: query.position,
      condicao: query.condition,
      idade: { gte: query.minAge, lte: query.maxAge },
      clubeId: clubFilter(query),
    };
    const rows = await this.prisma.jogador.findMany({ where });

    const { data, totalItems } = listPlayers(rows.map(toPlayerResponse), query);
    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / query.limit),
      },
    };
  }

  async findOne(id: number) {
    return toPlayerResponse(await this.findActive(id));
  }

  async update(id: number, body: unknown) {
    const input = parseUpdatePlayer(body);
    const current = await this.findActive(id);
    if (input.age < current.idade) {
      throw new ConflictException('A idade não pode ser menor que a idade atual.');
    }
    if (current.clubeId !== null && input.position !== current.posicao) {
      throw new ConflictException('Jogador com clube não pode mudar de posição.');
    }

    const row = await this.prisma.jogador.update({
      where: { id },
      data: {
        nome: input.name,
        posicao: input.position,
        agilidade: input.agility,
        idade: input.age,
      },
    });
    return toPlayerResponse(row);
  }

  async changeCondition(id: number, body: unknown) {
    const condition = parseCondition(body);
    const current = await this.findActive(id);
    if (current.condicao === 'DOENTE' && condition === 'APTO') {
      throw new ConflictException('Jogador DOENTE não pode passar direto para APTO.');
    }
    if (current.condicao === condition) return toPlayerResponse(current);

    const row = await this.prisma.$transaction(async (tx) => {
      if (current.clubeId !== null) await lockClub(tx, current.clubeId);
      if (condition === 'DOENTE') await tx.escalacao.deleteMany({ where: { jogadorId: id } });
      return tx.jogador.update({ where: { id }, data: { condicao: condition } });
    });
    return toPlayerResponse(row);
  }

  async remove(id: number): Promise<void> {
    const current = await this.findActive(id);
    if (current.clubeId !== null) {
      throw new ConflictException('Jogador que está num clube não pode ser excluído.');
    }
    await this.prisma.jogador.update({ where: { id }, data: { excluidoEm: new Date() } });
  }

  private async findActive(id: number) {
    const row = await this.prisma.jogador.findFirst({ where: { id, excluidoEm: null } });
    if (!row) throw new NotFoundException('Jogador não encontrado.');
    return row;
  }

  private async assertClubExists(clubId: number): Promise<void> {
    const club = await this.prisma.clube.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Clube não encontrado.');
  }
}
