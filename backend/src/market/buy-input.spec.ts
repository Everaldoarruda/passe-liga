import { ValidationError } from '../common/validation-error';
import { parseBuy } from './buy-input';

describe('parseBuy (RN12)', () => {
  const now = new Date('2026-11-02T13:15:00Z'); // 10:15 em Brasília
  const valid = { club_id: 1, loyalty_until: '2027-03-02T10:15-03:00' };

  it('aceita um pedido válido', () => {
    const result = parseBuy(valid, now);
    expect(result.clubId).toBe(1);
    expect(result.loyaltyUntil.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('aceita exatamente 1.095 dias depois', () => {
    expect(() => parseBuy({ ...valid, loyalty_until: '2029-11-01T10:15-03:00' }, now)).not.toThrow();
  });

  it.each([
    ['sem club_id', { loyalty_until: valid.loyalty_until }],
    ['club_id zero', { ...valid, club_id: 0 }],
    ['club_id como texto', { ...valid, club_id: '1' }],
    ['club_id fracionário', { ...valid, club_id: 1.5 }],
    ['sem loyalty_until', { club_id: 1 }],
    ['fidelidade no passado', { ...valid, loyalty_until: '2026-11-02T10:14-03:00' }],
    ['fidelidade no próprio momento', { ...valid, loyalty_until: '2026-11-02T10:15-03:00' }],
    ['fidelidade além de 1.095 dias', { ...valid, loyalty_until: '2029-11-01T10:16-03:00' }],
    ['data sem horário e fuso', { ...valid, loyalty_until: '2027-03-02' }],
    ['corpo que não é objeto', []],
  ])('recusa: %s', (_label, body) => {
    expect(() => parseBuy(body, now)).toThrow(ValidationError);
  });
});