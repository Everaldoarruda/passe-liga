import { api, apiUrl, toQueryString } from './client';
import type { Purchase, Sale, TransactionHistory } from './types';

export interface PurchaseInput {
  club_id: number;
  loyalty_until: string;
}

export const buyPlayer = (playerId: number, body: PurchaseInput) =>
  api.post<Purchase>(`/players/${playerId}/buy`, body);

export const sellPlayer = (playerId: number) => api.post<Sale>(`/players/${playerId}/sell`);

export interface TransactionFilters {
  type: string;
  player_id: string;
}
export const listTransactions = (clubId: number, filters: TransactionFilters) =>
  api.get<TransactionHistory>(`/clubs/${clubId}/transactions${toQueryString({ ...filters })}`);

export const transactionsCsvUrl = (clubId: number, filters: TransactionFilters) =>
  apiUrl(`/clubs/${clubId}/transactions/export${toQueryString({ ...filters })}`);
