import { Formation, formationFits } from './lineup';
import type { Position } from './player-value';

describe('formationFits (RN19)', () => {
  const lineups: [Formation, Position[], boolean][] = [
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA'], true],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], true],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], true],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA'], true],
    ['2-1-1', ['GOL', 'ZAG', 'ZAG', 'MEI', 'ATA'], true], // a defesa pode ser ZAG ou LAT
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'MEI'], false], // meio no lugar do ataque
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], false],
    ['2-2', ['GOL', 'GOL', 'ZAG', 'ATA', 'ATA'], false], // dois goleiros
    ['2-2', ['ZAG', 'LAT', 'LAT', 'ATA', 'ATA'], false], // sem goleiro
    ['1-2-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], false],
    ['2-2', ['GOL', 'ZAG', 'ATA', 'ATA'], false], // só 4 jogadores
  ];

  it.each(lineups)('formação %s com %j => %s', (formation, positions, expected) => {
    expect(formationFits(formation, positions)).toBe(expected);
  });
});
