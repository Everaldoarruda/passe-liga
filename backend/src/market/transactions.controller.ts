import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { parseId } from '../common/parse-id';
import { TransactionsService } from './transactions.service';

@Controller('clubs')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get(':id/transactions')
  list(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    return this.transactions.list(parseId(id), query);
  }

  @Get(':id/transactions/export')
  async exportCsv(
    @Param('id') id: string,
    @Query() query: Record<string, unknown>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.transactions.exportCsv(parseId(id), query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="transacoes.csv"');
    return csv;
  }
}