<div align="right">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>

# PDF Filler — API de Automatización de Contratos de Crédito vía Nómina

Servicio backend de ciclo completo desarrollado con **NestJS**, **TypeScript**, **Prisma** y **PostgreSQL** que automatiza contratos de crédito con descuento vía nómina — desde la extracción inteligente de documentos con IA (INE, recibos de nómina y estado de cuenta) hasta el cálculo de tabla de crédito, generación dinámica de PDF, firma electrónica remota y flujo de aprobación por Mesa de Control.

[![CI Backend](https://github.com/K4YZER4/PDF-FILLER/actions/workflows/ci.yml/badge.svg)](https://github.com/K4YZER4/PDF-FILLER/actions/workflows/ci.yml)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Multimodal-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

> **Repositorio Frontend:** [K4YZER4/PDF-FILLER-FRONTEND](https://github.com/K4YZER4/PDF-FILLER-FRONTEND) (React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand)

---

## Características Clave y Aspectos de Ingeniería

- **Escaneo Multimodal Unificado con IA** — Extrae datos personales, laborales y bancarios desde INE, recibos de nómina y estado de cuenta en una sola petición usando Google Gemini AI, con validación de esquemas Zod y verificación de CURP.
- **Calculadora de Tabla de Crédito** — Calcula descuento quincenal, monto total pagaré, intereses y CAT a partir de tablas de amortización en Excel (`exceljs`).
- **Generación de PDF y Firma Electrónica Multipágina** — Rellena plantillas AcroForm con `pdf-lib`, estampa la firma manuscrita del cliente en todas las páginas requeridas y almacena los documentos en Cloudinary.
- **Flujo de Firma Remota Seguro** — Genera enlaces de firma de un solo uso con expiración automática (`TokenFirma`), validación opcional con código OTP de 6 dígitos y proxy seguro de PDF con protección anti-SSRF (lista blanca de hosts y bloqueo de IPs privadas).
- **Mesa de Control con RBAC** — Autenticación JWT + control de acceso por roles (`ASESOR` / `ADMIN`), validación de propiedad de contratos y máquina de estados respaldada por triggers de PostgreSQL e historial de auditoría (`POR FIRMAR` → `POR APROBAR` → `ACTIVO` / `RECHAZADO`).
- **Endurecimiento para Producción** — Rate limiting tipo token-bucket, encabezados Helmet, sanitización XSS, logs estructurados (`pino`), filtro global de excepciones con trazabilidad por `requestId` e imagen Docker segura.
- **Modo Demostración Pública** — Soporta `DEMO_MODE=true` con plantilla anonimizada (`contrato_demo.pdf`), clave de Gemini opcional por visitante (`X-Gemini-Api-Key`) y visualización directa del enlace de firma sin depender de un proveedor de correo.

---

## Arquitectura General

```text
Cliente (React 19)
   │
   ▼
API NestJS (JWT + RBAC + Rate Limit + Helmet)
   ├── /api/auth           → Login y emisión de JWT
   ├── /api/escaneos       → Extracción unificada de documentos con Gemini AI
   ├── /api/tablas         → Cálculo de tabla de crédito (Excel)
   ├── /api/contratos      → CRUD de contratos, aprobación e historial
   ├── /api/pdfs           → Generación de PDF y subida a Cloudinary
   ├── /api/enlaces-firma  → Enlaces de firma con expiración, OTP y estampado de firma
   └── /health             → Health check
   │
   ├── PostgreSQL (Prisma 7 + triggers y procedimientos SQL)
   ├── Cloudinary (PDFs y firmas del cliente)
   └── Google Gemini API (OCR multimodal)
```

### Estructura Modular (`src/`)

```text
src/
├── auth/          # Autenticación JWT, guards, decorador de roles y RBAC
├── asesores/      # Catálogo y consulta de asesores
├── common/        # Filtro de excepciones, request-id, rate limiter, multer y validadores
├── contratos/     # Contratos, controlador de PDFs, firma remota, folios e historial
├── escaneos/      # Endpoints de escaneo unificado e individual
├── gemini/        # Módulo proveedor de Gemini AI
├── health/        # Endpoint de salud
├── prisma/        # PrismaService y adaptador PostgreSQL
├── storage/       # Abstracción de almacenamiento (Cloudinary y local)
├── tablas/        # Módulo de cálculo de tabla de crédito
├── clients/       # Clientes externos de extracción con IA
├── services/      # Servicios de dominio (llenado PDF, persistencia, correo, tokens)
├── types/         # Interfaces TypeScript compartidas
└── utils/         # Sanitización, validación de CURP, números a letras y catálogos
```

---

## Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| **Runtime y Lenguaje** | Node.js 20, TypeScript 5 |
| **Framework** | NestJS 11 (adaptador Express 5) |
| **Base de Datos y ORM** | PostgreSQL 16, Prisma 7 (`@prisma/adapter-pg`) |
| **IA / OCR** | Google Gemini AI (`@google/genai`) |
| **PDF y Hojas de Cálculo** | `pdf-lib`, `exceljs`, `sharp` |
| **Cloud y Correo** | Cloudinary, SendGrid (opcional / modo demo soportado) |
| **Seguridad y Validación** | JWT, `bcryptjs`, Zod, Helmet, `xss`, Token-Bucket Guard |
| **Observabilidad y Pruebas** | Logs estructurados con Pino, Jest |
| **Infraestructura** | Docker, Docker Compose, listo para Render / Neon |

---

## Inicio Rápido

### 1. Desarrollo Local

```bash
git clone https://github.com/K4YZER4/PDF-FILLER.git
cd PDF-FILLER
npm install
```

Crea tu archivo `.env` a partir de `.env.example` (configura `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY` y opcionalmente `DEMO_MODE=true`), y ejecuta:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### 2. Docker

```bash
docker-compose up -d --build
```

### Credenciales de Demostración (tras `prisma db seed`)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| **Asesor (`ASESOR`)** | `juan@test.com` | `Demo1234!` |
| **Administrador (`ADMIN`)** | `admin@test.com` | `Demo1234!` |

---

## Documentación

Elige tu idioma:

- **English** → [README.md](./README.md)
- **Español** → [README.es.md](./README.es.md)

### Guías y Referencias

| Documento | Descripción |
| --- | --- |
| [Instalación y ejecución](./docs/es/setup.md) | Instalación, variables de entorno y ejecución local |
| [Referencia API](./docs/es/api.md) | Endpoints con ejemplos de request/response |
| [Arquitectura](./docs/es/architecture.md) | Estructura del proyecto y flujo de datos |
| [Manejo de Errores](./docs/es/error-handling/README.md) | Jerarquía de errores, logging con Pino y trazabilidad |
| [Calidad de Código](./docs/es/code-quality/README.md) | Configuración de ESLint, Prettier y TypeScript |
| [Validación de INE](./docs/es/ine-validation/README.md) | Extracción y reglas de validación de documento INE |
| [Guía de Desarrollo](./docs/es/development.md) | Convenciones para agregar endpoints y módulos |
| [Flujo de Firma](./docs/flujo-firma.md) | Ciclo de firma remota, tokens y Cloudinary |
| [Despliegue Demo](./docs/deploy-demo.md) | Guía para desplegar en Render, Neon y Vercel |
| [Conexión Frontend-Backend](./docs/conectar-frontend-backend.md) | Integración con el cliente en React |
