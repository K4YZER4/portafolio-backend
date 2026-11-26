<div align="left">
  <a href="../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
        <a href="../es/architecture.md">
                <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
        </a>
</div>

# Architecture

**Navigation:** Home › Docs › Architecture

---

## Project structure

```
PDF-FILLER/
│
├── app.ts                            # Entry point — Express setup, middleware, routes
│
├── src/
│   ├── routes/
│   │   ├── ine.routes.ts             # POST /api/ine
│   │   ├── estadosCuenta.routes.ts   # POST /api/estados-cuenta
│   │   ├── nominas.routes.ts         # POST /api/nominas
│   │   ├── pdfs.routes.ts            # POST /api/pdfs
│   │   ├── tablas.routes.ts          # POST /api/tablas/consultas
│   │   └── index.ts                  # Barrel export
│   │
│   ├── controllers/
│   │   ├── escanearIne.controller.ts        # INE extraction logic
│   │   ├── escanearNomina.controller.ts     # Payroll extraction logic
│   │   ├── escanearEstadoCuenta.controllers.ts # Bank statement extraction logic
│   │   ├── montoQuincena.controllers.ts     # Loan calculation logic
│   │   └── rellenarPdf.controllers.ts       # PDF generation logic
│   │
│   ├── services/
│   │   ├── escanearINE.services.ts          # OCR logic, INE field extraction
│   │   ├── escanearNomina.services.ts       # OCR logic, payroll extraction
│   │   ├── escanearEstadoCuenta.services.ts # OCR logic, statement extraction
│   │   ├── montoQuincena.services.ts        # Table lookup, loan calculation
│   │   ├── rellenarPdf.services.ts          # Field mapping, PDF assembly
│   │   ├── guardarContrato.services.ts      # Contract persistence in DB
│   │   └── cloudUpload.service.ts           # Signature upload to Cloudinary
│   │
│   ├── clients/
│   │   ├── extraerDatos.clients.ts              # Gemini API for INE extraction + validation
│   │   ├── extraerDatosNomina.clients.ts        # Gemini API for payroll extraction
│   │   └── extraerDatosEstadoCuenta.clients.ts  # Gemini API for bank statement extraction
│   │
│   ├── errors/
│   │   ├── AppError.errors.ts          # Base error class
│   │   ├── BadRequestError.errors.ts   # 400 errors
│   │   ├── UnauthorizedError.errors.ts # 401 errors
│   │   ├── NotFoundError.errors.ts     # 404 errors
│   │   ├── ExternalServiceError.errors.ts # 502 errors
│   │   ├── InternalServerError.errors.ts  # 500 errors
│   │   ├── RateLimitError.errors.ts    # 429 errors
│   │   └── index.ts                    # Barrel export
│   │
│   ├── middlewares/
│   │   ├── requestId.middlewares.ts          # Generate unique request ID
│   │   ├── errorHandler.middlewares.ts       # Global error handler
│   │   ├── logger.middlewares.ts             # Request logging
│   │   ├── xssProtector.middlewares.ts       # XSS protection
│   │   ├── multer.ts                         # Multer configuration (upload)
│   │   ├── parseFormDataJson.middlewares.ts  # Parse nested JSON in form-data
│   │   ├── errorHandling/
│   │   │   └── multerErrorHandler.middlewares.ts # Multer error conversion
│   │   └── validation/
│   │       ├── validateImageFile.middlewares.ts
│   │       ├── validateNominas.middlewares.ts
│   │       ├── validateMontoQuincenas.middlewares.ts
│   │       └── validatePDFData.middlewares.ts
│   │
│   ├── logger/
│   │   └── logger.ts                 # Pino logger configuration
│   │
│   ├── utils/
│   │   ├── rellenarPdf.utils.ts         # Low-level pdf-lib field writer
│   │   ├── tablaCargar.utils.ts         # Excel reader, table indexer on startup
│   │   ├── numeroLetras.utils.ts        # Number to Spanish words (no dependencies)
│   │   ├── asyncHandler.utils.ts        # Wrapper to avoid try/catch in controllers
│   │   ├── errorHandling.utils.ts       # Error utility functions
│   │   ├── rateLimit.utils.ts           # Token bucket rate limiter
│   │   ├── validarCurp.utils.ts         # CURP validation against RENAPO
│   │   ├── sanitize.utils.ts            # String sanitization
│   │   ├── xssProtectors.utils.ts       # XSS protection
│   │   ├── fechaMesLetra.utils.ts       # Date formatting
│   │   ├── numQuincena.utils.ts         # Current fortnight calculation
│   │   ├── generarFolio.ts              # Folio generation C-XXXXX
│   │   ├── calcularAnios.ts             # Year diff between dates
│   │   ├── formatearParaClabe.utils.ts  # CLABE formatting
│   │   └── guionEntre3Digitos.utils.ts  # Hyphen formatting
│   │
│   ├── types/
│   │   ├── express.d.ts              # Extend Express Request type
│   │   ├── ine.types.ts              # IneData interface
│   │   ├── tabla.types.ts            # TablaDescuento interface
│   │   ├── nomina.types.ts           # NominaDatos interface
│   │   ├── datosExtra.types.ts       # DatosExtra interface
│   │   ├── estadoCuenta.types.ts     # EstadoCuentaResponse interface
│   │   ├── fecha.types.ts            # Date types
│   │   ├── prismaTransaction.ts      # Prisma transaction type
│   │   ├── pinoRoll.d.ts            # pino-roll type declarations
│   │   └── index.ts                  # Barrel export
│   │
├── public/
│   ├── generador.html                # Frontend — 3-tab form (Client · Amount · Extras)
│   └── generadorWithDefaults.html    # Frontend with default values preset
│
├── scripts/    # Utility / maintenance scripts
│   └── listar_campos.ts   # Prints all named PDF form fields + their type. Run before mapping new fields.
├── contrato.pdf                      # PDF template (not committed)
├── *.xlsx                            # Discount tables (not committed)
└── spa.traineddata                   # Tesseract Spanish model (not committed)
```

