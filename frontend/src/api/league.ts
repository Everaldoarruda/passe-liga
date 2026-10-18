import { api } from './client';
import type { Lineup } from './types';

export const getLineup = (clubId: number) => api.get<Lineup>(`/clubs/${clubId}/lineup`);

export interface LineupInput {
  formation: string;
  player_ids: number[];
}

export const saveLineup = (clubId: number, body: LineupInput) =>
  api.put<Lineup>(`/clubs/${clubId}/lineup`, body);
