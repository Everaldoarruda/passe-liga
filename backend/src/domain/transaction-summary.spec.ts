import { summarizeTransactions, TransactionRow } from './transaction-summary';

const purchase: TransactionRow = {
  createdAt: new Date('2026-11-02T13:15:00Z'), type: 'COMPRA', playerName: 'Meia Lua',
  valueCents: 3700, feeCents: 185, penaltyCents: 0, profitCents: null, cashChangeCents: -3885,
};
const sale: TransactionRow = {
  createdAt: new Date('2026-11-05T19:40:00Z'), type: 'VENDA', playerName: 'Meia Lua',
  valueCents: 4000, feeCents: 30, penaltyCents: 400, profitCents: 300, cashChangeCents: 3570,
};

describe('summarizeTransactions (RN17)', () => {
  it('soma compra e venda', () => {
    expect(summarizeTransactions([sale, purchase])).toEqual({
      totalSpent: 3885, totalReceived: 3570, totalFees: 215, totalPenalties: 400, totalProfit: 300,
    });
  });

  it('só vendas: total gasto zerado', () => {
    expect(summarizeTransactions([sale])).toEqual({
      totalSpent: 0, totalReceived: 3570, totalFees: 30, totalPenalties: 400, totalProfit: 300,
    });
  });

  it('sem transações: tudo zerado', () => {
    expect(summarizeTransactions([])).toEqual({
      totalSpent: 0, totalReceived: 0, totalFees: 0, totalPenalties: 0, totalProfit: 0,
    });
  });

  it('o lucro mantém o sinal', () => {
    const loss: TransactionRow = { ...sale, profitCents: -750, penaltyCents: 850, cashChangeCents: 3400, feeCents: 0 };
    expect(summarizeTransactions([sale, loss]).totalProfit).toBe(-450);
  });
});