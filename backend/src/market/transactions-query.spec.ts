import { ValidationError } from '../common/validation-error';
import { parseTransactionsQuery } from './transactions-query';

describe('parseTransactionsQuery (RN17 e RN18)', () => {
  it('sem parâmetros, não filtra', () => {
    expect(parseTransactionsQuery({})).toEqual({ types: undefined, playerId: undefined });
  });

  it.each([
    ['COMPRA', ['COMPRA']],
    ['VENDA', ['VENDA']],
    ['COMPRA,VENDA', ['COMPRA', 'VENDA']],
  ])('aceita type=%s', (type, expected) => {
    expect(parseTransactionsQuery({ type }).types).toEqual(expected);
  });

  it('aceita player_id válido', () => {
    expect(parseTransactionsQuery({ player_id: '7' }).playerId).toBe(7);
  });

  it.each([[''], ['compra'], ['COMPRA,venda'], ['COMPRA,COMPRA'], ['COMPRA, VENDA'], ['COMPRA,']])(
    'recusa type=%s',
    (type) => {
      expect(() => parseTransactionsQuery({ type })).toThrow(ValidationError);
    },
  );

  it.each([[''], ['0'], ['01'], ['abc'], ['-1'], ['1.5'], ['2147483648']])(
    'recusa player_id=%s',
    (player_id) => {
      expect(() => parseTransactionsQuery({ player_id })).toThrow(ValidationError);
    },
  );

  it('recusa parâmetro repetido', () => {
    expect(() => parseTransactionsQuery({ type: ['COMPRA', 'VENDA'] })).toThrow(ValidationError);
  });
});
