<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>

# Calidad de Código — Referencia

Referencia técnica completa para reglas de ESLint, opciones del compilador de TypeScript y configuración de Prettier.

---

## Reglas de ESLint

Todas las reglas de ESLint configuradas en `.eslintrc.json`.

### Reglas Activas Actualmente

| Regla | Nivel | Propósito | ¿Auto-arreglable? |
|-------|-------|----------|-------------------|
| `@typescript-eslint/no-unused-vars` | error | Previene variables sin usar | ✅ Sí |
| `no-console` | warn | Advierte sobre console | ❌ No |
| `semi` | error | Requiere punto y coma | ✅ Sí |
| `quotes` | error | Aplica comillas dobles | ✅ Sí |
| `indent` | error | Aplica indentación de 2 espacios | ✅ Sí |
| `comma-dangle` | error | Requiere comas al final en multiline | ✅ Sí |
| `no-var` | error | Prohíbe `var`, requiere `let`/`const` | ✅ Sí |
| `prefer-const` | error | Prefiere `const` sobre `let` cuando es posible | ✅ Sí |
| `eqeqeq` | error | Requiere `===` y `!==` | ✅ Sí |
| `no-implicit-any` | error | Sin tipos `any` implícitos | ❌ No |
| `no-explicit-any` | warn | Advierte sobre tipos `any` explícitos | ❌ No |

### Reglas Recomendadas para Agregar

```json
{
  "rules": {
    "no-debugger": "error",
    "no-unreachable": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "valid-typeof": "error",
    "no-return-assign": "error",
    "no-self-compare": "error",
    "use-isnan": "error"
  }
}
```

---

## Opciones del Compilador de TypeScript

Configuración en `tsconfig.json`.

### Referencia de Opciones del Compilador

| Opción | Valor | Propósito |
|--------|-------|----------|
| `target` | `ES2020` | Versión de JavaScript para compilar |
| `module` | `commonjs` | Sistema de módulos (Node.js usa CommonJS) |
| `lib` | `["ES2020"]` | Definiciones de librería de TypeScript |
| `outDir` | `./dist` | Directorio de salida para archivos `.js` compilados |
| `rootDir` | `./src` | Directorio raíz de archivos fuente `.ts` |
| `strict` | `true` | Habilita todas las opciones de verificación de tipo estricto |
| `esModuleInterop` | `true` | Permite interoperabilidad CommonJS/ES6 |
| `skipLibCheck` | `true` | Omite verificación de tipo de archivos de declaración |
| `forceConsistentCasingInFileNames` | `true` | Aplica mayúsculas consistentes en importaciones |
| `resolveJsonModule` | `true` | Permite importar archivos `.json` |
| `declaration` | `true` | Genera archivos de declaración `.d.ts` |
| `declarationMap` | `true` | Genera sourcemaps para archivos `.d.ts` |
| `sourceMap` | `true` | Genera sourcemaps `.js.map` para debugging |
| `noImplicitAny` | `true` | Error en tipos `any` implícitos |
| `strictNullChecks` | `true` | Error en acceso potencial a `null`/`undefined` |
| `strictFunctionTypes` | `true` | Verificación estricta de tipos de función |
| `noUnusedLocals` | `true` | Error en variables locales sin usar |
| `noUnusedParameters` | `true` | Error en parámetros de función sin usar |
| `noImplicitReturns` | `true` | Error en funciones sin return explícito |
| `noFallthroughCasesInSwitch` | `true` | Error en switch sin break |

### Desglose del Modo Estricto

Cuando `"strict": true`, se habilitan:

- `noImplicitAny` — Sin `any` implícito
- `strictNullChecks` — Manejo explícito de null/undefined
- `strictFunctionTypes` — Tipos estrictos de parámetros
- `strictBindCallApply` — Verificación estricta de bind/call/apply
- `strictPropertyInitialization` — Requiere inicialización de propiedades
- `noImplicitThis` — Sin `this: any` implícito
- `alwaysStrict` — Analiza en modo estricto, emite "use strict"

---

## Configuración de Prettier

Configuración en `.prettierrc.json`.

### Opciones de Prettier

| Opción | Valor | Propósito |
|--------|-------|----------|
| `semi` | `true` | Agrega punto y coma al final de sentencias |
| `singleQuote` | `false` | Usa comillas dobles (no simples) |
| `trailingComma` | `"es5"` | Agrega comas al final donde es válido en ES5 |
| `tabWidth` | `2` | Indenta con 2 espacios |
| `useTabs` | `false` | Usa espacios (no tabs) |
| `printWidth` | `100` | Envuelve líneas en 100 caracteres |
| `bracketSpacing` | `true` | Agrega espacios dentro de brackets de objetos |
| `arrowParens` | `"always"` | Envuelve parámetros de arrow function en paréntesis |
| `endOfLine` | `"lf"` | Usa finales de línea LF (Unix/Linux/Mac) |

### Comportamiento Predeterminado de Prettier

```typescript
// ENTRADA
const x={a:1,b:2}
const fn=()=>x

// SALIDA (después de prettier)
const x = { a: 1, b: 2 };
const fn = () => x;
```

---

## Scripts npm

