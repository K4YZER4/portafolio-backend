<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Atrás-lightgray?style=flat" alt="Volver a Manejo de Errores"/>
  </a>
  &nbsp;
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/Inicio-lightgray?style=flat" alt="Inicio"/>
  </a>
</div>

# Manejo de Errores — Tutorial

**Ruta:** Inicio › Docs › Manejo de Errores › Tutorial

**Objetivo:** Entender cómo fluyen los errores a través de la aplicación y cómo manejarlos correctamente.

**Audiencia:** Desarrolladores nuevos en el sistema de manejo de errores.

**Tiempo estimado:** 25 minutos

**Siguiente:** [Guías Prácticas](./02-how-to-guides.md) →

---

## Qué Aprenderás

Al final de este tutorial entenderás:
- Cómo fluyen los errores desde controllers al manejador de errores global
- Por qué tenemos diferentes clases de error para diferentes situaciones
- Cómo lanzar errores que el sistema entiende
- Cómo los errores se registran automáticamente
- Cómo los IDs de solicitud rastrean errores para debugging

---

## El Flujo de Errores (Vista General)

```
┌─────────────────────────────────────┐
│ Usuario realiza una solicitud       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Solicitud llega al controller       │
│ (envuelto en asyncHandler)          │
└──────────────┬──────────────────────┘
               ↓
        ┌──────┴──────┐
        ↓             ↓
    ÉXITO         ERROR OCURRE
        │             │
        │      ┌──────┴─────────────────┐
        │      ↓                        ↓
        │   Lanzar Error          Capturar & Convertir
        │      │                        │
        │      └────────┬───────────────┘
        │               ↓
        └──────→ errorHandler Global
                       ↓
        ┌──────────────────────────────┐
        │ Convierte a respuesta JSON   │
        │ Registra con requestId       │
        │ Envía código de estado HTTP  │
        └──────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │ Respuesta enviada al cliente │
        └──────────────────────────────┘
```

---

## Paso 1: Entender Clases de Error

Tu aplicación tiene 6 tipos de error. Cada uno representa un estado HTTP diferente:

### 1. **BadRequestError (400)**
La entrada del usuario es inválida.

**Cuándo usar:**
- Falta campo requerido
- Formato de datos es incorrecto
- Tipo de archivo no permitido
- Cantidad es negativa

**Ejemplo:**
```typescript
if (!req.body.curp) {
  throw new BadRequestError("CURP es requerido", "MISSING_CURP");
}
```

### 2. **UnauthorizedError (401)**
El usuario no está autenticado.

**Cuándo usar:**
- Token JWT falta
- Token expirado
- Credenciales incorrectas

**Ejemplo:**
```typescript
if (!req.headers.authorization) {
  throw new UnauthorizedError("Token requerido", "MISSING_TOKEN");
}
```

### 3. **NotFoundError (404)**
El recurso no existe.

**Cuándo usar:**
- ID de usuario no existe
- Documento no encontrado
- Registro fue eliminado

**Ejemplo:**
```typescript
const user = await db.users.findById(id);
if (!user) {
  throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND");
}
```

### 4. **ExternalServiceError (502)**
Una API externa falló.

**Cuándo usar:**
- Timeout de Gemini API
- Fallo de conexión a base de datos
- Payment gateway está caído

**Ejemplo:**
```typescript
try {
  const result = await genAI.models.generateContent(...);
} catch (error) {
  throw new ExternalServiceError("Gemini API falló", "GEMINI_ERROR");
}
```

### 5. **InternalServerError (500)**
Error inesperado (un bug).

**Cuándo usar:**
- Referencia nula inesperada
- Excepción no manejada
- Error de lógica

**Ejemplo:**
```typescript
// Esto no debería suceder, pero si ocurre:
if (!data) {
  throw new InternalServerError("Estado inesperado", "INVALID_STATE");
}
```

### 6. **RateLimitError (429)**
Demasiadas solicitudes.

