import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export async function lockClub(tx: Prisma.TransactionClient, clubId: number): Promise<void> {
  const rows = await tx.$queryRaw<{ id: number }[]>`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
  if (rows.length === 0) throw new NotFoundException('Clube não encontrado.');
}