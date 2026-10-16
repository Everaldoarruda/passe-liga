import { asObject, Body, readCleanText, readText } from '../common/body';
import { fail } from '../common/fail';
import { normalizeForComparison } from '../common/text';

export interface CreateClubInput {
  name: string;
  acronym: string;
}

function readName(body: Body): string {
  const name = readCleanText(body, 'name', 3, 60);
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
  const raw = readText(body, 'acronym');
  if (!/^[A-Z]{3}$/.test(raw)) {
    return fail('A sigla deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento.');
  }
  if (new Set(raw).size === 1) return fail('A sigla não pode ter as três letras iguais.');

  const letters = normalizeForComparison(name)
    .replace(/[^a-z]/g, '')
    .toUpperCase();
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
