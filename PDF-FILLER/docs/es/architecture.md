<div align="left">
  <a href="../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver al Inicio"/>
  </a>
</div>

<div align="right">
        <a href="../en/architecture.md">
                <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
        </a>
</div>

# Arquitectura

**Navegación:** Inicio › Docs › Arquitectura

---

## Estructura del proyecto

```
PDF-FILLER/
│
├── app.ts                            # Punto de entrada — Setup de Express, middlewares, rutas
│
├── src/
│   ├── routes/
│   │   ├── ine.routes.ts             # POST /api/ine
│   │   ├── estadosCuenta.routes.ts   # POST /api/estados-cuenta
│   │   ├── nominas.routes.ts         # POST /api/nominas
│   │   ├── pdfs.routes.ts            # POST /api/pdfs
│   │   ├── tablas.routes.ts          # POST /api/tablas/consultas
│   │   ├── firma.routes.ts           # GET/POST /api/contratos/:id/pdf|enlaces-firma, /api/enlaces-firma/:token
│   │   └── index.ts                  # Barrel export
│   │
│   ├── controllers/
│   │   ├── escanearIne.controller.ts        # Lógica de extracción de INE
│   │   ├── escanearNomina.controller.ts     # Lógica de extracción de nómina
│   │   ├── escanearEstadoCuenta.controllers.ts # Lógica de extracción de estado de cuenta
│   │   ├── montoQuincena.controllers.ts     # Lógica de cálculo de crédito
│   │   ├── rellenarPdf.controllers.ts       # Lógica de generación de PDF + subida Cloudinary
│   │   └── firma.controllers.ts             # Lógica de firma: token, validar, recibir firma, servir PDF
│   │
│   ├── services/
│   │   ├── escanearINE.services.ts          # Lógica de OCR, extracción de INE
│   │   ├── escanearNomina.services.ts       # Lógica de OCR, extracción de nómina
│   │   ├── escanearEstadoCuenta.services.ts # Lógica de OCR, extracción de estado de cuenta
│   │   ├── montoQuincena.services.ts        # Búsqueda de tabla, cálculo de crédito
│   │   ├── rellenarPdf.services.ts          # Mapeo de campos, ensamble de PDF
│   │   ├── guardarContrato.services.ts      # Persistencia de contrato en DB
│   │   ├── cloudUpload.service.ts           # Subida de firma/PDF a Cloudinary (firmas/{folio}.png, contratos/{folio}.pdf)
│   │   ├── tokenFirma.service.ts            # Generación/validación de tokens de firma
│   │   └── email.service.ts                 # Envío de correos SendGrid
│   │
│   ├── clients/
│   │   ├── extraerDatos.clients.ts              # API de Gemini para extracción y validación de INE
│   │   ├── extraerDatosNomina.clients.ts        # API de Gemini para extracción de nómina
│   │   └── extraerDatosEstadoCuenta.clients.ts  # API de Gemini para extracción de estado de cuenta
│   │
│   ├── errors/
│   │   ├── AppError.errors.ts          # Clase de error base
│   │   ├── BadRequestError.errors.ts   # Errores 400
│   │   ├── UnauthorizedError.errors.ts # Errores 401
│   │   ├── NotFoundError.errors.ts     # Errores 404
│   │   ├── ExternalServiceError.errors.ts # Errores 502
│   │   ├── InternalServerError.errors.ts  # Errores 500
│   │   ├── RateLimitError.errors.ts    # Errores 429
│   │   └── index.ts                    # Barrel export
│   │
│   ├── middlewares/
│   │   ├── requestId.middlewares.ts          # Genera ID único de solicitud
│   │   ├── errorHandler.middlewares.ts       # Manejador de errores global
│   │   ├── logger.middlewares.ts             # Logging de solicitudes
│   │   ├── xssProtector.middlewares.ts       # Protección XSS
│   │   ├── multer.ts                         # Configuración de Multer (upload)
│   │   ├── parseFormDataJson.middlewares.ts  # Parsea JSON anidado en form-data
│   │   ├── errorHandling/
│   │   │   └── multerErrorHandler.middlewares.ts # Conversión de errores de Multer
│   │   └── validation/
│   │       ├── validateImageFile.middlewares.ts
│   │       ├── validateNominas.middlewares.ts
│   │       ├── validateMontoQuincenas.middlewares.ts
│   │       └── validatePDFData.middlewares.ts
│   │
│   ├── logger/
│   │   └── logger.ts                 # Configuración de logger Pino
│   │
│   ├── utils/
│   │   ├── rellenarPdf.utils.ts         # Escritor de campos pdf-lib de bajo nivel
│   │   ├── tablaCargar.utils.ts         # Lector de Excel, indexador de tabla en inicio
│   │   ├── numeroLetras.utils.ts        # Número a palabras en español (sin dependencias)
│   │   ├── asyncHandler.utils.ts        # Wrapper para evitar try/catch en controllers
│   │   ├── errorHandling.utils.ts       # Funciones de utilidad de error
│   │   ├── rateLimit.utils.ts           # Limitador de tasa token bucket
│   │   ├── validarCurp.utils.ts         # Validación de CURP contra RENAPO
│   │   ├── sanitize.utils.ts            # Sanitización de strings
│   │   ├── xssProtectors.utils.ts       # Protección XSS
│   │   ├── fechaMesLetra.utils.ts       # Formateo de fechas
│   │   ├── numQuincena.utils.ts         # Cálculo de quincena actual
│   │   ├── generarFolio.ts              # Generación de folio C-XXXXX
│   │   ├── calcularAnios.ts             # Cálculo de años entre fechas
│   │   ├── formatearParaClabe.utils.ts  # Formateo de CLABE
│   │   └── guionEntre3Digitos.utils.ts  # Formateo con guiones
│   │
│   ├── types/
│   │   ├── express.d.ts              # Extiende tipo Express Request
│   │   ├── ine.types.ts              # Interfaz IneData
│   │   ├── tabla.types.ts            # Interfaz TablaDescuento
│   │   ├── nomina.types.ts           # Interfaz NominaDatos
│   │   ├── datosExtra.types.ts       # Interfaz DatosExtra
│   │   ├── estadoCuenta.types.ts     # Interfaz EstadoCuentaResponse
│   │   ├── fecha.types.ts            # Tipos de fecha
│   │   ├── prismaTransaction.ts      # Tipo de transacción de Prisma
│   │   ├── pinoRoll.d.ts            # Declaración de tipos para pino-roll
│   │   └── index.ts                  # Barrel export
│   │
├── public/
│   ├── generador.html                # Frontend — Formulario de 3 pestañas (Cliente · Monto · Extras)
│   └── generadorWithDefaults.html    # Frontend con valores por defecto
│
├── scripts/    # Scripts de utilidad / mantenimiento
│   └── listar_campos.ts   # Imprime todos los campos de formulario PDF nombrados + su tipo. Ejecutar antes de mapear nuevos campos.
├── contrato.pdf                      # Plantilla PDF (no comprometida)
├── *.xlsx                            # Tablas de descuento (no comprometidas)
└── spa.traineddata                   # Modelo español de Tesseract (no comprometido)
```

