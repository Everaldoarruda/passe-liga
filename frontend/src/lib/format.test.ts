import { describe, expect, it } from 'vitest';
import { formatDateTime, formatMoney, toApiDateTime, initials, formatSignedMoney } from './format';
describe('formatMoney', () => {
  it('usa 2 casas, vírgula decimal e ponto nos milhares', () => {
    expect(formatMoney(40)).toBe('40,00');
    expect(formatMoney(1234.5)).toBe('1.234,50');
    expect(formatMoney(-42)).toBe('-42,00');
  });
});

describe('formatDateTime', () => {
  it('mostra a data no horário de Brasília', () => {
    expect(formatDateTime('2027-03-02T10:15:00-03:00')).toBe('02/03/2027, 10:15');
  });
});

describe('toApiDateTime', () => {
  it('acrescenta o fuso de Brasília ao valor do campo de data e hora', () => {
    expect(toApiDateTime('2027-03-02T10:15')).toBe('2027-03-02T10:15-03:00');
  });
});

describe('initials', () => {
  it('usa a primeira letra do primeiro e do último nome', () => {
    expect(initials('André Lacerda')).toBe('AL');
    expect(initials('Maria da Silva Souza')).toBe('MS');
  });
});
describe('formatSignedMoney', () => {
  it('põe + nas entradas e - nas saídas', () => {
    expect(formatSignedMoney(35.7)).toBe('+35,70');
    expect(formatSignedMoney(-38.85)).toBe('-38,85');
  });
});
