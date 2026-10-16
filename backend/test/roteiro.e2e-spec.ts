import { api, ApiResponse } from './api';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const sameAttributes = (value: number) => ({
  pace: value,
  shooting: value,
  passing: value,
  dribbling: value,
  defending: value,
  physical: value,
});

let nameCounter = 0;

// Nomes válidos e distintos (só letras): "Jogador Ab", "Jogador Ac", ...
function uniqueName(prefix = 'Jogador'): string {
  nameCounter++;
  let n = nameCounter;
  let suffix = '';
  while (n > 0) {
    suffix = String.fromCharCode(97 + ((n - 1) % 26)) + suffix;
    n = Math.floor((n - 1) / 26);
  }
  return `${prefix} ${suffix[0].toUpperCase()}${suffix.slice(1)}`;
}

function newPlayer(overrides: Record<string, unknown> = {}) {
  return {
    name: uniqueName(),
    position: 'MEI',
    agility: 50,
    age: 25,
    ...sameAttributes(75),
    potential: 75,
    ...overrides,
  };
}

async function createPlayer(overrides: Record<string, unknown> = {}, condition?: string): Promise<any> {
  const created = await api.post('/players', newPlayer(overrides));
  expect(created.status).toBe(201);
  if (condition === undefined) return created.body;
  const changed = await api.patch(`/players/${created.body.id}/condition`, { condition });
  expect(changed.status).toBe(200);
  return changed.body;
}

async function createClub(name: string, acronym: string): Promise<any> {
  const created = await api.post('/clubs', { name, acronym });
  expect(created.status).toBe(201);
  return created.body;
}

async function expectRejected(request: Promise<ApiResponse>, status: number): Promise<void> {
  const response = await request;
  expect(response.status).toBe(status);
  expect(typeof response.body?.message).toBe('string');
  expect(response.body.message.length).toBeGreaterThan(0);
}

// Formato da RN01, no horário de Brasília
const brasilia = (time: number) => `${new Date(time - 3 * 60 * MINUTE).toISOString().slice(0, 16)}-03:00`;
const brasiliaWithSeconds = (time: number) =>
  `${new Date(time - 3 * 60 * MINUTE).toISOString().slice(0, 19)}-03:00`;
const currentMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE;
const farLoyalty = () => brasilia(Date.now() + 400 * DAY);

async function buy(playerId: number, clubId: number, loyaltyUntil = farLoyalty()): Promise<any> {
  const bought = await api.post(`/players/${playerId}/buy`, { club_id: clubId, loyalty_until: loyaltyUntil });
  expect(bought.status).toBe(200);
  return bought.body;
}

async function sell(playerId: number): Promise<any> {
  const sold = await api.post(`/players/${playerId}/sell`);
  expect(sold.status).toBe(200);
  return sold.body;
}

const totalPlayers = async () => (await api.get('/players?limit=1')).body.meta.total_items;
const clubCash = async (clubId: number) => (await api.get(`/clubs/${clubId}`)).body.cash;
const names = (response: ApiResponse) => response.body.data.map((player: any) => player.name);

const normalized = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
const byName = (a: any, b: any) => {
  const x = normalized(a.name);
  const y = normalized(b.name);
  return x < y ? -1 : x > y ? 1 : a.id - b.id;
};

