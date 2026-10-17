import { api } from './client';
import type { PlayerPage } from './types';

export const listPlayers = (page: number) => api.get<PlayerPage>(`/players?page=${page}`);
