import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const clubs = await this.prisma.clube.findMany({ orderBy: { nome: 'asc' } });
    return clubs.map(( c: { id: number; nome: string; sigla: string; caixa: unknown; } ) => this.toResponse(c));
  }

  async create(data: { name: string; acronym: string }) {
    const club = await this.prisma.clube.create({
      data: { nome: data.name, sigla: data.acronym },
    });
    return this.toResponse(club);
  }

  private toResponse(c: { id: number; nome: string; sigla: string; caixa: unknown }) {
    const cash = Number(c.caixa);
    return { id: c.id, name: c.nome, acronym: c.sigla, cash, squad_value: 0, net_worth: cash };
  }
}