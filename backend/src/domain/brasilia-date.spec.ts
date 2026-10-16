import { formatBrasilia, parseBrasiliaDate } from './brasilia-date';

describe('parseBrasiliaDate (RN01)', () => {
  it('converte o horário de Brasília para UTC', () => {
    expect(parseBrasiliaDate('2027-03-02T10:15-03:00')?.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('aceita 29 de fevereiro em ano bissexto', () => {
    expect(parseBrasiliaDate('2028-02-29T10:15-03:00')).not.toBeNull();
  });

  it.each([
    ['2027-02-30T10:15-03:00'],
    ['2027-02-29T10:15-03:00'],
    ['2027-03-02T24:00-03:00'],
    ['2027-03-02T10:60-03:00'],
    ['2027-03-02T10:15'],
    ['2027-03-02T10:15:00-03:00'],
    ['2027-03-02T10:15+00:00'],
    ['2027-03-02 10:15-03:00'],
  ])('recusa %s', (text) => {
    expect(parseBrasiliaDate(text)).toBeNull();
  });
});

describe('formatBrasilia', () => {
  it('formata com segundos e -03:00', () => {
    expect(formatBrasilia(new Date('2026-11-05T19:40:00Z'))).toBe('2026-11-05T16:40:00-03:00');
  });
});
