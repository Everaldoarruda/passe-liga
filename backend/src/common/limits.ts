export const MAX_ID = 2147483647;

// Id vindo do corpo JSON: inteiro de 1 até MAX_ID
export const isId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_ID;

// Id vindo da URL ou da query string: só dígitos, sem zero à esquerda, até MAX_ID
export const isIdText = (raw: string): boolean => /^[1-9][0-9]*$/.test(raw) && Number(raw) <= MAX_ID;