---

## Flujo de datos

### Flujo de Extracción de INE

```
Usuario carga foto de INE
        │
        ▼
POST /api/ine
  [middleware validateImageFile] valida que existe imagen y es JPG/PNG
        │
        ▼
  [Controller] llama a extractINEData
        │
        ▼
  [Service] llama a API de Gemini con:
    1. Prompt de validación de imagen (¿es INE válida? ¿calidad OK? ¿campos legibles?)
    2. Si INVALID_DOCUMENT → lanza BadRequestError
    3. Si VALID → extrae datos (nombres, CURP, domicilio, etc.)
        │
        ▼
  [Response] devuelve JSON IneData
        │
        ▼
(frontend auto-rellena campos de pestaña Cliente)
```

### Flujo de Cálculo de Crédito

```
Usuario ingresa montoNeto + plazoQuincenas
        │
        ▼
POST /api/tablas/consultas
  [Controller] valida entradas
  [Service] busca tabla de Excel pre-indexada
        │
        ▼
  [Response] devuelve:
    - descuentoQuincenal
    - montoPagare
    - tasaMensual
    - cat
    - etc.
        │
        ▼
(frontend muestra resultados de crédito)
```

### Flujo de Generación de PDF

```
Usuario rellena pestaña Extras → hace clic "Generar Contrato PDF"
        │
        ▼
POST /api/pdfs (multipart: data + file firma)
  [middleware validatePDFData] valida todos los campos requeridos
        │
        ▼
  [Controller] genera PDF con generarContrato(contrato, firmaImage)
        │
        ▼
  [Response] devuelve PDF binario inmediatamente
        │
        ▼
  [Post-response] (async):
    ├─ guardarContrato() → DB (estado: POR FIRMAR)
    ├─ uploadPDF(pdfBuffer, folio) → Cloudinary (contratos/{folio}.pdf)
    ├─ uploadFirmaImage(firmaImage, folio) → Cloudinary (firmas/{folio}.png) [si hay firma]
    └─ UPDATE contrato_prestamo SET url_pdf_cloud, url_firma_cloud
```

