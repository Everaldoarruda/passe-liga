import { describe, expect, it } from 'vitest';
import { checkInteger, checkRequired, checkText } from './validation';

describe('checkText', () => {
  it('exige o campo e o tamanho, depois de juntar os espaços', () => {
    expect(checkText('   ', 3, 100)).toBe('Campo obrigatório.');
    expect(checkText('  A  B ', 4, 100)).toBe('Use de 4 a 100 caracteres.');
    expect(checkText('Ana Lima', 3, 100)).toBeUndefined();
  });
});

describe('checkInteger', () => {
  it('aceita só inteiros dentro da faixa', () => {
    expect(checkInteger('', 1, 99)).toBe('Campo obrigatório.');
    expect(checkInteger('0', 1, 99)).toBe('Informe um número inteiro de 1 a 99.');
    expect(checkInteger('50.5', 1, 99)).toBe('Informe um número inteiro de 1 a 99.');
    expect(checkInteger('99', 1, 99)).toBeUndefined();
  });
});

describe('checkRequired', () => {
  it('recusa o valor vazio', () => {
    expect(checkRequired('')).toBe('Campo obrigatório.');
    expect(checkRequired('GOL')).toBeUndefined();
  });
});
