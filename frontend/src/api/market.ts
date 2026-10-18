import { api } from './client';
import type { Purchase, Sale } from './types';

export interface PurchaseInput {
  club_id: number;
  loyalty_until: string;
}

export const buyPlayer = (playerId: number, body: PurchaseInput) =>
  api.post<Purchase>(`/players/${playerId}/buy`, body);

export const sellPlayer = (playerId: number) => api.post<Sale>(`/players/${playerId}/sell`);
