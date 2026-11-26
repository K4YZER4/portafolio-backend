<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Atrás-lightgray?style=flat" alt="Volver a Manejo de Errores"/>
  </a>
  &nbsp;
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/Inicio-lightgray?style=flat" alt="Inicio"/>
  </a>
</div>

# Manejo de Errores — Guías Prácticas

**Ruta:** Inicio › Docs › Manejo de Errores › Guías Prácticas

**Objetivo:** Resolver problemas específicos de manejo de errores con recetas prácticas.

**Audiencia:** Desarrolladores implementando características específicas.

**← Anterior:** [Tutorial](./01-tutorial.md) | **Siguiente →:** [Referencia](./03-reference.md)

---

## Cómo Lanzar un Error Básico en un Controller

**Problema:** Necesitas validar entrada del usuario y rechazar la solicitud si es inválida.

**Solución:**

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError } from "../errors";

export const validateCURP = asyncHandler(async (req, res) => {
  const { curp } = req.body;
  
  // Validar
  if (!curp) {
    throw new BadRequestError("CURP es requerido", "MISSING_CURP");
  }
  
  if (curp.length !== 18) {
    throw new BadRequestError("CURP debe tener 18 caracteres", "INVALID_CURP");
  }
  
  // Éxito
  res.json({ valid: true });
});
```

**Puntos clave:**
- Siempre envuelve controller en `asyncHandler`
- Lanza el error directamente (no necesitas try/catch)
- Usa códigos de error específicos (ej. "INVALID_CURP" no solo "ERROR")

---

## Cómo Manejar Errores de Carga de Archivos

**Problema:** Usuarios cargan archivos demasiado grandes, formato incorrecto, o inválidos.

**Solución:**

Los errores de Multer se manejan automáticamente. El middleware `multerErrorHandler` los captura y convierte a BadRequestError.

```typescript
// En tu archivo de rutas:
import multer from "multer";
import { multerErrorHandler } from "../middlewares/errorHandling/multerErrorHandler.middlewares";

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten imágenes"));
    } else {
      cb(null, true);
    }
  },
});

router.post(
  "/upload",
  upload.single("file"),
  multerErrorHandler, // ← Captura errores de multer
  validateImageFile,  // ← Tu middleware de validación
  (req, res) => {
    res.json({ success: true });
  }
);
```

**Cómo funciona:**
1. Error de Multer ocurre (ej. archivo demasiado grande)
2. `multerErrorHandler` lo captura
3. Convierte a `BadRequestError` con mensaje apropiado
4. Respuesta de error enviada al cliente

**Errores comunes de Multer manejados:**
- `LIMIT_FILE_SIZE` → "Archivo demasiado grande"
- `LIMIT_FILES` → "Demasiados archivos"
- `LIMIT_FILE_COUNT` → "Límite de archivos excedido"
- Errores personalizados de fileFilter → "Solo se permiten imágenes"

---

## Cómo Validar Datos de Solicitud

**Problema:** Tienes lógica de validación compleja. ¿Dónde debería ir?

**Solución:**

Crea middleware de validación en `src/middlewares/validation/`:

```typescript
// src/middlewares/validation/validateNominas.middlewares.ts

import { BadRequestError } from "../../errors";

export const validateNominas = (req, res, next) => {
  const { nominas } = req.body;
  
  if (!Array.isArray(nominas)) {
    throw new BadRequestError("Nominas debe ser un array", "INVALID_NOMINAS");
  }
  
  if (nominas.length === 0) {
    throw new BadRequestError("Al menos una nómina requerida", "EMPTY_NOMINAS");
  }
  
  // Validar cada nómina
  for (let i = 0; i < nominas.length; i++) {
    const nomina = nominas[i];
    
    if (!nomina.fechaPago) {
      throw new BadRequestError(
        `Nómina ${i} sin fechaPago`,
        "MISSING_FECHA_PAGO"
      );
    }
    
    if (nomina.monto <= 0) {
      throw new BadRequestError(
        `Nómina ${i} monto debe ser positivo`,
        "INVALID_MONTO"
      );
    }
  }
  
  next();
};
```

**Uso en ruta:**

```typescript
router.post(
  "/fill",
  validateNominas, // ← Ejecutar validación
  fillContractController
);
```

**Consejos:**
- Pon lógica de validación en middleware
- Lanza `BadRequestError` para entrada inválida
- Usa códigos de error descriptivos
- Incluye nombre de campo en mensaje de error

---

## Cómo Manejar Fallos de API Externas

**Problema:** Una API externa (Gemini, base de datos, etc.) falla. ¿Cómo la manejas?

**Solución:**

```typescript
import { ExternalServiceError } from "../errors";

