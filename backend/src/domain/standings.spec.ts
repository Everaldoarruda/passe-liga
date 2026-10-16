import { buildStandings } from './standings';

describe('buildStandings (RN21)', () => {
  const clubs = [
    { id: 1, name: 'Águias FC' },
    { id: 2, name: 'Delta FC' },
    { id: 3, name: 'Gama SC' },
    { id: 4, name: 'Épsilon EC' },
    { id: 5, name: 'Mangue FC' },
    { id: 6, name: 'Tubarões EC' },
  ];
  const matches = [
    { homeId: 1, awayId: 2, homeGoals: 1, awayGoals: 2 },
    { homeId: 3, awayId: 4, homeGoals: 2, awayGoals: 1 },
    { homeId: 4, awayId: 1, homeGoals: 3, awayGoals: 2 },
    { homeId: 2, awayId: 3, homeGoals: 0, awayGoals: 1 },
  ];

  it('reproduz a classificação do enunciado, com os clubes que não jogaram zerados', () => {
    const rows = buildStandings(clubs, matches).map((r) => [
      r.position, r.clubName, r.points, r.goalDifference, r.goalsFor,
    ]);
    expect(rows).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
  });

  it('desempata pelo id quando os nomes são iguais na comparação', () => {
    const rows = buildStandings(
      [{ id: 2, name: 'Aguias FC' }, { id: 1, name: 'Águias FC' }],
      [],
    );
    expect(rows.map((r) => r.clubId)).toEqual([1, 2]);
  });

  it('sem clubes, devolve lista vazia', () => {
    expect(buildStandings([], [])).toEqual([]);
  });
});