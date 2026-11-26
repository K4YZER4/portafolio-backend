<div align="left">
  <a href="../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>

<div align="right">
  <a href="../en/development.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>

# Guía de Desarrollo

**Navegación:** Inicio › Docs › Desarrollo

Guía para crear nuevos controladores y manejar errores correctamente.

---

## Crear un Nuevo Controlador

### Paso 1: Identificar posibles errores

Antes de escribir código, pregúntate: **¿Qué podría salir mal?**

```typescript
// Ejemplo: Extraer datos de tarjeta INE
// Podría fallar si:
// - No se cargó archivo (BadRequest)
// - El archivo tiene formato incorrecto (BadRequest)
// - Timeout de API Gemini (ExternalService)
// - La guardada en BD falla (InternalServer)
```

### Paso 2: Elegir tipos de error

Mapea cada problema a una clase de error:

| Problema                          | Clase de Error         | HTTP |
| --------------------------------- | ---------------------- | ---- |
| Entrada del usuario es incorrecta | `BadRequestError`      | 400  |
| Usuario no autenticado            | `UnauthorizedError`    | 401  |
| Recurso no existe                 | `NotFoundError`        | 404  |
| API externa falla                 | `ExternalServiceError` | 502  |
| Error de código/inesperado        | `InternalServerError`  | 500  |

### Paso 3: Escribir controlador con asyncHandler

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError, NotFoundError, ExternalServiceError } from "../errors";

export const myNewController = asyncHandler(async (req, res) => {
  // No necesitas try/catch - asyncHandler captura todo

  // Validar entrada
  if (!req.body.requiredField) {
    throw new BadRequestError("Campo requerido faltante", "MISSING_FIELD");
  }

  // Verificar si recurso existe
  const resource = await db.find(req.body.id);
  if (!resource) {
    throw new NotFoundError("Recurso no encontrado", "RESOURCE_NOT_FOUND");
  }

  // Llamar API externa (puede fallar)
  try {
    const result = await externalAPI.call(data);
    res.json(result);
  } catch (error) {
    throw new ExternalServiceError("API falló", "API_ERROR");
  }
});
```

**Resultado:**

- ✅ Sin bloques try/catch
- ✅ Errores registrados automáticamente
- ✅ Códigos HTTP correctos
- ✅ Formato de respuesta consistente

---

## Árbol de Decisión de Errores

Usa esto para elegir el error correcto:

```
¿Este error ocurre porque...

├─ El usuario proporcionó entrada incorrecta?
│  └─ throw new BadRequestError(mensaje, "CÓDIGO")
│
├─ El usuario no está autenticado?
│  └─ throw new UnauthorizedError(mensaje, "CÓDIGO")
│
├─ Buscamos algo que no existe?
│  └─ throw new NotFoundError(mensaje, "CÓDIGO")
│
├─ ¿Una API/servicio externo falló?
│  └─ throw new ExternalServiceError(mensaje, "CÓDIGO")
│
└─ ¿Algo inesperado sucedió (error)?
   └─ throw new InternalServerError(mensaje, "CÓDIGO")
```

---

## Ejemplos Antes & Después

### Ejemplo 1: Validar Entrada

**ANTES (forma antigua con try/catch):**

```typescript
export const validateCURP = async (req: Request, res: Response) => {
  try {
    const { curp } = req.body;

    if (!curp) {
      res.status(400).json({ error: "CURP requerido" });
      return;
    }

    if (curp.length !== 18) {
      res.status(400).json({ error: "CURP debe tener 18 caracteres" });
      return;
    }

    res.json({ valid: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
```

**DESPUÉS (forma nueva con asyncHandler):**

```typescript
export const validateCURP = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  if (!curp) {
    throw new BadRequestError("CURP requerido", "MISSING_CURP");
  }

  if (curp.length !== 18) {
    throw new BadRequestError("CURP debe tener 18 caracteres", "INVALID_CURP");
  }

  res.json({ valid: true });
});
```

**Diferencia:**

- 20 líneas → 10 líneas
- Códigos de estado manuales → Automáticos
- Sin registro de errores → Registrado automáticamente en archivo
- Respuestas inconsistentes → JSON consistente

---

### Ejemplo 2: Búsqueda en Base de Datos

**ANTES:**

```typescript
export const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await db.users.findById(userId);

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error de base de datos" });
  }
};
```

**DESPUÉS:**

```typescript
export const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await db.users.findById(userId);

  if (!user) {
    throw new NotFoundError(`Usuario ${userId} no encontrado`, "USER_NOT_FOUND");
  }

  res.json(user);
});
```

---

### Ejemplo 3: Llamada a API Externa

**ANTES:**

```typescript
export const extractINE = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Imagen requerida" });
      return;
    }

    try {
      const result = await geminiAPI.extract(req.file.buffer);
      res.json(result);
    } catch (apiError) {
      res.status(502).json({ error: "API de Gemini falló" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
```

**DESPUÉS:**

```typescript
export const extractINE = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("Imagen requerida", "MISSING_IMAGE");
  }

  try {
    const result = await geminiAPI.extract(req.file.buffer);
    res.json(result);
  } catch (error) {
    throw new ExternalServiceError("API de Gemini falló", "GEMINI_ERROR");
  }
});
```

---

## Prueba de Errores en Postman

### Configuración

1. Abre Postman
2. Crea una nueva solicitud
3. Establece el método y URL
4. Agrega encabezados/cuerpo según sea necesario
5. Envía la solicitud

### Prueba cada tipo de error

**BadRequestError (400):**

```
POST http://localhost:3001/api/validate-curp
Body: { "curp": "ABC" }