export const extractINEData = async (imageBuffer) => {
  try {
    const result = await genAI.models.generateContent({
      contents: [
        {
          parts: [
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/png" } },
            { text: "Extrae datos de INE de esta imagen..." },
          ],
        },
      ],
    });
    
    return parseINEResponse(result);
  } catch (error) {
    // API externa falló
    throw new ExternalServiceError(
      "No se pudo extraer datos de INE",
      "INE_EXTRACTION_FAILED"
    );
  }
};
```

**En controller:**

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const data = await extractINEData(imageBuffer);
    res.json({ data });
  } catch (error) {
    // Error capturado por asyncHandler y pasado a errorHandler global
    throw error;
  }
});
```

**Puntos clave:**
- Envuelve llamadas a API externa en try/catch
- Lanza `ExternalServiceError` si API falla
- No expongas errores internos de API al cliente
- Usa códigos de error específicos ("INE_EXTRACTION_FAILED")

---

## Cómo Validar Calidad de Documento (Ejemplo INE)

**Problema:** Gemini devuelve "INVALID_DOCUMENT" cuando la imagen no es una INE válida o calidad es pobre.

**Solución:**

```typescript
import { BadRequestError } from "../errors";
import { genAI } from "./gemini";

export const validateINEQuality = async (imageBuffer) => {
  try {
    const response = await genAI.models.generateContent({
      contents: [
        {
          parts: [
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/png" } },
            {
              text: `Valida esta imagen de INE Mexicana (tarjeta de ID):
1. ¿Es una INE Mexicana? (Si no, responde: INVALID_DOCUMENT)
2. ¿La calidad de imagen es suficiente? (Si no, responde: INVALID_DOCUMENT)
3. ¿Todos los campos de datos críticos son legibles? (Si no, responde: INVALID_DOCUMENT)
Si todos los checks pasan, responde: VALID`,
            },
          ],
        },
      ],
    });
    
    const result = response.response.text();
    
    // Verifica si Gemini dice que documento es inválido
    if (result.includes("INVALID_DOCUMENT")) {
      throw new BadRequestError(
        "Documento no es una INE Mexicana válida o calidad es muy baja",
        "INVALID_DOCUMENT"
      );
    }
    
    return true;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error; // Re-lanza errores de validación
    }
    
    throw new ExternalServiceError(
      "No se pudo validar INE",
      "INE_VALIDATION_FAILED"
    );
  }
};
```

**Uso en controller:**

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  const imageBuffer = req.file.buffer;
  
  // Primero valida calidad
  await validateINEQuality(imageBuffer);
  
  // Luego extrae datos
  const data = await extractINEData(imageBuffer);
  
  res.json({ data });
});
```

**Por qué este patrón:**
- Valida ANTES de extracción (ahorra llamadas a API)
- Rechaza calidad pobre temprano (mejor UX)
- Usa código "INVALID_DOCUMENT" consistentemente

---

## Cómo Crear una Clase de Error Personalizada

**Problema:** Necesitas un tipo de error que no existe en el sistema.

**Solución:**

Crea nuevo archivo en `src/errors/`:

```typescript
// src/errors/UnprocessableContentError.errors.ts

import { AppError } from "./AppError.errors";

export class UnprocessableContentError extends AppError {
  constructor(message: string, code: string) {
    super(message, 422, code); // 422 Unprocessable Content
  }
}
```

**Exportalo:**

```typescript
// src/errors/index.ts

