import { fail } from './fail';

export type Body = Record<string, unknown>;

export function asObject(body: unknown): Body {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return fail('O corpo da requisição deve ser um objeto JSON.');
  }
  return body as Body;
}