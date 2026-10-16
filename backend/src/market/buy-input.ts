import { asObject, readId, readText } from '../common/body';
import { fail } from '../common/fail';
import { parseBrasiliaDate } from '../domain/brasilia-date';
import { MS_PER_DAY } from '../domain/trade';

const MAX_LOYALTY_DAYS = 1095;

export interface BuyInput {
  clubId: number;
  loyaltyUntil: Date;
}

export function parseBuy(raw: unknown, now: Date): BuyInput {
  const body = asObject(raw);

  const clubId = readId(body, 'club_id');
  const text = readText(body, 'loyalty_until');
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
