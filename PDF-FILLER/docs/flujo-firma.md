# Flujo de Firma de Contratos — Plan Técnico Completo

## Visión General

```
Asesor crea contrato
  → POST /api/pdfs
  → Genera PDF → Sube a Cloudinary (contratos/{folio}.pdf)
  → Estado: POR FIRMAR
  → Genera token de firma → Recibe link
   → En modo demo: muestra el link para copiarlo o abrirlo
   → En producción: envía el link al cliente mediante SendGrid
  → Cliente abre link
    → Ve datos del contrato + PDF desde Cloudinary
    → Firma en canvas + acepta términos
    → Envía firma
  → Backend: sube firma a Cloudinary (firmas/{folio}.png)
  → Actualiza url_firma_cloud en contrato_prestamo
  → Trigger valida que url_pdf_cloud y url_firma_cloud existan
  → Estado: POR APROBAR
  → (Opcional) Asesor aprueba → ACTIVO
```

---

## ✅ Fase 1 — Setup Inicial (Completada)

- Seed con estados: `["POR FIRMAR", "POR APROBAR", "ACTIVO", "LIQUIDADO", "CANCELADO", "VENCIDO"]`
- Trigger `fn_primer_historial_contrato` (crea historial al insertar contrato)
- Trigger case-insensitive para validar estado inicial

---

## ✅ Fase 2 — Endpoints de Firma (Completada)

### 2.1 Modelo `TokenFirma` en schema.prisma

```prisma
model TokenFirma {
  token       String   @id @db.VarChar(64)
  id_contrato Int
  expira      DateTime? @db.Timestamp()
  usado       Boolean  @default(false)
  created_at  DateTime @default(now()) @db.Timestamp()

  contrato ContratoPrestamo @relation(fields: [id_contrato], references: [id])

  @@map("token_firma")
  @@schema("credito")
}
```

**Trigger:** `trg_expiracion_token_firma` — expira automáticamente a las 12 horas.

### 2.2 Columnas Cloud en contrato_prestamo

| Columna | Tipo | Propósito |
|---|---|---|
| `url_pdf_cloud` | `VARCHAR(500)` | URL del PDF original en Cloudinary |
| `url_firma_cloud` | `VARCHAR(500)` | URL de la firma del cliente en Cloudinary |
| `url_pdf_firmado_cloud` | `VARCHAR(500)` | URL del PDF firmado (futuro) |

**Trigger:** `trg_validar_urls_firma` — al cambiar estado ≠ "POR FIRMAR", exige que `url_pdf_cloud` y `url_firma_cloud` NO sean NULL.

### 2.3 Servicios

| Archivo | Funciones |
|---|---|
| `src/services/tokenFirma.service.ts` | `generarToken`, `validarToken`, `marcarUsado` |
| `src/services/cloudUpload.service.ts` | `uploadFirmaImage(buffer, folio)` → `firmas/{folio}.png` |
| | `uploadPDF(buffer, folio)` → `contratos/{folio}.pdf` |
| | `eliminarImagenCloud(url, folder)` |
| `src/services/email.service.ts` | `enviarLinkFirma({ email, nombreCliente, link, folio })` vía SendGrid |

### 2.4 Endpoints RESTful

Archivo: `src/contratos/firma.controller.ts`

| Método | Ruta | Body | Respuesta | Qué hace |
|---|---|---|---|---|
| `GET` | `/api/contratos/:id/pdf` | — | Binario/PDF o redirect | Sirve PDF (redirige a Cloudinary si existe, fallback a disco) |
| `POST` | `/api/contratos/:id/enlaces-firma` | — | `{ link, token, expira, correoEnviado, modoDemo, mensajeCorreo }` | Genera token y muestra o envía el enlace |
| `GET` | `/api/enlaces-firma/:token` | — | `{ contrato: {...}, pdfUrl }` | Valida token y devuelve datos del contrato |
| `POST` | `/api/enlaces-firma/:token/firmas` | `{ firmaBase64, aceptoTerminos }` | `{ success, message }` | Sube firma a Cloudinary, actualiza estado, registra historial |

**Nota:** `:id` acepta tanto ID numérico como folio (ej: `C-000001`).

### 2.5 Detalles de POST /api/enlaces-firma/:token/firmas

1. Validar token (no expirado, no usado)
2. Validar `firmaBase64` (formato `data:image/png;base64,...`) y `aceptoTerminos === true`
3. Decodificar base64 → buffer
4. Subir a Cloudinary usando `uploadFirmaImage(buffer, folio)`
5. En transacción:
   - Actualizar `contrato_prestamo.url_firma_cloud` con la URL
   - Actualizar `cliente.url_firma_svg` (backward compat)
   - Cambiar `id_estado_contrato` → POR APROBAR
   - Actualizar `fecha_firma`
   - Marcar token como usado
   - Insertar historial en `HistorialCredito`
6. El trigger `trg_validar_urls_firma` valida que `url_pdf_cloud` y `url_firma_cloud` existan

---

