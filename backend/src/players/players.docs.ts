import type { ApiBodyOptions, ApiQueryOptions } from '@nestjs/swagger';
import { CONDITIONS, POSITIONS } from '../domain/player-enums';

const basicFields = {
  name: { type: 'string', minLength: 3, maxLength: 100 },
  position: { type: 'string', enum: [...POSITIONS] },
  agility: { type: 'integer', minimum: 1, maximum: 100 },
  age: { type: 'integer', minimum: 16, maximum: 45 },
};

const attribute = { type: 'integer', minimum: 1, maximum: 99 };

export const CREATE_PLAYER_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: [
      ...Object.keys(basicFields),
      'pace',
      'shooting',
      'passing',
      'dribbling',
      'defending',
      'physical',
      'potential',
    ],
    properties: {
      ...basicFields,
      pace: attribute,
      shooting: attribute,
      passing: attribute,
      dribbling: attribute,
      defending: attribute,
      physical: attribute,
      potential: attribute,
    },
    example: {
      name: 'Meia Lua',
      position: 'MEI',
      agility: 85,
      age: 25,
      pace: 70,
      shooting: 68,
      passing: 82,
      dribbling: 79,
      defending: 55,
      physical: 64,
      potential: 86,
    },
  },
};

export const UPDATE_PLAYER_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: Object.keys(basicFields),
    properties: basicFields,
    example: { name: 'Davi Melo', position: 'MEI', agility: 70, age: 23 },
  },
};

export const CHANGE_CONDITION_BODY: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['condition'],
    properties: { condition: { type: 'string', enum: [...CONDITIONS] } },
    example: { condition: 'MAL_CONDICIONADO' },
  },
};

export const LIST_PLAYERS_QUERIES: ApiQueryOptions[] = [
  { name: 'search', type: String, description: 'Texto de 2 a 100 caracteres, sem diferenciar acentos' },
  { name: 'position', enum: [...POSITIONS] },
  { name: 'condition', enum: [...CONDITIONS] },
  { name: 'free', enum: ['true', 'false'] },
  { name: 'club_id', type: Number },
  { name: 'min_age', type: Number },
  { name: 'max_age', type: Number },
  { name: 'min_value', type: Number, description: 'Valor de mercado mínimo' },
  { name: 'max_value', type: Number, description: 'Valor de mercado máximo' },
  {
    name: 'sort',
    type: String,
    description:
      'name, value_asc, value_desc, age_asc, age_desc ou position; até dois, separados por vírgula',
  },
  { name: 'page', type: Number },
  { name: 'limit', type: Number, description: 'De 1 a 50' },
];
