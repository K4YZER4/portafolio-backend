<div align="left">
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver al Inicio"/>
  </a>
</div>

<div align="right">
  <a href="../../en/ine-validation/README.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>

# Validación de INE

Entiende cómo funciona la validación de INE (ID Mexicana) en RellenadorContratos.

---

**Navegación:** Inicio › Docs › Validación de INE

---

## Resumen

El sistema de validación de INE asegura que:

- ✅ Solo documentos INE Mexicanos válidos sean procesados
- ✅ Calidad de imagen sea suficiente para extracción de datos
- ✅ Todos los campos de datos críticos sean legibles
- ✅ Documentos inválidos sean rechazados temprano (antes de llamadas a API caras)
- ✅ Usuarios reciban feedback claro sobre por qué su documento fue rechazado

---

## Cómo Funciona

### La Validación en Tres Pasos

```
1. Usuario carga imagen de INE
   ↓
2. Validar calidad de documento ANTES de extracción
   - ¿Es una INE Mexicana?
   - ¿Calidad de imagen es suficiente?
   - ¿Son campos críticos legibles?
   ↓
3. Si es válido → Extraer datos usando Gemini
   ↓
4. Si no es válido → Devolver error INVALID_DOCUMENT
```

### ¿Por Qué Este Orden?

- **Validar primero:** Llamadas a API caras solo para documentos válidos
- **Ahorrar recursos:** Rechazar imágenes malas en milisegundos, no segundos
- **Mejor UX:** Usuarios saben inmediatamente si su imagen no funcionará
- **Feedback claro:** "Documento no válido" en lugar de errores de extracción

---

## El Prompt de Gemini

El sistema usa un prompt especializado de Gemini que valida ANTES de extraer:

```
Valida esta imagen de INE Mexicana (tarjeta de ID):
1. ¿Es una INE Mexicana? (Si no, responde: INVALID_DOCUMENT)
2. ¿Calidad de imagen es suficiente? (Si no, responde: INVALID_DOCUMENT)
3. ¿Son todos los campos de datos críticos legibles? (Si no, responde: INVALID_DOCUMENT)
Si todos los checks pasan, responde: VALID
```

**Respuestas:**

- `INVALID_DOCUMENT` → Algo está mal con el documento o imagen
- `VALID` → Documento es válido, proceder con extracción

---

## Manejo de Errores

### Respuesta de Documento Inválido

```typescript
// Backend recibe "INVALID_DOCUMENT" de Gemini
if (response.includes("INVALID_DOCUMENT")) {
  throw new BadRequestError(
    "Documento no es una INE Mexicana válida o calidad es muy baja",
    "INVALID_DOCUMENT"
  );
}
```

### Respuesta del Cliente (400)

```json
{
  "error": "Documento no es una INE Mexicana válida o calidad es muy baja",
  "code": "INVALID_DOCUMENT",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

### Manejo en Frontend

```typescript
switch (error.code) {
  case "INVALID_DOCUMENT":
    showError("Por favor carga una foto clara de tu tarjeta de INE Mexicana");
    showTips([
      "Asegúrate de que toda la tarjeta sea visible",
      "Asegura buena iluminación",
      "Evita sombras y reflejos",
      "Mantén la tarjeta recta",
    ]);
    break;
}
```

---

## Lista de Verificación de Validación para Usuarios

El sistema verifica si tu INE cumple estos requisitos:

✅ **¿Es una INE Mexicana?**

- Debe ser ID oficial del gobierno Mexicano
- Documentos extranjeros no funcionarán
- INEs expiradas pueden no funcionar

✅ **¿Calidad de imagen es buena?**

- Sin desenfoque
- Buena iluminación (no muy oscura ni brillante)
- Sin sombras ni reflejos
- Toda la tarjeta debe ser visible

✅ **¿Son campos críticos legibles?**

- Foto debe ser clara
- Nombre debe ser legible
- CURP debe ser legible
- Fechas de validez deben ser legibles

---

## Detalles de Implementación

### Ubicaciones de Archivos

**Lógica de Validación de INE:**

- `src/clients/extraerDatos.clients.ts` — Extracción principal de INE con validación
- `src/clients/extraerDatosNomina.clients.ts` — Extracción de nómina con validación
- `src/clients/extraerDatosEstadoCuenta.clients.ts` — Extracción de estado de cuenta con validación

**Integración de API:**

- Google Generative AI (Gemini) maneja validación y extracción

### Patrón de Código

```typescript
import { genAI } from "./gemini"; // Google Generative AI

