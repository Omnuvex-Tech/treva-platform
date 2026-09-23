import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

const CODE_BY_STATUS: Record<number, string> = {
  400: 'validation_error',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  429: 'too_many_requests',
};

/**
 * Every error leaves as `{ statusCode, code, message, errors? }`.
 *
 * `message` is always a single string — treva-broker's http client shows it as
 * is — and `code` is a stable, machine-readable key the client can translate.
 * A service sets its own code by throwing `new XException({ message, code })`;
 * otherwise it falls back to one derived from the status.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string | undefined;
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as { message?: string | string[]; code?: string };

        if (Array.isArray(body.message)) {
          // ValidationPipe reports every failed constraint.
          errors = body.message;
          message = body.message[0] ?? message;
        } else if (body.message) {
          message = body.message;
        }

        code = body.code;
      }
    } else if (exception instanceof Error) {
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      code: code ?? CODE_BY_STATUS[status] ?? 'internal_error',
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
