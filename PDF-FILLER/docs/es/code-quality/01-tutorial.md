<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>

# Configuración de Calidad de Código — Tutorial

**Objetivo:** Aprender a configurar y usar ESLint, Prettier y TypeScript en tu proyecto para garantizar calidad y consistencia en el código.

**Audiencia:** Desarrolladores nuevos en herramientas de calidad de código.

**Tiempo estimado:** 30 minutos

---

## Qué Aprenderás

Al final de este tutorial entenderás:

- Cómo ESLint detecta errores y estándares de código
- Cómo Prettier formatea automáticamente el código
- Cómo TypeScript previene errores de tipo antes de la ejecución
- Cómo estas herramientas trabajan juntas en el pipeline de compilación
- Cómo ejecutar y arreglar problemas de calidad

---

## Requisitos Previos

- Node.js 20+ instalado
- npm 9+ instalado
- Conocimiento básico de npm y TypeScript

---

## Paso 1: Entender las Herramientas

### ESLint

Un **linter** que analiza tu código en busca de errores potenciales y violaciones de estilo.

- Detecta errores antes de la ejecución (variables sin usar, código inalcanzable, etc.)
- Aplica estándares de codificación (convenciones de nombres, consistencia, etc.)
- Puede auto-arreglar muchos problemas automáticamente

### Prettier

Un **formateador de código** que reescribe automáticamente tu código para que coincida con un estilo consistente.

- Elimina debates sobre estilo (tabs vs espacios, punto y coma, etc.)
- Formatea al guardar (si está configurado en tu editor)
- Aplica un único estilo de código consistente

### TypeScript

Un **verificador de tipos** que previene errores de tipo durante el desarrollo.

- Detecta desajustes de tipo antes de la ejecución (ej: llamar `.length` en un número)
- Proporciona mejor autocompletado y documentación en el IDE
- Se compila a JavaScript que se ejecuta en Node.js

---

## Paso 2: Instalar Dependencias

Tu proyecto ya tiene estos configurados. Para verificar que están instalados:

```bash
npm ls eslint typescript prettier
```

**La salida debe mostrar:**

```
eslint@8.55.0
typescript@5.0.0
prettier@3.0.0
```

Si faltan, instálalos:

```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier
```

---

## Paso 3: Revisar los Archivos de Configuración

Tu proyecto tiene tres archivos de configuración clave en el directorio raíz:

### `tsconfig.json` — Configuración de TypeScript

Controla cómo TypeScript compila tu código:

```json
{
  "compilerOptions": {
    "target": "ES2020", // Versión de JavaScript a compilar
    "module": "commonjs", // Sistema de módulos (Node.js usa CommonJS)
    "strict": true, // Habilita TODAS las verificaciones de tipo
    "sourceMap": true, // Mapea JS compilado de vuelta a TS para debugging
    "declaration": true, // Genera archivos .d.ts para definiciones de tipo
    "outDir": "./dist" // Dónde va el JS compilado
  }
}
```

### `.eslintrc.json` — Configuración de ESLint

Define qué patrones de código están permitidos/prohibidos:

```json
{
  "parser": "@typescript-eslint/parser",
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "semi": ["error", "always"]
  }
}
```

### `.prettierrc.json` — Configuración de Prettier

Define el estilo del código:

```json
{
  "semi": true,
  "singleQuote": false,
  "useTabs": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Paso 4: Ejecutar las Herramientas

### Compilar TypeScript

Compila tu código TypeScript a JavaScript:

```bash
npm run build
```

**Qué sucede:**

- TypeScript lee todos los archivos `.ts` en `src/`
- Verifica cada anotación de tipo
- Reporta errores si los tipos no coinciden
- Compila a JavaScript en la carpeta `dist/`

**Ejemplo de error que podrías ver:**

```
src/logger/logger.ts:36:48 - error TS2339:
Property 'res' is declared but its value is never read.
```

### Verificar el Código (Lint)

Verifica problemas de calidad de código:

```bash
npm run lint
```

**Qué sucede:**

- ESLint lee todos los archivos `.ts` (excepto los en `.eslintignore`)
- Verifica violaciones de las reglas en `.eslintrc.json`
- Reporta violaciones con números de línea y sugerencias

**Ejemplo de salida:**

```
src/utils/errorHandling.utils.ts
  15:1  error  Unexpected var, use let or const  (no-var)