**Cuándo usar:**
- Usuario excedió límite de rate
- Bucket está lleno

**Ejemplo:**
```typescript
if (bucket.count > MAX_REQUESTS) {
  throw new RateLimitError("Demasiadas solicitudes", 60); // reintentar después de 60 segundos
}
```

---

## Paso 2: Importar y Usar Clases de Error

Todas las clases de error están en `src/errors/`:

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ExternalServiceError,
  InternalServerError,
  RateLimitError,
} from "../errors";
```

---

## Paso 3: Lanzar Errores en Controllers

**Ejemplo de controller:**

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError } from "../errors";

export const validateCURP = asyncHandler(async (req, res) => {
  // Validar entrada
  const { curp } = req.body;
  
  if (!curp) {
    throw new BadRequestError("CURP es requerido", "MISSING_CURP");
  }
  
  if (curp.length !== 18) {
    throw new BadRequestError("CURP debe tener 18 caracteres", "INVALID_CURP");
  }
  
  // Si la validación pasa, enviar respuesta
  res.json({ valid: true });
});
```

**Puntos clave:**
- ✅ Envuelve controller en `asyncHandler`
- ✅ Solo `throw` errores (no necesitas try/catch)
- ✅ asyncHandler los captura automáticamente

---

## Paso 4: Entender el Wrapper asyncHandler

El wrapper `asyncHandler` hace tres cosas:

1. **Captura errores lanzados** — Cualquier error que lances es capturado
2. **Verifica si es AppError** — Si es nuestro error personalizado, lo pasa
3. **Convierte errores desconocidos** — Si es un Error nativo, lo envuelve como InternalServerError

**Ejemplo:**

```typescript
// Este error...
throw new BadRequestError("Entrada inválida", "INVALID_INPUT");

// ...es capturado por asyncHandler y pasado a errorHandler global
// Global errorHandler envía esto al cliente:
{
  "error": "Entrada inválida",
  "code": "INVALID_INPUT",
  "requestId": "req-a1b2c3d4",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Paso 5: Entender el Error Handler Global

El error handler global (`src/middlewares/errorHandler.middlewares.ts`) es middleware Express que:

1. **Recibe el error** de asyncHandler
2. **Lo formatea** como JSON con statusCode, message, code, requestId
3. **Lo registra** con timestamp e info del endpoint
4. **Envía respuesta HTTP** con código de estado correcto

**Se ejecuta automáticamente** — no necesitas hacer nada especial.

---

## Paso 6: Entender el Rastreo de ID de Solicitud

Cada solicitud obtiene un ID único para rastreo:

```
Solicitud llega → requestIdMiddleware genera ID
   ↓
ID se agrega a req.id
   ↓
ID se agrega al header X-Request-Id
   ↓
Error ocurre, ID se registra con error
   ↓
Puedes encontrar error en logs buscando ese ID
```

**Ejemplo:**
```
Request ID: req-a1b2c3d4

En logs ves:
[2026-05-11 18:30:00] ERROR: requestId: "req-a1b2c3d4" ...
```

**Caso de uso:** Un usuario dice "recibí un error hace 30 minutos" — buscas en logs su request ID y encuentras exactamente qué pasó.

---

## Paso 7: Ver Errores en Acción

### Ejemplo 1: Solicitud Válida

```
POST /api/validate-curp
Body: { "curp": "ABCD123456EFGHIJ12" }

Response (200):
{
  "data": { "valid": true },
  "requestId": "req-abc123"
}
```

### Ejemplo 2: Solicitud Inválida (BadRequestError)

```
POST /api/validate-curp
Body: { "curp": "ABC" }

