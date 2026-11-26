<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

# Code Quality — Reference

Complete technical reference for ESLint rules, TypeScript compiler options, and Prettier configuration.

---

## ESLint Rules

All ESLint rules configured in `.eslintrc.json`.

### Current Active Rules

| Rule | Level | Purpose | Auto-fix? |
|------|-------|---------|-----------|
| `@typescript-eslint/no-unused-vars` | error | Prevents unused variables | ✅ Yes |
| `no-console` | warn | Warns about console usage | ❌ No |
| `semi` | error | Requires semicolons | ✅ Yes |
| `quotes` | error | Enforces double quotes | ✅ Yes |
| `indent` | error | Enforces 2-space indentation | ✅ Yes |
| `comma-dangle` | error | Requires trailing commas in multiline | ✅ Yes |
| `no-var` | error | Forbids `var`, requires `let`/`const` | ✅ Yes |
| `prefer-const` | error | Prefers `const` over `let` when possible | ✅ Yes |
| `eqeqeq` | error | Requires `===` and `!==` | ✅ Yes |
| `no-implicit-any` | error | No implicit `any` types | ❌ No |
| `no-explicit-any` | warn | Warns about explicit `any` types | ❌ No |

### Recommended Rules to Add

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

## TypeScript Compiler Options

Configuration in `tsconfig.json`.

### Compiler Options Reference

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | `ES2020` | JavaScript version to compile to |
| `module` | `commonjs` | Module system (Node.js uses CommonJS) |
| `lib` | `["ES2020"]` | TypeScript library definitions |
| `outDir` | `./dist` | Output directory for compiled `.js` files |
| `rootDir` | `./src` | Root directory of source `.ts` files |
| `strict` | `true` | Enable all strict type checking options |
| `esModuleInterop` | `true` | Allow CommonJS/ES6 interoperability |
| `skipLibCheck` | `true` | Skip type checking of declaration files |
| `forceConsistentCasingInFileNames` | `true` | Enforce consistent casing in imports |
| `resolveJsonModule` | `true` | Allow importing `.json` files |
| `declaration` | `true` | Generate `.d.ts` declaration files |
| `declarationMap` | `true` | Generate sourcemaps for `.d.ts` files |
| `sourceMap` | `true` | Generate `.js.map` sourcemaps for debugging |
| `noImplicitAny` | `true` | Error on implicit `any` types |
| `strictNullChecks` | `true` | Error on potential `null`/`undefined` access |
| `strictFunctionTypes` | `true` | Strict function type checking |
| `noUnusedLocals` | `true` | Error on unused local variables |
| `noUnusedParameters` | `true` | Error on unused function parameters |
| `noImplicitReturns` | `true` | Error on functions without explicit return |
| `noFallthroughCasesInSwitch` | `true` | Error on switch fallthrough |

### Strict Mode Breakdown

When `"strict": true`, these are enabled:

- `noImplicitAny` — No implicit `any`
- `strictNullChecks` — Explicit null/undefined handling
- `strictFunctionTypes` — Strict function parameter types
- `strictBindCallApply` — Strict bind/call/apply checking
- `strictPropertyInitialization` — Require property initialization
- `noImplicitThis` — No implicit `this: any`
- `alwaysStrict` — Parse in strict mode, emit "use strict"

---

## Prettier Configuration

Configuration in `.prettierrc.json`.

### Prettier Options

| Option | Value | Purpose |
|--------|-------|---------|
| `semi` | `true` | Add semicolons at statement ends |
| `singleQuote` | `false` | Use double quotes (not single) |
| `trailingComma` | `"es5"` | Add trailing commas where valid in ES5 |
| `tabWidth` | `2` | Indent with 2 spaces |
| `useTabs` | `false` | Use spaces (not tabs) |
| `printWidth` | `100` | Wrap lines at 100 characters |
| `bracketSpacing` | `true` | Add spaces inside object brackets `{ x }` |
| `arrowParens` | `"always"` | Wrap arrow function parameters in parens |
| `endOfLine` | `"lf"` | Use LF line endings (Unix/Linux/Mac) |

### Default Prettier Behavior

```typescript
// INPUT
const x={a:1,b:2}
const fn=()=>x

// OUTPUT (after prettier)
const x = { a: 1, b: 2 };
const fn = () => x;
```

---

## npm Scripts

