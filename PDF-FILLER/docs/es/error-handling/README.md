<div align="left">
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver al Inicio"/>
  </a>
</div>

<div align="right">
  <a href="../../en/error-handling/README.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>

# Manejo de Errores

Aprende cómo manejar errores correctamente en RellenadorContratos.

---

**Navegación:** Inicio › Docs › Manejo de Errores

---

## Resumen

El sistema de manejo de errores asegura:

- ✅ Formato de error consistente en todos los endpoints
- ✅ Códigos de estado HTTP apropiados
- ✅ Logging automático con IDs de solicitud
- ✅ Debugging y rastreo de errores fácil
- ✅ Mejor manejo de errores en frontend

---

## Estructura de Documentación

Esta documentación sigue el **Marco Diátaxis**:

### 📚 [Tutorial](./01-tutorial.md) — _Aprendizaje_

**Comienza aquí si eres nuevo.** Una guía paso a paso que enseña cómo fluyen los errores a través del sistema.

- Entender el flujo de errores
- Aprender clases de error
- Cómo funciona asyncHandler
- Cómo funciona el error handler global
- Rastreo de ID de solicitud

**Tiempo:** 25 minutos

---

### 🔧 [Guías Prácticas](./02-how-to-guides.md) — _Recetas_

**Usa estas para resolver problemas específicos.** Recetas prácticas para escenarios comunes.

- Cómo lanzar un error básico
- Cómo manejar errores de carga de archivos
- Cómo validar datos de solicitud
- Cómo manejar fallos de API externas
- Cómo validar calidad de documento
- Cómo crear clases de error personalizadas
- Cómo capturar y registrar errores
- Cómo manejar validación anidada/dependiente
- Cómo manejar operaciones en lote
- Cómo manejar errores de timeout
- Cómo usar códigos de error para manejo en frontend

**Tiempo:** Busca lo que necesites (5-10 minutos por receta)

---

### 📖 [Referencia](./03-reference.md) — _Búsqueda_

**Usa esto para encontrar detalles específicos.** Referencia técnica completa para todos los tipos de error y códigos.

- Firmas de clases de error
- Todas las clases de error y códigos HTTP
- Códigos de error estándar (400, 401, 404, 500, 502, 429)
- Estructura de respuesta de error
- Códigos de estado HTTP explicados
- Códigos de error de Multer
- Diagrama de flujo de error
- Formato de logging
- Formato de ID de solicitud
- Mejores prácticas
- Tabla de referencia rápida

**Tiempo:** Busca según sea necesario

---

### 💡 [Explicación](./04-explanation.md) — _Comprensión_

**Lee esto para entender el porqué.** Análisis profundo de la filosofía y decisiones de diseño.

- ¿Por qué esta arquitectura?
- Principios de diseño
- ¿Por qué asyncHandler?
- ¿Por qué error handler global?
- ¿Por qué IDs de solicitud?
- ¿Por qué formato de error consistente?
- ¿Por qué códigos HTTP diferentes?
- ¿Por qué códigos de error habilitan mejor UX?
- ¿Por qué validación debe ocurrir temprano?
- La filosofía: fallar rápido
- Estrategia de logging
- Consideraciones de rendimiento
- Ruta de migración

**Tiempo:** 30 minutos

---

## Inicio Rápido

### Lanzar un Error

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError } from "../errors";

export const validateCURP = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  if (!curp) {
    throw new BadRequestError("CURP es requerido", "MISSING_CURP");
  }

  res.json({ valid: true });
});
```

### Respuesta de Error

```json
{
  "error": "CURP es requerido",
  "code": "MISSING_CURP",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Clases de Error

| Clase                  | HTTP | Usar Cuando                     |
| ---------------------- | ---- | ------------------------------- |
| `BadRequestError`      | 400  | Entrada del usuario es inválida |
| `UnauthorizedError`    | 401  | Usuario no está autenticado     |
| `NotFoundError`        | 404  | Recurso no existe               |
| `ExternalServiceError` | 502  | API externa falló               |
| `InternalServerError`  | 500  | Error inesperado (bug)          |
| `RateLimitError`       | 429  | Demasiadas solicitudes          |

---

## Códigos de Error Comunes

| Código                  | HTTP | Significado                               |
| ----------------------- | ---- | ----------------------------------------- |
| `INVALID_CURP`          | 400  | Formato de CURP es inválido               |
| `MISSING_CURP`          | 400  | CURP es requerido                         |
| `INVALID_DOCUMENT`      | 400  | Documento no es válido o calidad es pobre |
| `FILE_TOO_LARGE`        | 400  | Archivo excede límite de tamaño           |
| `MISSING_TOKEN`         | 401  | Token de autorización faltante            |
| `TOKEN_EXPIRED`         | 401  | Token ha expirado                         |
| `USER_NOT_FOUND`        | 404  | Usuario no existe                         |
| `CONTRACT_NOT_FOUND`    | 404  | Contrato no existe                        |
| `GEMINI_ERROR`          | 502  | Gemini API falló                          |
| `INE_EXTRACTION_FAILED` | 502  | Servicio de extracción de INE falló       |

---

## Conceptos Clave

### ID de Solicitud

Cada solicitud obtiene un ID único para debugging:

```
req-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
```

Usa esto para buscar en logs cuando estés debuggeando.

### asyncHandler

Middleware que captura todos los errores lanzados en controllers:

```typescript
export const controller = asyncHandler(async (req, res) => {
  // Cualquier error lanzado aquí es capturado automáticamente
  throw new BadRequestError("Error", "CODE");
});
```

### Global Error Handler

Middleware que captura todos los errores y formatea respuestas:

```json
{
  "error": "Mensaje legible para humanos",
  "code": "CODIGO_LEGIBLE_POR_MAQUINA",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Lista de Verificación de Manejo de Errores

Al implementar una característica, asegúrate de:

- ✅ Todos los controllers están envueltos en `asyncHandler`
- ✅ Entrada inválida lanza `BadRequestError` con código específico
- ✅ Recursos faltantes lanzan `NotFoundError`
- ✅ Llamadas a API externa lanzan `ExternalServiceError` en fallo
- ✅ Errores inesperados son capturados y registrados
- ✅ Mensajes de error son amigables para el usuario
- ✅ Códigos de error coinciden con estándares documentados

---

## Próximos Pasos

- **¿Nuevo en manejo de errores?** Comienza con el [Tutorial](./01-tutorial.md)
- **¿Resolviendo un problema específico?** Ver [Guías Prácticas](./02-how-to-guides.md)
- **¿Buscando detalles?** Consulta la [Referencia](./03-reference.md)
- **¿Quieres entender el porqué?** Lee la [Explicación](./04-explanation.md)

---

## Recursos

- [Fuente: Clases de Error](../../src/errors/)
- [Fuente: Global Error Handler](../../src/middlewares/errorHandler.middlewares.ts)
- [Fuente: asyncHandler](../../src/utils/asyncHandler.utils.ts)
- [Documentación de Arquitectura](../architecture.md)
