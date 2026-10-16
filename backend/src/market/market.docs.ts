import type { ApiBodyOptions, ApiQueryOptions } from '@nestjs/swagger';

export const BUY_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['club_id', 'loyalty_until'],
    properties: {
      club_id: { type: 'integer', minimum: 1 },
      loyalty_until: { type: 'string', description: 'Fim da fidelidade, no formato AAAA-MM-DDTHH:MM-03:00' },
    },
    example: { club_id: 1, loyalty_until: '2027-03-02T10:15-03:00' },
  },
};

export const TRANSACTIONS_QUERIES: ApiQueryOptions[] = [
  { name: 'type', type: String, description: 'COMPRA, VENDA ou COMPRA,VENDA' },
  { name: 'player_id', type: Number },
];
