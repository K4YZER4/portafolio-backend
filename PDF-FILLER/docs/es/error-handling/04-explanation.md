<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Atrás-lightgray?style=flat" alt="Volver a Manejo de Errores"/>
  </a>
  &nbsp;
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/Inicio-lightgray?style=flat" alt="Inicio"/>
  </a>
</div>

# Manejo de Errores — Explicación

**Ruta:** Inicio › Docs › Manejo de Errores › Explicación

**Objetivo:** Entender POR QUÉ el sistema de manejo de errores está diseñado de esta manera.

**Audiencia:** Desarrolladores que quieren entender la filosofía y razonamiento.

**← Anterior:** [Referencia](./03-reference.md) | **Siguiente →:** Ninguno (Último doc)

---

## ¿Por Qué Esta Arquitectura?

### El Problema que Resolvimos

**Antes:** El manejo de errores estaba disperso en el código.

```typescript
// Controller 1
try {
  await api.call();
} catch (error) {
  res.status(500).json({ error: error.message });
}

// Controller 2
try {
  validateInput();
} catch (error) {
  res.status(400).json({ message: "Inválido" });
}

// Controller 3
try {
  findUser();
} catch (error) {
  console.log(error);
  res.status(500).json({ error: "Error del servidor" });
}
```

**Problemas:**

- ❌ Sin formato de error consistente
- ❌ Diferentes códigos HTTP para mismo error
- ❌ Errores no registrados centralmente
- ❌ Difícil debuggear (sin ID de solicitud)
- ❌ Lógica de manejo de errores duplicada
- ❌ Frontend no puede manejar errores confiablemente

### La Solución

Un sistema centralizado y estandarizado de manejo de errores:

```typescript
// Todos los controllers usan el mismo patrón
export const controller = asyncHandler(async (req, res) => {
  if (!valid) {
    throw new BadRequestError("Inválido", "INVALID_INPUT");
  }
  res.json({ data });
});
```

**Beneficios:**

- ✅ Formato de error consistente en todos lados
- ✅ Códigos HTTP apropiados
- ✅ Logging central con IDs de solicitud
- ✅ Fácil de debuggear
- ✅ Sin duplicación de código
- ✅ Frontend puede manejar errores confiablemente

---

## Principios de Diseño

### 1. Los Errores Son Excepciones, No Valores de Retorno

**¿Por qué?** Hace el código más limpio y garantiza que los errores nunca se ignoren.

```typescript
// ❌ Malo: Error como valor de retorno
const result = validateInput(data);
if (result.error) {
  // Debes recordar verificar el error
}

// ✅ Bueno: Error como excepción
try {
  validateInput(data);
  // Error automáticamente se propaga hacia arriba
} catch (error) {
  // Debes manejar explícitamente
}
```

### 2. Diferentes Tipos de Error para Diferentes Situaciones

**¿Por qué?** Permite códigos HTTP apropiados y hace el manejo en frontend más fácil.

```typescript
// 400: Usuario cometió un error (reintentar con entrada diferente)
throw new BadRequestError("Email inválido", "INVALID_EMAIL");

// 401: Usuario no está autenticado (iniciar sesión)
throw new UnauthorizedError("Token requerido", "MISSING_TOKEN");

// 404: Recurso no existe (no es culpa del usuario)
throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND");

// 502: Servicio externo falló (usuario debe reintentar)
throw new ExternalServiceError("API falló", "API_ERROR");

// 500: Bug inesperado (reportar a desarrolladores)
throw new InternalServerError("Bug", "UNEXPECTED");
```

**Cada uno le dice al cliente:** "Esto es lo que pasó y qué hacer al respecto."

### 3. Códigos de Error, No Mensajes

**¿Por qué?** Los mensajes son para humanos; los códigos son para máquinas.

```typescript
// ❌ Malo: ¿Cómo sabría frontend cuál error es este?
throw new BadRequestError(
  "El valor ingresado para email no es válido y debe coincidir con la especificación RFC 5322"
);

// ✅ Bueno: Código identifica error, mensaje lo explica
throw new BadRequestError("Formato de Email es inválido", "INVALID_EMAIL");
```

**Beneficios:**

- Frontend puede responder a `INVALID_EMAIL` con UI específica
- Cambiar mensaje no rompe frontend
- Funciona entre lenguajes (mismo código, mensaje diferente)

### 4. Logging Central con IDs de Solicitud

