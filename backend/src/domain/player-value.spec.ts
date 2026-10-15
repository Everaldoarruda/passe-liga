import { Attributes, baseValueCents, overall, Position } from './player-value';

const attrs = (
  pace: number, shooting: number, passing: number,
  dribbling: number, defending: number, physical: number,
): Attributes => ({ pace, shooting, passing, dribbling, defending, physical });

describe('overall (RN06)', () => {
  const cases: [Position, Attributes, number][] = [
    ['MEI', attrs(68, 65, 80, 78, 52, 60), 73],
    ['ATA', attrs(78, 75, 73, 82, 48, 68), 76],
    ['LAT', attrs(72, 70, 78, 76, 70, 66), 72],
    ['ZAG', attrs(50, 90, 60, 40, 80, 75), 73], // 72,50 sobe (meio para cima)
    ['GOL', attrs(55, 30, 65, 40, 72, 68), 68],
  ];

  it.each(cases)('%s %j => %i', (position, attributes, expected) => {
    expect(overall(position, attributes)).toBe(expected);
  });
});

describe('baseValueCents (RN06)', () => {
  const cases: [number, number, number, number][] = [
    // overall, potencial, idade no cadastro, esperado em centavos
    [75, 86, 25, 4000],
    [60, 70, 30, 1000], // fim da primeira faixa
    [61, 70, 30, 1200], // início da segunda faixa
    [76, 80, 22, 4600],
    [85, 92, 27, 10000],
    [70, 84, 21, 3420], // jovem promessa
    [70, 84, 22, 3000], // 22 anos: não é jovem promessa
    [45, 90, 18, 363], // 3,625 arredonda para 3,63
    [40, 66, 36, 100], // piso de 1,00
  ];

  it.each(cases)('overall %i, potencial %i, idade %i => %i', (ov, potential, age, expected) => {
    expect(baseValueCents(ov, potential, age)).toBe(expected);
  });
});