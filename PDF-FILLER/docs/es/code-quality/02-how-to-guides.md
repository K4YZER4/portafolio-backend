<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>

# Calidad de Código — Guías Prácticas

Recetas prácticas para tareas comunes con ESLint, Prettier y TypeScript.

---

## Cómo Arreglar Errores de ESLint Automáticamente

**Problema:** Tienes muchos errores de ESLint y quieres arreglarlos rápidamente.

**Solución:**

```bash
npm run lint:fix
```

Este comando:
1. Ejecuta ESLint con la bandera `--fix`
2. Arregla automáticamente ~80% de errores (imports sin usar, punto y coma, const/let, espaciado, etc.)
3. Reporta errores restantes que necesitan arreglos manuales

**Ejemplo:**
```
ANTES:
  ✗ 15 errores

DESPUÉS de ejecutar lint:fix:
  ✗ 3 errores (necesitan arreglos manuales)
  ✓ 12 errores arreglados
```

---

## Cómo Desactivar una Regla de ESLint para una Línea

**Problema:** Tienes una razón legítima para romper una regla de ESLint en una línea específica.

**Solución:**

Agrega un comentario encima de la línea:

```typescript
// eslint-disable-next-line no-console
console.log("Esto está bien en este caso específico");
```

O en la misma línea:

```typescript
console.log("Valor de debug:", x); // eslint-disable-line no-console
```

**Cuándo usar:**
- ✅ Temporalmente para debugging
- ✅ Cuando tienes una razón válida (documentada en el comentario)
- ❌ NO como un hábito para eludir estándares

**Mejor enfoque:** Entiende por qué existe la regla y síguela en lugar de eludirla.

---

## Cómo Desactivar una Regla de ESLint para Archivo Completo

**Problema:** Necesitas desactivar una regla para un archivo completo (ej: archivo generado o de terceros).

**Solución:**

Agrega al inicio del archivo:

```typescript
/* eslint-disable no-console */

// Tu código aquí...
```

O desactiva múltiples reglas:

```typescript
/* eslint-disable no-console, no-unused-vars */
```

---

## Cómo Desactivar ESLint para Directorio Completo

**Problema:** Quieres que ciertos directorios salten verificaciones de ESLint (ej: `dist/`, `node_modules/`).

**Solución:**

Edita `.eslintignore`:

```
dist/
node_modules/
*.test.ts
coverage/
```

**Lo que ya está ignorado:**
```
dist/              # Salida compilada
node_modules/      # Dependencias
logs/              # Archivos de log
*.env              # Archivos de entorno
```

---

## Cómo Agregar una Nueva Regla de ESLint

**Problema:** Quieres aplicar un nuevo estándar de codificación (ej: sin declaraciones `var`).

**Solución:**

1. Edita `.eslintrc.json`:

```json
{
  "rules": {
    "no-var": "error"  // ← Agrega nueva regla
  }
}
```

2. Ejecuta lint:fix para aplicar a todos los archivos:

```bash
npm run lint:fix
```

3. Arregla manualmente cualquier violación restante.

**Reglas comunes para agregar:**
```json
{
  "rules": {
    "no-var": "error",                    // Usa let/const en lugar de var
    "prefer-const": "error",              // Usa const cuando no se reasigna
    "eqeqeq": "error",                    // Usa === en lugar de ==
    "no-console": "warn",                 // Advierte sobre console.log en producción
    "no-debugger": "error",               // Error en sentencias debugger
    "camelCase": "error"                  // Aplica camelCase para variables
  }
}
```

---

## Cómo Formatear Código Automáticamente

**Problema:** Tu código tiene formateo inconsistente y quieres arreglarlo todo de una vez.

**Solución:**

```bash
npm run format
```

Esto reescribe TODOS los archivos `.ts` para que coincidan con la configuración en `.prettierrc.json`.

**Qué arregla Prettier:**
- Indentación (2 espacios)
- Largo de línea (máximo 100 caracteres)
- Comas al final
- Comillas (comillas dobles)
- Punto y coma

**Ejemplo:**
```typescript
// ANTES
function x(a,b,c){return a+b+c}

// DESPUÉS
function x(a, b, c) {
  return a + b + c;
}
```

---

## Cómo Verificar si Prettier Haría Cambios

**Problema:** Quieres ver qué Prettier cambiaría SIN modificar archivos.

**Solución:**

```bash
npm run format:check
```

**Salida:**
```
✗ src/clients/extraerDatos.clients.ts
✓ src/utils/validar_curp.utils.ts
✓ src/errors/AppError.errors.ts

3 archivos serían reformateados.
```

---

## Cómo Configurar Prettier para tu Editor

**Problema:** Quieres que Prettier formatea tu código automáticamente cuando guardas.

**Solución:**

1. Instala extensión de VS Code: **Prettier - Code formatter**

2. Crea `.vscode/settings.json` en la raíz del proyecto:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

3. Ahora cuando guardas cualquier archivo `.ts`, se formatea automáticamente. ✨

---

## Cómo Compilar TypeScript y Verificar Errores

