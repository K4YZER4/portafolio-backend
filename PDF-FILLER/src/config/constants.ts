/**
 * Constantes globales del proyecto
 * Centraliza valores reutilizados en múltiples lugares
 */

// Períodos válidos para quincenas (plazo en quincenas)
export const VALID_PERIODS = [24, 36, 48, 72, 96, 120];

// Tipos MIME permitidos para imágenes
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

// Límite máximo de tamaño de archivo: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Validación de monto: debe ser divisible por este número
export const MONTO_DIVISOR = 1000;

// Mensajes de error reutilizables
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `Campo requerido: ${field}`,
  INVALID_NUMBER: (field: string) => `${field} debe ser un número`,
  INVALID_FILE_TYPE: (types: string[]) =>
    `Solo estos tipos son permitidos: ${types.join(", ")}`,
  INVALID_PERIODS: `Períodos válidos: ${VALID_PERIODS.join(", ")}`,
  MONTO_DIVISOR_ERROR: `Monto debe ser divisible por ${MONTO_DIVISOR}`,
  MONTO_POSITIVE: "Monto debe ser mayor a 0",
} as const;
