<div align="left">
  <a href="../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
  <a href="../es/api.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>

# API Reference

**Breadcrumb:** Home › Docs › API Reference

---

# API Reference

Base URL: `http://localhost:3000`

All request and response bodies are JSON unless noted otherwise.

---

## Response Format

### Success Response

```json
{
  "data": "...",
  "requestId": "req-abc123"
}
```

All responses include a `requestId` header for traceability.

**Header:**

```
X-Request-Id: req-abc123
```

### Error Response

All errors follow this format:

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

**Common HTTP Status Codes:**

| Status | Meaning      | Cause                   |
| ------ | ------------ | ----------------------- |
| `200`  | OK           | Request succeeded       |
| `400`  | Bad Request  | Input validation failed |
| `401`  | Unauthorized | Authentication required |
| `404`  | Not Found    | Resource doesn't exist  |
| `502`  | Bad Gateway  | External API failed     |
| `500`  | Server Error | Unexpected error        |

---

## INE

### `POST /api/ine`

Processes an uploaded INE photo and returns the extracted client data.

**Request** — `multipart/form-data`

| Field   | Type   | Description                      |
| ------- | ------ | -------------------------------- |
| `image` | `File` | JPG or PNG photo of the INE card |

**Response `200`**

```json
{
  "nombre1": "string",
  "nombre2": "string",
  "apellidoPaterno": "string",
  "apellidoMaterno": "string",
  "sexo": "string",
  "fechaNac": "string",
  "curp": "string",
  "claveElector": "string",
  "domicilio": {
    "calle": "string",
    "numeroCasa": "string",
    "colonia": "string",
    "codigoPostal": "string",
    "municipio": "string",
    "estado": "string"
  },
  "seccion": "string",
  "vigencia": "string",
  "numEmision": "string"
}
```

**Errors**

| Code  | Reason                                     |
| ----- | ------------------------------------------ |
| `400` | No image uploaded or unsupported format    |
| `400` | Document is not a valid Mexican INE        |
| `400` | Document quality is too low for extraction |
| `500` | Internal extraction error                  |

**Error Example (Invalid Document):**

