import { AppError } from "./AppError.errors";

export class ExternalServiceError extends AppError {
  constructor(message: string, code: string = "EXTERNAL_SERVICE_ERROR") {
    super(message, 502, code);
  }
}
