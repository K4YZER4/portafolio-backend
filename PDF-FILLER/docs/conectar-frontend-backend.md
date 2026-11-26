# Conexión Frontend → Backend

## 📋 Resumen de Endpoints

| Método | Ruta | Propósito |
|--------|------|-----------|
| `POST` | `/api/pdfs` | Crear contrato + generar PDF |
| `GET` | `/api/contratos/:id/pdf` | Obtener PDF del contrato |
| `POST` | `/api/contratos/:id/enlaces-firma` | Generar token de firma + enviar email |
| `GET` | `/api/enlaces-firma/:token` | Validar token y obtener datos del contrato |
| `POST` | `/api/enlaces-firma/:token/firmas` | Recibir firma del cliente |
| `POST` | `/api/ine` | Escanear INE (OCR) |
| `POST` | `/api/nominas` | Escanear nóminas (OCR) |
| `POST` | `/api/estados-cuenta` | Escanear estado de cuenta (OCR) |
| `POST` | `/api/tablas/consultas` | Consultar tabla de descuento |

---

## 🔧 Configuración

### Variable de entorno `FRONTEND_URL`

El backend usa `FRONTEND_URL` (definida en `.env`) para:

1. **CORS** — Solo permite peticiones desde este origen
2. **Link de firma** — Construye el link que se envía al cliente: `{FRONTEND_URL}/firmar/{token}`

```
FRONTEND_URL=http://localhost:5173
```

### Flujo de CORS

```ts
// app.ts
cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

---

## 1. Crear Contrato (`POST /api/pdfs`)

### Content-Type: `multipart/form-data`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `firmaImage` | file (opcional) | Imagen de la firma del asesor (PNG/JPEG/WEBP, max 10MB) |
| `data` | string (JSON) | JSON string con los datos del contrato |

### Estructura de `data`

```json
{
  "ine": {
    "nombre1": "JUAN",
    "nombre2": "CARLOS",
    "apellidoPaterno": "PÉREZ",
    "apellidoMaterno": "LÓPEZ",
    "curp": "PELJ850101HDFRRN09",
    "sexo": "M",
    "fechaNac": "1985-01-01",
    "domicilio": {
      "calle": "AV. PRINCIPAL",
      "numeroCasa": "123",
      "colonia": "CENTRO",
      "codigoPostal": "80000",
      "municipio": "CULIACÁN",
      "estado": "SINALOA"
    }
  },
  "tabla": {
    "montoNeto": 10000,
    "montoPagare": 12350.50,
    "descuentoQuincenal": 514.60,
    "plazoMeses": 12,
    "plazoQuincenas": 24,
    "tasaMensual": 3.5,
    "importeInteres": 2350.50,
    "importeIvaInteres": 70.52,
    "cat": 48.5
  },
  "extra": {
    "telefonoCelular": "6671234567",
    "telefonoCasa": "6677654321",
    "mail": "cliente@email.com",
    "dependientesEconomicos": 2,
    "fechaIngreso": "2020-03-15",
    "fechaContrato": "2026-06-20",
    "fechaArranque": "2026-07-01",
    "referencia1": "MARÍA LÓPEZ",
    "telefonoReferencia1": "6671112233",
    "referencia2": "PEDRO RAMÍREZ",
    "telefonoReferencia2": "6674445566",
    "numVendedor": "V001",
    "sucursal": "CULIACÁN",
    "vendedor": "ASESOR 1",
    "lugarFecha": "CULIACÁN, SIN",
    "estadoCivil": "SOLTERO",
    "propiedad": "PROPIA",
    "entreCalles": "CALLE 1 Y CALLE 2"
  },
  "estadoCuenta": {
    "nombreTitular": "JUAN CARLOS PÉREZ LÓPEZ",
    "rfc": "PELJ850101XXX",
    "clabe": "012345678901234567",
    "numeroCuenta": "1234567890",
    "banco": "BBVA"
  },
  "nomina": {
    "noEmpleado": "EMP001",
    "puesto": "ANALISTA",
    "departamento": "VENTAS",
    "dependencia": "GOBIERNO DEL ESTADO",
    "rfc": "PELJ850101XXX",
    "ingresoMensual": 15000,
    "telefonoEmpresarial": "6671234567",
    "emailLaboral": "empleado@dependencia.gob.mx"
  }
}
```

### ⚠️ Nota sobre el folio

El campo `folio` **no se debe enviar** desde el frontend. El servidor lo genera automáticamente usando el patrón `C-XXXXXX` (ej: `C-000002`).

### Respuesta exitosa (200)

```
Content-Type: application/pdf
Content-Disposition: inline; filename=C-000002.pdf

