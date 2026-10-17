const money = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export const formatMoney = (value: number): string => money.format(value);

export const formatDateTime = (isoDate: string): string => dateTime.format(new Date(isoDate));

export const toApiDateTime = (localDateTime: string) => `${localDateTime}-03:00`;
