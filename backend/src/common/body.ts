import { fail } from './fail';
import { isId } from './limits';
import { countCharacters, hasControlCharacters, normalizeSpaces } from './text';

export type Body = Record<string, unknown>;

export function asObject(body: unknown): Body {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return fail('O corpo da requisição deve ser um objeto JSON.');
  }
  return body as Body;
}

export function readRequired(body: Body, field: string): unknown {
  const value = body[field];
  if (value === undefined || value === null) return fail(`O campo ${field} é obrigatório.`);
  return value;
}

export function readText(body: Body, field: string): string {
  const value = readRequired(body, field);
  if (typeof value !== 'string') return fail(`O campo ${field} deve ser um texto.`);
  return value;
}

// Texto livre: sem caracteres de controle, espaços normalizados e tamanho entre min e max
export function readCleanText(body: Body, field: string, min: number, max: number): string {
  const raw = readText(body, field);
  if (hasControlCharacters(raw)) return fail(`O campo ${field} não pode ter caracteres de controle.`);
  const text = normalizeSpaces(raw);
  if (text === '') return fail(`O campo ${field} é obrigatório.`);
  const length = countCharacters(text);
  if (length < min || length > max) return fail(`O campo ${field} deve ter de ${min} a ${max} caracteres.`);
  return text;
}

export function readChoice<T extends string>(body: Body, field: string, allowed: readonly T[], message: string): T {
  const value = readRequired(body, field);
  if (typeof value !== 'string' || !allowed.includes(value as T)) return fail(message);
  return value as T;
}

export function readId(body: Body, field: string): number {
  const value = readRequired(body, field);
  if (!isId(value)) return fail(`O campo ${field} deve ser um inteiro positivo.`);
  return value;
}