[Binary PDF data]
```

La respuesta es el PDF directamente. El frontend puede mostrarlo en un iframe o descargarlo.

---

## 2. Obtener PDF (`GET /api/contratos/:id/pdf`)

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `:id` | ID numérico del contrato o folio (`C-000002`) |

### Respuesta

Redirige a la URL de Cloudinary si existe, o sirve el PDF local como fallback.

```
Content-Type: application/pdf
Location: https://res.cloudinary.com/...
```

---

## 3. Generar Enlace de Firma (`POST /api/contratos/:id/enlaces-firma`)

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `:id` | ID numérico o folio del contrato |

### Body: vacío

### Respuesta (201)

```json
{
  "link": "http://localhost:5173/firmar/abc123token...",
  "token": "abc123token...",
  "expira": "2026-06-21T00:00:00.000Z"
}
```

### Comportamiento

- Valida que el contrato exista y esté en estado `POR FIRMAR`
- Genera un UUID token (sin guiones) con expiración de 12 horas (trigger DB)
- Envía email automático al cliente vía SendGrid con el link
- Si el email falla, el token sigue siendo válido (solo se loggea warning)

---

## 4. Página de Firma del Cliente (`GET /firmar/:token`)

### Ruta del frontend

```
http://localhost:5173/firmar/{token}
```

### Paso 1: Obtener datos del contrato

```
GET /api/enlaces-firma/:token
```

**Respuesta (200):**

```json
{
  "contrato": {
    "folio": "C-000002",
    "nombre": "JUAN CARLOS PÉREZ LÓPEZ",
    "curp": "PELJ850101HDFRRN09",
    "importeCredito": "10000",
    "importeTotal": "12350.50",
    "pagoQuincenal": "514.60"
  },
  "pdfUrl": "/api/contratos/C-000002/pdf"
}
```

**Errores:**

| Código | Causa |
|--------|-------|
| 404 | Token no encontrado |
| 400 | Token ya usado |
| 400 | Token expirado |

### Paso 2: Mostrar PDF

Usar `pdfUrl` de la respuesta para mostrar el PDF:
```html
<iframe src="https://TU_API/api/contratos/C-000002/pdf"></iframe>
```
o redirigir directamente a la URL (hace redirect a Cloudinary).

### Paso 3: Enviar firma

```
POST /api/enlaces-firma/:token/firmas
Content-Type: application/json