---

## Data flow

### INE Extraction Flow

```
User uploads INE photo
        │
        ▼
POST /api/ine
  [validateImageFile middleware] validates image exists and is JPG/PNG
        │
        ▼
  [Controller] calls extractINEData
        │
        ▼
  [Service] calls Gemini API with:
    1. Image validation prompt (is valid INE? quality OK? fields legible?)
    2. If INVALID_DOCUMENT → throw BadRequestError
    3. If VALID → extract data (names, CURP, address, etc.)
        │
        ▼
  [Response] returns IneData JSON
        │
        ▼
(frontend auto-fills Client tab fields)
```

### Loan Calculation Flow

```
User inputs montoNeto + plazoQuincenas
        │
        ▼
POST /api/tablas/consultas
  [Controller] validates inputs
  [Service] looks up pre-indexed Excel table
        │
        ▼
  [Response] returns:
    - descuentoQuincenal
    - montoPagare
    - tasaMensual
    - cat
    - etc.
        │
        ▼
(frontend shows loan results)
```

### PDF Generation Flow

```
User fills Extras tab → clicks "Generar Contrato PDF"
        │
        ▼
POST /api/pdfs
  [validatePDFData middleware] validates all required fields
        │
        ▼
  [Controller] calls rellenar_pdf service
        │
        ▼
  [Service] maps:
    - IneData + TablaDescuento + DatosExtra
    - to PDF template named form fields
    - Calls numero_letras for amount to Spanish words
    - Calls rellenar_pdf.utils to write fields via pdf-lib
        │
        ▼
  [Response] returns PDF binary
        │
        ▼
(browser downloads the file)
```

---

## Validation Pipeline

The system validates data at multiple points:

```
Request arrives
        │
        ▼
[requestIdMiddleware] generates unique ID
        │
        ▼
[loggerMiddleware] logs request
        │
        ▼
[Route-specific validation middleware]
  ├─ [validateImageFile] for INE uploads
  ├─ [multerErrorHandler] converts Multer errors
  ├─ [validatePDFData] for PDF generation
  └─ etc.
        │
        ▼
[Controller] receives validated data
        │
        ▼
[Service] processes data or calls external APIs
        │
        ▼
[Response] sent to client
```

---

## Key design decisions

**Express static serving** — The frontend HTML is served via `express.static('public')`. No separate frontend server or CORS issues — everything on `localhost:3000`.

**Excel as data source** — Discount tables come from an official `.xlsx` file. `tabla_cargar.utils.ts` reads and indexes it on server startup so lookups are O(1) at runtime.

**PDF field mapping** — The contract PDF has named form fields. The service maps TypeScript interface properties to those field names. Unknown fields are warned and skipped — no hard crash.

**Number to words** — Amount in words (e.g. `DIEZ MIL PESOS 00/100 M.N.`) is generated by a custom zero-dependency utility covering amounts up to millions.

**Gemini for Document Validation** — INE documents are validated BEFORE extraction to save API quota. Bad images/documents are rejected early with clear error codes.

---

## Error Handling & Logging System

All errors flow through a **global error handling pipeline** that ensures consistency, traceability, and proper logging.

**For complete documentation:** [Error Handling Guide](./error-handling/)

### How it works

1. **Controller throws error** — Developers throw specific error types (BadRequest, NotFound, etc.)
2. **asyncHandler catches it** — Wrapper automatically catches async errors
3. **Express routes to errorHandler** — Special 4-parameter middleware
4. **Logger writes to file** — Pino saves error with `requestId` to `logs/error-YYYY-MM-DD.log`
5. **Client receives consistent JSON** — Error message + code + requestId + timestamp

### Request lifecycle with error handling

```
Client Request
    ↓
[requestIdMiddleware] generates req.id = "req-abc123"
    ↓
[loggerMiddleware] attaches logger to req
    ↓
[Validation middlewares] check input format, file types, etc.
    ├─ If validation fails: throw BadRequestError
    ├─ If file too large: throw BadRequestError
    └─ Next middleware/controller
    ↓
[Controller] validates business logic, calls services
    ├─ If error: throw new BadRequestError(...)
    ├─ If not found: throw new NotFoundError(...)
    ├─ If API fails: throw new ExternalServiceError(...)
    └─ If unexpected: throw new InternalServerError(...)
    ↓
[asyncHandler] catches thrown error
    ↓
[Express] recognizes errorHandler (4 params)
    ↓
[errorHandler] logs to file + responds to client
    ├─ logger.error() writes to logs/error-2026-05-04.log
    └─ res.json() sends error response with requestId
    ↓
Client receives error response
```

### Error response format

All errors return this JSON structure:

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

**Example (Invalid Document):**

```json
{
  "error": "Document is not a valid Mexican INE or quality is too low",
  "code": "INVALID_DOCUMENT",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

### Error types available

| Class                  | HTTP | Use when                    |
| ---------------------- | ---- | --------------------------- |
| `BadRequestError`      | 400  | User input validation fails |
| `UnauthorizedError`    | 401  | Authentication check fails  |
| `NotFoundError`        | 404  | Resource doesn't exist      |
| `ExternalServiceError` | 502  | External API fails          |
| `InternalServerError`  | 500  | Unexpected bug occurs       |
| `RateLimitError`       | 429  | Rate limit exceeded         |

### Logging

- **Development:** Errors show in terminal (pretty printed) + written to file
- **Production:** Errors written to file only (JSON format for parsing)
- **File location:** `logs/error-YYYY-MM-DD.log` (auto-rotates daily, deletes after 7 days)
- **Traceability:** Every error includes `requestId` so you can trace the full request path

---

## Related Documentation

- [Error Handling Guide](./error-handling/) — Complete error handling documentation
- [API Reference](./api.md) — All endpoints and responses
- [Setup & Running](./setup.md) — Installation and configuration