describe('Etapa 1: jogadores', () => {
  it('B02: listas vazias respondem 200', async () => {
    const players = await api.get('/players');
    expect(players.status).toBe(200);
    expect(players.body).toEqual({ data: [], meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 } });
    for (const path of ['/clubs', '/matches', '/standings']) {
      const response = await api.get(path);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    }
  });

  describe('B01: validação do cadastro', () => {
    const withoutField = (field: string) => {
      const body: Record<string, unknown> = newPlayer();
      delete body[field];
      return body;
    };
    const invalidBodies: [string, unknown][] = [
      ['corpo que é lista', []],
      ['corpo que é número', 10],
      ['nome com dígito', newPlayer({ name: 'Jogador 10' })],
      ['nome com uma palavra', newPlayer({ name: 'Jogador' })],
      ['nome só com espaços', newPlayer({ name: '     ' })],
      ['nome com tabulação', newPlayer({ name: 'Ana\tLima' })],
      ['nome com 101 caracteres', newPlayer({ name: `${'a'.repeat(50)} ${'b'.repeat(50)}` })],
      ['posição em minúsculas', newPlayer({ position: 'mei' })],
      ['agilidade como texto', newPlayer({ agility: '50' })],
      ['agilidade fracionária', newPlayer({ agility: 50.5 })],
      ['agilidade 0', newPlayer({ agility: 0 })],
      ['agilidade 101', newPlayer({ agility: 101 })],
      ['idade 15', newPlayer({ age: 15 })],
      ['idade 46', newPlayer({ age: 46 })],
      ['atributo 100', newPlayer({ pace: 100, potential: 100 })],
      ['potencial ausente', withoutField('potential')],
      ['potencial nulo', newPlayer({ potential: null })],
      ['campo fora do snake_case', { ...withoutField('agility'), Agility: 50 }],
      ['soma dos atributos 481', newPlayer({ ...sameAttributes(80), pace: 81, potential: 81 })],
      ['potencial menor que o maior atributo', newPlayer({ potential: 74 })],
      ['35 anos com agilidade 86', newPlayer({ age: 35, agility: 86 })],
      ['33 anos com potencial maior que o maior atributo', newPlayer({ age: 33, potential: 80 })],
    ];

    it.each(invalidBodies)('%s → 400, sem gravar', async (_, body) => {
      const before = await totalPlayers();
      await expectRejected(api.post('/players', body), 400);
      expect(await totalPlayers()).toBe(before);
    });

    it('texto simples como corpo → 400', async () => {
      await expectRejected(api.raw('POST', '/players', '"x"'), 400);
    });

    it('aceita os limites e normaliza os espaços do nome', async () => {
      const accepted = [
        newPlayer({ name: '  Meia   Zeta ' }),
        newPlayer({ ...sameAttributes(80), potential: 80 }),
        newPlayer({ age: 35, agility: 85 }),
        newPlayer({ age: 33, potential: 75 }),
      ];
      const responses = await Promise.all(accepted.map((body) => api.post('/players', body)));
      expect(responses.map((response) => response.status)).toEqual([201, 201, 201, 201]);
      expect(responses[0].body.name).toBe('Meia Zeta');
    });

    it('aceita 50.0 como inteiro', async () => {
      const body = JSON.stringify(newPlayer({ agility: 50 })).replace('"agility":50', '"agility":50.0');
      const response = await api.raw('POST', '/players', body);
      expect(response.status).toBe(201);
      expect(response.body.agility).toBe(50);
    });
  });

  describe('B02: códigos de erro e convenções', () => {
    it('JSON inválido → 400 com message em JSON', async () => {
      const response = await api.raw('POST', '/players', '{invalido');
      expect(response.status).toBe(400);
      expect(response.headers.get('content-type')).toMatch(/^application\/json/);
      expect(response.body.message).toBeTruthy();
    });

    it('caminho inexistente → 404 com message em JSON', async () => {
      const response = await api.get('/inexistente');
      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toMatch(/^application\/json/);
      expect(response.body.message).toBeTruthy();
    });

    it.each(['abc', '0', '01', '-1', '1.5', '2147483648', '999999'])('id %s na URL → 404', async (id) => {
      await expectRejected(api.get(`/players/${id}`), 404);
    });
  });

  describe('B03: campos controlados, Location e PUT', () => {
    let player: any;

    it('ignora os campos controlados pelo sistema e responde 201 com Location', async () => {
      const body = newPlayer({
        ...sameAttributes(0),
        pace: 70,
        shooting: 68,
        passing: 82,
        dribbling: 79,
        defending: 55,
        physical: 64,
        potential: 86,
        id: 999,
        base_value: 1,
        overall: 1,
        market_value: 1,
        condition: 'DOENTE',
        club_id: 1,
        campo_inexistente: true,
      });
      const response = await api.post('/players', body);
      expect(response.status).toBe(201);
      player = response.body;
      expect(response.headers.get('location')).toBe(`/api/v1/players/${player.id}`);
      expect(player.id).not.toBe(999);
      expect(player).toMatchObject({
        condition: 'APTO',
        club_id: null,
        base_value: 40,
        market_value: 40,
        overall: 75,
      });
    });

    it('consulta por id devolve o mesmo jogador', async () => {
      const response = await api.get(`/players/${player.id}`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(/^application\/json/);
      expect(response.body).toEqual(player);
    });

    it('PUT muda só nome, posição, agilidade e idade; o valor base continua o do cadastro', async () => {
      const response = await api.put(`/players/${player.id}`, {
        name: 'Meia Lua',
        position: 'ATA',
        agility: 60,
        age: 26,
        pace: 1,
        potential: 1,
        base_value: 1,
      });
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Meia Lua',
        position: 'ATA',
        agility: 60,
        age: 26,
        pace: 70,
        potential: 86,
        base_value: 40,
        overall: 72,
      });
    });
  });

  describe('B04: edição e alteração de condição', () => {
    let player: any;

    beforeAll(async () => {
      player = await createPlayer({ age: 30 });
    });

    it('PUT com corpo inválido → 400', async () => {
      await expectRejected(
        api.put(`/players/${player.id}`, { name: player.name, position: 'MEI', agility: 50 }),
        400,
      );
      await expectRejected(
        api.put(`/players/${player.id}`, { name: player.name, position: 'MEI', agility: '50', age: 30 }),
        400,
      );
    });

    it('PUT com idade menor que a atual → 409', async () => {
      await expectRejected(
        api.put(`/players/${player.id}`, { name: player.name, position: 'MEI', agility: 50, age: 29 }),
        409,
      );
      expect((await api.get(`/players/${player.id}`)).body.age).toBe(30);
    });

    it('PATCH com corpo inválido → 400 e jogador inexistente → 404', async () => {
      await expectRejected(api.patch(`/players/${player.id}/condition`, {}), 400);
      await expectRejected(api.patch(`/players/${player.id}/condition`, { condition: 'apto' }), 400);
      await expectRejected(api.patch(`/players/${player.id}/condition`, []), 400);
      await expectRejected(api.patch('/players/999999/condition', { condition: 'APTO' }), 404);
    });

    it('segue as transições de condição, com DOENTE → APTO recusado', async () => {
      const change = (condition: string) => api.patch(`/players/${player.id}/condition`, { condition });
      expect((await change('MAL_CONDICIONADO')).status).toBe(200);
      expect((await change('DOENTE')).status).toBe(200);
      await expectRejected(change('APTO'), 409);
      expect((await change('DOENTE')).body.condition).toBe('DOENTE');
      expect((await change('MAL_CONDICIONADO')).status).toBe(200);
      expect((await change('APTO')).body.condition).toBe('APTO');
    });
  });

  describe('B05: valor de mercado', () => {
    const cases: [string, number, number, number, string | undefined, number][] = [
      ['APTO, a agilidade não age', 75, 20, 25, undefined, 40],
      ['APTO com 19 anos', 75, 50, 19, undefined, 44],
      ['MAL_CONDICIONADO', 75, 50, 25, 'MAL_CONDICIONADO', 34],
      ['MAL_CONDICIONADO, agilidade 80 e 21 anos', 75, 80, 21, 'MAL_CONDICIONADO', 41],
      ['MAL_CONDICIONADO, agilidade 30 e 33 anos', 75, 30, 33, 'MAL_CONDICIONADO', 26],
      ['DOENTE com agilidade 90', 75, 90, 25, 'DOENTE', 34],
      ['DOENTE com agilidade 30, no teto', 75, 30, 25, 'DOENTE', 24],
      ['DOENTE com agilidade 10 e 40 anos, limitado ao teto', 75, 10, 40, 'DOENTE', 24],
      ['piso de 1,00', 40, 50, 35, 'MAL_CONDICIONADO', 1],
    ];

    it.each(cases)('%s', async (_, attribute, agility, age, condition, expected) => {
      const player = await createPlayer(
        { ...sameAttributes(attribute), potential: attribute, agility, age },
        condition,
      );
      expect(player.market_value).toBe(expected);
    });

    it('arredonda o meio para longe do zero (35,055 → 35,06)', async () => {
      const player = await createPlayer(
        { ...sameAttributes(70), potential: 84, agility: 85, age: 21 },
        'MAL_CONDICIONADO',
      );
      expect(player.base_value).toBe(34.2);
      expect(player.market_value).toBe(35.06);
    });

    it('usa a idade atual, não a do cadastro', async () => {
      const player = await createPlayer();
      const edited = await api.put(`/players/${player.id}`, {
        name: player.name,
        position: 'MEI',
        agility: 50,
        age: 32,
      });
      expect(edited.body).toMatchObject({ base_value: 40, market_value: 36 });
    });
  });

  describe('B06: overall e valor base', () => {
    const overallCases: [string, number[], number][] = [
      ['MEI', [68, 65, 80, 78, 52, 60], 73],
      ['ATA', [78, 75, 73, 82, 48, 68], 76],
      ['LAT', [72, 70, 78, 76, 70, 66], 72],
      ['ZAG', [50, 90, 60, 40, 80, 75], 73],
      ['GOL', [55, 30, 65, 40, 72, 68], 68],
    ];

    it.each(overallCases)('overall de %s', async (position, values, expected) => {
      const [pace, shooting, passing, dribbling, defending, physical] = values;
      const player = await createPlayer({
        position,
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physical,
        potential: Math.max(...values),
      });
      expect(player.overall).toBe(expected);
    });

    const baseCases: [number, number, number, number][] = [
      [75, 86, 25, 40],
      [60, 70, 30, 10],
      [61, 70, 30, 12],
      [76, 80, 22, 46],
      [70, 84, 21, 34.2],
      [70, 84, 22, 30],
      [45, 90, 18, 3.63],
      [40, 40, 36, 1],
    ];

    it.each(baseCases)(
      'overall %i, potencial %i e %i anos → valor base %d',
      async (overall, potential, age, expected) => {
        const player = await createPlayer({ ...sameAttributes(overall), potential, age });
        expect(player.base_value).toBe(expected);
      },
    );
  });

  describe('B07: listagem', () => {
    const search = '/players?search=zuleica';

    beforeAll(async () => {
      await createPlayer({ name: 'Ana Zuleica', position: 'MEI', age: 30 });
      await createPlayer({ name: 'Bruno Zuléica', position: 'ATA', ...sameAttributes(60), potential: 60 });
      await createPlayer({ name: 'Caio Zuleica', position: 'ATA' });
      await createPlayer({
        name: 'Davi Zuleica',
        position: 'GOL',
        age: 19,
        ...sameAttributes(61),
        potential: 61,
      });
      await createPlayer({ name: 'Édson Zuleica', position: 'ZAG', age: 33 });
    });

    it('busca sem diferenciar acentos e maiúsculas, ordenada pelo nome', async () => {
      const response = await api.get('/players?search=ZULEICA');
      expect(names(response)).toEqual([
        'Ana Zuleica',
        'Bruno Zuléica',
        'Caio Zuleica',
        'Davi Zuleica',
        'Édson Zuleica',
      ]);
    });

    it('combina filtros', async () => {
      expect(names(await api.get(`${search}&position=ATA`))).toEqual(['Bruno Zuléica', 'Caio Zuleica']);
      expect(names(await api.get(`${search}&min_age=25&max_age=30`))).toEqual([
        'Ana Zuleica',
        'Bruno Zuléica',
        'Caio Zuleica',
      ]);
      expect(names(await api.get(`${search}&min_value=13.2&max_value=36`))).toEqual([
        'Davi Zuleica',
        'Édson Zuleica',
      ]);
      expect((await api.get(`${search}&free=true`)).body.meta.total_items).toBe(5);
    });

    it('ordena por valor, por dois critérios e por posição, com desempate pelo nome', async () => {
      expect(names(await api.get(`${search}&sort=value_desc`))).toEqual([
        'Ana Zuleica',
        'Caio Zuleica',
        'Édson Zuleica',
        'Davi Zuleica',
        'Bruno Zuléica',
      ]);
      expect(names(await api.get(`${search}&sort=value_desc,age_asc`))).toEqual([
        'Caio Zuleica',
        'Ana Zuleica',
        'Édson Zuleica',
        'Davi Zuleica',
        'Bruno Zuléica',
      ]);
      expect(names(await api.get(`${search}&sort=position`))).toEqual([
        'Davi Zuleica',
        'Édson Zuleica',
        'Ana Zuleica',
        'Bruno Zuléica',
        'Caio Zuleica',
      ]);
    });

    it('pagina depois de filtrar, com meta correto', async () => {
      const lastPage = await api.get(`${search}&limit=2&page=3`);
      expect(names(lastPage)).toEqual(['Édson Zuleica']);
      expect(lastPage.body.meta).toEqual({ page: 3, limit: 2, total_items: 5, total_pages: 3 });
      const beyond = await api.get(`${search}&limit=2&page=4`);
      expect(beyond.status).toBe(200);
      expect(beyond.body.data).toEqual([]);
      expect(beyond.body.meta.total_pages).toBe(3);
    });

    it.each([
      'position=mei',
      'position=',
      'limit=51',
      'limit=0',
      'page=0',
      'page=01',
      'min_age=30&max_age=25',
      'min_value=50&max_value=10',
      'min_value=1.234',
      'free=true&club_id=1',
      'sort=POSITION',
      'sort=value_asc,value_desc',
      'search=a',
    ])('parâmetro inválido ou contraditório (%s) → 400', async (query) => {
      await expectRejected(api.get(`/players?${query}`), 400);
    });

    it('club_id inexistente → 404', async () => {
      await expectRejected(api.get('/players?club_id=999999'), 404);
    });
  });

  describe('B08: exclusão lógica', () => {
    it('responde 204 sem corpo, e o jogador passa a não existir', async () => {
      const player = await createPlayer({ name: 'Excluido Logico' });
      const removed = await api.delete(`/players/${player.id}`);
      expect(removed.status).toBe(204);
      expect(removed.text).toBe('');

      await expectRejected(api.get(`/players/${player.id}`), 404);
      await expectRejected(
        api.put(`/players/${player.id}`, { name: 'Outro Nome', position: 'MEI', agility: 50, age: 25 }),
        404,
      );
      await expectRejected(api.patch(`/players/${player.id}/condition`, { condition: 'DOENTE' }), 404);
      await expectRejected(api.delete(`/players/${player.id}`), 404);
      expect((await api.get('/players?search=excluido')).body.data).toEqual([]);
    });
  });
});

