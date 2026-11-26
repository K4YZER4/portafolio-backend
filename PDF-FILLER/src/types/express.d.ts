import { Logger } from "pino";
import "multer";
declare global {
  namespace Express {
    interface Request {
      id: string; // Agregado por requestIdMiddleware (SIEMPRE existe)
      logger: Logger; // Agregado por loggerMiddleware (SIEMPRE existe)
    }
  }
}

export {};
