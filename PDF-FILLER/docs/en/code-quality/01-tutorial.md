<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

# Code Quality Setup — Tutorial

**Goal:** Learn how to set up and configure ESLint, Prettier, and TypeScript in your project to ensure code quality and consistency.

**Audience:** Developers new to code quality tools.

**Time to complete:** 30 minutes

---

## What You'll Learn

By the end of this tutorial, you'll understand:

- How ESLint catches bugs and enforces code standards
- How Prettier automatically formats code
- How TypeScript prevents type errors before runtime
- How these tools work together in the build pipeline
- How to run and fix code quality issues

---

## Prerequisites

- Node.js 20+ installed
- npm 9+ installed
- Basic understanding of npm and TypeScript

---

## Step 1: Understand the Tools

### ESLint

A **linter** that analyzes your code for potential errors and style violations.

- Catches bugs before runtime (unused variables, unreachable code, etc.)
- Enforces coding standards (naming conventions, consistency, etc.)
- Can auto-fix many issues automatically

### Prettier

A **code formatter** that automatically rewrites your code to match a consistent style.

- Removes style debates (tabs vs spaces, semicolons, etc.)
- Formats on save (if configured in your editor)
- Enforces a single, consistent code style

### TypeScript

A **type checker** that prevents type errors during development.

- Catches type mismatches before runtime (e.g., calling `.length` on a number)
- Provides better IDE autocomplete and documentation
- Compiles to JavaScript that runs in Node.js

---

## Step 2: Install Dependencies

Your project already has these configured. To verify they're installed:

```bash
npm ls eslint typescript prettier
```

**Output should show:**

```
eslint@8.55.0
typescript@5.0.0
prettier@3.0.0
```

If missing, install them:

```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier
```

---

## Step 3: Review Configuration Files

Your project has three key configuration files in the root directory:

### `tsconfig.json` — TypeScript Configuration

Controls how TypeScript compiles your code:

```json
{
  "compilerOptions": {
    "target": "ES2020", // JavaScript version to target
    "module": "commonjs", // Module system (Node.js uses CommonJS)
    "strict": true, // Enable ALL type checking
    "sourceMap": true, // Map compiled JS back to TS for debugging
    "declaration": true, // Generate .d.ts files for type definitions
    "outDir": "./dist" // Where compiled JS goes
  }
}
```

### `.eslintrc.json` — ESLint Configuration

Defines which code patterns are allowed/forbidden:

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

### `.prettierrc.json` — Prettier Configuration

Defines the code style:

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

## Step 4: Run the Tools

### Build TypeScript

Compile your TypeScript code to JavaScript:

```bash
npm run build
```

**What happens:**

- TypeScript reads all `.ts` files in `src/`
- Checks every type annotation
- Reports errors if types don't match
- Compiles to JavaScript in the `dist/` folder

**Example error you might see:**

```
src/logger/logger.ts:36:48 - error TS2339:
Property 'res' is declared but its value is never read.
```

### Lint Your Code

Check for code quality issues:

```bash
npm run lint
```

**What happens:**

- ESLint reads all `.ts` files (except those in `.eslintignore`)
- Checks for violations of the rules in `.eslintrc.json`
- Reports violations with line numbers and fixes

**Example output:**

```
src/utils/errorHandling.utils.ts
  15:1  error  Unexpected var, use let or const  (no-var)

2 errors, 0 warnings
```

### Auto-Fix Issues

ESLint can fix many issues automatically:

```bash
npm run lint:fix
```

**What happens:**

- ESLint runs with the `--fix` flag
- Automatically fixes all issues it can (unused imports, const vs let, semicolons, etc.)
- Reports only issues that require manual fixes

### Format Code

Prettier rewrites your code to match the style:

```bash
npm run format
```

**What happens:**

- Prettier reads all `.ts` files
- Reformats them (spacing, indentation, line breaks, etc.)
- Overwrites the files in place

**Example transformation:**

```typescript
// BEFORE (inconsistent style)
function add(a, b) {
  return a + b;
}

// AFTER (Prettier formats it)
function add(a, b) {
  return a + b;
}
```

---

## Step 5: Check Your Progress

Verify all tools are happy:

```bash
npm run build       # TypeScript compilation
npm run lint        # ESLint checks
npm run format:check # Prettier dry-run (don't modify files)
```

If all three pass with no errors, you're done! ✅

---

## Step 6: Understanding Common Errors

### Error: "Property 'X' does not exist"

**Cause:** TypeScript type mismatch.

**Fix:**

```typescript
// ❌ WRONG
const err: MulterError;
console.log(err.limit); // Error: 'limit' doesn't exist

// ✅ RIGHT
import { MAX_FILE_SIZE } from "../config/constants";
console.log(MAX_FILE_SIZE);
```

### Error: "'X' is declared but never used"

**Cause:** Unused variable.

**Fix:**

```typescript
// ❌ WRONG
const unused = 42;
console.log("hello");

// ✅ RIGHT (rename with underscore)
const _unused = 42;
console.log("hello");
```

### Error: "next is not a function"

**Cause:** Express middleware missing `res` parameter.

**Fix:**

```typescript
// ❌ WRONG
export const middleware = (req: Request, next: NextFunction) => {
  next();
};

// ✅ RIGHT
export const middleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};
```

---

## Step 7: Integrate With Your Workflow

### In Your Editor (VS Code)

1. Install extension: **ESLint** (by Microsoft)
2. Install extension: **Prettier - Code formatter** (by Prettier)
3. Create `.vscode/settings.json` in project root:

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

Now:

- Prettier formats on save automatically ✨
- ESLint warnings appear inline in your editor
- `Ctrl+Shift+P` → "Format Document" → formats with Prettier

### In Your Git Workflow (Optional)

Install `husky` to run linting before every commit:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Then create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint:fix
npm run format
npm run build
```

Now every commit is automatically checked. 🎯

---

## Summary

You now know:

- ✅ ESLint catches bugs and enforces standards
- ✅ Prettier keeps code style consistent
- ✅ TypeScript prevents type errors
- ✅ How to run each tool (`npm run build`, `npm run lint`, `npm run format`)
- ✅ How to fix common errors
- ✅ How to integrate with your editor

**Next steps:**

- Read the [How-to Guides](./02-how-to-guides.md) for practical recipes
- Check the [Reference](./03-reference.md) for all ESLint rules
- Read the [Explanation](./04-explanation.md) to understand the philosophy

---

## Quick Reference

| Command                | What it does                         | Auto-fix?      |
| ---------------------- | ------------------------------------ | -------------- |
| `npm run build`        | TypeScript compilation check         | ❌ Manual      |
| `npm run lint`         | Run ESLint                           | ❌ Report only |
| `npm run lint:fix`     | Run ESLint + auto-fix                | ✅ Yes         |
| `npm run format`       | Run Prettier                         | ✅ Yes         |
| `npm run format:check` | Check if Prettier would change files | ❌ Report only |
