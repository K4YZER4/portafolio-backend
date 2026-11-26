import { AppError } from "./AppError.errors";

export class UnauthorizedError extends AppError {
  constructor(message: string, code: string = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}
