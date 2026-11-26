<div align="right">
  <a href="./README.es.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>

# PDF Filler — Payroll Loan Contract Automation API

Full-lifecycle backend service built with **NestJS**, **TypeScript**, **Prisma**, and **PostgreSQL** that automates payroll-deduction loan contracts — from AI-powered document extraction (ID, payroll receipts, bank statements) to loan table calculation, dynamic PDF contract generation, secure remote client e-signature, and admin approval workflows.

[![CI Backend](https://github.com/K4YZER4/PDF-FILLER/actions/workflows/ci.yml/badge.svg)](https://github.com/K4YZER4/PDF-FILLER/actions/workflows/ci.yml)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Multimodal-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

> **Frontend Repository:** [K4YZER4/PDF-FILLER-FRONTEND](https://github.com/K4YZER4/PDF-FILLER-FRONTEND) (React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand)

---

## Key Features & Engineering Highlights

- **Unified Multimodal AI Document Scanning** — Extracts structured client, employment, and banking fields from Mexican ID cards (INE), payroll stubs, and bank statements in a single request using Google Gemini AI, validated with Zod schemas and CURP checksum rules.
- **Dynamic Loan Table Calculator** — Computes biweekly payments, total payable amount, interest, and CAT from configurable Excel amortization tables (`exceljs`).
- **Programmatic PDF Generation & Multi-Page E-Signature** — Fills AcroForm templates with `pdf-lib`, embeds the client's drawn signature across every required signature page, and stores artifacts in Cloudinary.
- **Secure Remote Signing Flow** — Generates single-use, time-expiring signing tokens (`TokenFirma`), optional 6-digit OTP verification, and a backend PDF proxy with SSRF protection (strict hostname allowlist and private IP blocking).
- **Role-Based Approval Workflow ("Mesa de Control")** — JWT authentication + RBAC (`ASESOR` / `ADMIN`), resource ownership checks, and PostgreSQL-enforced state transitions with full audit history (`POR FIRMAR` → `POR APROBAR` → `ACTIVO` / `RECHAZADO`).
- **Production Hardening** — Token-bucket rate limiting, Helmet security headers, XSS input sanitization, structured logging (`pino`), global exception filter with request ID tracing, and non-root Docker image.
- **Public Demo Mode** — Supports `DEMO_MODE=true` using an anonymized PDF template (`contrato_demo.pdf`), visitor-supplied `X-Gemini-Api-Key` header, and direct signing link display without requiring an external email provider.

---

## Architecture Overview

```text
Client (React 19)
   │
   ▼
NestJS API (JWT + RBAC + Rate Limit + Helmet)
   ├── /api/auth           → Login & JWT issuance
   ├── /api/escaneos       → Unified Gemini AI document extraction
   ├── /api/tablas         → Loan amortization calculator (Excel)
   ├── /api/contratos      → Contract CRUD, approval workflow & audit history
   ├── /api/pdfs           → PDF generation & Cloudinary upload
   ├── /api/enlaces-firma  → Expiring signing links, OTP & multi-page signature stamping
   └── /health             → Liveness check
   │
   ├── PostgreSQL (Prisma 7 + SQL triggers & stored procedures)
   ├── Cloudinary (PDFs & client signatures)
   └── Google Gemini API (Multimodal OCR)
```

### Modular Structure (`src/`)

```text
src/
├── auth/          # JWT authentication, guards, roles decorator & RBAC
├── asesores/      # Advisor catalog & lookups
├── common/        # Exception filter, request-id middleware, rate limiter, multer & validators
├── contratos/     # Contracts controller/service, PDF controller, signing flow, folio & history
├── escaneos/      # Unified & individual document scanning endpoints
├── gemini/        # Gemini AI provider module
├── health/        # Health check endpoint
├── prisma/        # PrismaService & PostgreSQL adapter
├── storage/       # Cloudinary & local file storage abstraction
├── tablas/        # Loan table calculation module
├── clients/       # External AI extraction clients
├── services/      # Domain services (PDF filling, contract persistence, email, tokens)
├── types/         # Shared TypeScript domain interfaces
└── utils/         # Sanitization, CURP validation, number-to-words & catalog helpers
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Runtime & Language** | Node.js 20, TypeScript 5 |
| **Framework** | NestJS 11 (Express 5 adapter) |
| **Database & ORM** | PostgreSQL 16, Prisma 7 (`@prisma/adapter-pg`) |
| **AI / OCR** | Google Gemini AI (`@google/genai`) |
| **PDF & Spreadsheets** | `pdf-lib`, `exceljs`, `sharp` |
| **Cloud & Email** | Cloudinary, SendGrid (optional / demo mode supported) |
| **Security & Validation** | JWT, `bcryptjs`, Zod, Helmet, `xss`, Token-Bucket Guard |
| **Observability & Testing** | Pino structured logs, Jest |
| **Infrastructure** | Docker, Docker Compose, Render / Neon ready |

---

## Quick Start

### 1. Local Development

```bash
git clone https://github.com/K4YZER4/PDF-FILLER.git
cd PDF-FILLER
npm install
```

Create a `.env` file based on `.env.example` (set `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, and optionally `DEMO_MODE=true`), then run:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### 2. Docker

```bash
docker-compose up -d --build
```

### Demo Credentials (after `prisma db seed`)

| Role | Email | Password |
| --- | --- | --- |
| **Advisor (`ASESOR`)** | `juan@test.com` | `Demo1234!` |
| **Admin (`ADMIN`)** | `admin@test.com` | `Demo1234!` |

---

## Documentation

Choose your language:

- **English** → [README.md](./README.md)
- **Español** → [README.es.md](./README.es.md)

### Guides & References

| Document | Description |
| --- | --- |
| [Setup & Running](./docs/en/setup.md) | Installation, environment variables, and local execution |
| [API Reference](./docs/en/api.md) | Endpoints with request/response examples |
| [Architecture](./docs/en/architecture.md) | System structure and data flow |
| [Error Handling](./docs/en/error-handling/README.md) | Error hierarchy, Pino logging, and request tracing |
| [Code Quality](./docs/en/code-quality/README.md) | ESLint, Prettier, and TypeScript conventions |
| [INE Validation](./docs/en/ine-validation/README.md) | Mexican ID extraction and validation rules |
| [Development Guide](./docs/en/development.md) | Conventions for adding new endpoints and modules |
| [Signature Flow (ES)](./docs/flujo-firma.md) | Remote e-signature lifecycle, tokens, and Cloudinary integration |
| [Demo Deployment (ES)](./docs/deploy-demo.md) | Deploying with Render, Neon, and Vercel |
| [Frontend-Backend Integration (ES)](./docs/conectar-frontend-backend.md) | Connecting the React frontend with this API |
