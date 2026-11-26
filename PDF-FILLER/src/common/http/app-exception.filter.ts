import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppError } from "../../errors";

const HTTP_ERROR_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.PAYLOAD_TOO_LARGE]: "PAYLOAD_TOO_LARGE",
  [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMIT_EXCEEDED",
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const requestId = request.header("x-request-id") ?? "unknown";
    const timestamp = new Date().toISOString();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json({
        error: exception.message,
        message: exception.message,
        code: exception.code,
        requestId,
        statusCode: exception.statusCode,
        timestamp,
      });
      return;
    }

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException
      ? exception.message
      : "Internal Server Error";

    this.logger.error(
      `${request.method} ${request.originalUrl} -> ${status}: ${message} [${requestId}]`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      error: message,
      message,
      code: HTTP_ERROR_CODES[status] ?? "INTERNAL_ERROR",
      requestId,
      statusCode: status,
      timestamp,
    });
  }
}