describe('Etapa 2: clubes', () => {
  it('B09: cria com 201, Location e caixa de 300,00', async () => {
    const response = await api.post('/clubs', { name: 'Águias FC', acronym: 'AGU' });
    expect(response.status).toBe(201);
    expect(response.headers.get('location')).toBe(`/api/v1/clubs/${response.body.id}`);
    expect(response.body).toMatchObject({
      name: 'Águias FC',
      acronym: 'AGU',
      cash: 300,
      squad_value: 0,
      net_worth: 300,
    });
  });

  it.each([
    ['nome com uma palavra', 'Águias', 'AGU'],
    ['nome com dígito', 'Clube 10 FC', 'CFC'],
    ['nome com seis palavras', 'Um Dois Tres Quatro Cinco Seis', 'UDT'],
    ['nome com caractere não permitido', 'Clube_Novo FC', 'CNF'],
    ['sigla em minúsculas', 'Lobos FC', 'lfc'],
    ['sigla com duas letras', 'Lobos FC', 'LF'],
    ['sigla com letras iguais', 'Aaa Aaa', 'AAA'],
    ['letras da sigla fora de ordem', 'Lobos FC', 'LCF'],
    ['primeira letra diferente da do nome', 'Lobos FC', 'OFC'],
  ])('%s → 400', async (_, name, acronym) => {
    await expectRejected(api.post('/clubs', { name, acronym }), 400);
  });

  it('nome único sem diferenciar maiúsculas, mas considerando acentos; sigla única', async () => {
    await expectRejected(api.post('/clubs', { name: '  águias   fc ', acronym: 'AGF' }), 409);
    await createClub('Aguias FC', 'AGF');
    await expectRejected(api.post('/clubs', { name: 'Agulha Unida', acronym: 'AGU' }), 409);
  });

  it('GET /clubs ordena pelo nome, com desempate pelo id', async () => {
    await createClub('Gama SC', 'GSC');
    await createClub('Épsilon SC', 'ESC');
    await createClub('Delta FC', 'DFC');
    const response = await api.get('/clubs');
    expect(response.body.map((club: any) => club.name)).toEqual([
      'Águias FC',
      'Aguias FC',
      'Delta FC',
      'Épsilon SC',
      'Gama SC',
    ]);
  });
});

