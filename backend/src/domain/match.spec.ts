import { effectiveValue, Fielded, matchResult, MatchResult, playMatch, Team } from './match';
import type { Position } from './player-value';

const base = { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 };

const fielded = (
  id: number,
  name: string,
  position: Position,
  overrides: Partial<Fielded> = {},
): Fielded => ({ id, name, position, condition: 'APTO', ...base, ...overrides });

// Escalação propositalmente fora da ordem do elenco
const eagles: Team = {
  clubId: 1,
  players: [
    fielded(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
    fielded(31, 'Davi Lins', 'LAT', { condition: 'MAL_CONDICIONADO', dribbling: 74, defending: 66 }),
    fielded(30, 'Rui Prado', 'GOL', { defending: 77 }),
    fielded(33, 'Lauro Neves', 'MEI', { passing: 82 }),
    fielded(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
  ],
};

const delta: Team = {
  clubId: 2,
  players: [
    fielded(40, 'Ivo Teles', 'GOL', { defending: 72 }),
    fielded(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
    fielded(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
    fielded(43, 'Nei Soares', 'MEI', { passing: 70 }),
    fielded(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
  ],
};

const uniform = (clubId: number, value: number): Team => {
  const all = { shooting: value, passing: value, dribbling: value, defending: value };
  return {
    clubId,
    players: [
      fielded(clubId * 10 + 1, 'Goleiro Um', 'GOL', all),
      fielded(clubId * 10 + 2, 'Zagueiro Um', 'ZAG', all),
      fielded(clubId * 10 + 3, 'Lateral Um', 'LAT', all),
      fielded(clubId * 10 + 4, 'Meia Um', 'MEI', all),
      fielded(clubId * 10 + 5, 'Atacante Um', 'ATA', all),
    ],
  };
};

describe('playMatch (RN20)', () => {
  it('reproduz o exemplo do enunciado: 1 x 2, vence o visitante', () => {
    const outcome = playMatch(eagles, delta);
    expect(outcome.homeGoals).toBe(1);
    expect(outcome.awayGoals).toBe(2);
    expect(outcome.result).toBe('VISITANTE');
  });

  it('monta os 6 duelos na ordem e com os valores do enunciado', () => {
    const rows = playMatch(eagles, delta).duels.map((d) => [
      d.order, d.attacker.playerName, d.attacker.value, d.defender.playerName, d.defender.value, d.goal,
    ]);
    expect(rows).toEqual([
      [1, 'Otto Rangel', 75, 'Ivo Teles', 72, true],
      [2, 'Lauro Neves', 82, 'Hugo Vaz', 84, false],
      [3, 'Davi Lins', 63, 'Lino Matos', 63, false], // duelo empatado não é gol
      [4, 'Ugo Falcão', 81, 'Rui Prado', 77, true],
      [5, 'Nei Soares', 70, 'Téo Brandão', 84, false],
      [6, 'Lino Matos', 79, 'Davi Lins', 56, true],
    ]);
  });

  it('dois titulares na mesma posição seguem o nome (1-2-1)', () => {
    const home: Team = {
      clubId: 1,
      players: [
        fielded(1, 'Gol Um', 'GOL'),
        fielded(2, 'Zag Um', 'ZAG'),
        fielded(3, 'Bruno Lima', 'MEI', { passing: 99 }),
        fielded(4, 'Aldo Lima', 'MEI', { passing: 10 }),
        fielded(5, 'Ata Um', 'ATA'),
      ],
    };
    const outcome = playMatch(home, uniform(2, 50));
    expect(outcome.duels[1].attacker.playerName).toBe('Bruno Lima'); // 3º jogador de linha
    expect(outcome.duels[2].attacker.playerName).toBe('Aldo Lima'); // 2º jogador de linha
  });

  it('time muito superior marca os 3 gols e o outro nenhum', () => {
    const outcome = playMatch(uniform(1, 99), uniform(2, 1));
    expect([outcome.homeGoals, outcome.awayGoals, outcome.result]).toEqual([3, 0, 'MANDANTE']);
  });

  it('times iguais empatam sem gols', () => {
    const outcome = playMatch(uniform(1, 50), uniform(2, 50));
    expect([outcome.homeGoals, outcome.awayGoals, outcome.result]).toEqual([0, 0, 'EMPATE']);
  });
});

describe('effectiveValue (RN20)', () => {
  const sick = (dribbling: number) =>
    fielded(1, 'Zeca Lima', 'LAT', { condition: 'MAL_CONDICIONADO', dribbling });

  it.each([
    [74, 63], // 62,9
    [66, 56], // 56,1
    [50, 43], // 42,5 sobe (meio para cima)
    [100, 85],
  ])('MAL_CONDICIONADO: %i vira %i', (value, expected) => {
    expect(effectiveValue(sick(value), 'dribbling')).toBe(expected);
  });

  it('APTO joga com o atributo do cadastro', () => {
    expect(effectiveValue(fielded(1, 'Zeca Lima', 'LAT', { dribbling: 74 }), 'dribbling')).toBe(74);
  });
});

describe('matchResult', () => {
  it.each<[number, number, MatchResult]>([
    [1, 0, 'MANDANTE'],
    [0, 2, 'VISITANTE'],
    [2, 2, 'EMPATE'],
  ])('%i x %i => %s', (home, away, expected) => {
    expect(matchResult(home, away)).toBe(expected);
  });
});