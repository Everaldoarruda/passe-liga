import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { byCriteria } from '../players/player-list';
import { toPlayerResponse } from '../players/player.presenter';
import { PrismaService } from '../prisma/prisma.service';
import { parseClubSort, sortClubs } from './club-list';
import { parseCreateClub } from './club-input';
import { ClubWithPlayers, toClubSummary, toContract } from './club.presenter';


const MAX_CLUBS = 20;
const WITH_PLAYERS = { jogadores: { where: { excluidoEm: null } } };
const WITH_PLAYERS_AND_CONTRACTS = {
  jogadores: {
    where: { excluidoEm: null },
    include: { contratos: { where: { situacao: 'ATIVO' } } },
  },
} satisfies Prisma.ClubeInclude;


@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const club = await this.prisma.clube.findUnique({
      where: { id },
      include: WITH_PLAYERS_AND_CONTRACTS,
    });
    if (!club) throw new NotFoundException('Clube não encontrado.');

    const now = new Date();
    const players = club.jogadores
      .map((row) => ({
        ...toPlayerResponse(row),
        contract: row.contratos[0] ? toContract(row.contratos[0], now) : null,
      }))
      .sort(byCriteria([{ field: 'position', descending: false }]));
    return { ...toClubSummary(club, players), players };
  }

  async create(body: unknown) {
    const input = parseCreateClub(body);
    await this.assertNameAndAcronymAvailable(input.name, input.acronym);

    try {
      const club = await this.prisma.$transaction(async (tx) => {
        if ((await tx.clube.count()) >= MAX_CLUBS) {
          throw new ConflictException('A liga aceita no máximo 20 clubes.');
        }
        return tx.clube.create({ data: { nome: input.name, sigla: input.acronym } });
      });
      return toClubSummary(club, []);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um clube com esse nome ou sigla.');
      }
      throw error;
    }
  }

  async list(rawQuery: Record<string, unknown>) {
    const sort = parseClubSort(rawQuery);
    const clubs = await this.prisma.clube.findMany({ include: WITH_PLAYERS });
    return sortClubs(clubs.map((club) => this.summarize(club)), sort);
  }

  private summarize(club: ClubWithPlayers) {
    return toClubSummary(club, club.jogadores.map(toPlayerResponse));
  }

  private async assertNameAndAcronymAvailable(name: string, acronym: string): Promise<void> {
    const sameName = await this.prisma.clube.findFirst({
      where: { nome: { equals: name, mode: 'insensitive' } },
    });
    if (sameName) throw new ConflictException('Já existe um clube com esse nome.');

    const sameAcronym = await this.prisma.clube.findUnique({ where: { sigla: acronym } });
    if (sameAcronym) throw new ConflictException('Já existe um clube com essa sigla.');
  }
}