describe('Etapas 3 a 6: compra, venda, clubes com elenco e histórico', () => {
  let clubs: Record<string, any>;

  beforeAll(async () => {
    const list = (await api.get('/clubs')).body;
    clubs = Object.fromEntries(list.map((club: any) => [club.acronym, club]));
  });

  describe('B10: compra', () => {
    it('cobra o valor de mercado com a taxa e cria o contrato e a transação', async () => {
      const player = await createPlayer();
      const loyaltyUntil = currentMinute() + 400 * DAY;
      const bought = await buy(player.id, clubs.AGU.id, brasilia(loyaltyUntil));
      expect(bought).toMatchObject({
        club_id: clubs.AGU.id,
        player_id: player.id,
        player_name: player.name,
        type: 'COMPRA',
        value: 40,
        fee: 2,
        penalty: 0,
        profit: null,
        cash_change: -42,
        contract: { purchase_value: 40, loyalty_until: brasiliaWithSeconds(loyaltyUntil), status: 'ATIVO' },
        club_cash: 258,
      });
      expect((await api.get(`/players/${player.id}`)).body.club_id).toBe(clubs.AGU.id);
    });

    it('não cobra taxa até 30,00', async () => {
      const player = await createPlayer({ ...sameAttributes(70), potential: 70 });
      const bought = await buy(player.id, clubs.AGU.id);
      expect(bought).toMatchObject({ value: 30, fee: 0, cash_change: -30 });
    });

    it('recusa o custo acima de 50% do caixa, sem gravar nada', async () => {
      const expensive = { ...sameAttributes(80), potential: 99, age: 18 };
      const first = await buy((await createPlayer(expensive)).id, clubs.GSC.id);
      expect(first).toMatchObject({ value: 91.63, fee: 4.58, club_cash: 203.79 });
      const second = await buy((await createPlayer(expensive)).id, clubs.GSC.id);
      expect(second.club_cash).toBe(107.58);

      const third = await createPlayer(expensive);
      await expectRejected(
        api.post(`/players/${third.id}/buy`, { club_id: clubs.GSC.id, loyalty_until: farLoyalty() }),
        409,
      );
      expect(await clubCash(clubs.GSC.id)).toBe(107.58);
      expect((await api.get(`/players/${third.id}`)).body.club_id).toBeNull();
    });
  });

  describe('B11: compra recusada', () => {
    it('jogador com clube → 409 e jogador excluído → 404', async () => {
      const player = await createPlayer();
      await buy(player.id, clubs.DFC.id);
      await expectRejected(
        api.post(`/players/${player.id}/buy`, { club_id: clubs.ESC.id, loyalty_until: farLoyalty() }),
        409,
      );

      const removed = await createPlayer();
      await api.delete(`/players/${removed.id}`);
      await expectRejected(
        api.post(`/players/${removed.id}/buy`, { club_id: clubs.ESC.id, loyalty_until: farLoyalty() }),
        404,
      );
    });

    it.each([
      ['club_id 0', 0],
      ['club_id negativo', -1],
      ['club_id como texto', '1'],
      ['club_id fracionário', 1.5],
      ['club_id nulo', null],
    ])('%s → 400', async (_, clubId) => {
      const player = await createPlayer();
      await expectRejected(
        api.post(`/players/${player.id}/buy`, { club_id: clubId, loyalty_until: farLoyalty() }),
        400,
      );
    });

    it('clube inexistente → 404', async () => {
      const player = await createPlayer();
      await expectRejected(
        api.post(`/players/${player.id}/buy`, { club_id: 999999, loyalty_until: farLoyalty() }),
        404,
      );
    });

    it('elenco com 12 jogadores → 409', async () => {
      const cheap = { ...sameAttributes(40), potential: 40, age: 36 };
      for (let i = 0; i < 12; i++) await buy((await createPlayer(cheap)).id, clubs.ESC.id);
      const extra = await createPlayer(cheap);
      await expectRejected(
        api.post(`/players/${extra.id}/buy`, { club_id: clubs.ESC.id, loyalty_until: farLoyalty() }),
        409,
      );
    });
  });

  describe('B12: fim da fidelidade', () => {
    let player: any;

    beforeAll(async () => {
      player = await createPlayer();
    });

    it.each([
      ['sem o -03:00', () => brasilia(Date.now() + 10 * DAY).slice(0, 16)],
      ['com segundos', () => brasiliaWithSeconds(Date.now() + 10 * DAY)],
      ['em UTC', () => new Date(Date.now() + 10 * DAY).toISOString()],
      ['data inexistente', () => '2027-02-30T10:15-03:00'],
      ['hora 24:00', () => '2027-03-02T24:00-03:00'],
      ['no passado', () => brasilia(Date.now() - 2 * MINUTE)],
      ['depois de 1.095 dias', () => brasilia(Date.now() + 1096 * DAY)],
    ])('%s → 400', async (_, loyaltyUntil) => {
      await expectRejected(
        api.post(`/players/${player.id}/buy`, { club_id: clubs.AGF.id, loyalty_until: loyaltyUntil() }),
        400,
      );
      expect((await api.get(`/players/${player.id}`)).body.club_id).toBeNull();
    });

    it('aceita até 1.095 dias', async () => {
      const bought = await buy(player.id, clubs.AGF.id, brasilia(Date.now() + 1094 * DAY));
      expect(bought.contract.status).toBe('ATIVO');
    });
  });

  describe('B13: clube com elenco', () => {
    it('mostra o elenco na ordem, os contratos, o valor do elenco e o patrimônio', async () => {
      const club = await createClub('Mangue FC', 'MFC');
      const start = currentMinute();
      const midfielder = await createPlayer({ position: 'MEI' });
      const goalkeeper = await createPlayer({
        position: 'GOL',
        age: 19,
        ...sameAttributes(61),
        potential: 61,
      });
      const striker = await createPlayer({ position: 'ATA', agility: 30 }, 'DOENTE');

      await buy(midfielder.id, club.id, brasilia(start + 120 * DAY + 2 * MINUTE));
      await buy(goalkeeper.id, club.id, brasilia(start + 200 * DAY + 2 * MINUTE));
      await buy(striker.id, club.id, brasilia(start + 10 * DAY + 2 * MINUTE));

      const response = await api.get(`/clubs/${club.id}`);
      expect(response.body).toMatchObject({ cash: 220.8, squad_value: 77.2, net_worth: 298 });
      const squad = response.body.players.map((player: any) => [
        player.id,
        player.market_value,
        player.contract.remaining_days,
        player.contract.penalty_rate,
      ]);
      expect(squad).toEqual([
        [goalkeeper.id, 13.2, 201, 20],
        [midfielder.id, 40, 121, 10],
        [striker.id, 24, 11, 5],
      ]);
    });
  });

  describe('B14: multa por fidelidade', () => {
    const cases: [string, number, number, number][] = [
      ['10 dias e 2 horas', 10 * DAY + 120 * MINUTE, 11, 5],
      ['exatamente 30 dias', 30 * DAY, 30, 5],
      ['30 dias e 1 minuto', 30 * DAY + 2 * MINUTE, 31, 10],
      ['exatamente 180 dias', 180 * DAY, 180, 10],
      ['180 dias e 1 minuto', 180 * DAY + 2 * MINUTE, 181, 20],
    ];

    it.each(cases)('%s', async (_, loyalty, remainingDays, penaltyRate) => {
      const player = await createPlayer();
      await buy(player.id, clubs.DFC.id, brasilia(currentMinute() + loyalty));
      const sold = await sell(player.id);
      expect(sold).toMatchObject({
        type: 'VENDA',
        remaining_days: remainingDays,
        penalty_rate: penaltyRate,
        penalty: (40 * penaltyRate) / 100,
        contract_status: 'RESCINDIDO',
      });
    });

    it('limita a multa a 10,00', async () => {
      const player = await createPlayer({ ...sameAttributes(80), potential: 99, age: 18 });
      await buy(player.id, clubs.AGU.id, brasilia(currentMinute() + 200 * DAY));
      const sold = await sell(player.id);
      expect(sold).toMatchObject({ value: 91.63, penalty_rate: 20, penalty: 10 });
    });

    it('fidelidade cumprida: 0 dia, sem multa e contrato ENCERRADO', async () => {
      const player = await createPlayer();
      const loyaltyUntil = currentMinute() + 2 * MINUTE;
      await buy(player.id, clubs.DFC.id, brasilia(loyaltyUntil));
      await new Promise((resolve) => setTimeout(resolve, loyaltyUntil - Date.now() + 1000));
      const sold = await sell(player.id);
      expect(sold).toMatchObject({
        remaining_days: 0,
        penalty_rate: 0,
        penalty: 0,
        contract_status: 'ENCERRADO',
        cash_change: 40,
      });
    }, 200_000);
  });

  describe('B15: venda', () => {
    const shortLoyalty = () => brasilia(currentMinute() + 10 * DAY + 120 * MINUTE);

    it('lucro até 10,00: comissão de 10% e crédito no caixa', async () => {
      const player = await createPlayer({}, 'MAL_CONDICIONADO');
      const bought = await buy(player.id, clubs.DFC.id, shortLoyalty());
      expect(bought.value).toBe(34);
      await api.patch(`/players/${player.id}/condition`, { condition: 'APTO' });

      const cashBefore = await clubCash(clubs.DFC.id);
      const sold = await sell(player.id);
      expect(sold).toMatchObject({
        purchase_value: 34,
        value: 40,
        penalty: 2,
        profit: 6,
        fee: 0.6,
        cash_change: 37.4,
      });
      expect(sold.club_cash).toBeCloseTo(cashBefore + 37.4, 2);
    });

    it('lucro acima de 10,00: comissão progressiva arredondada no final', async () => {
      const player = await createPlayer(
        { ...sameAttributes(80), potential: 99, age: 21 },
        'MAL_CONDICIONADO',
      );
      const bought = await buy(player.id, clubs.AGU.id, shortLoyalty());
      expect(bought.value).toBe(79.14);
      await api.patch(`/players/${player.id}/condition`, { condition: 'APTO' });

      const sold = await sell(player.id);
      expect(sold).toMatchObject({
        value: 91.63,
        penalty: 4.58,
        profit: 12.49,
        fee: 1.5,
        cash_change: 85.55,
      });
    });

    it('prejuízo: sem comissão, e o jogador volta a ficar livre', async () => {
      const player = await createPlayer();
      await buy(player.id, clubs.DFC.id, shortLoyalty());
      await api.patch(`/players/${player.id}/condition`, { condition: 'MAL_CONDICIONADO' });

      const sold = await sell(player.id);
      expect(sold).toMatchObject({ value: 34, penalty: 1.7, profit: -6, fee: 0, cash_change: 32.3 });
      expect((await api.get(`/players/${player.id}`)).body.club_id).toBeNull();
      const free = await api.get(`/players?free=true&search=${encodeURIComponent(player.name)}`);
      expect(free.body.data.map((item: any) => item.id)).toContain(player.id);
    });
  });

  describe('B16: venda recusada e recompra', () => {
    it('jogador livre → 409 e jogador excluído → 404', async () => {
      const free = await createPlayer();
      await expectRejected(api.post(`/players/${free.id}/sell`), 409);
      await api.delete(`/players/${free.id}`);
      await expectRejected(api.post(`/players/${free.id}/sell`), 404);
    });

    it('o clube que vendeu não compra de novo; outro clube compra', async () => {
      const player = await createPlayer();
      await buy(player.id, clubs.DFC.id);
      await sell(player.id);
      await expectRejected(
        api.post(`/players/${player.id}/buy`, { club_id: clubs.DFC.id, loyalty_until: farLoyalty() }),
        409,
      );
      const bought = await buy(player.id, clubs.AGF.id);
      expect(bought.club_id).toBe(clubs.AGF.id);
    });
  });

  describe('B17: clubes com elenco', () => {
    it('GET /clubs ordena pelo patrimônio, com desempate pelo nome', async () => {
      const response = await api.get('/clubs?sort=net_worth_desc');
      expect(response.status).toBe(200);
      const expected = [...response.body].sort((a: any, b: any) => b.net_worth - a.net_worth || byName(a, b));
      expect(response.body).toEqual(expected);
      const ascending = await api.get('/clubs?sort=net_worth_asc');
      expect(ascending.body.map((club: any) => club.id)).toEqual(
        [...ascending.body]
          .sort((a: any, b: any) => a.net_worth - b.net_worth || byName(a, b))
          .map((c: any) => c.id),
      );
    });

    it.each(['sort=patrimonio', 'sort=NAME', 'sort='])('GET /clubs?%s → 400', async (query) => {
      await expectRejected(api.get(`/clubs?${query}`), 400);
    });

    it('GET /players com club_id e com free=false', async () => {
      const squad = (await api.get(`/clubs/${clubs.ESC.id}`)).body.players.map((player: any) => player.id);
      const byClub = await api.get(`/players?club_id=${clubs.ESC.id}&limit=50`);
      const ascending = (a: number, b: number) => a - b;
      expect(byClub.body.data.map((player: any) => player.id).sort(ascending)).toEqual(
        [...squad].sort(ascending),
      );

      const withClub = await api.get('/players?free=false&limit=50');
      expect(withClub.body.data.every((player: any) => player.club_id !== null)).toBe(true);
    });

    it('jogador com clube não é excluído nem muda de posição (409)', async () => {
      const player = await createPlayer();
      await buy(player.id, clubs.AGF.id);
      await expectRejected(api.delete(`/players/${player.id}`), 409);
      const edit = { name: player.name, agility: 50, age: 25 };
      await expectRejected(api.put(`/players/${player.id}`, { ...edit, position: 'ATA' }), 409);
      expect((await api.put(`/players/${player.id}`, { ...edit, position: 'MEI' })).status).toBe(200);
    });
  });

  describe('B18: histórico de transações', () => {
    let club: any;
    let renamed: any;
    let removed: any;

    beforeAll(async () => {
      club = await createClub('Tubarões EC', 'TEC');
      renamed = await createPlayer({ name: 'Nome Antigo' });
      removed = await createPlayer();
      await buy(renamed.id, club.id);
      await buy(removed.id, club.id);
      await sell(removed.id);
      await api.delete(`/players/${removed.id}`);
      await api.put(`/players/${renamed.id}`, { name: 'Nome Novo', position: 'MEI', agility: 50, age: 25 });
    });

    it('da mais recente para a mais antiga, com o nome e os valores do momento', async () => {
      const response = await api.get(`/clubs/${club.id}/transactions`);
      expect(response.status).toBe(200);
      expect(response.body.data.map((item: any) => [item.player_id, item.type])).toEqual([
        [removed.id, 'VENDA'],
        [removed.id, 'COMPRA'],
        [renamed.id, 'COMPRA'],
      ]);
      expect(response.body.data[2].player_name).toBe('Nome Antigo');
      expect(response.body.summary).toEqual({
        total_spent: 84,
        total_received: 32,
        total_fees: 4,
        total_penalties: 8,
        total_profit: 0,
      });
    });

    it('300,00 + soma das variações = caixa atual', async () => {
      for (const id of [club.id, clubs.AGU.id, clubs.DFC.id]) {
        const history = (await api.get(`/clubs/${id}/transactions`)).body.data;
        const total = history.reduce((sum: number, item: any) => sum + item.cash_change, 300);
        expect(await clubCash(id)).toBeCloseTo(total, 2);
      }
    });

    it('filtra por tipo e por jogador, com o summary dos filtrados', async () => {
      const sales = await api.get(`/clubs/${club.id}/transactions?type=VENDA`);
      expect(sales.body.data).toHaveLength(1);
      expect(sales.body.summary.total_spent).toBe(0);
      expect(sales.body.summary.total_received).toBe(32);

      const both = await api.get(`/clubs/${club.id}/transactions?type=COMPRA,VENDA&player_id=${renamed.id}`);
      expect(both.body.data).toHaveLength(1);
      expect(both.body.summary.total_spent).toBe(42);

      const other = await createPlayer();
      const none = await api.get(`/clubs/${club.id}/transactions?player_id=${other.id}`);
      expect(none.status).toBe(200);
      expect(none.body.data).toEqual([]);
      expect(Object.values(none.body.summary)).toEqual([0, 0, 0, 0, 0]);
    });

    it.each(['type=venda', 'type=COMPRA,COMPRA', 'type=', 'player_id=abc', 'player_id=0'])(
      'filtro inválido (%s) → 400',
      async (query) => {
        await expectRejected(api.get(`/clubs/${club.id}/transactions?${query}`), 400);
      },
    );

    it('jogador excluído no filtro → 404, mas as transações dele continuam no histórico', async () => {
      await expectRejected(api.get(`/clubs/${club.id}/transactions?player_id=${removed.id}`), 404);
      await expectRejected(api.get('/clubs/999999/transactions'), 404);
    });
  });

  describe('B19: exportação CSV', () => {
    let club: any;

    beforeAll(async () => {
      club = await createClub('Corsários FC', 'CFC');
      const quoted = await createPlayer({ name: 'Zé "Foguete" Lima' });
      const withSemicolon = await createPlayer({ name: 'Ana;Paula Souza' });
      await buy(quoted.id, club.id);
      await buy(withSemicolon.id, club.id);
      await sell(withSemicolon.id);
    });

    it('UTF-8 sem BOM, LF, cabeçalho e linhas na ordem do histórico', async () => {
      const response = await api.get(`/clubs/${club.id}/transactions/export`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(/^text\/csv/);
      expect(response.text.charCodeAt(0)).not.toBe(0xfeff);
      expect(response.text).not.toContain('\r');
      expect(response.text.endsWith('\n')).toBe(true);

      const lines = response.text.slice(0, -1).split('\n');
      expect(lines[0]).toBe('data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa');
      expect(lines).toHaveLength(4);
      expect(lines[1]).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00;VENDA;"Ana;Paula Souza";40,00;0,00;8,00;0,00;32,00$/,
      );
      expect(lines[3]).toMatch(/;COMPRA;"Zé ""Foguete"" Lima";40,00;2,00;0,00;;-42,00$/);
    });

    it('aplica os filtros e responde os erros em JSON', async () => {
      const sales = await api.get(`/clubs/${club.id}/transactions/export?type=VENDA`);
      expect(sales.text.split('\n')).toHaveLength(3);
      const empty = await api.get(
        `/clubs/${club.id}/transactions/export?type=COMPRA&player_id=${(await createPlayer()).id}`,
      );
      expect(empty.text).toBe('data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n');

      const invalid = await api.get(`/clubs/${club.id}/transactions/export?type=x`);
      expect(invalid.status).toBe(400);
      expect(invalid.headers.get('content-type')).toMatch(/^application\/json/);
      await expectRejected(api.get('/clubs/999999/transactions/export'), 404);
    });
  });
});

