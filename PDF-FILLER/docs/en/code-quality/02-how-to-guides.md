<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

# Code Quality — How-to Guides

Practical recipes for common tasks with ESLint, Prettier, and TypeScript.

---

## How to Fix ESLint Errors Automatically

**Problem:** You have many ESLint errors and want to fix them quickly.

**Solution:**

```bash
npm run lint:fix
```

This command:

1. Runs ESLint with the `--fix` flag
2. Automatically fixes ~80% of errors (unused imports, semicolons, const/let, spacing, etc.)
3. Reports remaining errors that need manual fixes

**Example:**

```
BEFORE:
  ✗ 15 errors

AFTER running lint:fix:
  ✗ 3 errors (need manual fixes)
  ✓ 12 errors fixed
```

---

## How to Disable ESLint Rule for a Single Line

**Problem:** You have a legitimate reason to break an ESLint rule on one specific line.

**Solution:**

Add a comment above the line:

```typescript
// eslint-disable-next-line no-console
console.log("This is fine in this specific case");
```

Or on the same line:

```typescript
console.log("Debug value:", x); // eslint-disable-line no-console
```

**When to use:**

- ✅ Temporarily for debugging
- ✅ When you have a valid reason (documented in the comment)
- ❌ NOT as a habit to bypass standards

**Better approach:** Understand why the rule exists and follow it instead.

---

## How to Disable ESLint Rule for Entire File

**Problem:** You need to disable a rule for an entire file (e.g., a generated or third-party file).

**Solution:**

Add at the top of the file:

```typescript
/* eslint-disable no-console */

// Your code here...
```

Or disable multiple rules:

```typescript
/* eslint-disable no-console, no-unused-vars */
```

---

## How to Disable ESLint for Entire Directory

**Problem:** You want certain directories to skip ESLint checks (e.g., `dist/`, `node_modules/`).

**Solution:**

Edit `.eslintignore`:

```
dist/
node_modules/
*.test.ts
coverage/
```

**What's already ignored:**

```
dist/              # Compiled output
node_modules/      # Dependencies
logs/              # Log files
*.env              # Environment files
```

---

## How to Add a New ESLint Rule

**Problem:** You want to enforce a new coding standard (e.g., no `var` declarations).

**Solution:**

1. Edit `.eslintrc.json`:

```json
{
  "rules": {
    "no-var": "error" // ← Add new rule
  }
}
```

2. Run lint:fix to apply to all files:

```bash
npm run lint:fix
```

3. Manually fix any remaining violations.

**Common rules to add:**

```json
{
  "rules": {
    "no-var": "error", // Use let/const instead
    "prefer-const": "error", // Use const when not reassigned
    "eqeqeq": "error", // Use === instead of ==
    "no-console": "warn", // Warn on console.log in production
    "no-debugger": "error", // Error on debugger statements
    "camelCase": "error" // Enforce camelCase for variables
  }
}
```

---

## How to Format Code Automatically

**Problem:** Your code has inconsistent formatting and you want to fix it all at once.

**Solution:**

```bash
npm run format
```

This rewrites ALL `.ts` files to match `.prettierrc.json` settings.

**What Prettier fixes:**

- Indentation (2 spaces)
- Line length (100 characters max)
- Trailing commas
- Quotes (double quotes)
- Semicolons

**Example:**

```typescript
// BEFORE
function x(a, b, c) {
  return a + b + c;
}

// AFTER
function x(a, b, c) {
  return a + b + c;
}
```

---

## How to Check if Prettier Would Change Files

**Problem:** You want to see what Prettier would change WITHOUT modifying files.

**Solution:**

```bash
npm run format:check
```

**Output:**

```
✗ src/clients/extraerDatos.clients.ts
✓ src/utils/validar_curp.utils.ts
✓ src/errors/AppError.errors.ts

3 files would be reformatted.
```

---

## How to Configure Prettier for Your Editor

**Problem:** You want Prettier to format your code automatically when you save.

**Solution:**

1. Install VS Code extension: **Prettier - Code formatter**

2. Create `.vscode/settings.json` in project root:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

3. Now when you save any `.ts` file, it formats automatically. ✨

---

## How to Compile TypeScript and Check for Errors

