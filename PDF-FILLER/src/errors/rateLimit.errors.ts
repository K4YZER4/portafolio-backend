import { AppError } from "./AppError.errors";
export class RateLimitError extends AppError {
  retryAfter: number;

  constructor(retryAfterSeconds: number) {
    super(
      `Límite de requests excedido. Reintentar en ${retryAfterSeconds}s`,
      429,
      "RATE_LIMIT_EXCEEDED",
    );

    this.retryAfter = retryAfterSeconds;
  }
}