Todos los scripts disponibles en `package.json`.

| Script | Comando | Propósito |
|--------|---------|----------|
| `build` | `tsc` | Compila TypeScript a JavaScript |
| `start` | `node dist/app.js` | Ejecuta aplicación compilada |
| `dev` | `ts-node app.ts` | Ejecuta TypeScript directamente (desarrollo) |
| `lint` | `eslint src --ext .ts` | Verifica código con ESLint |
| `lint:fix` | `eslint src --ext .ts --fix` | Auto-arregla problemas de ESLint |
| `format` | `prettier --write "src/**/*.ts"` | Formatea todo el código con Prettier |
| `format:check` | `prettier --check "src/**/*.ts"` | Verifica si archivos necesitan formateo |

---

## Patrones de Archivo

### `.eslintignore`
Archivos/directorios que ESLint omite:

```
dist/              # Salida compilada
node_modules/      # Dependencias
logs/              # Archivos de log
*.env              # Archivos de entorno
public/            # Archivos frontend
contrato.pdf       # Archivos binarios
```

### `.prettierignore`
Archivos/directorios que Prettier omite:

```
dist/
node_modules/
*.pdf
*.xlsx
```

---

## Niveles de Severidad de Error

| Nivel | Significado | Impacto de Build |
|-------|-------------|-----------------|
| `"error"` | La violación debe arreglarse | ❌ Build falla |
| `"warn"` | Se reporta pero se permite | ✅ Build exitoso |
| `"off"` | Regla deshabilitada | ✅ Sin verificación |

---

## Códigos Comunes de Error de TypeScript

| Código | Error | Ejemplo |
|--------|-------|---------|
| TS2339 | La propiedad no existe | `err.limit` (no existe en MulterError) |
| TS2532 | Object posiblemente undefined | `value?.property` requerido |
| TS2322 | El tipo no es asignable | `const x: number = "hello"` |
| TS2531 | Object posiblemente null | `obj.method()` sin null check |
| TS2339 | No se puede encontrar nombre | `console.lgg()` (typo) |
| TS7006 | Parámetro sin anotación de tipo | `const fn = (x) => x` |

---

## Códigos Comunes de Error de ESLint

| Código | Mensaje | Auto-arreglable |
|--------|---------|-----------------|
| `no-unused-vars` | Variable definida pero no usada | ✅ Remover |
| `semi` | Punto y coma faltante | ✅ Agregar |
| `quotes` | Tipo de comilla incorrecto | ✅ Arreglar |
| `no-var` | Uso de `var` prohibido | ✅ Reemplazar con `let`/`const` |
| `no-console` | console.X encontrado | ❌ Manual |
| `eqeqeq` | Usa `===` en lugar de `==` | ✅ Reemplazar |
| `indent` | Indentación incorrecta | ✅ Arreglar |
| `prefer-const` | Variable nunca reasignada | ✅ Cambiar a `const` |

---

## Errores del Modo Estricto de TypeScript que Verás

### Error: Object is possibly 'undefined'

```typescript
// ❌ ERROR
const value = obj.property;
console.log(value.toUpperCase());

// ✅ ARREGLADO
const value = obj?.property;
if (value) {
  console.log(value.toUpperCase());
}
```

### Error: Type 'string' is not assignable to type 'number'

```typescript
// ❌ ERROR
const num: number = "42";

// ✅ ARREGLADO
const num: number = parseInt("42", 10);
```

### Error: Parameter 'x' implicitly has an 'any' type

```typescript
// ❌ ERROR
const fn = (x) => x * 2;

// ✅ ARREGLADO
const fn = (x: number): number => x * 2;
```

---

## Árboles de Decisión Rápida

### "¿Debo usar var, let o const?"

```
Usa const por defecto
   ↓
¿La variable será reasignada?
   ├─ Sí → Usa let
   └─ No → Mantén const
```

### "¿Debo desactivar una regla de ESLint?"

```
¿Hay una razón legítima para romper esta regla?
   ├─ No → No desactives, sigue la regla
   ├─ Sí → ¿Es una excepción única?
   │   ├─ Sí → Usa eslint-disable-next-line
   │   └─ No → Agrega a .eslintignore
   └─ ¿Múltiples veces en la base de código?
       └─ Actualiza nivel de regla en .eslintrc.json
```

### "¿Debo agregar tipo `any`?"

```
¿Puedes determinar el tipo?
   ├─ Sí → Define el tipo apropiado
   ├─ No, pero es externo → Usa `unknown` primero, estrecha con checks
   └─ Sin opción, temporal → Usa `any` + comentario TODO
```

---

## Ubicación de Archivos de Configuración

| Archivo | Propósito | Ubicación |
|---------|----------|----------|
| `tsconfig.json` | Compilador de TypeScript | Raíz |
| `.eslintrc.json` | Reglas de ESLint | Raíz |
| `.prettierrc.json` | Formateo de Prettier | Raíz |
| `.eslintignore` | Patrones de ignorado de ESLint | Raíz |
| `.vscode/settings.json` | Configuración del editor VS Code | Raíz/.vscode/ |
| `.husky/pre-commit` | Hook de pre-commit de Git | Raíz/.husky/ |

