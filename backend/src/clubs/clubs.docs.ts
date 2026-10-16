import type { ApiBodyOptions, ApiQueryOptions } from '@nestjs/swagger';

export const CREATE_CLUB_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['name', 'acronym'],
    properties: {
      name: { type: 'string', minLength: 3, maxLength: 60 },
      acronym: { type: 'string', pattern: '^[A-Z]{3}$' },
    },
    example: { name: 'Águias FC', acronym: 'AGU' },
  },
};

export const LIST_CLUBS_QUERIES: ApiQueryOptions[] = [
  { name: 'sort', enum: ['name', 'net_worth_asc', 'net_worth_desc'] },
];
