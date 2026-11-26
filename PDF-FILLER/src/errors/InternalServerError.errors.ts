import { AppError } from "./AppError.errors";

export class InternalServerError extends AppError {
  constructor(message: string, code: string = "INTERNAL_SERVER_ERROR") {
    super(message, 500, code);
  }
}