**Problem:** You want to compile your TypeScript and catch all type errors.

**Solution:**

```bash
npm run build
```

This:

1. Runs TypeScript compiler on all `.ts` files in `src/`
2. Reports any type errors
3. Compiles to JavaScript in `dist/` (if no errors)

**Example output if errors exist:**

```
src/logger/logger.ts:36:48 - error TS2339:
Property 'res' is declared but its value is never read.

src/utils/errorHandling.utils.ts:15:1 - error TS2532:
Object is possibly 'undefined'.
```

**If you see errors:** Fix them before the code compiles. This prevents runtime crashes.

---

## How to Fix Type Error: "Property Does Not Exist"

**Problem:**

```typescript
// ❌ ERROR
const err: MulterError;
console.log(err.limit); // Error: Property 'limit' does not exist
```

**Solution:**

Check what properties actually exist on the type. Use a constant instead:

```typescript
// ✅ CORRECT
import { MAX_FILE_SIZE } from "../config/constants";
console.log(MAX_FILE_SIZE);
```

Or use `Object.keys()` to inspect:

```typescript
console.log(Object.keys(err)); // See what properties exist
```

---

## How to Fix Type Error: "Value is Declared but Never Used"

**Problem:**

```typescript
// ❌ ERROR
const apiKey = process.env.GEMINI_API_KEY;
// ESLint: 'apiKey' is assigned a value but never used
```

**Solution:**

**Option 1: Use the variable**

```typescript
// ✅ CORRECT
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });
```

**Option 2: Remove it**

```typescript
// ✅ CORRECT
// If you don't need it, delete the line
```

**Option 3: Mark as intentionally unused**

```typescript
// ✅ CORRECT
const _apiKey = process.env.GEMINI_API_KEY; // Prefix with _
// Now ESLint knows you intentionally didn't use it
```

---

## How to Run All Quality Checks in Sequence

**Problem:** You want to verify everything before committing code.

**Solution:**

```bash
npm run build       # TypeScript
npm run lint        # ESLint
npm run format:check # Prettier
```

Or create a script in `package.json`:

```json
{
  "scripts": {
    "check-all": "npm run build && npm run lint && npm run format:check"
  }
}
```

Then run:

```bash
npm run check-all
```

---

## How to Add TypeScript Type Definition for External Library

**Problem:** You're using a library that doesn't have TypeScript types.

```typescript
// ❌ ERROR
import someLib from "some-lib";
// Error: Could not find a declaration file for 'some-lib'
```

**Solution:**

**Option 1: Install types package (preferred)**

```bash
npm install --save-dev @types/some-lib
```

**Option 2: If no @types package exists, create a basic one**

Create `src/types/some-lib.d.ts`:

```typescript
declare module "some-lib" {
  function someLib(options: any): any;
  export default someLib;
}
```

**Option 3: Use `any` type (last resort)**

```typescript
const someLib: any = require("some-lib");
```

---

## How to Create a Pre-commit Hook (Git)

**Problem:** You want to automatically run linting/formatting before every commit.

**Solution:**

1. Install `husky`:

```bash
npm install --save-dev husky
npx husky install
```

2. Add a pre-commit hook:

```bash
npx husky add .husky/pre-commit "npm run lint:fix && npm run format && npm run build"
```

3. Now every time you commit, this script runs automatically:

```
$ git commit
  → Running: npm run lint:fix
  → Running: npm run format
  → Running: npm run build
  ✓ Commit successful
```

If any step fails, the commit is blocked. 🛡️

---

## How to Configure ESLint to Work with Your IDE

**Problem:** ESLint errors aren't showing in your editor.

**Solution:**

1. Install VS Code extension: **ESLint** (by Microsoft)

2. Create `.vscode/settings.json`:

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

3. Now:
   - ESLint errors show as red squiggles
   - Warnings show as yellow squiggles
   - `Ctrl+Shift+P` → "ESLint: Fix All Auto-fixable Problems"

---

## Quick Checklist

Before pushing code:

- [ ] `npm run build` passes
- [ ] `npm run lint` shows 0 errors
- [ ] `npm run format:check` shows no changes needed
- [ ] All manual fixes completed
- [ ] Code tested locally

✅ You're ready to push!
