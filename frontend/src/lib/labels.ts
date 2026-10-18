import type { Condition, Position } from '../api/types';

export const POSITION_NAMES: Record<Position, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  MEI: 'Meio-campo',
  ATA: 'Atacante',
};

export const CONDITION_NAMES: Record<Condition, string> = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
};
export const TRANSACTION_TYPE_NAMES = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
} as const;

export const ATTRIBUTE_NAMES = {
  pace: 'Velocidade',
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
  physical: 'Físico',
} as const;

export const RESULT_NAMES = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
} as const;