export { AppError } from "./AppError.errors";
export { BadRequestError } from "./BadRequestError.errors";
// ... otras exportaciones
export { UnprocessableContentError } from "./UnprocessableContentError.errors";
```

**Úsalo:**

```typescript
import { UnprocessableContentError } from "../errors";

if (dataIsInconsistent) {
  throw new UnprocessableContentError(
    "Datos son inconsistentes",
    "INCONSISTENT_DATA"
  );
}
```

**Referencia de códigos de estado HTTP:**
- 400: BadRequestError (error en entrada de usuario)
- 401: UnauthorizedError (token faltante/inválido)
- 403: ForbiddenError (usuario sin permiso)
- 404: NotFoundError (recurso no encontrado)
- 422: UnprocessableContentError (formato válido, pero semánticamente incorrecto)
- 429: RateLimitError (demasiadas solicitudes)
- 500: InternalServerError (error inesperado)
- 502: ExternalServiceError (API externa falló)
- 503: ServiceUnavailableError (servicio caído)

---

## Cómo Capturar y Registrar Detalles de Error

**Problema:** Un error ocurre y necesitas debugearlo. ¿Cómo encuentras los detalles?

**Solución:**

Cada respuesta de error incluye un `requestId`. Úsalo para buscar en logs:

```
GET /api/validate-curp
Body: { "curp": "INVALID" }

