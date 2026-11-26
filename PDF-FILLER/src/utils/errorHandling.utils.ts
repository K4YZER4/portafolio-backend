import { AppError, ExternalServiceError } from "../errors/";
/**
 * Wrapper que:
 * 1. Ejecuta la función
 * 2. Si falla → lanza ExternalServiceError automáticamente
 * 3. Sin necesidad de try-catch manual
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorCode: string,
  errorMessage: string = "External service failed"
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new ExternalServiceError(errorMessage, errorCode);
  }
}
