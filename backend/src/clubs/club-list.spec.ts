import { ValidationError } from '../common/validation-error';
import { parseClubSort, sortClubs } from './club-list';

const club = (id: number, name: string, net_worth: number) => ({ id, name, net_worth });

describe('sortClubs (RN11)', () => {
  const clubs = [club(1, 'Gama SC', 300), club(2, 'Épsilon EC', 300), club(3, 'Delta FC', 310)];

  it('ordena por nome sem acento', () => {
    expect(sortClubs(clubs, 'name').map((c) => c.name)).toEqual([
      'Delta FC', 'Épsilon EC', 'Gama SC',
    ]);
  });

  it('ordena por patrimônio decrescente e desempata pelo nome', () => {
    expect(sortClubs(clubs, 'net_worth_desc').map((c) => c.name)).toEqual([
      'Delta FC', 'Épsilon EC', 'Gama SC',
    ]);
  });

  it('ordena por patrimônio crescente e desempata pelo nome', () => {
    expect(sortClubs(clubs, 'net_worth_asc').map((c) => c.name)).toEqual([
      'Épsilon EC', 'Gama SC', 'Delta FC',
    ]);
  });
});

describe('parseClubSort', () => {
  it('usa name quando o parâmetro não vem', () => {
    expect(parseClubSort({})).toBe('name');
  });

  it.each([[''], ['NAME'], ['patrimonio']])('recusa sort=%s', (sort) => {
    expect(() => parseClubSort({ sort })).toThrow(ValidationError);
  });
});