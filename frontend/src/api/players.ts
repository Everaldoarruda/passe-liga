import { api } from './client';
import type { PlayerPage } from './types';

export const listPlayers = () => api.get<PlayerPage>('/players');