**¿Por qué?** Debuggear es difícil cuando no puedes encontrar logs.

```
Usuario llama: "Recibí un error hace 2 horas"
↓
Usuario reporta error con requestId: "req-abc123"
↓
Desarrollador busca "req-abc123" en logs
↓
Encuentra: solicitud exacta, error, timestamp, endpoint
↓
¡Reparado!
```

**Sin IDs de solicitud:** ¿Encontrar error entre millones de líneas de logs? Buena suerte.

### 5. Validación Antes de Procesamiento

**¿Por qué?** Atrapar errores temprano, ahorrar recursos.

```typescript
// ❌ Malo: Extraer datos LUEGO validar
const data = await expensiveExtraction(buffer);
if (!data) {
  return error;
}

// ✅ Bueno: Validar LUEGO extraer
await validateQuality(buffer);
const data = await expensiveExtraction(buffer);
```

### 6. Errores de Servicio Externo Son Diferentes de Errores de Usuario

**¿Por qué?** El usuario no puede arreglar un fallo de servicio externo.

```typescript
// 400: Error de usuario (usuario puede arreglarlo)
throw new BadRequestError("CURP inválido", "INVALID_CURP");

// 502: Error externo (usuario no puede arreglarlo, debe reintentar)
throw new ExternalServiceError("Gemini API falló", "GEMINI_ERROR");
```

---

## ¿Por Qué asyncHandler?

### El Problema

JavaScript async/await hace fácil olvidar manejo de errores:

```typescript
// Este error nunca es capturado
export const controller = (req, res) => {
  asyncFunction(); // ← Si esto lanza, la app se cuelga
  res.json({ ok: true });
};
```

### La Solución

Envuelve en asyncHandler para capturar todos los errores:

```typescript
// Todos los errores capturados automáticamente
export const controller = asyncHandler(async (req, res) => {
  throw new BadRequestError("Error", "CODE"); // ← Capturado!
  res.json({ ok: true });
});
```

### Cómo Funciona

```typescript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
  //     ↑ Convierte errores lanzados en rechazos de Promise
  //                                       ↑ Pasa al error handler
};
```

---

## ¿Por Qué Global Error Handler?

### El Problema

Sin global error handler, cada controller debe manejar errores:

```typescript
// Controller 1
router.post("/endpoint1", (req, res) => {
  try {
    doSomething();
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Controller 2
router.post("/endpoint2", (req, res) => {
  try {
    doSomething();
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Controller 3... (repetir 100 veces)
```

### La Solución

Un global error handler captura todos los errores:

```typescript
// Controllers solo lanzan
router.post(
  "/endpoint1",
  asyncHandler(async (req, res) => {
    throw new BadRequestError("Error", "CODE");
  })
);

// Global handler captura todo
app.use((error, req, res, next) => {
  // Formatear, registrar, responder
});
```

---

## ¿Por Qué IDs de Solicitud?

### Sin IDs de Solicitud

```
[18:30:00] ERROR: CURP inválido
[18:30:01] ERROR: CURP inválido
[18:30:02] ERROR: CURP inválido
[18:30:03] ERROR: CURP inválido
[18:30:04] ERROR: CURP inválido
...
Usuario: "Recibí error a las 18:30:02"
Desarrollador: "¿Cuál? Todos los 100 endpoints tuvieron errores a las 18:30:02"
```

### Con IDs de Solicitud

```
[18:30:00] req-abc123 ERROR: CURP inválido endpoint: POST /api/validate
[18:30:01] req-def456 ERROR: CURP inválido endpoint: POST /api/validate
...
Usuario: "Recibí error con requestId req-abc123"
Desarrollador: "¡Lo encontré! POST /api/validate a las 18:30:00 con validación de CURP"
```

---

## ¿Por Qué Formato de Error Consistente?

### Respuestas Malas de Diferentes Endpoints

```
GET /api/user (404):
{ "message": "no encontrado" }

POST /api/validate (400):
{ "error": { "field": "email", "reason": "inválido" } }

DELETE /api/contract (500):
{ "errors": ["algo salió mal"] }

Código de frontend:
if (response.status === 404) {
  if (response.data.message) {
    show(response.data.message);
  } else if (response.data.error) {
    show(response.data.error);
  } // ... manejar 10 formatos diferentes
}
```

### Respuestas Buenas (Formato Consistente)