**Problema:** Quieres compilar tu TypeScript y detectar todos los errores de tipo.

**Solución:**

```bash
npm run build
```

Esto:
1. Ejecuta el compilador de TypeScript en todos los archivos `.ts` en `src/`
2. Reporta cualquier error de tipo
3. Compila a JavaScript en `dist/` (si no hay errores)

**Ejemplo de salida si hay errores:**
```
src/logger/logger.ts:36:48 - error TS2339: 
Property 'res' is declared but its value is never read.

src/utils/errorHandling.utils.ts:15:1 - error TS2532:
Object is possibly 'undefined'.
```

**Si ves errores:** Arrérgalos antes de que el código compile. Esto previene crashes en tiempo de ejecución.

---

## Cómo Arreglar Error de Tipo: "Property Does Not Exist"

**Problema:**
```typescript
// ❌ ERROR
const err: MulterError;
console.log(err.limit);  // Error: Property 'limit' no existe
```

**Solución:**

Verifica qué propiedades realmente existen en el tipo. Usa una constante en su lugar:

```typescript
// ✅ CORRECTO
import { MAX_FILE_SIZE } from "../config/constants";
console.log(MAX_FILE_SIZE);
```

O usa `Object.keys()` para inspeccionar:

```typescript
console.log(Object.keys(err));  // Ve qué propiedades existen
```

---

## Cómo Arreglar Error de Tipo: "Value is Declared but Never Used"

**Problema:**
```typescript
// ❌ ERROR
const apiKey = process.env.GEMINI_API_KEY;
// ESLint: 'apiKey' se asigna un valor pero nunca se usa
```

**Solución:**

**Opción 1: Usa la variable**
```typescript
// ✅ CORRECTO
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });
```

**Opción 2: Elimínala**
```typescript
// ✅ CORRECTO
// Si no la necesitas, borra la línea
```

**Opción 3: Marca como intencionalmente sin usar**
```typescript
// ✅ CORRECTO
const _apiKey = process.env.GEMINI_API_KEY;  // Prefijo con _
// Ahora ESLint sabe que intencionalmente no la usaste
```

---

## Cómo Ejecutar Todas las Verificaciones de Calidad en Secuencia

**Problema:** Quieres verificar todo antes de hacer commit del código.

**Solución:**

```bash
npm run build       # TypeScript
npm run lint        # ESLint
npm run format:check # Prettier
```

O crea un script en `package.json`:

```json
{
  "scripts": {
    "check-all": "npm run build && npm run lint && npm run format:check"
  }
}
```

Luego ejecuta:
```bash
npm run check-all
```

---

## Cómo Agregar Definición de Tipo TypeScript para Librería Externa

**Problema:** Usas una librería que no tiene tipos de TypeScript.

```typescript
// ❌ ERROR
import someLib from 'some-lib';
// Error: Could not find a declaration file for 'some-lib'
```

**Solución:**

**Opción 1: Instala paquete de tipos (preferido)**
```bash
npm install --save-dev @types/some-lib
```

**Opción 2: Si no existe paquete @types, crea uno básico**

Crea `src/types/some-lib.d.ts`:

```typescript
declare module 'some-lib' {
  function someLib(options: any): any;
  export default someLib;
}
```

**Opción 3: Usa tipo `any` (último recurso)**
```typescript
const someLib: any = require('some-lib');
```

---

## Cómo Crear un Pre-commit Hook (Git)

**Problema:** Quieres ejecutar automáticamente linting/formateo antes de cada commit.

**Solución:**

1. Instala `husky`:
```bash
npm install --save-dev husky
npx husky install
```

2. Agrega un pre-commit hook:
```bash
npx husky add .husky/pre-commit "npm run lint:fix && npm run format && npm run build"
```

3. Ahora cada vez que haces commit, este script se ejecuta automáticamente:
```
$ git commit
  → Ejecutando: npm run lint:fix
  → Ejecutando: npm run format
  → Ejecutando: npm run build
  ✓ Commit exitoso
```

Si cualquier paso falla, el commit se bloquea. 🛡️

---

## Cómo Configurar ESLint para Trabajar con tu IDE

**Problema:** Los errores de ESLint no se muestran en tu editor.

**Solución:**

1. Instala extensión de VS Code: **ESLint** (por Microsoft)

2. Crea `.vscode/settings.json`:

```json
{
  "eslint.enable": true,
  "eslint.validate": ["typescript", "typescriptreact"],
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

3. Ahora:
   - Los errores de ESLint se muestran como líneas rojas
   - Las advertencias se muestran como líneas amarillas
   - `Ctrl+Shift+P` → "ESLint: Fix All Auto-fixable Problems"

---

## Lista de Verificación Rápida

Antes de hacer push:

- [ ] `npm run build` pasa
- [ ] `npm run lint` muestra 0 errores
- [ ] `npm run format:check` no muestra cambios necesarios
- [ ] Todos los arreglos manuales completados
- [ ] Código probado localmente

✅ ¡Listo para hacer push!