### Flujo de Firma Digital

```
Asesor genera enlace:
POST /api/contratos/:id/enlaces-firma
  ├─ generarToken(idContrato) → UUID + expira 12h
  ├─ INSERT token_firma
  ├─ enviarLinkFirma(cliente.email, link, folio) → SendGrid
  └─ Response: { link, token, expira }

Cliente firma:
POST /api/enlaces-firma/:token/firmas
  ├─ validarToken(token) → { idContrato, folio, curp, ... }
  ├─ Validar firmaBase64 + aceptoTerminos
  ├─ Decodificar → buffer
  ├─ uploadFirmaImage(buffer, folio) → Cloudinary (firmas/{folio}.png)
  └─ TRANSACCIÓN:
      ├─ UPDATE contrato SET url_firma_cloud, estado = POR APROBAR, fecha_firma = now
      │    └─ TRIGGER trg_validar_urls_firma: valida cloud URLs no NULL
      ├─ UPDATE cliente SET url_firma_svg
      ├─ UPDATE token_firma SET usado = true
      └─ INSERT historial_credito

Servir PDF:
GET /api/contratos/:id/pdf
  ├─ ¿url_pdf_cloud existe? → redirect a Cloudinary
  └─ ¿No? → servir desde disco local (/pdfs/{folio}.pdf)
```

---

## Tubería de Validación

El sistema valida datos en múltiples puntos:

```
Solicitud llega
        │
        ▼
[requestIdMiddleware] genera ID único
        │
        ▼
[loggerMiddleware] registra solicitud
        │
        ▼
[Middleware de validación específico de ruta]
  ├─ [validateImageFile] para cargas de INE
  ├─ [multerErrorHandler] convierte errores de Multer
  ├─ [validatePDFData] para generación de PDF
  └─ etc.
        │
        ▼
[Controller] recibe datos validados
        │
        ▼
[Service] procesa datos o llama a APIs externas
        │
        ▼
[Response] enviada al cliente
```

---

## Decisiones de diseño clave

**Servicio estático de Express** — El HTML del frontend se sirve vía `express.static('public')`. Sin servidor frontend separado ni problemas de CORS — todo en `localhost:3000`.

**Excel como fuente de datos** — Las tablas de descuento provienen de un archivo `.xlsx` oficial. `tabla_cargar.utils.ts` lo lee e indexa en inicio del servidor para búsquedas O(1) en tiempo de ejecución.

**Mapeo de campos PDF** — El PDF de contrato tiene campos de formulario nombrados. El servicio mapea propiedades de interfaz TypeScript a esos nombres de campo. Campos desconocidos se advierten y se saltan — sin crash duro.

**Número a palabras** — Cantidad en palabras (ej. `DIEZ MIL PESOS 00/100 M.N.`) se genera por una utilidad personalizada sin dependencias que cubre cantidades hasta millones.

**Gemini para Validación de Documentos** — Documentos INE se validan ANTES de extracción para ahorrar cuota de API. Imágenes/documentos malos se rechazan temprano con códigos de error claros.

