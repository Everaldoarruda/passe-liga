import { api, toQueryString } from './client';
import type { Condition, Player, PlayerPage, Position } from './types';

export interface PlayerFilters {
  page: number;
  search: string;
  position: string;
  condition: string;
  free: string;
  club_id: string;
  min_age: string;
  max_age: string;
  min_value: string;
  max_value: string;
  sort: string;
}

export interface PlayerUpdate {
  name: string;
  position: Position;
  agility: number;
  age: number;
}

export interface PlayerCreate extends PlayerUpdate {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}

export const listPlayers = (filters: PlayerFilters) =>
  api.get<PlayerPage>(`/players${toQueryString({ ...filters })}`);

export const createPlayer = (body: PlayerCreate) => api.post<Player>('/players', body);

export const updatePlayer = (id: number, body: PlayerUpdate) => api.put<Player>(`/players/${id}`, body);

export const changeCondition = (id: number, condition: Condition) =>
  api.patch<Player>(`/players/${id}/condition`, { condition });

export const deletePlayer = (id: number) => api.delete(`/players/${id}`);
