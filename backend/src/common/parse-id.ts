import { NotFoundException } from '@nestjs/common';
import { MAX_ID } from './limits';

export function parseId(raw: string): number {
  const valid = /^[1-9][0-9]*$/.test(raw) && Number(raw) <= MAX_ID;
  if (!valid) throw new NotFoundException('Recurso não encontrado.');
  return Number(raw);
}