2 errors, 0 warnings
```

### Auto-Arreglar Problemas

ESLint puede arreglar muchos problemas automáticamente:

```bash
npm run lint:fix
```

**Qué sucede:**

- ESLint ejecuta con la bandera `--fix`
- Arregla automáticamente todos los problemas que puede (imports sin usar, const vs let, punto y coma, etc.)
- Reporta solo los problemas que requieren arreglos manuales

### Formatear Código

Prettier reescribe tu código para que coincida con el estilo:

```bash
npm run format
```

**Qué sucede:**

- Prettier lee todos los archivos `.ts`
- Los reformatea (espaciado, indentación, saltos de línea, etc.)
- Sobrescribe los archivos en su lugar

**Ejemplo de transformación:**

```typescript
// ANTES (estilo inconsistente)
function add(a, b) {
  return a + b;
}

// DESPUÉS (Prettier lo formatea)
function add(a, b) {
  return a + b;
}
```

---

## Paso 5: Verificar tu Progreso

Verifica que todas las herramientas estén contentas:

```bash
npm run build       # Verificación de compilación de TypeScript
npm run lint        # Verificaciones de ESLint
npm run format:check # Prettier prueba seca (no modifica archivos)
```

Si los tres pasan sin errores, ¡ya terminaste! ✅

---

## Paso 6: Entender Errores Comunes

### Error: "Property 'X' does not exist"

**Causa:** Desajuste de tipo en TypeScript.

**Solución:**

```typescript
// ❌ INCORRECTO
const err: MulterError;
console.log(err.limit); // Error: 'limit' no existe

// ✅ CORRECTO
import { MAX_FILE_SIZE } from "../config/constants";
console.log(MAX_FILE_SIZE);
```

### Error: "'X' is declared but never used"

**Causa:** Variable sin usar.

**Solución:**

```typescript
// ❌ INCORRECTO
const unused = 42;
console.log("hello");

// ✅ CORRECTO (renombra con guión bajo)
const _unused = 42;
console.log("hello");
```

### Error: "next is not a function"

**Causa:** Middleware de Express sin parámetro `res`.

**Solución:**

```typescript
// ❌ INCORRECTO
export const middleware = (req: Request, next: NextFunction) => {
  next();
};

// ✅ CORRECTO
export const middleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};
```

---

## Paso 7: Integrar en tu Flujo de Trabajo

### En tu Editor (VS Code)

1. Instala extensión: **ESLint** (por Microsoft)
2. Instala extensión: **Prettier - Code formatter** (por Prettier)
3. Crea `.vscode/settings.json` en la raíz del proyecto:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript", "typescriptreact"],
  "eslint.format.enable": true
}
```

Ahora:

- Prettier formatea al guardar automáticamente ✨
- Las advertencias de ESLint aparecen en línea en tu editor
- `Ctrl+Shift+P` → "Format Document" → formatea con Prettier

### En tu Flujo de Git (Opcional)

Instala `husky` para ejecutar linting antes de cada commit:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Luego crea `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint:fix
npm run format
npm run build
```

Ahora cada commit se verifica automáticamente. 🎯

---

## Resumen

Ahora sabes:

- ✅ ESLint detecta errores y aplica estándares
- ✅ Prettier mantiene el estilo de código consistente
- ✅ TypeScript previene errores de tipo
- ✅ Cómo ejecutar cada herramienta (`npm run build`, `npm run lint`, `npm run format`)
- ✅ Cómo arreglar errores comunes
- ✅ Cómo integrar con tu editor

**Próximos pasos:**

- Lee las [Guías Prácticas](./02-how-to-guides.md) para recetas prácticas
- Consulta la [Referencia](./03-reference.md) para todas las reglas de ESLint
- Lee la [Explicación](./04-explanation.md) para entender la filosofía

---

## Referencia Rápida

| Comando                | Qué hace                                  | ¿Auto-arregla?  |
| ---------------------- | ----------------------------------------- | --------------- |
| `npm run build`        | Verificación de compilación de TypeScript | ❌ Manual       |
| `npm run lint`         | Ejecutar ESLint                           | ❌ Solo reporta |
| `npm run lint:fix`     | Ejecutar ESLint + auto-arreglar           | ✅ Sí           |
| `npm run format`       | Ejecutar Prettier                         | ✅ Sí           |
| `npm run format:check` | Verificar si Prettier haría cambios       | ❌ Solo reporta |
