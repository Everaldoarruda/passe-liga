import { asObject, Body } from '../common/body';
import { fail } from '../common/fail';
import { hasControlCharacters, normalizeForComparison, normalizeSpaces } from '../common/text';

export interface CreateClubInput {
  name: string;
  acronym: string;
}

function readName(body: Body): string {
  const raw = body.name;
  if (raw === undefined || raw === null) return fail('O campo name é obrigatório.');
  if (typeof raw !== 'string') return fail('O campo name deve ser um texto.');
  if (hasControlCharacters(raw)) return fail('O campo name não pode ter caracteres de controle.');
  const name = normalizeSpaces(raw);
  if (name === '') return fail('O campo name é obrigatório.');
  const length = [...name].length;
  if (length < 3 || length > 60) return fail('O campo name deve ter de 3 a 60 caracteres.');
  if (!/^[\p{L} .-]+$/u.test(name)) {
    return fail('O campo name só aceita letras, espaços, hífen e ponto.');
  }
  const words = name.split(' ').filter((word) => /\p{L}/u.test(word));
  if (words.length < 2 || words.length > 5) return fail('O campo name deve ter de 2 a 5 palavras.');
  return name;
}

// As letras da sigla aparecem no nome, nessa ordem (não precisam ser vizinhas)
function appearsInOrder(acronym: string, letters: string): boolean {
  let next = 0;
  for (const letter of letters) {
    if (letter === acronym[next]) next++;
  }
  return next === acronym.length;
}

function readAcronym(body: Body, name: string): string {
  const raw = body.acronym;
  if (raw === undefined || raw === null) return fail('O campo acronym é obrigatório.');
  if (typeof raw !== 'string') return fail('O campo acronym deve ser um texto.');
  if (!/^[A-Z]{3}$/.test(raw)) {
    return fail('A sigla deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento.');
  }
  if (new Set(raw).size === 1) return fail('A sigla não pode ter as três letras iguais.');

  const letters = normalizeForComparison(name).replace(/[^a-z]/g, '').toUpperCase();
  if (raw[0] !== letters[0]) {
    return fail('A primeira letra da sigla deve ser a primeira letra do nome do clube.');
  }
  if (!appearsInOrder(raw, letters)) {
    return fail('As letras da sigla devem aparecer no nome do clube, nessa ordem.');
  }
  return raw;
}

export function parseCreateClub(raw: unknown): CreateClubInput {
  const body = asObject(raw);
  const name = readName(body);
  return { name, acronym: readAcronym(body, name) };
}