import { asObject } from '../common/body';
import { fail } from '../common/fail';
import { parseBrasiliaDate } from '../domain/brasilia-date';
import { MS_PER_DAY } from '../domain/trade';

const MAX_ID = 2147483647;
const MAX_LOYALTY_DAYS = 1095;

export interface BuyInput {
  clubId: number;
  loyaltyUntil: Date;
}

export function parseBuy(raw: unknown, now: Date): BuyInput {
  const body = asObject(raw);

  const clubId = body.club_id;
  if (clubId === undefined || clubId === null) return fail('O campo club_id é obrigatório.');
  if (typeof clubId !== 'number' || !Number.isInteger(clubId) || clubId < 1 || clubId > MAX_ID) {
    return fail('O campo club_id deve ser um inteiro positivo.');
  }

  const text = body.loyalty_until;
  if (text === undefined || text === null) return fail('O campo loyalty_until é obrigatório.');
  if (typeof text !== 'string') return fail('O campo loyalty_until deve ser um texto.');
  const loyaltyUntil = parseBrasiliaDate(text);
  if (!loyaltyUntil) {
    return fail('O campo loyalty_until deve ser uma data válida no formato AAAA-MM-DDTHH:MM-03:00.');
  }

  const difference = loyaltyUntil.getTime() - now.getTime();
  if (difference <= 0) return fail('O fim da fidelidade deve ser depois do momento da compra.');
  if (difference > MAX_LOYALTY_DAYS * MS_PER_DAY) {
    return fail('O fim da fidelidade pode ser, no máximo, 1.095 dias depois da compra.');
  }
  return { clubId, loyaltyUntil };
}