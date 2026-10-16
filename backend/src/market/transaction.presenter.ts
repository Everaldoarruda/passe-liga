import type { Transacao } from '@prisma/client';
import { formatBrasilia } from '../domain/brasilia-date';
import { fromCents, toCents } from '../domain/money';
import type { SummaryCents, TransactionRow, TransactionType } from '../domain/transaction-summary';

const centsOf = (decimal: unknown): number => toCents(Number(decimal));

export function toTransactionRow(row: Transacao): TransactionRow {
  return {
    createdAt: row.criadoEm,
    type: row.tipo as TransactionType,
    playerName: row.nomeJogador,
    valueCents: centsOf(row.valor),
    feeCents: centsOf(row.taxa),
    penaltyCents: centsOf(row.multa),
    profitCents: row.lucro === null ? null : centsOf(row.lucro),
    cashChangeCents: centsOf(row.variacaoCaixa),
  };
}

export function toTransactionResponse(row: Transacao) {
  const t = toTransactionRow(row);
  return {
    id: row.id,
    club_id: row.clubeId,
    player_id: row.jogadorId,
    player_name: t.playerName,
    type: t.type,
    value: fromCents(t.valueCents),
    fee: fromCents(t.feeCents),
    penalty: fromCents(t.penaltyCents),
    profit: t.profitCents === null ? null : fromCents(t.profitCents),
    cash_change: fromCents(t.cashChangeCents),
    created_at: formatBrasilia(t.createdAt),
  };
}

export function toSummaryResponse(summary: SummaryCents) {
  return {
    total_spent: fromCents(summary.totalSpent),
    total_received: fromCents(summary.totalReceived),
    total_fees: fromCents(summary.totalFees),
    total_penalties: fromCents(summary.totalPenalties),
    total_profit: fromCents(summary.totalProfit),
  };
}
