import { TransactionRow } from './transaction-summary';
import { buildTransactionsCsv } from './transactions-csv';

const HEADER = 'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

const base: TransactionRow = {
  createdAt: new Date('2026-11-05T19:40:00Z'),
  type: 'VENDA',
  playerName: 'Meia Lua',
  valueCents: 4000,
  feeCents: 30,
  penaltyCents: 400,
  profitCents: 300,
  cashChangeCents: 3570,
};

describe('buildTransactionsCsv (RN18)', () => {
  it('sem transações, devolve só o cabeçalho com LF', () => {
    expect(buildTransactionsCsv([])).toBe(`${HEADER}\n`);
  });

  it('reproduz o exemplo do enunciado', () => {
    const purchase: TransactionRow = {
      createdAt: new Date('2026-11-02T13:15:00Z'),
      type: 'COMPRA',
      playerName: 'Meia Lua',
      valueCents: 3700,
      feeCents: 185,
      penaltyCents: 0,
      profitCents: null,
      cashChangeCents: -3885,
    };
    expect(buildTransactionsCsv([base, purchase])).toBe(
      `${HEADER}\n` +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('põe entre aspas o nome com aspas, duplicando as internas', () => {
    const csv = buildTransactionsCsv([{ ...base, playerName: 'Zé "Foguete" Lima' }]);
    expect(csv).toContain(';"Zé ""Foguete"" Lima";');
  });

  it('põe entre aspas o nome com ponto e vírgula', () => {
    const csv = buildTransactionsCsv([{ ...base, playerName: 'Ana; Lima' }]);
    expect(csv).toContain(';"Ana; Lima";');
  });

  it('formata valores pequenos e negativos', () => {
    const csv = buildTransactionsCsv([{ ...base, cashChangeCents: -5 }]);
    expect(csv.trimEnd().endsWith(';-0,05')).toBe(true);
  });
});
