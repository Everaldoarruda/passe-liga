import { api, toQueryString } from './client';
import type { Lineup, MatchDetail, Match, Standing } from './types';

export const getLineup = (clubId: number) => api.get<Lineup>(`/clubs/${clubId}/lineup`);

export interface LineupInput {
  formation: string;
  player_ids: number[];
}

export const saveLineup = (clubId: number, body: LineupInput) =>
  api.put<Lineup>(`/clubs/${clubId}/lineup`, body);

export interface MatchInput {
  home_club_id: number;
  away_club_id: number;
}

export const playMatch = (body: MatchInput) => api.post<MatchDetail>('/matches', body);

export const listMatches = (clubId: string) =>
  api.get<Match[]>(`/matches${toQueryString({ club_id: clubId })}`);

export const getMatch = (id: number) => api.get<MatchDetail>(`/matches/${id}`);

export const listStandings = () => api.get<Standing[]>('/standings');