```json
{
  "error": "Document is not a valid Mexican INE or quality is too low",
  "code": "INVALID_DOCUMENT",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

**Error Example (No Image):**

```json
{
  "error": "No image provided",
  "code": "NO_IMAGE",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

---

## Consultas

### `POST /api/tablas/consultas`

Calculates the loan table for a given net amount and term.

**Request**

```json
{
  "montoNeto": 10000,
  "plazoQuincenas": 48
}
```

| Field            | Type     | Allowed values                      |
| ---------------- | -------- | ----------------------------------- |
| `montoNeto`      | `number` | Any positive number                 |
| `plazoQuincenas` | `number` | `24`, `36`, `48`, `72`, `96`, `120` |

**Response `200`**

```json
{
  "montoNeto": "number",
  "montoPagare": "number",
  "descuentoQuincenal": "number",
  "plazoQuincenas": "number",
  "plazoMeses": "number",
  "tasaMensual": "number",
  "tasaAnual": "number",
  "importeInteres": "number",
  "cat": "number"
}
```

**Errors**

| Code  | Reason                                       |
| ----- | -------------------------------------------- |
| `400` | `plazoQuincenas` not in allowed values       |
| `404` | No table entry for the given amount and term |

**Error Example:**

```json
{
  "error": "Invalid plazo value",
  "code": "INVALID_PLAZO",
  "requestId": "req-abc456",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:31:00Z"
}
```

---

## PDFs

### `POST /api/pdfs`

Generates a filled PDF contract and returns the binary file.

**Request**

```json
{
  "ine": {
    "nombre1": "string",
    "nombre2": "string",
    "apellidoPaterno": "string",
    "apellidoMaterno": "string",
    "curp": "string",
    "sexo": "string",
    "fechaNac": "string",
    "claveElector": "string",
    "domicilio": {
      "calle": "string",
      "numeroCasa": "string",
      "colonia": "string",
      "codigoPostal": "string",
      "municipio": "string",
      "estado": "string"
    }
  },
  "tabla": {
    "montoNeto": "number",
    "montoPagare": "number",
    "descuentoQuincenal": "number",
    "plazoQuincenas": "number",
    "tasaMensual": "number",
    "importeInteres": "number"
  },
  "extra": {
    "folio": "string",
    "rfc": "string",
    "telefonoCelular": "string",
    "telefonoCasa": "string",
    "mail": "string",
    "ingresoMensual": "string",
    "dependencia": "string",
    "empleado": "string",
    "departamento": "string",
    "puesto": "string",
    "mesesAntiguedad": "string",
    "añosAntiguedad": "string",
    "referencia1": "string",
    "telefonoReferencia1": "string",
    "referencia2": "string",
    "telefonoReferencia2": "string",
    "referencia3": "string",
    "telefonoReferencia3": "string",
    "banco": "string",
    "numeroCuenta": "string",
    "clabe": "string",
    "lugarFecha": "string",
    "vendedor": "string",
    "estadoCivil": "string"
  }
}
```

**Response `200`** — `application/pdf` binary

Returns the raw PDF file ready to download.

**Errors**

| Code  | Reason                           |
| ----- | -------------------------------- |
| `400` | Missing required fields          |
| `500` | PDF template could not be filled |

**Error Example:**

```json
{
  "error": "Missing required field: nombre1",
  "code": "MISSING_FIELD",
  "requestId": "req-def789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:32:00Z"
}
```

---

## Digital Signature

### `POST /api/contratos/:id/enlaces-firma`

Generates a signature token for the contract and sends the link via email.

`:id` accepts numeric ID or folio (e.g. `C-000001`).

**Request** — No body

**Response `201`**

```json
{
  "link": "http://localhost:3000/firmar/uuid-token",
  "token": "uuid-token",
  "expira": "2026-06-19T07:59:10.000Z"
}
```

**Errors**

| Code  | Reason                                  |
|-------|-----------------------------------------|
| `404` | Contract not found                      |
| `400` | Contract is not in "POR FIRMAR" state   |

---

### `GET /api/contratos/:id/pdf`

Serves the contract PDF. Redirects to Cloudinary if `url_pdf_cloud` exists, otherwise falls back to local disk.

**:id:** Numeric ID or folio (e.g. `C-000001`)

**Response `200`** — `application/pdf` or Cloudinary redirect

---

### `GET /api/enlaces-firma/:token`

Validates a signature token and returns contract data for the signing page.

**Request** — No body

**Response `200`**

```json
{
  "contrato": {
    "folio": "C-000001",
    "nombre": "JUAN CARLOS PEREZ LOPEZ",
    "curp": "PELJ900101HDFRRN07",
    "importeCredito": "10000",
    "importeTotal": "12000",
    "pagoQuincenal": "500"
  },
  "pdfUrl": "/api/contratos/C-000001/pdf"
}
```

**Errors**

| Code  | Reason             |
|-------|--------------------|
| `404` | Token not found    |
| `400` | Token already used |
| `400` | Token expired      |

---

### `POST /api/enlaces-firma/:token/firmas`

Receives the client's signature, uploads it to Cloudinary, and changes the contract state to "POR APROBAR".

**Request**

```json
{
  "firmaBase64": "data:image/png;base64,iVBORw0KGgo...",
  "aceptoTerminos": true
}
```

| Field | Type | Description |
|---|---|---|
| `firmaBase64` | `string` | PNG image in base64 with `data:image/png;base64,` prefix |
| `aceptoTerminos` | `boolean` | Must be `true` |

**Response `200`**

```json
{
  "success": true,
  "message": "Contract signed successfully"
}
```

**Errors**

| Code  | Reason                                                |
|-------|-------------------------------------------------------|
| `400` | `firmaBase64` not provided                            |
| `400` | `aceptoTerminos` is not `true`                        |
| `400` | Invalid signature format                              |
| `400` | Token expired or already used                         |
| `500` | Trigger `trg_validar_urls_firma` — `url_pdf_cloud` missing |

---

## Error Codes Reference

For complete error handling documentation and all possible error codes, see [Error Handling Reference](./error-handling/03-reference.md)

---

<div align="left">
  <a href="../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>
