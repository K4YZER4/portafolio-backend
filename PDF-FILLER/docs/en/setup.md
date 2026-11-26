<div align="left">
  <a href="../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
  <a href="../es/setup.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>

# Setup & Running

**Navigation:** Home › Docs › Setup & Running

---

## Prerequisites

- Node.js 20+
- npm 9+

## Install

```bash
git clone https://github.com/K4YZER4/PDF-FILLER.git
cd PDF-FILLER
npm install
```

## Environment variables

```bash
cp .env.example .env
```

| Variable | Default | Description                |
| -------- | ------- | -------------------------- |
| `PORT`   | `3000`  | Port the server listens on |

## Code Quality Tools

This project includes tools to maintain code quality:

### ESLint

Detect code problems and enforce style rules:

```bash
# Check for issues
npm run lint

# Automatically fix issues
npm run lint:fix
```

**Configuration:** `.eslintrc.json`

- Parser: `@typescript-eslint`
- 11 active rules for code quality
- `eslintignore` patterns configured

### Prettier

Code formatter for consistent style:

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

**Configuration:** `.prettierrc.json`

- 2-space indentation
- Double quotes
- 100-char line width

### TypeScript

Type safety and compile-time error checking:

```bash
# Check types
npm run build  # Includes type checking

# Development with types
npm run dev    # Also checks types
```

**Configuration:** `tsconfig.json`

- Strict mode enabled
- Source maps generated
- Declaration files (.d.ts) generated

### Scripts Reference

```bash
npm run build              # Build (TypeScript compile + type check)
npm run dev                # Development mode with auto-reload
npm run lint               # Check code with ESLint
npm run lint:fix           # Automatically fix ESLint issues
npm run format:check       # Check Prettier formatting
npm run format             # Automatically format code
npm run start              # Start production build
```

**See more:** [Code Quality Documentation](./code-quality/)

---

## Helper scripts

```bash
# Lists all named form fields and their types from the PDF template
npx ts-node scripts/listar_campos.ts
```

Useful when you need to map new fields from the contract template.

## Required files

Place these in the project root before running:

| File              | Description                             |
| ----------------- | --------------------------------------- |
| `contrato.pdf`    | PDF template with named form fields     |
| `*.xlsx`          | Discount tables file                    |
| `spa.traineddata` | Tesseract Spanish language data for OCR |

> ⚠️ These files are not committed to the repository because they contain proprietary data.

## Run

```bash
# Development
npm run dev

# Build + production
npm run build
npm start
```

The web form is available at:

```
http://localhost:3000/generador.html
```

---

**Next:** [API Reference](./api.md)
