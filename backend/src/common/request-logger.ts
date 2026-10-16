import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

// Registra no fim da resposta, para pegar também os erros do filtro global e as rotas inexistentes
export function logRequests(request: Request, response: Response, next: NextFunction): void {
  response.on('finish', () => {
    logger.log(`${request.method} ${request.originalUrl} ${response.statusCode}`);
  });
  next();
}
