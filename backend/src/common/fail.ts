import { BadRequestException } from '@nestjs/common';

export function fail(message: string): never {
  throw new BadRequestException(message);
}