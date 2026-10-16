import { ValidationError } from '../common/validation-error';
import { parseLineup } from './lineup-input';

describe('parseLineup (RN19)', () => {
  const ids = [34, 31, 30, 33, 32];

  it('aceita a formação e 5 ids em qualquer ordem', () => {
    expect(parseLineup({ formation: '2-1-1', player_ids: ids })).toEqual({
      formation: '2-1-1',
      playerIds: ids,
    });
  });

  it.each([
    ['sem formation', { player_ids: ids }],
    ['formation fora da lista', { formation: '4-4-2', player_ids: ids }],
    ['sem player_ids', { formation: '2-2' }],
    ['player_ids que não é lista', { formation: '2-2', player_ids: '1,2,3,4,5' }],
    ['4 ids', { formation: '2-2', player_ids: [1, 2, 3, 4] }],
    ['6 ids', { formation: '2-2', player_ids: [1, 2, 3, 4, 5, 6] }],
    ['ids repetidos', { formation: '2-2', player_ids: [1, 1, 2, 3, 4] }],
    ['id zero', { formation: '2-2', player_ids: [0, 1, 2, 3, 4] }],
    ['id negativo', { formation: '2-2', player_ids: [-1, 1, 2, 3, 4] }],
    ['id como texto', { formation: '2-2', player_ids: ['1', 2, 3, 4, 5] }],
    ['id fracionário', { formation: '2-2', player_ids: [1.5, 2, 3, 4, 5] }],
    ['id acima do máximo', { formation: '2-2', player_ids: [2147483648, 2, 3, 4, 5] }],
    ['corpo que não é objeto', []],
  ])('recusa: %s', (_label, body) => {
    expect(() => parseLineup(body)).toThrow(ValidationError);
  });
});