Response (400):
{
  "error": "CURP debe tener 18 caracteres",
  "code": "INVALID_CURP",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

### Ejemplo 3: API Externa Falla (ExternalServiceError)

```
POST /api/ine
[Carga de archivo]

[Gemini API timeout]

Response (502):
{
  "error": "Gemini API falló",
  "code": "GEMINI_ERROR",
  "requestId": "req-def456",
  "statusCode": 502,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Paso 8: Dónde se Capturan los Errores

Los errores pueden originarse de diferentes lugares:

### **1. Middleware de Validación**
```typescript
// validateImageFile.middlewares.ts
if (!req.file) {
  throw new BadRequestError("Imagen requerida", "NO_IMAGE");
}
```

### **2. Errores de Multer**
```typescript
// multerErrorHandler.middlewares.ts captura errores de Multer
// y los convierte a BadRequestError
```

### **3. Controllers**
```typescript
// Tu código de controller
if (!data) {
  throw new BadRequestError("Datos inválidos", "INVALID_DATA");
}
```

### **4. Services**
```typescript
// Validación de capa de servicio
if (curp.length !== 18) {
  throw new BadRequestError("CURP inválido", "INVALID_CURP");
}
```

**Todos los caminos llevan a:** Global errorHandler → Registra y envía respuesta

---

## Paso 9: Escenarios de Error Comunes

### Escenario 1: Campo Requerido Faltante

```typescript
// Controller
export const processPayment = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;
  
  if (!amount) {
    throw new BadRequestError("Cantidad requerida", "MISSING_AMOUNT");
  }
  
  if (!currency) {
    throw new BadRequestError("Moneda requerida", "MISSING_CURRENCY");
  }
  
  // Procesar pago...
});
```

### Escenario 2: Recurso No Encontrado

```typescript
// Controller
export const getContract = asyncHandler(async (req, res) => {
  const contract = await db.contracts.findById(req.params.id);
  
  if (!contract) {
    throw new NotFoundError(
      `Contrato ${req.params.id} no encontrado`,
      "CONTRACT_NOT_FOUND"
    );
  }
  
  res.json({ data: contract });
});
```

### Escenario 3: API Externa Falla

```typescript
// Service
export const extractINEData = asyncHandler(async (buffer) => {
  try {
    const response = await genAI.models.generateContent({...});
    return parseResponse(response);
  } catch (error) {
    throw new ExternalServiceError(
      "No se pudo extraer INE",
      "INE_EXTRACTION_FAILED"
    );
  }
});
```

---

## Resumen

Ahora sabes:
- ✅ Cómo fluyen los errores desde controllers al cliente
- ✅ Cuál clase de error usar en cada situación
- ✅ Cómo lanzar errores en controllers
- ✅ Cómo asyncHandler los captura
- ✅ Cómo el errorHandler global formatea respuestas
- ✅ Cómo los IDs de solicitud rastrean errores

**Punto clave:** Lanza el tipo de error correcto, asyncHandler lo captura, global errorHandler lo formatea. Listo.

---

## Próximos Pasos

- Lee las [Guías Prácticas](./02-how-to-guides.md) para resolver problemas específicos
- Consulta la [Referencia](./03-reference.md) para todos los tipos de error y códigos
- Lee la [Explicación](./04-explanation.md) para entender la filosofía

---

## Referencia Rápida

| Clase de Error | HTTP | Cuándo | Ejemplo |
|-------------|------|--------|---------|
| `BadRequestError` | 400 | Entrada inválida | `throw new BadRequestError("CURP inválido", "INVALID_CURP")` |
| `UnauthorizedError` | 401 | Sin autenticación | `throw new UnauthorizedError("Token requerido", "MISSING_TOKEN")` |
| `NotFoundError` | 404 | Recurso faltante | `throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND")` |
| `ExternalServiceError` | 502 | API falló | `throw new ExternalServiceError("API falló", "API_ERROR")` |
| `InternalServerError` | 500 | Bug/inesperado | `throw new InternalServerError("Inesperado", "UNEXPECTED")` |
| `RateLimitError` | 429 | Demasiadas solicitudes | `throw new RateLimitError("Rate limit", 60)` |