Response (400):
{
  "error": "CURP debe tener 18 caracteres",
  "code": "INVALID_CURP",
  "requestId": "req-a1b2c3d4e5f6",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**En tus logs, busca:** `req-a1b2c3d4e5f6`

Encontrarás:
```
[2026-05-11 18:30:00] requestId: "req-a1b2c3d4e5f6"
[2026-05-11 18:30:00] endpoint: "POST /api/validate-curp"
[2026-05-11 18:30:00] statusCode: 400
[2026-05-11 18:30:00] error: "CURP debe tener 18 caracteres"
[2026-05-11 18:30:00] code: "INVALID_CURP"
```

**Flujo de rastreo:**
1. Solicitud llega
2. `requestIdMiddleware` genera ID único
3. Solicitud procesada
4. Error ocurre
5. `errorHandler` registra con ID de solicitud
6. Respuesta enviada con ID de solicitud
7. Usuario reporta problema con ID de solicitud
8. Desarrollador busca en logs ese ID de solicitud

---

## Cómo Manejar Validación Anidada/Dependiente

**Problema:** Campo B es solo válido si Campo A tiene un valor específico.

**Solución:**

```typescript
export const validateComplexData = asyncHandler(async (req, res) => {
  const { tipoContrato, monto, cuotas } = req.body;
  
  // Validación básica
  if (!tipoContrato) {
    throw new BadRequestError("Tipo es requerido", "MISSING_TYPE");
  }
  
  // Validación dependiente
  if (tipoContrato === "QUINCENA") {
    if (!cuotas) {
      throw new BadRequestError(
        "Cuotas requeridas para tipo QUINCENA",
        "MISSING_CUOTAS"
      );
    }
    
    if (cuotas < 1 || cuotas > 24) {
      throw new BadRequestError(
        "Cuotas debe estar entre 1 y 24",
        "INVALID_CUOTAS"
      );
    }
  }
  
  if (tipoContrato === "FIJO") {
    if (!monto) {
      throw new BadRequestError(
        "Monto requerido para tipo FIJO",
        "MISSING_MONTO"
      );
    }
    
    if (monto <= 0) {
      throw new BadRequestError(
        "Monto debe ser positivo",
        "INVALID_MONTO"
      );
    }
  }
  
  // Toda validación pasó
  res.json({ valid: true });
});
```

**Patrón:**
1. Valida campos requeridos primero
2. Luego valida campos dependientes
3. Lanza códigos de error específicos
4. Incluye nombre de campo en mensaje de error

---

## Cómo Manejar Operaciones en Lote con Fallos Parciales

**Problema:** Procesando 10 contratos, pero 3 fallan. ¿Cómo responder?

**Solución:**

```typescript
export const fillMultipleContracts = asyncHandler(async (req, res) => {
  const { contracts } = req.body;
  
  const results = [];
  
  for (const contract of contracts) {
    try {
      const filled = await fillContract(contract);
      results.push({
        success: true,
        contractId: contract.id,
        data: filled,
      });
    } catch (error) {
      results.push({
        success: false,
        contractId: contract.id,
        error: error.message,
        code: error.code,
      });
    }
  }
  
  // Verifica si todos fallaron
  const allFailed = results.every((r) => !r.success);
  if (allFailed) {
    throw new BadRequestError(
      "Todos los contratos fallaron al procesar",
      "ALL_FAILED"
    );
  }
  
  // Éxito parcial está bien
  res.json({ results });
});
```

**Respuesta:**
```json
{
  "results": [
    { "success": true, "contractId": "1", "data": {...} },
    { "success": false, "contractId": "2", "error": "CURP inválido", "code": "INVALID_CURP" },
    { "success": true, "contractId": "3", "data": {...} }
  ]
}
```

---

## Cómo Manejar Errores de Timeout

**Problema:** API externa es lenta o timeout ocurre.

**Solución:**

```typescript
import { ExternalServiceError } from "../errors";

export const callAPIWithTimeout = async (promise, timeoutMs = 30000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Timeout de solicitud")),
      timeoutMs
    )
  );
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    throw new ExternalServiceError(
      `Solicitud a API falló: ${error.message}`,
      "API_TIMEOUT"
    );
  }
};

// Uso:
export const extractINEData = async (imageBuffer) => {
  const geminiPromise = genAI.models.generateContent({...});
  
  try {
    const result = await callAPIWithTimeout(geminiPromise, 30000);
    return parseINEResponse(result);
  } catch (error) {
    throw error; // Ya es ExternalServiceError
  }
};
```

---

## Cómo Usar Códigos de Error para Manejo en Frontend

**Problema:** Frontend necesita mostrar UI específica basada en tipo de error.

**Solución:**

**Backend:** Incluye códigos de error consistentes:
```typescript
throw new BadRequestError("Archivo es demasiado grande", "FILE_TOO_LARGE");
throw new BadRequestError("Documento no es válido", "INVALID_DOCUMENT");
throw new UnauthorizedError("Token expirado", "TOKEN_EXPIRED");
```

**Frontend:** Maneja por código:
```typescript
try {
  const response = await fetch("/api/upload", { ... });
  const data = await response.json();
  
  if (!response.ok) {
    switch (data.code) {
      case "FILE_TOO_LARGE":
        showError("Archivo debe ser menor a 5MB");
        break;
      case "INVALID_DOCUMENT":
        showError("Por favor carga una INE Mexicana válida");
        break;
      case "TOKEN_EXPIRED":
        redirectToLogin();
        break;
      default:
        showError(data.error);
    }
  }
} catch (error) {
  showError("Error de red");
}
```

**Beneficios:**
- Frontend responde precisamente a tipo de error
- Mejor experiencia de usuario (mensajes específicos)
- Debugging más fácil (códigos de error en logs)

---

## Referencia Rápida

| Tarea | Clase de Error | Ejemplo |
|------|-------------|---------|
| Entrada del usuario inválida | BadRequestError | `throw new BadRequestError("CURP inválido", "INVALID_CURP")` |
| No autenticado | UnauthorizedError | `throw new UnauthorizedError("Token requerido", "MISSING_TOKEN")` |
| Recurso faltante | NotFoundError | `throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND")` |
| API externa falla | ExternalServiceError | `throw new ExternalServiceError("API falló", "API_ERROR")` |
| Error inesperado | InternalServerError | `throw new InternalServerError("Bug", "UNEXPECTED")` |
| Demasiadas solicitudes | RateLimitError | `throw new RateLimitError("Rate limit", 60)` |