{
  "firmaBase64": "data:image/png;base64,iVBORw0KGgo...",
  "aceptoTerminos": true
}
```

**Respuesta (200):**

```json
{
  "success": true,
  "message": "Contrato firmado exitosamente"
}
```

**Validaciones:**
- `firmaBase64` debe ser `data:image/png;base64,...` (o jpeg/webp)
- `aceptoTerminos` debe ser `true`
- El token debe ser válido (no usado, no expirado)

---

## 5. Página de firma — Implementación sugerida

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Firmar Contrato</title>
  <script src="https://cdn.jsdelivr.net/npm/signature_pad@5.0.4/dist/signature_pad.umd.min.js"></script>
</head>
<body>
  <div id="app">
    <!-- Datos del contrato -->
    <div id="datos-contrato">
      <p>Folio: <span id="folio"></span></p>
      <p>Nombre: <span id="nombre"></span></p>
      <p>CURP: <span id="curp"></span></p>
      <p>Importe: <span id="importe"></span></p>
    </div>

    <!-- PDF embebido -->
    <iframe id="pdf-viewer" style="width:100%;height:500px;"></iframe>

    <!-- Canvas de firma -->
    <canvas id="signature-canvas"></canvas>
    <button onclick="limpiarFirma()">Limpiar</button>

    <!-- Checkbox de términos -->
    <label>
      <input type="checkbox" id="acepto-terminos" />
      Acepto los términos y condiciones
    </label>

    <!-- Botón de firmar -->
    <button id="btn-firmar" onclick="firmar()">Firmar Contrato</button>
  </div>

  <script>
    const API_BASE = '';  // misma URL o proxy
    const token = window.location.pathname.split('/').pop();

    let signaturePad;
    const canvas = document.getElementById('signature-canvas');

    // Cargar datos del contrato
    fetch(`${API_BASE}/api/enlaces-firma/${token}`)
      .then(r => r.json())
      .then(data => {
        document.getElementById('folio').textContent = data.contrato.folio;
        document.getElementById('nombre').textContent = data.contrato.nombre;
        document.getElementById('curp').textContent = data.contrato.curp;
        document.getElementById('importe').textContent =
          `$${data.contrato.importeCredito}`;

        // Mostrar PDF
        document.getElementById('pdf-viewer').src =
          `${API_BASE}${data.pdfUrl}`;

        // Inicializar canvas de firma
        signaturePad = new SignaturePad(canvas);
      })
      .catch(err => {
        document.getElementById('app').innerHTML =
          `<p style="color:red">Error: ${err.message}</p>`;
      });

    function limpiarFirma() {
      signaturePad.clear();
    }

    async function firmar() {
      const acepto = document.getElementById('acepto-terminos').checked;
      if (!acepto) {
        return alert('Debes aceptar los términos y condiciones');
      }

      if (signaturePad.isEmpty()) {
        return alert('Debes dibujar tu firma');
      }

      const firmaBase64 = signaturePad.toDataURL('image/png');

      try {
        const res = await fetch(
          `${API_BASE}/api/enlaces-firma/${token}/firmas`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firmaBase64, aceptoTerminos: true }),
          }
        );

        const result = await res.json();

        if (res.ok) {
          alert('¡Contrato firmado exitosamente!');
          document.getElementById('btn-firmar').disabled = true;
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (err) {
        alert(`Error de conexión: ${err.message}`);
      }
    }
  </script>
</body>
</html>
```

---

## 📦 Resumen de cambios realizados (este PR)

| Archivo | Cambio |
|---------|--------|
| `src/controllers/rellenarPdf.controllers.ts` | Orden: Cloudinary → DB → response. Ya no hay fire-and-forget |
| `src/services/guardarContrato.services.ts` | Acepta `{ folio, pdfUrl, firmaUrl }`, los guarda en la transacción |
| `src/services/rellenarPdf.services.ts` | Acepta `folio` como parámetro para el campo FOLIO del PDF |
| `src/controllers/firma.controllers.ts` | Reemplaza `$queryRawUnsafe` por Prisma queries |
| `src/config/estadosContrato.ts` | **(nuevo)** Cache en memoria de IDs de estados |
| `app.ts` | Carga cache de estados al iniciar |
| `src/types/datosExtra.types.ts` | Elimina `folio` del interface |
| `src/utils/index.ts` | Exporta `generarFolio` |
| `public/generador.html` | Elimina campo de folio |

---

## 🔒 Consideraciones de seguridad

1. **CORS** configurado solo para `FRONTEND_URL`
2. **XSS protection** vía middleware custom
3. **Helmet** headers de seguridad HTTP
4. **Rate limiting** 40 tokens/minuto en upload de PDFs
5. **Tokens de firma** expiran en 12h (trigger DB) y son de un solo uso
6. **Validación Zod** de todas las variables de entorno al iniciar
