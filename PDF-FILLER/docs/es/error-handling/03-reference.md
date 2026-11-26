<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Atrás-lightgray?style=flat" alt="Volver a Manejo de Errores"/>
  </a>
  &nbsp;
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/Inicio-lightgray?style=flat" alt="Inicio"/>
  </a>
</div>

# Manejo de Errores — Referencia

**Ruta:** Inicio › Docs › Manejo de Errores › Referencia

**Objetivo:** Referencia técnica completa para todos los tipos de error, códigos y patrones de uso.

**Audiencia:** Desarrolladores que necesitan buscar detalles de errores.

**← Anterior:** [Guías Prácticas](./02-how-to-guides.md) | **Siguiente →:** [Explicación](./04-explanation.md)

---

## Resumen de Clases de Error

| Clase | HTTP | Descripción | Cuándo Usar |
|-------|------|-------------|------------|
| `BadRequestError` | 400 | Entrada del usuario es inválida | Campo faltante/incorrecto, formato inválido, validación falló |
| `UnauthorizedError` | 401 | Usuario no está autenticado | Token faltante, token expirado, credenciales inválidas |
| `ForbiddenError` | 403 | Usuario carece de permiso | Usuario no puede acceder recurso, privilegios insuficientes |
| `NotFoundError` | 404 | Recurso no existe | Usuario/documento/registro no encontrado |
| `RateLimitError` | 429 | Demasiadas solicitudes | Rate limit excedido, cuota excedida |
| `InternalServerError` | 500 | Error inesperado del servidor | Bug, referencia nula, excepción no manejada |
| `ExternalServiceError` | 502 | API externa falló | Timeout de Gemini, error de base de datos, API caída |

---

## Firmas de Clases de Error

### BadRequestError

```typescript
new BadRequestError(message: string, code: string)
```

**Parámetros:**
- `message`: Mensaje de error legible para humanos (mostrado al usuario)
- `code`: Código de error legible por máquina (para manejo en cliente)