```
GET /api/user (404):
{ "error": "Usuario no encontrado", "code": "USER_NOT_FOUND" }

POST /api/validate (400):
{ "error": "Email inválido", "code": "INVALID_EMAIL" }

DELETE /api/contract (500):
{ "error": "Error inesperado", "code": "UNEXPECTED" }

Código de frontend:
if (!response.ok) {
  handleError(response.data.code, response.data.error);
}
```

**Beneficios:**

- Mismo manejo para todos los endpoints
- Frontend es más simple
- Fácil de agregar nuevos endpoints

---

## Los Códigos de Estado HTTP Importan

### ¿Por Qué Códigos Diferentes?

Cada código de estado le cuenta al cliente una historia diferente:

| Código | Significado            | Acción del Cliente              |
| ------ | ---------------------- | ------------------------------- |
| 400    | Error del usuario      | Reintentar con datos diferentes |
| 401    | No autenticado         | Iniciar sesión y reintentar     |
| 404    | Recurso faltante       | Nada que hacer (no disponible)  |
| 429    | Rate limitado          | Esperar y reintentar            |
| 500    | Bug del servidor       | Reintentar en un momento        |
| 502    | Servicio externo caído | Reintentar en un momento        |

### Ejemplo del Mundo Real

```typescript
// Gemini API falla
throw new ExternalServiceError("API falló", "GEMINI_ERROR"); // 502

// Frontend debe:
// 1. Mostrar "Servicio temporalmente no disponible"
// 2. Ofrecer reintentar
// 3. NO mostrar error al usuario como su culpa
```

---

## Códigos de Error Habilitan Mejor UX

### Sin Códigos

```typescript
// Frontend recibe error
if (response.status === 400) {
  // Podría ser cualquier error de validación
  // Mostrar mensaje genérico
  showError("Por favor verifica tu entrada");
}
```

### Con Códigos

```typescript
// Frontend recibe error con código
switch (response.data.code) {
  case "INVALID_EMAIL":
    focusEmailField();
    showError("Por favor ingresa un email válido");
    break;
  case "INVALID_CURP":
    focusCURPField();
    showError("CURP debe tener 18 caracteres");
    break;
  case "MISSING_AMOUNT":
    focusAmountField();
    showError("Monto es requerido");
    break;
}
```

**Resultado:** Mejor UX, usuarios saben exactamente qué está mal.

---

## Validación Debe Ocurrir Temprano

### Malo: Extraer Luego Validar

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  const imageBuffer = req.file.buffer;

  // Llamada a API cara
  const extracted = await extractINEData(imageBuffer);

  // Luego validar
  if (!extracted || extracted.length === 0) {
    throw new BadRequestError("Inválido", "INVALID_DOCUMENT");
  }

  res.json({ data: extracted });
});
```

**Problemas:**

- Llamada a API cara desperdiciada
- Hubiera podido validar en 10ms
- Pobre UX (usuario espera extracción)

### Bueno: Validar Luego Extraer

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  const imageBuffer = req.file.buffer;

  // Validar primero (barato, rápido)
  await validateINEQuality(imageBuffer);

  // Solo entonces extraer (caro)
  const extracted = await extractINEData(imageBuffer);

  res.json({ data: extracted });
});
```

**Beneficios:**

- Documentos inválidos rechazados en milisegundos
- Llamadas a API solo para documentos válidos
- Mejor UX
- Ahorra cuota de API

---

## ¿Por Qué Código INVALID_DOCUMENT?

### El Patrón de Gemini

Gemini no siempre puede decirte qué está mal con una imagen (es una caja negra):

```
¿Es esta imagen una INE válida?
¿Todos los campos son legibles?
¿Calidad es suficiente?
```

En lugar de devolver errores detallados (que no son confiables), Gemini devuelve:

```
"INVALID_DOCUMENT" → Algo está mal, no puede ser específico
"VALID" → Todos los checks pasaron
```

**¿Por qué esto es bueno:**

- Preciso (Gemini solo dice válido o no)
- Simple (sin falsos positivos)
- Usuario sabe documento no funciona (sin detalles falsos)

---

## La Filosofía: Fallar Rápido

### Principio: Atrapar Problemas Temprano

```typescript
// ❌ Malo: Dejar datos inválidos fluir a través del sistema
export const fillContract = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  const contract = await db.contracts.create({
    curp: curp, // Podría ser inválido, sin validación
  });

  await sendToGemini(contract);
  await sendToPDF(contract);
  // Si CURP era inválido, desperdiciamos 3 llamadas a API
});

// ✅ Bueno: Validar inmediatamente
export const fillContract = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  if (!curp || curp.length !== 18) {
    throw new BadRequestError("CURP inválido", "INVALID_CURP");
  }

  const contract = await db.contracts.create({ curp });
  // ... resto de lógica
});
```

