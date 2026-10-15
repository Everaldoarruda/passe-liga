import { Injectable, NotFoundException } from '@nestjs/common';
import { fromCents } from '../domain/money';
import { baseValueCents, overall } from '../domain/player-value';
import { PrismaService } from '../prisma/prisma.service';
import { parseCreatePlayer } from './player-input';
import { toPlayerResponse } from './player.presenter';

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

  async findOne(id: number) {
    const row = await this.prisma.jogador.findFirst({ where: { id, excluidoEm: null } });
    if (!row) throw new NotFoundException('Jogador não encontrado.');
    return toPlayerResponse(row);
  }
}