## ✅ Fase 3 — Envío de Correo Electrónico (Completada)

### 3.1 Configuración

Variables en `.env`:
```
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=notificaciones@tudominio.com
EMAIL_ENABLED=false
```

Schema Zod en `src/config/index.ts`:
```ts
EMAIL_ENABLED: z.enum(["true", "false"]).default("false"),
SENDGRID_API_KEY: z.string().optional(),
FROM_EMAIL: z.string().email().optional(),
```

Por defecto el proyecto usa modo demostración: no depende de un proveedor de
correo y devuelve el enlace para copiarlo o abrirlo desde la vista previa.
Para activar el envío real, configura las credenciales y usa
`EMAIL_ENABLED=true`.

### 3.4 Usuarios demo

La autenticación Nest usa JWT y los usuarios se almacenan en
`organizacion.usuario` con contraseñas bcrypt:

| Usuario | Contraseña | Rol |
|---|---|---|
| `juan@test.com` | `Demo1234!` | asesor |
| `admin@test.com` | `Demo1234!` | admin |

Estas credenciales son únicamente para desarrollo y demostración.

### 3.2 Servicio `src/services/email.service.ts`

```
enviarLinkFirma({ email, nombreCliente, link, folio })
  → Asunto: "Contrato {folio} listo para firmar"
  → HTML con botón "Firmar Contrato"
  → Si falla: solo log warning (no hace rollback del token)
```

### 3.3 Integración

Se activa automáticamente en `POST /api/contratos/:id/enlaces-firma`:
- Después de generar el token, busca el `email_personal` del cliente
- En modo demo devuelve el enlace sin enviar correo
- Con `EMAIL_ENABLED=true`, envía correo con el link de firma
- Si falla el envío, el token ya fue creado — solo se loguea warning

---

## ✅ Fase 4 — Página de Firma (Completada)

Frontend en proyecto separado o añadir a `public/firmar.html`.

### Ruta: `{FRONTEND_URL}/firmar/:token`

La página debe:
1. Al cargar: `GET /api/enlaces-firma/:token`
   - Mostrar datos del contrato: folio, nombre, CURP, importes
   - Mostrar PDF embebido desde Cloudinary
2. Canvas de firma (`signature_pad`)
3. Checkbox: "Acepto los términos y condiciones"
4. Botón "Firmar Contrato" → `POST /api/enlaces-firma/:token/firmas`

---

## Estructura Cloudinary

```
cloudinary/
├── firmas/{folio}.png                ← Firma del cliente
├── contratos/{folio}.pdf              ← PDF original (generado al crear)
└── contratos_firmados/{folio}.pdf     ← PDF firmado (futuro)
```

---

## Resumen de Archivos

### Creados
| Archivo | Propósito |
|---|---|
| `prisma/migrations/20260619005238_token_firma/` | Tabla TokenFirma |
| `prisma/migrations/20260619005811_trigger_expiracion_token/` | Trigger expiración 12h |
| `prisma/migrations/20260619010000_add_cloud_urls/` | Columnas cloud + trigger validación |
| `src/services/tokenFirma.service.ts` | Lógica de tokens |
| `src/services/email.service.ts` | Envío de correos SendGrid |
| `src/routes/firma.routes.ts` | Endpoints de firma |
| `src/controllers/firma.controllers.ts` | Controladores de firma |

### Modificados
| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Modelo TokenFirma + columnas cloud en ContratoPrestamo |
| `src/config/index.ts` | SENDGRID_API_KEY, FROM_EMAIL |
| `src/routes/index.ts` | Exportar routerFirma y routerContratos |
| `app.ts` | Registrar rutas de firma |
| `src/services/cloudUpload.service.ts` | uploadFirmaImage usa folio, nueva uploadPDF |
| `src/controllers/rellenarPdf.controllers.ts` | PDF se sube a Cloudinary en vez de disco |
| `src/controllers/firma.controllers.ts` | Email automático, búsqueda case-insensitive |

---

## Diagrama de Secuencia

```
POST /api/contratos/:id/enlaces-firma
  ├─ resuelve :id (numérico o folio)
  ├─ valida contrato existe y está en POR FIRMAR
  ├─ genera UUID → INSERT token_firma
  ├─ construye link = FRONTEND_URL + "/firmar/" + token
  ├─ busca cliente.email_personal
  ├─ enviarLinkFirma() vía SendGrid (si falla, solo warn)
  └─ responde { link, token, expira }

POST /api/enlaces-firma/:token/firmas
  ├─ valida token vigente
  ├─ valida firmaBase64 + aceptoTerminos
  ├─ uploadFirmaImage(buffer, folio) → Cloudinary URL
  ├─ TRANSACCIÓN:
  │   ├─ UPDATE contrato SET url_firma_cloud = url, estado = POR APROBAR
  │   ├─ UPDATE cliente SET url_firma_svg = url
  │   ├─ UPDATE token_firma SET usado = true
  │   └─ INSERT historial_credito
  ├─ TRIGGER valida que cloud URLs no sean NULL
  └─ responde { success: true }
```
