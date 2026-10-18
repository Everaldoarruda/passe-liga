const REQUIRED = 'Campo obrigatório.';

// Conta como a API: espaços repetidos viram um só, e cada caractere Unicode conta 1
export function checkText(value: string, min: number, max: number): string | undefined {
  const length = Array.from(value.trim().replace(/ +/g, ' ')).length;
  if (length === 0) return REQUIRED;
  if (length < min || length > max) return `Use de ${min} a ${max} caracteres.`;
  return undefined;
}

export function checkInteger(value: string, min: number, max: number): string | undefined {
  if (value.trim() === '') return REQUIRED;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    return `Informe um número inteiro de ${min} a ${max}.`;
  }
  return undefined;
}

export function checkRequired(value: string): string | undefined {
  return value === '' ? REQUIRED : undefined;
}