Respuesta esperada:
{
  "error": "CURP debe tener 18 caracteres",
  "code": "INVALID_CURP",
  "statusCode": 400,
  "requestId": "req-...",
  "timestamp": "2026-05-04T..."
}
```

**NotFoundError (404):**

```
GET http://localhost:3001/api/user/999999

Respuesta esperada:
{
  "error": "Usuario 999999 no encontrado",
  "code": "USER_NOT_FOUND",
  "statusCode": 404,
  "requestId": "req-...",
  "timestamp": "2026-05-04T..."
}
```

**ExternalServiceError (502):**

```
POST http://localhost:3001/api/ine
(Con API de Gemini inactiva)

Respuesta esperada:
{
  "error": "API de Gemini falló",
  "code": "GEMINI_ERROR",
  "statusCode": 502,
  "requestId": "req-...",
  "timestamp": "2026-05-04T..."
}
```

### Verificar ID de solicitud en encabezados

Después de enviar la solicitud:

1. Haz clic en la pestaña "Headers" en la respuesta
2. Busca `X-Request-Id: req-abc123`
3. Debe coincidir con `requestId` en el cuerpo de respuesta

---

## Lista de Verificación Antes de Commit

Antes de hacer commit de cambios de controlador:

- [ ] Controlador usa envoltura `asyncHandler`
- [ ] Sin bloques `try/catch` manuales (excepto para capturar errores específicos)
- [ ] Toda validación lanza `BadRequestError`
- [ ] Búsquedas de BD lanzan `NotFoundError` si no se encuentra
- [ ] Llamadas a API externa lanzan `ExternalServiceError` en caso de fallo
- [ ] Códigos de error son significativos (no genéricos)
- [ ] Probadas todas las rutas de error en Postman
- [ ] Formato de respuesta es consistente con otros endpoints
- [ ] Sin PII (CURP, contraseñas, etc.) en mensajes de error
- [ ] Los logs se escriben en `logs/error-YYYY-MM-DD.log`

---

## Errores Comunes

### ❌ Error 1: No envolver con asyncHandler

```typescript
// INCORRECTO - crasheará en rechazo no manejado
export const myController = async (req, res) => {
  const result = await someAsyncFunction();
  res.json(result);
};

// CORRECTO - asyncHandler captura errores
export const myController = asyncHandler(async (req, res) => {
  const result = await someAsyncFunction();
  res.json(result);
});
```

### ❌ Error 2: Lanzar Error genérico

```typescript
// INCORRECTO - pierde información de tipo de error
throw new Error("Algo falló");

// CORRECTO - usar clase de error específica
throw new BadRequestError("Entrada inválida", "INVALID_INPUT");
```

### ❌ Error 3: Usar try/catch cuando no deberías

```typescript
// INCORRECTO - try/catch innecesario
export const myController = asyncHandler(async (req, res) => {
  try {
    if (!req.body.field) {
      throw new BadRequestError("Campo requerido", "MISSING_FIELD");
    }
  } catch (error) {
    next(error);
  }
});

// CORRECTO - simplemente lanza, asyncHandler lo captura
export const myController = asyncHandler(async (req, res) => {
  if (!req.body.field) {
    throw new BadRequestError("Campo requerido", "MISSING_FIELD");
  }
});
```

### ❌ Error 4: Registrar PII

```typescript
// INCORRECTO - registra datos sensibles
logger.error({
  curp: "ABCD123456HDFMZR00",
  bankAccount: "0123456789",
  creditCard: "1234-5678",
});

// CORRECTO - solo registra metadatos
logger.error({
  code: "INVALID_CURP",
  message: "Validación de CURP falló",
  endpoint: "POST /api/validate",
});
```

---

## Plantilla Rápida

Copia esta plantilla para nuevos controladores:

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError, NotFoundError, ExternalServiceError } from "../errors";

export const myNewController = asyncHandler(async (req, res) => {
  // 1. Validar entrada
  const { requiredField } = req.body;
  if (!requiredField) {
    throw new BadRequestError("Campo requerido faltante", "MISSING_FIELD");
  }

  // 2. Verificar si recurso existe
  const resource = await db.find(requiredField);
  if (!resource) {
    throw new NotFoundError("Recurso no encontrado", "NOT_FOUND");
  }

  // 3. Llamar API externa si es necesario
  try {
    const result = await externalAPI.call(resource);
    res.json(result);
  } catch (error) {
    throw new ExternalServiceError("API falló", "API_ERROR");
  }
});
```

---

## Pasos Siguientes

1. Revisa `docs/error-handling/README.md` para referencia completa
2. Actualiza controladores existentes para usar asyncHandler
3. Prueba todas las rutas de error en Postman
4. Verifica logs en `logs/error-YYYY-MM-DD.log`
