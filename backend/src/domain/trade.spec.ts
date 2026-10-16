import {
  commissionCents, isWithinCashLimit, MS_PER_DAY, penaltyRate, purchaseFeeCents,
  remainingDays, settleSale,
} from './trade';

describe('purchaseFeeCents (RN13)', () => {
  it.each([
    [2800, 0],
    [3000, 0], // 30,00 não é maior que 30,00
    [3001, 150], // 1,5005 arredonda para 1,50
    [3700, 185],
    [4762, 238],
    [4800, 240],
  ])('valor de mercado %i => taxa %i', (value, expected) => {
    expect(purchaseFeeCents(value)).toBe(expected);
  });
});

describe('isWithinCashLimit (RN13)', () => {
  it.each([
    [5000, 10000, true], // igual ao limite
    [5040, 10000, false],
    [13057, 26115, true],
    [13058, 26115, false], // limite de 130,575 sem arredondar
  ])('custo %i com caixa %i => %s', (cost, cash, expected) => {
    expect(isWithinCashLimit(cost, cash)).toBe(expected);
  });
});

describe('remainingDays (RN15)', () => {
  const now = new Date('2026-11-05T19:40:00Z');
  const after = (days: number, minutes = 0) =>
    new Date(now.getTime() + days * MS_PER_DAY + minutes * 60_000);

  it.each([
    ['já passou', after(-3), 0],
    ['no próprio momento', after(0), 0],
    ['10 dias e 2 horas', after(10, 120), 11],
    ['exatamente 30 dias', after(30), 30],
    ['30 dias e 1 minuto', after(30, 1), 31],
    ['exatamente 180 dias', after(180), 180],
    ['180 dias e 1 minuto', after(180, 1), 181],
    ['200 dias', after(200), 200],
  ])('%s => %i', (_label, until, expected) => {
    expect(remainingDays(until, now)).toBe(expected);
  });

  it('116 dias, 17 horas e 35 minutos => 117 (exemplo do enunciado)', () => {
    expect(remainingDays(new Date('2027-03-02T13:15:00Z'), now)).toBe(117);
  });
});

describe('penaltyRate (RN15)', () => {
  it.each([[0, 0], [1, 5], [30, 5], [31, 10], [180, 10], [181, 20], [200, 20]])(
    '%i dias => %i%%',
    (days, expected) => {
      expect(penaltyRate(days)).toBe(expected);
    },
  );
});

describe('commissionCents (RN16)', () => {
  it.each([
    [300, 30],
    [385, 39], // 0,385 arredonda para 0,39
    [1000, 100],
    [1001, 100], // 1,002 arredonda para 1,00
    [1500, 200],
    [-750, 0],
    [0, 0],
  ])('lucro %i => comissão %i', (profit, expected) => {
    expect(commissionCents(profit)).toBe(expected);
  });
});

describe('settleSale (RN15 e RN16)', () => {
  it.each([
    // valor, compra, dias, multa, lucro, comissão, crédito (centavos)
    [4000, 3700, 117, 400, 300, 30, 3570],
    [4250, 5000, 200, 850, -750, 0, 3400],
    [3000, 2615, 10, 150, 385, 39, 2811],
    [2500, 2500, 0, 0, 0, 0, 2500],
    [7500, 6000, 200, 1000, 1500, 200, 6300], // multa limitada a 10,00
  ])('valor %i, compra %i, %i dias', (value, purchase, days, penalty, profit, commission, credit) => {
    expect(settleSale(value, purchase, days)).toMatchObject({
      penaltyCents: penalty,
      profitCents: profit,
      commissionCents: commission,
      creditCents: credit,
    });
  });
});