import { fail } from './fail';
import { isIdText } from './limits';

export type Query = Record<string, unknown>;

// Ausente devolve undefined; presente e vazio (ou repetido) é 400
export function readParam(query: Query, name: string): string | undefined {
  const value = query[name];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value === '') return fail(`O parâmetro ${name} é inválido.`);
  return value;
}

export function readIdParam(query: Query, name: string): number | undefined {
  const raw = readParam(query, name);
  if (raw === undefined) return undefined;
  if (!isIdText(raw)) {
    return fail(`O parâmetro ${name} deve ser um inteiro positivo.`);
  }
  return Number(raw);
}