**Cloudinary para almacenamiento** — Las firmas y PDFs se almacenan en Cloudinary en carpetas separadas: `firmas/{folio}.png` y `contratos/{folio}.pdf`. No se guardan en disco local, lo que permite escalar horizontalmente sin perder archivos. En desarrollo se puede caer a disco local como fallback.

**Token de firma con expiración** — Cada enlace de firma tiene un UUID único que expira a las 12 horas (trigger a nivel BD). Un token solo puede usarse una vez. Al cambiar el estado del contrato, un trigger BD valida que las URLs de Cloudinary existan.

**Búsqueda case-insensitive** — Las descripciones de estado de contrato se comparan con `LOWER()` para evitar errores por mayúsculas/minúsculas entre seed y código.

---

## Sistema de Manejo de Errores y Logging

Todos los errores fluyen a través de una **tubería de manejo de errores global** que asegura consistencia, trazabilidad y logging apropiado.

**Para documentación completa:** [Guía de Manejo de Errores](./error-handling/)

### Cómo funciona

1. **Controller lanza error** — Desarrolladores lanzan tipos de error específicos (BadRequest, NotFound, etc.)
2. **asyncHandler lo captura** — Wrapper captura automáticamente errores async
3. **Express rutas a errorHandler** — Middleware especial de 4 parámetros
4. **Logger escribe a archivo** — Pino guarda error con `requestId` a `logs/error-YYYY-MM-DD.log`
5. **Cliente recibe JSON consistente** — Mensaje de error + código + requestId + timestamp

### Ciclo de vida de solicitud con manejo de errores

```
Solicitud del Cliente
    ↓
[requestIdMiddleware] genera req.id = "req-abc123"
    ↓
[loggerMiddleware] adjunta logger a req
    ↓
[Middlewares de validación] verifican formato de entrada, tipos de archivo, etc.
    ├─ Si validación falla: lanza BadRequestError
    ├─ Si archivo demasiado grande: lanza BadRequestError
    └─ Siguiente middleware/controller
    ↓
[Controller] valida lógica de negocio, llama a servicios
    ├─ Si error: lanza new BadRequestError(...)
    ├─ Si no encontrado: lanza new NotFoundError(...)
    ├─ Si API falla: lanza new ExternalServiceError(...)
    └─ Si inesperado: lanza new InternalServerError(...)
    ↓
[asyncHandler] captura error lanzado
    ↓
[Express] reconoce errorHandler (4 parámetros)
    ↓
[errorHandler] registra a archivo + responde al cliente
    ├─ logger.error() escribe a logs/error-2026-05-04.log
    └─ res.json() envía respuesta de error con requestId
    ↓
Cliente recibe respuesta de error
```

### Formato de respuesta de error

Todos los errores devuelven esta estructura JSON:

```json
{
  "error": "Mensaje legible para humanos",
  "code": "ERROR_CODE",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

**Ejemplo (Documento Inválido):**

```json
{
  "error": "Documento no es una INE Mexicana válida o calidad es muy baja",
  "code": "INVALID_DOCUMENT",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

### Tipos de error disponibles

| Clase                  | HTTP | Usar cuando                            |
| ---------------------- | ---- | -------------------------------------- |
| `BadRequestError`      | 400  | Validación de entrada de usuario falla |
| `UnauthorizedError`    | 401  | Verificación de autenticación falla    |
| `NotFoundError`        | 404  | Recurso no existe                      |
| `ExternalServiceError` | 502  | API externa falla                      |
| `InternalServerError`  | 500  | Ocurre bug inesperado                  |
| `RateLimitError`       | 429  | Límite de velocidad excedido           |

### Logging

- **Desarrollo:** Errores se muestran en terminal (pretty printed) + escritos a archivo
- **Producción:** Errores escritos a archivo solamente (formato JSON para parsing)
- **Ubicación de archivo:** `logs/error-YYYY-MM-DD.log` (auto-rotación diaria, elimina después de 7 días)
- **Trazabilidad:** Cada error incluye `requestId` para rastrear la ruta de solicitud completa

---

## Documentación Relacionada

- [Guía de Manejo de Errores](./error-handling/) — Documentación completa de manejo de errores
- [Referencia de API](./api.md) — Todos los endpoints y respuestas
- [Instalación y Ejecución](./setup.md) — Instalación y configuración
