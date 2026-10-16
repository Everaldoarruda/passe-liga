export const TRANSACTION_TYPES = ['COMPRA', 'VENDA'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface TransactionRow {
  createdAt: Date;
  type: TransactionType;
  playerName: string;
  valueCents: number;
  feeCents: number;
  penaltyCents: number;
  profitCents: number | null;
  cashChangeCents: number;
}

export interface SummaryCents {
  totalSpent: number;
  totalReceived: number;
  totalFees: number;
  totalPenalties: number;
  totalProfit: number;
}

export function summarizeTransactions(rows: TransactionRow[]): SummaryCents {
  const summary: SummaryCents = {
    totalSpent: 0,
    totalReceived: 0,
    totalFees: 0,
    totalPenalties: 0,
    totalProfit: 0,
  };
  for (const row of rows) {
    summary.totalFees += row.feeCents;
    if (row.type === 'COMPRA') {
      summary.totalSpent += row.valueCents + row.feeCents;
    } else {
      summary.totalReceived += row.cashChangeCents;
      summary.totalPenalties += row.penaltyCents;
      summary.totalProfit += row.profitCents ?? 0;
    }
  }
  return summary;
}