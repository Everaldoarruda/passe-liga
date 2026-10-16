import { ValidationError } from '../common/validation-error';
import { parseMatch } from './match-input';

describe('parseMatch (RN20)', () => {
  it('aceita dois clubes diferentes', () => {
    expect(parseMatch({ home_club_id: 1, away_club_id: 2 })).toEqual({
      homeClubId: 1,
      awayClubId: 2,
    });
  });

  it.each([
    ['sem mandante', { away_club_id: 2 }],
    ['sem visitante', { home_club_id: 1 }],
    ['mandante zero', { home_club_id: 0, away_club_id: 2 }],
    ['visitante negativo', { home_club_id: 1, away_club_id: -2 }],
    ['mandante como texto', { home_club_id: '1', away_club_id: 2 }],
    ['visitante fracionário', { home_club_id: 1, away_club_id: 2.5 }],
    ['id acima do máximo', { home_club_id: 2147483648, away_club_id: 2 }],
    ['clubes iguais', { home_club_id: 3, away_club_id: 3 }],
    ['corpo que não é objeto', []],
  ])('recusa: %s', (_label, body) => {
    expect(() => parseMatch(body)).toThrow(ValidationError);
  });
});