All available scripts in `package.json`.

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/app.js` | Run compiled application |
| `dev` | `ts-node app.ts` | Run TypeScript directly (development) |
| `lint` | `eslint src --ext .ts` | Check code with ESLint |
| `lint:fix` | `eslint src --ext .ts --fix` | Auto-fix ESLint issues |
| `format` | `prettier --write "src/**/*.ts"` | Format all code with Prettier |
| `format:check` | `prettier --check "src/**/*.ts"` | Check if files need formatting |

---

## File Patterns

### `.eslintignore`
Files/directories ESLint skips:

```
dist/              # Compiled output
node_modules/      # Dependencies
logs/              # Log files
*.env              # Environment files
public/            # Frontend files
contrato.pdf       # Binary files
```

### `.prettierignore`
Files/directories Prettier skips:

```
dist/
node_modules/
*.pdf
*.xlsx
```

---

## Error Severity Levels

| Level | Meaning | Build Impact |
|-------|---------|--------------|
| `"error"` | Violation must be fixed | ❌ Build fails |
| `"warn"` | Violation reported but allowed | ✅ Build succeeds |
| `"off"` | Rule disabled | ✅ No checking |

---

## Common TypeScript Error Codes

| Code | Error | Example |
|------|-------|---------|
| TS2339 | Property does not exist | `err.limit` (doesn't exist on MulterError) |
| TS2532 | Object is possibly undefined | `value?.property` required |
| TS2322 | Type is not assignable | `const x: number = "hello"` |
| TS2531 | Object is possibly null | `obj.method()` without null check |
| TS2339 | Cannot find name | `console.lgg()` (typo) |
| TS7006 | Parameter lacks type annotation | `const fn = (x) => x` |

---

## Common ESLint Error Codes

| Code | Message | Auto-fix |
|------|---------|----------|
| `no-unused-vars` | Variable is defined but not used | ✅ Remove |
| `semi` | Missing semicolon | ✅ Add |
| `quotes` | Wrong quote type | ✅ Fix |
| `no-var` | Use of forbidden `var` | ✅ Replace with `let`/`const` |
| `no-console` | console.X found | ❌ Manual |
| `eqeqeq` | Use `===` instead of `==` | ✅ Replace |
| `indent` | Incorrect indentation | ✅ Fix |
| `prefer-const` | Variable never reassigned | ✅ Change to `const` |

---

## TypeScript Strict Mode Errors You'll See

### Error: Object is possibly 'undefined'

```typescript
// ❌ ERROR
const value = obj.property;
console.log(value.toUpperCase());

// ✅ FIXED
const value = obj?.property;
if (value) {
  console.log(value.toUpperCase());
}
```

### Error: Type 'string' is not assignable to type 'number'

```typescript
// ❌ ERROR
const num: number = "42";

// ✅ FIXED
const num: number = parseInt("42", 10);
```

### Error: Parameter 'x' implicitly has an 'any' type

```typescript
// ❌ ERROR
const fn = (x) => x * 2;

// ✅ FIXED
const fn = (x: number): number => x * 2;
```

---

## Quick Decision Trees

### "Should I use var, let, or const?"

```
Use const by default
   ↓
Will the variable be reassigned?
   ├─ Yes → Use let
   └─ No → Keep const
```

### "Should I disable an ESLint rule?"

```
Is there a legitimate reason to break this rule?
   ├─ No → Don't disable, follow the rule
   ├─ Yes → Is it a one-time exception?
   │   ├─ Yes → Use eslint-disable-next-line
   │   └─ No → Add rule to .eslintignore
   └─ Multiple times across codebase?
       └─ Update .eslintrc.json rule level to warn or off
```

### "Should I add `any` type?"

```
Can you determine the type?
   ├─ Yes → Define the proper type
   ├─ No, but it's external → Use `unknown` first, narrow with checks
   └─ No choice, temporary → Use `any` + TODO comment
```

---

## Configuration Files Location

| File | Purpose | Location |
|------|---------|----------|
| `tsconfig.json` | TypeScript compiler | Root |
| `.eslintrc.json` | ESLint rules | Root |
| `.prettierrc.json` | Prettier formatting | Root |
| `.eslintignore` | ESLint ignore patterns | Root |
| `.vscode/settings.json` | VS Code editor settings | Root/.vscode/ |
| `.husky/pre-commit` | Git pre-commit hook | Root/.husky/ |

