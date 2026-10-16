import { fail } from '../common/fail';
import { PlayerCondition } from '../domain/market-value';
import { Attributes, Position } from '../domain/player-value';
import { CONDITIONS, POSITIONS } from '../domain/player-enums';
import { asObject, Body, readChoice, readCleanText, readRequired } from '../common/body';

export interface UpdatePlayerInput {
  name: string;
  position: Position;
  agility: number;
  age: number;
}

export interface CreatePlayerInput extends UpdatePlayerInput, Attributes {
  potential: number;
}

function readInt(body: Body, field: string, min: number, max: number): number {
  const value = readRequired(body, field);
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return fail(`O campo ${field} deve ser um número inteiro.`);
  }
  if (value < min || value > max) return fail(`O campo ${field} deve estar entre ${min} e ${max}.`);
  return value;
}

function readName(body: Body): string {
  const name = readCleanText(body, 'name', 3, 100);
  if (/[0-9]/.test(name)) return fail('O campo name não pode ter dígitos.');
  const words = name.split(' ').filter((word) => /\p{L}/u.test(word));
  if (words.length < 2) return fail('O campo name deve ter pelo menos duas palavras.');
  return name;
}

function readBasicData(body: Body): UpdatePlayerInput {
  const name = readName(body);
  const position = readChoice(
    body,
    'position',
    POSITIONS,
    'O campo position deve ser GOL, ZAG, LAT, MEI ou ATA.',
  );
  const age = readInt(body, 'age', 16, 45);
  const agility = readInt(body, 'agility', 1, 100);
  if (age >= 35 && agility > 85) fail('Com 35 anos ou mais, a agilidade é no máximo 85.');
  return { name, position, age, agility };
}

export function parseCreatePlayer(raw: unknown): CreatePlayerInput {
  const body = asObject(raw);
  const basic = readBasicData(body);

  const attributes: Attributes = {
    pace: readInt(body, 'pace', 1, 99),
    shooting: readInt(body, 'shooting', 1, 99),
    passing: readInt(body, 'passing', 1, 99),
    dribbling: readInt(body, 'dribbling', 1, 99),
    defending: readInt(body, 'defending', 1, 99),
    physical: readInt(body, 'physical', 1, 99),
  };
  const values = Object.values(attributes);
  if (values.reduce((sum, v) => sum + v, 0) > 480) {
    fail('A soma dos seis atributos não pode passar de 480.');
  }

  const highest = Math.max(...values);
  const potential = readInt(body, 'potential', 1, 99);
  if (potential < highest) fail('O potential não pode ser menor que o maior atributo.');
  if (basic.age >= 33 && potential !== highest) {
    fail('Com 33 anos ou mais, o potential deve ser igual ao maior atributo.');
  }

  return { ...basic, potential, ...attributes };
}

export function parseUpdatePlayer(raw: unknown): UpdatePlayerInput {
  return readBasicData(asObject(raw));
}

export function parseCondition(raw: unknown): PlayerCondition {
  return readChoice(
    asObject(raw),
    'condition',
    CONDITIONS,
    'O campo condition deve ser APTO, MAL_CONDICIONADO ou DOENTE.',
  );
}
