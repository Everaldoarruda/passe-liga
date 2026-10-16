import type { ListPlayersQuery } from './list-players-query';
import { listPlayers } from './player-list';
import type { PlayerResponse } from './player.presenter';

const player = (id: number, name: string, overrides: Partial<PlayerResponse> = {}): PlayerResponse => ({
  id,
  name,
  position: 'MEI',
  agility: 50,
  age: 25,
  condition: 'APTO',
  base_value: 10,
  market_value: 10,
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physical: 50,
  potential: 60,
  overall: 50,
  club_id: null,
  ...overrides,
});

const query = (overrides: Partial<ListPlayersQuery> = {}): ListPlayersQuery => ({
  minAge: 16,
  maxAge: 45,
  minValueCents: 0,
  maxValueCents: 55000,
  sort: [{ field: 'name', descending: false }],
  page: 1,
  limit: 10,
  ...overrides,
});

const names = (players: PlayerResponse[]) => players.map((p) => p.name);

describe('listPlayers (RN07)', () => {
  const twentyThree = Array.from({ length: 23 }, (_, i) =>
    player(i + 1, `Jogador ${String(i + 1).padStart(2, '0')}`),
  );

  it.each([
    [1, 10],
    [3, 3],
    [4, 0],
  ])('com 23 jogadores e limit 10, a página %i traz %i itens', (page, expected) => {
    const result = listPlayers(twentyThree, query({ page }));
    expect(result.data).toHaveLength(expected);
    expect(result.totalItems).toBe(23);
  });

  it('busca ignorando maiúsculas e acentos', () => {
    const players = [player(1, 'João Silva'), player(2, 'Meia Lua')];
    expect(names(listPlayers(players, query({ search: 'joao' })).data)).toEqual(['João Silva']);
    expect(names(listPlayers(players, query({ search: 'LUA' })).data)).toEqual(['Meia Lua']);
  });

  it('ordena por nome sem acento e com o espaço antes do hífen', () => {
    const players = [
      player(1, 'Gama Lima'),
      player(2, 'Épsilon Lima'),
      player(3, 'Delta Lima'),
      player(4, 'Ana-Maria Souza'),
      player(5, 'Ana Lima'),
    ];
    expect(names(listPlayers(players, query()).data)).toEqual([
      'Ana Lima',
      'Ana-Maria Souza',
      'Delta Lima',
      'Épsilon Lima',
      'Gama Lima',
    ]);
  });

  it('ordena por valor decrescente e desempata pelo nome', () => {
    const players = [
      player(1, 'Bruno Lima', { market_value: 20 }),
      player(2, 'Aldo Lima', { market_value: 20 }),
      player(3, 'Caio Lima', { market_value: 30 }),
    ];
    const sort = [{ field: 'value' as const, descending: true }];
    expect(names(listPlayers(players, query({ sort })).data)).toEqual([
      'Caio Lima',
      'Aldo Lima',
      'Bruno Lima',
    ]);
  });

  it('ordena por posição na ordem GOL, ZAG, LAT, MEI, ATA', () => {
    const players = [
      player(1, 'Um Ata', { position: 'ATA' }),
      player(2, 'Um Mei', { position: 'MEI' }),
      player(3, 'Um Gol', { position: 'GOL' }),
      player(4, 'Um Lat', { position: 'LAT' }),
      player(5, 'Um Zag', { position: 'ZAG' }),
    ];
    const sort = [{ field: 'position' as const, descending: false }];
    expect(names(listPlayers(players, query({ sort })).data)).toEqual([
      'Um Gol',
      'Um Zag',
      'Um Lat',
      'Um Mei',
      'Um Ata',
    ]);
  });
});
