<div align="left">
  <a href="../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>

<div align="right">
  <a href="../en/api.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>

# Referencia de API

**Navegación:** Inicio › Docs › Referencia de API

URL Base: `http://localhost:3000`

Todos los cuerpos de solicitud y respuesta son JSON a menos que se indique lo contrario.

---

## Formato de Respuesta

### Respuesta Exitosa

```json
{
  "data": "...",
  "requestId": "req-abc123"
}
```

Todas las respuestas incluyen un header `requestId` para trazabilidad.

**Header:**
```
X-Request-Id: req-abc123
```

### Respuesta de Error

Todos los errores siguen este formato:

```json
{
  "error": "Mensaje legible para humanos",
  "code": "ERROR_CODE",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

**Códigos de Estado HTTP Comunes:**

| Status | Significado | Causa |
|--------|------------|-------|
| `200` | OK | Solicitud exitosa |
| `400` | Bad Request | Validación de entrada falló |
| `401` | Unauthorized | Autenticación requerida |
| `404` | Not Found | Recurso no existe |
| `502` | Bad Gateway | API externa falló |
| `500` | Server Error | Error inesperado |

---

## INE

### `POST /api/ine`

Procesa una foto de INE cargada y devuelve los datos del cliente extraídos.

**Solicitud** — `multipart/form-data`

| Campo   | Tipo   | Descripción                      |
| ------- | ------ | -------------------------------- |
| `image` | `File` | Foto JPG o PNG de la tarjeta INE |

**Respuesta `200`**

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

**Errores**

| Code  | Razón                                                    |
| ----- | -------------------------------------------------------- |
| `400` | No hay imagen cargada o formato no soportado             |
| `400` | Documento no es una INE Mexicana válida                  |
| `400` | Calidad del documento es muy baja para extracción        |
| `500` | Error interno de extracción                              |

**Ejemplo de Error (Documento Inválido):**

```json
{
  "error": "Documento no es una INE Mexicana válida o calidad es muy baja",
  "code": "INVALID_DOCUMENT",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

**Ejemplo de Error (Sin Imagen):**

```json
{
  "error": "No hay imagen proporcionada",
  "code": "NO_IMAGE",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:30:00Z"
}
```

---

## Consultas

### `POST /api/tablas/consultas`

Calcula la tabla de préstamo para un monto neto y plazo dado.

**Solicitud**

```json
{
  "montoNeto": 10000,
  "plazoQuincenas": 48
}
```

| Campo            | Tipo     | Valores permitidos                   |
| ---------------- | -------- | ------------------------------------ |
| `montoNeto`      | `number` | Cualquier número positivo            |
| `plazoQuincenas` | `number` | `24`, `36`, `48`, `72`, `96`, `120`  |

**Respuesta `200`**

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

**Errores**

| Code  | Razón                                              |
| ----- | -------------------------------------------------- |
| `400` | `plazoQuincenas` no está en valores permitidos     |
| `404` | Sin entrada de tabla para monto y plazo indicado   |

**Ejemplo de Error:**

```json
{
  "error": "Valor de plazo inválido",
  "code": "INVALID_PLAZO",
  "requestId": "req-abc456",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:31:00Z"
}
```

---

## PDFs

### `POST /api/pdfs`

Genera un contrato PDF rellenado y devuelve el archivo binario.

**Solicitud**

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

**Respuesta `200`** — `application/pdf` binario

Devuelve el archivo PDF sin procesar listo para descargar.

**Errores**

| Code  | Razón                             |
| ----- | --------------------------------- |
| `400` | Campos requeridos faltantes       |
| `500` | Plantilla PDF no pudo ser rellenada|

**Ejemplo de Error:**

```json
{
  "error": "Campo requerido faltante: nombre1",
  "code": "MISSING_FIELD",
  "requestId": "req-def789",
  "statusCode": 400,
  "timestamp": "2026-05-04T18:32:00Z"
}
```

---

---

## Firma Digital

### `POST /api/contratos/:id/enlaces-firma`

Genera un token de firma para el contrato y envía el link por correo al cliente.

`:id` acepta ID numérico o folio (ej: `C-000001`).

**Solicitud** — Sin body

**Respuesta `201`**

```json
{
  "link": "http://localhost:3000/firmar/uuid-del-token",
  "token": "uuid-del-token",
  "expira": "2026-06-19T07:59:10.000Z"
}
```

**Errores**

| Código | Razón |
|--------|-------|
| `404` | Contrato no encontrado |
| `400` | Contrato no está en estado "POR FIRMAR" |

---

### `GET /api/contratos/:id/pdf`

Sirve el PDF del contrato. Si existe `url_pdf_cloud`, redirige a Cloudinary. Si no, busca en disco local.

**:id:** ID numérico o folio (ej: `C-000001`)

**Respuesta `200`** — `application/pdf` o redirect a Cloudinary

---

### `GET /api/enlaces-firma/:token`

Valida un token de firma y devuelve los datos del contrato para mostrar en la página de firma.

**Solicitud** — Sin body

**Respuesta `200`**

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

**Errores**

| Código | Razón |
|--------|-------|
| `404` | Token no encontrado |
| `400` | Token ya usado |
| `400` | Token expirado |

---

### `POST /api/enlaces-firma/:token/firmas`

Recibe la firma del cliente, la sube a Cloudinary y cambia el estado del contrato a "POR APROBAR".

**Solicitud**

```json
{
  "firmaBase64": "data:image/png;base64,iVBORw0KGgo...",
  "aceptoTerminos": true
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `firmaBase64` | `string` | Imagen PNG en base64 con prefijo `data:image/png;base64,` |
| `aceptoTerminos` | `boolean` | Debe ser `true` |

**Respuesta `200`**

```json
{
  "success": true,
  "message": "Contrato firmado exitosamente"
}
```

**Errores**

| Código | Razón |
|--------|-------|
| `400` | `firmaBase64` no proporcionado |
| `400` | `aceptoTerminos` no es `true` |
| `400` | Formato de firma inválido |
| `400` | Token expirado o ya usado |
| `500` | Trigger `trg_validar_urls_firma` — `url_pdf_cloud` no existe |

---

## Referencia de Códigos de Error

Para documentación completa de manejo de errores y todos los códigos de error posibles, ver [Referencia de Manejo de Errores](./error-handling/03-reference.md)

---

<div align="left">
  <a href="../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>

