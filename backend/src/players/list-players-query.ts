import { fail } from '../common/fail';
import { hasControlCharacters, normalizeSpaces } from '../common/text';
import { PlayerCondition } from '../domain/market-value';
import { Position } from '../domain/player-value';
import { CONDITIONS, POSITIONS } from '../domain/player-enums';

export type SortField = 'name' | 'value' | 'age' | 'position';

export interface SortCriterion {
  field: SortField;
  descending: boolean;
}

export interface ListPlayersQuery {
  search?: string;
  position?: Position;
  condition?: PlayerCondition;
  free?: boolean;
  clubId?: number;
  minAge: number;
  maxAge: number;
  minValueCents: number;
  maxValueCents: number;
  sort: SortCriterion[];
  page: number;
  limit: number;
}

type Query = Record<string, unknown>;

const MAX_ID = 2147483647;
const MAX_VALUE_CENTS = 55000;

const SORT_OPTIONS = new Map<string, SortCriterion>([
  ['name', { field: 'name', descending: false }],
  ['value_asc', { field: 'value', descending: false }],
  ['value_desc', { field: 'value', descending: true }],
  ['age_asc', { field: 'age', descending: false }],
  ['age_desc', { field: 'age', descending: true }],
  ['position', { field: 'position', descending: false }],
]);

// Parâmetro ausente devolve undefined; presente e vazio (ou repetido) é 400
function read(query: Query, name: string): string | undefined {
  const value = query[name];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value === '') return fail(`O parâmetro ${name} é inválido.`);
  return value;
}

function readEnum<T extends string>(query: Query, name: string, allowed: readonly T[]): T | undefined {
  const raw = read(query, name);
  if (raw === undefined) return undefined;
  if (!allowed.includes(raw as T)) return fail(`O parâmetro ${name} tem um valor inválido.`);
  return raw as T;
}

function readInteger(query: Query, name: string, min: number, max: number): number | undefined {
  const raw = read(query, name);
  if (raw === undefined) return undefined;
  const value = Number(raw);
  if (!/^[1-9][0-9]*$/.test(raw) || value < min || value > max) {
    return fail(`O parâmetro ${name} deve ser um inteiro entre ${min} e ${max}.`);
  }
  return value;
}

function readMoneyInCents(query: Query, name: string): number | undefined {
  const raw = read(query, name);
  if (raw === undefined) return undefined;
  if (!/^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/.test(raw)) {
    return fail(`O parâmetro ${name} deve ser um decimal como 10, 10.5 ou 10.55.`);
  }
  const cents = Math.round(Number(raw) * 100);
  if (cents > MAX_VALUE_CENTS) return fail(`O parâmetro ${name} deve estar entre 0 e 550.`);
  return cents;
}

function readSearch(query: Query): string | undefined {
  const raw = read(query, 'search');
  if (raw === undefined) return undefined;
  if (hasControlCharacters(raw)) return fail('O parâmetro search não pode ter caracteres de controle.');
  const text = normalizeSpaces(raw);
  const length = [...text].length;
  if (length < 2 || length > 100) return fail('O parâmetro search deve ter de 2 a 100 caracteres.');
  return text;
}

function readSort(query: Query): SortCriterion[] {
  const raw = read(query, 'sort');
  if (raw === undefined) return [{ field: 'name', descending: false }];
  const parts = raw.split(',');
  if (parts.length > 2) return fail('O parâmetro sort aceita no máximo dois critérios.');
  const criteria = parts.map((part) => SORT_OPTIONS.get(part) ?? fail('O parâmetro sort é inválido.'));
  if (new Set(criteria.map((c) => c.field)).size !== criteria.length) {
    return fail('O parâmetro sort não pode repetir o mesmo campo.');
  }
  return criteria;
}

export function parseListPlayersQuery(query: Query): ListPlayersQuery {
  const free = readEnum<'true' | 'false'>(query, 'free', ['true', 'false']);
  const clubId = readInteger(query, 'club_id', 1, MAX_ID);
  if (free === 'true' && clubId !== undefined) {
    fail('O filtro free=true não pode ser combinado com club_id.');
  }

  const minAge = readInteger(query, 'min_age', 16, 45) ?? 16;
  const maxAge = readInteger(query, 'max_age', 16, 45) ?? 45;
  if (minAge > maxAge) fail('O parâmetro min_age não pode ser maior que max_age.');

  const minValueCents = readMoneyInCents(query, 'min_value') ?? 0;
  const maxValueCents = readMoneyInCents(query, 'max_value') ?? MAX_VALUE_CENTS;
  if (minValueCents > maxValueCents) fail('O parâmetro min_value não pode ser maior que max_value.');

  return {
    search: readSearch(query),
    position: readEnum<Position>(query, 'position', POSITIONS),
    condition: readEnum<PlayerCondition>(query, 'condition', CONDITIONS),
    free: free === undefined ? undefined : free === 'true',
    clubId,
    minAge,
    maxAge,
    minValueCents,
    maxValueCents,
    sort: readSort(query),
    page: readInteger(query, 'page', 1, MAX_ID) ?? 1,
    limit: readInteger(query, 'limit', 1, 50) ?? 10,
  };
}