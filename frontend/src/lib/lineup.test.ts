import { describe, expect, it } from 'vitest';
import { slotsFor } from './lineup';

describe('slotsFor', () => {
  it('cria 1 goleiro e os jogadores de linha de cada setor', () => {
    expect(slotsFor('2-1-1').map((slot) => slot.label)).toEqual([
      'Goleiro',
      'Defensor 1',
      'Defensor 2',
      'Meia 1',
      'Atacante 1',
    ]);
    expect(slotsFor('3-1').filter((slot) => slot.key.startsWith('DEF'))).toHaveLength(3);
  });
});
