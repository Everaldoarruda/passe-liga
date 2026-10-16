import { fail } from '../common/fail';
import { Query, readIdParam, readParam } from '../common/query';
import { TRANSACTION_TYPES, TransactionType } from '../domain/transaction-summary';

export interface TransactionsQuery {
  types?: TransactionType[];
  playerId?: number;
}

function readTypes(query: Query): TransactionType[] | undefined {
  const raw = readParam(query, 'type');
  if (raw === undefined) return undefined;

  const parts = raw.split(',');
  const allKnown = parts.every((part) => (TRANSACTION_TYPES as readonly string[]).includes(part));
  if (!allKnown || new Set(parts).size !== parts.length) {
    return fail('O parâmetro type deve ser COMPRA, VENDA ou os dois separados por vírgula, sem repetição.');
  }
  return parts as TransactionType[];
}

export function parseTransactionsQuery(query: Query): TransactionsQuery {
  return { types: readTypes(query), playerId: readIdParam(query, 'player_id') };
}