**Beneficio:** Datos inválidos atrapados inmediatamente, no propagados a través del sistema.

---

## Manejo de Errores vs Excepciones

### Las Excepciones Son Para Casos Excepcionales

```typescript
// ✅ Bueno: Fallo de validación esperado (puede ocurrir)
if (!curp) {
  throw new BadRequestError("CURP requerido", "MISSING_CURP");
}

// ✅ Bueno: Recurso no encontrado esperado (puede ocurrir)
const user = await db.users.findById(id);
if (!user) {
  throw new NotFoundError("Usuario no encontrado", "USER_NOT_FOUND");
}

// ✅ Bueno: Timeout de servicio externo esperado (puede ocurrir)
try {
  await geminiAPI.call();
} catch (error) {
  throw new ExternalServiceError("API falló", "API_ERROR");
}

// ❌ Malo: Referencia nula inesperada (no debería ocurrir)
const data = result.data;
// Si result es null, esto se cuelga sin manejar
```

**Filosofía:** Lanza excepciones para errores esperados. Los bugs deberían cuelgarse (para que los arregles).

---

## Estrategia de Logging

### ¿Por Qué Structured Logging?

```
❌ Malo: Logs no estructurados
ERROR: algo salió mal

✅ Bueno: Logs estructurados
{
  "timestamp": "2026-05-11T18:30:00Z",
  "requestId": "req-abc123",
  "level": "ERROR",
  "endpoint": "POST /api/validate-curp",
  "error": "CURP debe tener 18 caracteres",
  "code": "INVALID_CURP",
  "statusCode": 400
}
```

**Beneficios:**

- Fácil de buscar (buscar por requestId)
- Fácil de filtrar (filtrar por statusCode)
- Fácil de agregar (errores por código)
- Legible por máquina

### Ciclo de Vida de ID de Solicitud

```
1. Solicitud llega
   ↓ requestIdMiddleware genera: req-abc123

2. Almacenado en: req.id

3. Usado en: logs, respuestas

4. En error: incluido en respuesta de error

5. Usuario reporta: "Recibí error con requestId req-abc123"

6. Desarrollador: busca en logs "req-abc123"
```

---

## Consideraciones de Rendimiento

### Objetos de Error Son Baratos

```typescript
// Lanzar error es MUY rápido
throw new BadRequestError("Validación falló", "CODE");
// ~0.1ms

// Comparado con llamadas a API:
// Llamada HTTP: ~100-1000ms
// Llamada a BD: ~5-50ms
// Lectura de archivo: ~10-100ms
```

**Lección:** No evites lanzar errores por rendimiento. Son baratos.

### Pero Prevenir Errores Es Mejor

```typescript
// Malo: Lanzar muchos errores
for (let i = 0; i < 1000000; i++) {
  if (data[i] === null) throw new Error();
}

// Bueno: Verificar una vez
if (data.some((x) => x === null)) {
  throw new BadRequestError("Datos inválidos", "INVALID_DATA");
}
```

---

## Ruta de Migración

### Si Heredas Código Antiguo

```typescript
// Antiguo: Manejo de errores disperso
export const oldController = (req, res) => {
  try {
    doSomething();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Migra a: Patrón nuevo
export const newController = asyncHandler(async (req, res) => {
  doSomething();
  res.json({ success: true });
});
```

**Pasos:**

1. Envuelve en `asyncHandler`
2. Elimina try/catch
3. Lanza errores personalizados
4. Deja que el global handler se encargue

---

## Conclusión: Objetivos de Diseño

Nuestro sistema de manejo de errores fue diseñado para:

1. **Ser consistente** — Mismo formato en todos lados
2. **Ser informativo** — Códigos + mensajes + IDs de solicitud
3. **Ser accionable** — Códigos de estado le dicen al cliente qué hacer
4. **Ser debuggeable** — IDs de solicitud rastrean solicitudes a través del sistema
5. **Ser seguro** — Errores nunca cuelgan la app, siempre manejados
6. **Ser eficiente** — Validación temprano, llamadas a API tarde
7. **Ser amigable** — Mensajes de error específicos, no genéricos

Cuando tengas dudas, pregunta: "¿Esto sigue estos principios?"
