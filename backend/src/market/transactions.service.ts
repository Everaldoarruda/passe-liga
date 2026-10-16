import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { summarizeTransactions } from '../domain/transaction-summary';
import { buildTransactionsCsv } from '../domain/transactions-csv';
import { PrismaService } from '../prisma/prisma.service';
import { toSummaryResponse, toTransactionResponse, toTransactionRow } from './transaction.presenter';
import { parseTransactionsQuery } from './transactions-query';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(clubId: number, rawQuery: Record<string, unknown>) {
    const rows = await this.load(clubId, rawQuery);
    return {
      data: rows.map(toTransactionResponse),
      summary: toSummaryResponse(summarizeTransactions(rows.map(toTransactionRow))),
    };
  }

  async exportCsv(clubId: number, rawQuery: Record<string, unknown>): Promise<string> {
    const rows = await this.load(clubId, rawQuery);
    return buildTransactionsCsv(rows.map(toTransactionRow));
  }

  private async load(clubId: number, rawQuery: Record<string, unknown>) {
    const query = parseTransactionsQuery(rawQuery);

    const club = await this.prisma.clube.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Clube não encontrado.');

    if (query.playerId !== undefined) {
      const player = await this.prisma.jogador.findFirst({
        where: { id: query.playerId, excluidoEm: null },
      });
      if (!player) throw new NotFoundException('Jogador não encontrado.');
    }

    const where: Prisma.TransacaoWhereInput = {
      clubeId: clubId,
      tipo: query.types ? { in: query.types } : undefined,
      jogadorId: query.playerId,
    };
    return this.prisma.transacao.findMany({
      where,
      orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    });
  }
}
