import { divideRounded } from './money';

export const MS_PER_DAY = 86_400_000;

const FEE_THRESHOLD_CENTS = 3000; // taxa só acima de 30,00
const MAX_PENALTY_CENTS = 1000; // teto da multa: 10,00
const COMMISSION_BRACKET_CENTS = 1000; // 10% até 10,00 de lucro, 20% no que passar

export function purchaseFeeCents(valueCents: number): number {
  return valueCents > FEE_THRESHOLD_CENTS ? divideRounded(valueCents * 5, 100) : 0;
}

// O limite é exatamente a metade do caixa, sem arredondar (RN13)
export function isWithinCashLimit(totalCostCents: number, cashCents: number): boolean {
  return totalCostCents * 2 <= cashCents;
}

// Dias com fração, arredondados para cima; fim já passado vale 0 (RN15)
export function remainingDays(loyaltyUntil: Date, now: Date): number {
  const difference = loyaltyUntil.getTime() - now.getTime();
  return difference <= 0 ? 0 : Math.ceil(difference / MS_PER_DAY);
}

export function penaltyRate(days: number): number {
  if (days <= 0) return 0;
  if (days <= 30) return 5;
  if (days <= 180) return 10;
  return 20;
}

// Sem lucro, sem comissão; com lucro, arredondada uma única vez no final (RN16)
export function commissionCents(profitCents: number): number {
  if (profitCents <= 0) return 0;
  const firstBracket = Math.min(profitCents, COMMISSION_BRACKET_CENTS);
  const rest = profitCents - firstBracket;
  return divideRounded(firstBracket * 10 + rest * 20, 100);
}

export interface SaleSettlement {
  daysRemaining: number;
  penaltyRate: number;
  penaltyCents: number;
  profitCents: number;
  commissionCents: number;
  creditCents: number;
}

export function settleSale(valueCents: number, purchaseCents: number, daysRemaining: number): SaleSettlement {
  const rate = penaltyRate(daysRemaining);
  const penalty = Math.min(divideRounded(valueCents * rate, 100), MAX_PENALTY_CENTS);
  const profit = valueCents - purchaseCents;
  const commission = commissionCents(profit);
  return {
    daysRemaining,
    penaltyRate: rate,
    penaltyCents: penalty,
    profitCents: profit,
    commissionCents: commission,
    creditCents: valueCents - penalty - commission,
  };
}
