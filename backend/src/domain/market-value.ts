import { divideRounded, MIN_VALUE_CENTS } from './money';


export type PlayerCondition = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE'; 

const CONDITION_DISCOUNT: Record<PlayerCondition, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 150,
  DOENTE: 300,
};

const DISCOUNT_CAP = 400; //teto de -40%


export function conditionDiscount(condition: PlayerCondition, agility:number): number {
    if (condition === 'APTO')
        return 0;
    const discount = CONDITION_DISCOUNT[condition];
    if(agility >=80) return discount / 2; 
    if(agility <= 30) return discount +100;
    return discount;
}
export function ageAdjustment(age: number): number {
  if (age <= 21) return 100;
  if (age <= 31) return 0;
  return -100;
}
export function marketValueCents(
  baseValueCents: number,
  condition: PlayerCondition,
  agility: number,
  age: number,
): number {
  const total = Math.max(
    ageAdjustment(age) - conditionDiscount(condition, agility),
    -DISCOUNT_CAP,
  );
  const cents = divideRounded(baseValueCents * (1000 + total), 1000);
  return Math.max(cents, MIN_VALUE_CENTS);
}