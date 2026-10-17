import { api, toQueryString } from './client';
import type { PlayerPage } from './types';

export interface PlayerFilters {
  page: number;
}

export const listPlayers = (filters: PlayerFilters) =>
  api.get<PlayerPage>(`/players${toQueryString({ ...filters })}`);