export const extractINEData = async (imageBuffer: Buffer) => {
  const response = await genAI.models.generateContent({
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: "image/png",
            },
          },
          {
            text: `Valida esta imagen de INE Mexicana (tarjeta de ID):
1. ¿Es una INE Mexicana? (Si no, responde: INVALID_DOCUMENT)
2. ¿Calidad de imagen es suficiente? (Si no, responde: INVALID_DOCUMENT)
3. ¿Son todos los campos de datos críticos legibles? (Si no, responde: INVALID_DOCUMENT)
Si todos los checks pasan, responde: VALID`,
          },
        ],
      },
    ],
  });

  const result = response.response.text();

  // Verificar resultado de validación
  if (result.includes("INVALID_DOCUMENT")) {
    throw new BadRequestError("Documento no es válido o calidad es muy baja", "INVALID_DOCUMENT");
  }

  // Si es válido, proceder con extracción
  return parseINEResponse(result);
};
```

---

## Documentos Relacionados

- [Documentación de Manejo de Errores](../error-handling/README.md) — Cómo se manejan errores INVALID_DOCUMENT
- [Referencia de API](../api.md) — Endpoints de INE y respuestas de error
- [Arquitectura](../architecture.md) — Diseño del sistema y flujo de datos

---

## Problemas Comunes y Soluciones

### Problema: "Documento no es válido"

**Posibles causas:**

- Imagen está demasiado borrosa
- Tarjeta está parcialmente cortada
- Iluminación es pobre (muy oscura o brillante)
- Tarjeta está en ángulo

**Solución:**

- Toma una foto nueva con buena iluminación
- Asegúrate de que toda la tarjeta sea visible
- Mantén la tarjeta recta y paralela a la cámara
- Evita sombras y reflejos

### Problema: "Calidad es muy baja"

**Posibles causas:**

- Foto está desenfocada
- Resolución es muy baja
- Reflejo en la tarjeta
- Foto tomada desde ángulo extraño

**Solución:**

- Usa cámara de alta resolución (cámara de smartphone está bien)
- Enfoca claramente en tarjeta antes de tomar foto
- Elimina reflejos ajustando iluminación
- Toma foto recta, no en ángulo

### Problema: "Campos críticos no son legibles"

**Posibles causas:**

- Calidad de foto es pobre
- Tarjeta está dañada/desgastada
- Nombre o CURP es difícil de leer
- Campos de fecha no son claros

**Solución:**

- Toma foto más clara con mejor iluminación
- Si tarjeta está dañada/descolorida, puede no funcionar (tarjeta muy vieja)
- Zoom en para asegurarte de que todo texto es claro

---

## Notas de Rendimiento

- **Validación + Extracción:** ~3-5 segundos por imagen
- **Llamadas a API:** 1 llamada a Gemini (valida + extrae)
- **Costo:** Mínimo (usa tier gratis de Google Generative AI)
- **Timeout:** 30 segundos por solicitud

---

## Mejoras Futuras

Mejoras potenciales a validación de INE:

1. **Prompts multiidioma** — Validar en español/inglés automáticamente
2. **Checks de calidad avanzados** — Detectar tipo de documento antes de validación
3. **Procesamiento por lotes** — Validar múltiples documentos simultáneamente
4. **Caché** — Cachear resultados de validación para imágenes idénticas
5. **Logging** — Rastrear por qué documentos fallan validación

---

## Próximos Pasos

- Aprende [cómo se manejan errores](../error-handling/README.md)
- Ve [referencia de API](../api.md) para endpoints de INE
- Consulta [arquitectura del sistema](../architecture.md)