**Respuesta (HTTP 400):**
```json
{
  "error": "CURP debe tener 18 caracteres",
  "code": "INVALID_CURP",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Uso:**
```typescript
throw new BadRequestError("CURP debe tener 18 caracteres", "INVALID_CURP");
throw new BadRequestError("Monto debe ser positivo", "INVALID_AMOUNT");
throw new BadRequestError("Email es requerido", "MISSING_EMAIL");
```

---

### UnauthorizedError

```typescript
new UnauthorizedError(message: string, code: string)
```

**Parámetros:**
- `message`: Mensaje de error legible para humanos
- `code`: Código de error legible por máquina

**Respuesta (HTTP 401):**
```json
{
  "error": "Token es requerido",
  "code": "MISSING_TOKEN",
  "requestId": "req-def456",
  "statusCode": 401,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Uso:**
```typescript
throw new UnauthorizedError("Token es requerido", "MISSING_TOKEN");
throw new UnauthorizedError("Token expirado", "TOKEN_EXPIRED");
throw new UnauthorizedError("Credenciales inválidas", "INVALID_CREDENTIALS");
```

---

### NotFoundError

```typescript
new NotFoundError(message: string, code: string)
```

**Parámetros:**
- `message`: Mensaje de error legible para humanos
- `code`: Código de error legible por máquina

**Respuesta (HTTP 404):**
```json
{
  "error": "Contrato no encontrado",
  "code": "CONTRACT_NOT_FOUND",
  "requestId": "req-ghi789",
  "statusCode": 404,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Uso:**
```typescript
throw new NotFoundError("Contrato no encontrado", "CONTRACT_NOT_FOUND");
throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND");
throw new NotFoundError("Documento no encontrado", "DOCUMENT_NOT_FOUND");
```

---

### ExternalServiceError

```typescript
new ExternalServiceError(message: string, code: string)
```

**Parámetros:**
- `message`: Mensaje de error legible para humanos
- `code`: Código de error legible por máquina

**Respuesta (HTTP 502):**
```json
{
  "error": "No se pudo extraer datos de INE",
  "code": "INE_EXTRACTION_FAILED",
  "requestId": "req-jkl012",
  "statusCode": 502,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Uso:**
```typescript
throw new ExternalServiceError("Gemini API falló", "GEMINI_ERROR");
throw new ExternalServiceError("Fallo conexión base de datos", "DB_ERROR");
throw new ExternalServiceError("Gateway de pago no disponible", "PAYMENT_ERROR");
```

---

### InternalServerError

```typescript
new InternalServerError(message: string, code: string)
```

**Parámetros:**
- `message`: Mensaje de error legible para humanos
- `code`: Código de error legible por máquina

**Respuesta (HTTP 500):**
```json
{
  "error": "Error inesperado",
  "code": "UNEXPECTED",
  "requestId": "req-mno345",
  "statusCode": 500,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Uso:**
```typescript
throw new InternalServerError("Referencia nula inesperada", "NULL_REFERENCE");
throw new InternalServerError("Estado inválido", "INVALID_STATE");
throw new InternalServerError("Excepción no manejada", "UNEXPECTED");
```

---

### RateLimitError

```typescript
new RateLimitError(message: string, retryAfterSeconds: number)
```

**Parámetros:**
- `message`: Mensaje de error legible para humanos
- `retryAfterSeconds`: Segundos a esperar antes de reintentar

**Respuesta (HTTP 429):**
```json
{
  "error": "Demasiadas solicitudes",
  "code": "RATE_LIMIT_EXCEEDED",
  "requestId": "req-pqr678",
  "statusCode": 429,
  "retryAfter": 60,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Uso:**
```typescript
throw new RateLimitError("Demasiadas solicitudes", 60);
throw new RateLimitError("Cuota de API excedida", 3600);
throw new RateLimitError("Límite de solicitudes por usuario excedido", 300);
```

---

## Códigos de Error Estándar

### Errores de Validación (400)

| Código | Mensaje | Escenario |
|--------|---------|----------|
| `MISSING_CURP` | CURP es requerido | Campo CURP no proporcionado |
| `INVALID_CURP` | CURP debe tener 18 caracteres | Longitud de CURP incorrecta |
| `MISSING_EMAIL` | Email es requerido | Campo Email no proporcionado |
| `INVALID_EMAIL` | Formato de Email es inválido | Email no coincide con patrón |
| `MISSING_AMOUNT` | Monto es requerido | Campo Monto no proporcionado |
| `INVALID_AMOUNT` | Monto debe ser positivo | Monto es 0 o negativo |
| `INVALID_NOMINAS` | Nominas debe ser un array | Nominas no es un array |
| `EMPTY_NOMINAS` | Al menos una nómina requerida | Array de Nominas está vacío |
| `MISSING_FECHA_PAGO` | Fecha de pago es requerida | Campo de fecha faltante |
| `INVALID_DATE` | Formato de fecha es inválido | Fecha no coincide con formato |
| `MISSING_FILE` | Archivo es requerido | No hay archivo cargado |
| `FILE_TOO_LARGE` | Archivo es demasiado grande | Archivo excede límite de tamaño (5MB) |
| `INVALID_FILE_TYPE` | Tipo de archivo inválido | Tipo de archivo no permitido |
| `NO_IMAGE` | Imagen es requerida | No hay imagen cargada |
| `INVALID_DOCUMENT` | Documento no es válido o calidad es muy baja | INE no válida o calidad pobre |
| `INVALID_PDF` | PDF no es válido | Archivo PDF corrupto/inválido |

### Errores de Autenticación (401)

| Código | Mensaje | Escenario |
|--------|---------|----------|
| `MISSING_TOKEN` | Token es requerido | Header de Authorization faltante |
| `INVALID_TOKEN` | Token es inválido | Firma de Token inválida |
| `TOKEN_EXPIRED` | Token ha expirado | JWT expirado |
| `INVALID_CREDENTIALS` | Credenciales inválidas | Usuario/contraseña incorrectos |

### Errores No Encontrado (404)

| Código | Mensaje | Escenario |
|--------|---------|----------|
| `USER_NOT_FOUND` | Usuario no encontrado | ID de Usuario no existe |
| `CONTRACT_NOT_FOUND` | Contrato no encontrado | ID de Contrato no existe |
| `DOCUMENT_NOT_FOUND` | Documento no encontrado | ID de Documento no existe |
| `TEMPLATE_NOT_FOUND` | Plantilla no encontrada | ID de Plantilla no existe |

### Errores de Servicio Externo (502)

| Código | Mensaje | Escenario |
|--------|---------|----------|
| `GEMINI_ERROR` | Gemini API falló | Solicitud a Gemini falló |
| `INE_EXTRACTION_FAILED` | No se pudo extraer INE | Servicio de extracción caído |
| `DB_ERROR` | Error de base de datos | Conexión a BD falló |
| `PAYMENT_ERROR` | Gateway de pago no disponible | Servicio de pago caído |
| `API_TIMEOUT` | Timeout de solicitud a API | API externa demasiado lenta |

### Errores de Rate Limit (429)

| Código | Mensaje | Escenario |
|--------|---------|----------|
| `RATE_LIMIT_EXCEEDED` | Demasiadas solicitudes | Usuario excedió cuota |
| `API_LIMIT_EXCEEDED` | Cuota de API excedida | Cuota de servicio excedida |

### Errores de Servidor Interno (500)

| Código | Mensaje | Escenario |
|--------|---------|----------|
| `UNEXPECTED` | Error inesperado | Excepción no manejada |
| `NULL_REFERENCE` | Referencia nula inesperada | Puntero nulo |
| `INVALID_STATE` | Estado inválido | Error de lógica |

---

## Estructura de Respuesta de Error

Cada respuesta de error tiene esta estructura:

```json
{
  "error": "Mensaje legible para humanos",
  "code": "ERROR_CODE",
  "requestId": "req-abc123def456",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Campos:**
- `error`: Mensaje para usuarios finales (traducido si aplica)
- `code`: Código legible por máquina para manejo en cliente
- `requestId`: ID único para esta solicitud (para debugging)
- `statusCode`: Código de estado HTTP
- `timestamp`: Timestamp ISO 8601 cuando error ocurrió

---

## Códigos de Estado HTTP

| Código | Nombre | Caso de Uso | Clase de Error |
|--------|--------|------------|-------------|
| 400 | Bad Request | Entrada del cliente inválida | BadRequestError |
| 401 | Unauthorized | No autenticado | UnauthorizedError |
| 403 | Forbidden | Usuario carece de permiso | ForbiddenError |
| 404 | Not Found | Recurso no existe | NotFoundError |
| 429 | Too Many Requests | Rate limit excedido | RateLimitError |
| 500 | Internal Server Error | Error inesperado | InternalServerError |
| 502 | Bad Gateway | Servicio externo falló | ExternalServiceError |

---

## Códigos de Error de Multer

Los errores específicos de Multer se convierten a BadRequestError:

| Código Multer | Convertido A | Mensaje | Escenario |
|-------------|-------------|---------|----------|
| `LIMIT_FILE_SIZE` | BadRequestError | Archivo demasiado grande | Archivo excede límite de tamaño |
| `LIMIT_FILES` | BadRequestError | Demasiados archivos | Más archivos que lo permitido |
| `LIMIT_FIELD_SIZE` | BadRequestError | Valor de campo demasiado grande | Campo excede tamaño |
| `LIMIT_UNEXPECTED_FILE` | BadRequestError | Archivo inesperado | Nombre de campo de archivo incorrecto |

---

## Diagrama de Flujo de Error

```
Solicitud llega
    ↓
Controller (envuelto en asyncHandler)
    ↓
    ├─ Sin error → Enviar respuesta éxito
    │
    └─ Error lanzado
        ↓
    asyncHandler captura error
        ↓
        ├─ ¿Es AppError? → Pasar a través
        │
        └─ ¿Es Error nativo? → Envolver en InternalServerError
            ↓
        errorHandler global recibe error
            ↓
            ├─ Formatear como JSON
            ├─ Agregar requestId
            ├─ Agregar timestamp
            ├─ Registrar error
            │
        Enviar respuesta HTTP con código de estado
            ↓
        Respuesta al cliente
```

---

## Formato de Registro de Error

Cuando un error se registra:

```
[2026-05-11 18:30:00] ERROR
  requestId: req-abc123
  endpoint: POST /api/validate-curp
  method: POST
  path: /api/validate-curp
  statusCode: 400
  error: CURP debe tener 18 caracteres
  code: INVALID_CURP
  timestamp: 2026-05-11T18:30:00Z
```

---

## Formato de ID de Solicitud

Los IDs de solicitud se generan automáticamente:

```
req-{UUID}
```

**Ejemplo:** `req-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d`

**Uso:**
1. Devuelto en cada respuesta de error
2. Devuelto en cada respuesta de éxito
3. Registrado en todos los logs del servidor
4. Incluido en header X-Request-Id
5. Puede ser usado para rastrear solicitudes entre servicios

---

## Mejores Prácticas

### ✅ Haz Esto

```typescript
// Códigos de error específicos
throw new BadRequestError("CURP debe tener 18 caracteres", "INVALID_CURP");

// Mensajes descriptivos
throw new NotFoundError("Contrato ABC123 no encontrado", "CONTRACT_NOT_FOUND");

// Errores de API externa
throw new ExternalServiceError("Gemini API falló", "GEMINI_ERROR");

// Envuelve en asyncHandler
export const myController = asyncHandler(async (req, res) => {
  // código
});

// Usa tipos de error específicos
if (!user) throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND");
```

### ❌ No Hagas Esto

```typescript
// Mensajes genéricos
throw new Error("Error");

// Códigos genéricos
throw new BadRequestError("Inválido", "ERROR");

// Tragando errores
try {
  await api.call();
} catch (e) {
  // No hagas nada
}

// Exponiendo errores internos
throw new InternalServerError(error.stack, "ERROR");

// No enveloper en asyncHandler
export const myController = async (req, res) => {
  // Errores no manejados romperán la app
};
```

---

## Ejemplos de Importación

```typescript
// Importar error único
import { BadRequestError } from "../errors";

// Importar múltiples errores
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ExternalServiceError,
  InternalServerError,
  RateLimitError,
} from "../errors";

// Importar desde index
import {
  BadRequestError,
  asyncHandler,
} from "../errors";
```

---

## Resolución de Problemas

### Problema: Errores no están siendo capturados

**Solución:** Asegúrate de que el controller esté envuelto en `asyncHandler`:

```typescript
// ✅ Correcto
export const myController = asyncHandler(async (req, res) => {
  throw new BadRequestError("Error", "CODE");
});

// ❌ Incorrecto - error no será capturado
export const myController = async (req, res) => {
  throw new BadRequestError("Error", "CODE");
};
```

### Problema: Errores no aparecen en logs

**Solución:** El errorHandler global debe estar registrado como middleware:

```typescript
// En app.ts
app.use(globalErrorHandler);
```

### Problema: requestId es undefined

**Solución:** Asegúrate de que requestIdMiddleware se ejecute antes de otros middlewares:

```typescript
// En app.ts - esto DEBE venir PRIMERO
app.use(requestIdMiddleware);
app.use(authMiddleware);
// ... otros middlewares
```

### Problema: Errores de Multer no están siendo manejados

**Solución:** Agrega middleware multerErrorHandler después de multer:

```typescript
router.post(
  "/upload",
  upload.single("file"),
  multerErrorHandler, // ← Debe estar aquí
  validateImageFile,
  controller
);
```

---

## Tabla de Búsqueda Rápida

| Necesito... | Usar esto | HTTP | Ejemplo de Código |
|------------|----------|------|-------------------|
| Entrada inválida | BadRequestError | 400 | `throw new BadRequestError("CURP inválido", "INVALID_CURP")` |
| Token faltante | UnauthorizedError | 401 | `throw new UnauthorizedError("Token requerido", "MISSING_TOKEN")` |
| Recurso faltante | NotFoundError | 404 | `throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND")` |
| API lenta/falló | ExternalServiceError | 502 | `throw new ExternalServiceError("API falló", "API_ERROR")` |
| Bug inesperado | InternalServerError | 500 | `throw new InternalServerError("Bug", "UNEXPECTED")` |
| Demasiadas solicitudes | RateLimitError | 429 | `throw new RateLimitError("Límite excedido", 60)` |

