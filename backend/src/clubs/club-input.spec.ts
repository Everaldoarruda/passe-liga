import { ValidationError } from '../common/validation-error';
import { parseCreateClub } from './club-input';

describe('parseCreateClub (RN10)', () => {
  it.each([
    ['Águias FC', 'AGU'],
    ['Delta FC', 'DFC'],
    ['Gama SC', 'GSC'],
    ['Épsilon EC', 'EPS'],
    ['Mangue FC', 'MFC'],
    ['Tubarões EC', 'TUB'],
  ])('aceita %s com a sigla %s', (name, acronym) => {
    expect(parseCreateClub({ name, acronym })).toEqual({ name, acronym });
  });

  it.each([
    ['Aguias FC', 'XGU'], // primeira letra diferente da do nome
    ['Aguias FC', 'AUG'], // letras fora de ordem
    ['Aguias FC', 'agu'], // minúsculas
    ['Aguias FC', 'AG'], // menos de 3 letras
    ['Aguias FC', 'AGUI'], // mais de 3 letras
    ['Aaa Aaa', 'AAA'], // três letras iguais
  ])('recusa o nome %s com a sigla %s', (name, acronym) => {
    expect(() => parseCreateClub({ name, acronym })).toThrow(ValidationError);
  });

  it.each([
    ['Aguias'], // uma palavra só
    ['Ab'], // curto demais
    ['Aguias FC 2'], // dígito
    ['Um Dois Tres Quatro Cinco Seis'], // seis palavras
    ['Aguias_FC'], // caractere não permitido
  ])('recusa o nome inválido %s', (name) => {
    expect(() => parseCreateClub({ name, acronym: 'AGU' })).toThrow(ValidationError);
  });

  it('normaliza os espaços do nome', () => {
    expect(parseCreateClub({ name: '  Aguias   FC ', acronym: 'AGU' }).name).toBe('Aguias FC');
  });

  it('ignora campos que o sistema controla', () => {
    const result = parseCreateClub({ name: 'Aguias FC', acronym: 'AGU', cash: 9999, id: 7 });
    expect(result).toEqual({ name: 'Aguias FC', acronym: 'AGU' });
  });
});
