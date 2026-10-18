import { api, toQueryString } from './client';
import type { Club, ClubDetail } from './types';

export interface ClubCreate {
  name: string;
  acronym: string;
}

export const listClubs = (sort = 'name') => api.get<Club[]>(`/clubs${toQueryString({ sort })}`);

export const getClub = (id: number) => api.get<ClubDetail>(`/clubs/${id}`);

export const createClub = (body: ClubCreate) => api.post<Club>('/clubs', body);
