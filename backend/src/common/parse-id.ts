import { NotFoundException } from '@nestjs/common';
import { isIdText } from './limits';

export function parseId(raw: string): number {
  if (!isIdText(raw)) throw new NotFoundException('Recurso não encontrado.');
  return Number(raw);
}