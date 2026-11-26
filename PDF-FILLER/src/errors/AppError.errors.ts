export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();
  }
}
