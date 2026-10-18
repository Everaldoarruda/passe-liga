const money = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export const formatMoney = (value: number): string => money.format(value);

export const formatDateTime = (isoDate: string): string => dateTime.format(new Date(isoDate));

export const toApiDateTime = (localDateTime: string) => `${localDateTime}-03:00`;

export const initials = (name: string) => {
  const words = name.split(' ');
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
};
export const formatSignedMoney = (value: number) =>
  value > 0 ? `+${formatMoney(value)}` : formatMoney(value);

export const formatSigned = (value: number) => (value > 0 ? `+${value}` : String(value));
