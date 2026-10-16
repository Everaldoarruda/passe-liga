import type { ApiBodyOptions, ApiQueryOptions } from '@nestjs/swagger';
import { FORMATIONS } from '../domain/lineup';

export const LINEUP_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['formation', 'player_ids'],
    properties: {
      formation: { type: 'string', enum: FORMATIONS },
      player_ids: { type: 'array', items: { type: 'integer', minimum: 1 }, minItems: 5, maxItems: 5 },
    },
    example: { formation: '2-1-1', player_ids: [34, 31, 30, 33, 32] },
  },
};

export const MATCH_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['home_club_id', 'away_club_id'],
    properties: {
      home_club_id: { type: 'integer', minimum: 1 },
      away_club_id: { type: 'integer', minimum: 1 },
    },
    example: { home_club_id: 1, away_club_id: 2 },
  },
};

export const LIST_MATCHES_QUERIES: ApiQueryOptions[] = [{ name: 'club_id', type: Number }];
