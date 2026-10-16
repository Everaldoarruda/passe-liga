import { formatBrasilia } from './brasilia-date';
import type { TransactionRow } from './transaction-summary';

const HEADER = 'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

function csvMoney(cents: number): string {
  const abs = Math.abs(cents);
  const units = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  return `${cents < 0 ? '-' : ''}${units},${rest}`;
}

// Nome com ; ou aspas vai entre aspas duplas, e cada aspa interna é duplicada
function csvText(text: string): string {
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toLine(row: TransactionRow): string {
  return [
    formatBrasilia(row.createdAt),
    row.type,
    csvText(row.playerName),
    csvMoney(row.valueCents),
    csvMoney(row.feeCents),
    csvMoney(row.penaltyCents),
    row.profitCents === null ? '' : csvMoney(row.profitCents),
    csvMoney(row.cashChangeCents),
  ].join(';');
}

export function buildTransactionsCsv(rows: TransactionRow[]): string {
  return [HEADER, ...rows.map(toLine)].join('\n') + '\n';
}