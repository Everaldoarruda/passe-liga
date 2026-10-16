import { marketValueCents, PlayerCondition } from './market-value';

describe('marketValueCents (RN02 a RN05)', () => {
  const cases: [number, PlayerCondition, number, number, number][] = [
    // baseEmCentavos, condição, agilidade, idade, esperadoEmCentavos
    [8200, 'APTO', 20, 25, 8200],
    [8200, 'APTO', 50, 19, 9020],
    [8200, 'MAL_CONDICIONADO', 50, 25, 6970],
    [8200, 'MAL_CONDICIONADO', 80, 21, 8405],
    [8200, 'MAL_CONDICIONADO', 30, 33, 5330],
    [8200, 'DOENTE', 90, 25, 6970],
    [8200, 'DOENTE', 30, 25, 4920],
    [8200, 'DOENTE', 10, 40, 4920],
    [950, 'MAL_CONDICIONADO', 85, 25, 879],
    [100, 'MAL_CONDICIONADO', 50, 35, 100],
  ];

  it.each(cases)('base %i, %s, agilidade %i, idade %i => %i', (base, condition, agility, age, expected) => {
    expect(marketValueCents(base, condition, agility, age)).toBe(expected);
  });
});
