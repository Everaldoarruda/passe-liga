import { api, toQueryString } from './client';
import type { PlayerPage } from './types';

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

export const listPlayers = (filters: PlayerFilters) =>
  api.get<PlayerPage>(`/players${toQueryString({ ...filters })}`);