describe('Etapa 7: liga', () => {
  const others = (values: Record<string, number>) => ({ ...sameAttributes(50), ...values });
  let home: any;
  let away: any;
  let homeSquad: Record<string, any>;
  let awaySquad: Record<string, any>;
  let firstMatch: any;

  async function hire(club: any, name: string, position: string, values: Record<string, number>) {
    const attributes = others(values);
    const player = await createPlayer({
      name,
      position,
      ...attributes,
      potential: Math.max(...Object.values(attributes)),
    });
    await buy(player.id, club.id);
    return player;
  }

  const lineupIds = (squad: Record<string, any>) => Object.values(squad).map((player) => player.id);

  beforeAll(async () => {
    home = await createClub('Lince FC', 'LFC');
    away = await createClub('Pantera SC', 'PSC');
    homeSquad = {
      ata: await hire(home, 'Otto Rangel', 'ATA', { shooting: 75 }),
      lat: await hire(home, 'Davi Lins', 'LAT', { dribbling: 74, defending: 66 }),
      gol: await hire(home, 'Rui Prado', 'GOL', { defending: 77 }),
      mei: await hire(home, 'Lauro Neves', 'MEI', { passing: 82 }),
      zag: await hire(home, 'Téo Brandão', 'ZAG', { defending: 84 }),
    };
    awaySquad = {
      gol: await hire(away, 'Ivo Teles', 'GOL', { defending: 72 }),
      zag: await hire(away, 'Hugo Vaz', 'ZAG', { defending: 84 }),
      lat: await hire(away, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
      mei: await hire(away, 'Nei Soares', 'MEI', { passing: 70 }),
      ata: await hire(away, 'Ugo Falcão', 'ATA', { shooting: 81 }),
    };
  });

  describe('B20: escalação', () => {
    const put = (club: any, body: unknown) => api.put(`/clubs/${club.id}/lineup`, body);

    it.each<[string, (ids: number[]) => unknown]>([
      ['formação fora da lista', (ids) => ({ formation: '4-0', player_ids: ids })],
      ['formação ausente', (ids) => ({ player_ids: ids })],
      ['quatro ids', (ids) => ({ formation: '2-1-1', player_ids: ids.slice(0, 4) })],
      ['ids repetidos', (ids) => ({ formation: '2-1-1', player_ids: [ids[0], ...ids.slice(0, 4)] })],
      ['id como texto', (ids) => ({ formation: '2-1-1', player_ids: ids.map(String) })],
    ])('%s → 400', async (_, body) => {
      await expectRejected(put(home, body(lineupIds(homeSquad))), 400);
    });

    it('clube ou jogador inexistente → 404', async () => {
      await expectRejected(
        api.put('/clubs/999999/lineup', { formation: '2-1-1', player_ids: lineupIds(homeSquad) }),
        404,
      );
      const ids = [...lineupIds(homeSquad).slice(0, 4), 999999];
      await expectRejected(put(home, { formation: '2-1-1', player_ids: ids }), 404);
    });

    it('jogador de outro clube, livre, DOENTE ou formação que não fecha → 409, sem gravar', async () => {
      const ids = lineupIds(homeSquad);
      await expectRejected(
        put(home, { formation: '2-1-1', player_ids: [...ids.slice(0, 4), awaySquad.zag.id] }),
        409,
      );
      const free = await createPlayer({ position: 'ZAG' });
      await expectRejected(put(home, { formation: '2-1-1', player_ids: [...ids.slice(0, 4), free.id] }), 409);
      const sick = await hire(home, 'Mei Doente', 'MEI', {});
      await api.patch(`/players/${sick.id}/condition`, { condition: 'DOENTE' });
      const withSick = ids.map((id) => (id === homeSquad.mei.id ? sick.id : id));
      await expectRejected(put(home, { formation: '2-1-1', player_ids: withSick }), 409);
      await expectRejected(put(home, { formation: '3-1', player_ids: ids }), 409);

      const lineup = await api.get(`/clubs/${home.id}/lineup`);
      expect(lineup.body).toEqual({ club_id: home.id, formation: null, complete: false, players: [] });
    });

    it('escala os 5 titulares na ordem do elenco, sem mudar o caixa, e substitui por inteiro', async () => {
      const cashBefore = await clubCash(home.id);
      const reserve = await hire(home, 'Mei Reserva', 'MEI', {});
      const withReserve = lineupIds(homeSquad).map((id) => (id === homeSquad.mei.id ? reserve.id : id));
      expect((await put(home, { formation: '2-1-1', player_ids: withReserve })).status).toBe(200);

      const replaced = await put(home, { formation: '2-1-1', player_ids: lineupIds(homeSquad).reverse() });
      expect(replaced.status).toBe(200);
      const lineup = (await api.get(`/clubs/${home.id}/lineup`)).body;
      expect(lineup).toMatchObject({ club_id: home.id, formation: '2-1-1', complete: true });
      expect(lineup.players.map((player: any) => player.position)).toEqual([
        'GOL',
        'ZAG',
        'LAT',
        'MEI',
        'ATA',
      ]);
      expect(lineup.players[0]).toMatchObject({ id: homeSquad.gol.id, market_value: expect.any(Number) });
      expect(await clubCash(home.id)).toBeCloseTo(cashBefore - reserve.market_value, 2);

      expect((await put(away, { formation: '2-1-1', player_ids: lineupIds(awaySquad) })).status).toBe(200);
    });
  });

  describe('B21: partida', () => {
    it('joga os 6 duelos pela ordem do elenco, com MAL_CONDICIONADO a 85%', async () => {
      await api.patch(`/players/${homeSquad.lat.id}/condition`, { condition: 'MAL_CONDICIONADO' });
      const cash = [await clubCash(home.id), await clubCash(away.id)];

      const response = await api.post('/matches', { home_club_id: home.id, away_club_id: away.id });
      expect(response.status).toBe(201);
      firstMatch = response.body;
      expect(response.headers.get('location')).toBe(`/api/v1/matches/${firstMatch.id}`);
      expect(firstMatch).toMatchObject({
        home: { club_id: home.id, club_name: 'Lince FC', formation: '2-1-1', goals: 1 },
        away: { club_id: away.id, club_name: 'Pantera SC', formation: '2-1-1', goals: 2 },
        result: 'VISITANTE',
      });

      const duels = firstMatch.duels.map((duel: any) => [
        duel.order,
        duel.attacker.player_name,
        duel.attacker.attribute,
        duel.attacker.value,
        duel.defender.player_name,
        duel.defender.value,
        duel.goal,
      ]);
      expect(duels).toEqual([
        [1, 'Otto Rangel', 'shooting', 75, 'Ivo Teles', 72, true],
        [2, 'Lauro Neves', 'passing', 82, 'Hugo Vaz', 84, false],
        [3, 'Davi Lins', 'dribbling', 63, 'Lino Matos', 63, false],
        [4, 'Ugo Falcão', 'shooting', 81, 'Rui Prado', 77, true],
        [5, 'Nei Soares', 'passing', 70, 'Téo Brandão', 84, false],
        [6, 'Lino Matos', 'dribbling', 79, 'Davi Lins', 56, true],
      ]);
      expect(firstMatch.duels[2].attacker.condition).toBe('MAL_CONDICIONADO');

      expect([await clubCash(home.id), await clubCash(away.id)]).toEqual(cash);
      expect((await api.get(`/clubs/${home.id}/lineup`)).body.complete).toBe(true);
      expect((await api.get(`/players/${homeSquad.lat.id}`)).body.dribbling).toBe(74);
    });

    it('mandante igual ao visitante → 400, clube inexistente → 404, sem escalação → 409', async () => {
      await expectRejected(api.post('/matches', { home_club_id: home.id, away_club_id: home.id }), 400);
      await expectRejected(api.post('/matches', { home_club_id: home.id, away_club_id: 0 }), 400);
      await expectRejected(api.post('/matches', { home_club_id: 999999, away_club_id: away.id }), 404);
      const unlisted = (await api.get('/clubs')).body.find((club: any) => club.name === 'Águias FC');
      await expectRejected(api.post('/matches', { home_club_id: unlisted.id, away_club_id: away.id }), 409);
    });
  });

  describe('B22: histórico de partidas e classificação', () => {
    let secondMatch: any;

    beforeAll(async () => {
      secondMatch = (await api.post('/matches', { home_club_id: away.id, away_club_id: home.id })).body;
    });

    it('a segunda partida inverte quem ataca primeiro', () => {
      expect(secondMatch).toMatchObject({ home: { goals: 2 }, away: { goals: 1 }, result: 'MANDANTE' });
    });

    it('GET /matches da mais recente para a mais antiga, com o filtro club_id', async () => {
      const all = await api.get('/matches');
      expect(all.body.map((match: any) => match.id)).toEqual([secondMatch.id, firstMatch.id]);
      expect(all.body[0].duels).toBeUndefined();
      expect((await api.get(`/matches?club_id=${home.id}`)).body).toHaveLength(2);
      const other = (await api.get('/clubs')).body.find((club: any) => club.name === 'Gama SC');
      expect((await api.get(`/matches?club_id=${other.id}`)).body).toEqual([]);
      await expectRejected(api.get('/matches?club_id=abc'), 400);
      await expectRejected(api.get('/matches?club_id=999999'), 404);
    });

    it('GET /matches/{id} com os 6 duelos', async () => {
      const match = await api.get(`/matches/${firstMatch.id}`);
      expect(match.body).toEqual(firstMatch);
      await expectRejected(api.get('/matches/999999'), 404);
    });

    it('GET /standings com todos os clubes e os desempates', async () => {
      const clubs = (await api.get('/clubs')).body;
      const standings = (await api.get('/standings')).body;
      expect(standings).toHaveLength(clubs.length);
      expect(standings.map((row: any) => row.position)).toEqual(
        clubs.map((_: any, index: number) => index + 1),
      );
      expect(standings[0]).toEqual({
        position: 1,
        club_id: away.id,
        club_name: 'Pantera SC',
        played: 2,
        wins: 2,
        draws: 0,
        losses: 0,
        goals_for: 4,
        goals_against: 2,
        goal_difference: 2,
        points: 6,
      });
      const idle = standings
        .filter((row: any) => row.played === 0)
        .map((row: any) => ({ id: row.club_id, name: row.club_name }));
      expect(idle).toEqual([...idle].sort(byName));
    });

    it('titular vendido ou DOENTE sai da escalação, e o clube não joga até escalar de novo', async () => {
      await sell(homeSquad.ata.id);
      await api.patch(`/players/${homeSquad.gol.id}/condition`, { condition: 'DOENTE' });
      const lineup = (await api.get(`/clubs/${home.id}/lineup`)).body;
      expect(lineup).toMatchObject({ formation: '2-1-1', complete: false });
      expect(lineup.players).toHaveLength(3);
      await expectRejected(api.post('/matches', { home_club_id: home.id, away_club_id: away.id }), 409);
    });
  });
});

describe('Limite da liga', () => {
  it('B09: aceita no máximo 20 clubes', async () => {
    let count = (await api.get('/clubs')).body.length;
    for (let letter = 'D'.charCodeAt(0); count < 20; letter++) {
      const l = String.fromCharCode(letter);
      await createClub(`Clube ${l}a ${l}e`, `C${l}${l}`);
      count++;
    }
    await expectRejected(api.post('/clubs', { name: 'Clube Extra Vinte', acronym: 'CEV' }), 409);
    expect((await api.get('/clubs')).body).toHaveLength(20);
  });
});
