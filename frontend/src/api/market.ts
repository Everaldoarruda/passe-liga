import { api } from './client';
import type { Purchase } from './types';

export interface PurchaseInput {
  club_id: number;
  loyalty_until: string;
}

export const buyPlayer = (playerId: number, body: PurchaseInput) =>
  api.post<Purchase>(`/players/${playerId}/buy`, body);
