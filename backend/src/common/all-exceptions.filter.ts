import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  status: number;
  message: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message } = this.describe(exception);
    response.status(status).json({ message });
  }

  private describe(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.messageOf(exception.getResponse(), exception.message),
      };
    }
    const status = (exception as { status?: unknown } | null)?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return { status, message: 'Requisição inválida.' };
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return { status: 500, message: 'Erro interno do servidor.' };
  }

  private messageOf(body: string | object, fallback: string): string {
    if (typeof body === 'string') return body;
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(' ');
    return typeof message === 'string' ? message : fallback;
  }
}