<div align="left">
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
  <a href="../../es/code-quality/README.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>
# Code Quality Documentation

Complete documentation on ESLint, Prettier, and TypeScript setup for the Rellenador de Contratos project.

---

## Overview

This section covers how to maintain high code quality standards using three complementary tools:

- **ESLint** — Catches logical errors and enforces coding standards
- **Prettier** — Automatically formats code for consistency
- **TypeScript** — Prevents type errors before runtime

---

## Documentation Structure

### 📚 [Tutorial: Getting Started](./01-tutorial.md)

**For:** Developers new to code quality tools  
**Contains:** Step-by-step guide to understand and use each tool  
**Time:** 30 minutes  
**Goal:** Understand what each tool does and how to run them

### 🛠️ [How-to Guides](./02-how-to-guides.md)

**For:** Developers solving specific problems  
**Contains:** Practical recipes for common tasks  
**Examples:** How to fix errors, configure tools, set up editor integration  
**Goal:** Quick solutions to real problems

### 📖 [Reference](./03-reference.md)

**For:** Developers needing technical details  
**Contains:** Complete lists of rules, options, and configurations  
**Examples:** All ESLint rules, TypeScript compiler options, Prettier settings  
**Goal:** Look up exact values and technical details

### 💡 [Explanation](./04-explanation.md)

**For:** Developers wanting to understand the philosophy  
**Contains:** Why code quality matters, benefits, ROI  
**Examples:** Real-world scenarios, business case  
**Goal:** Understand the big picture and motivation

---

## Quick Start

**First time here?** Start with the [Tutorial](./01-tutorial.md).

**Need to solve a problem?** Check the [How-to Guides](./02-how-to-guides.md).

**Looking for technical details?** Use the [Reference](./03-reference.md).

**Want to understand why?** Read the [Explanation](./04-explanation.md).

---

## Essential Commands

```bash
# Check TypeScript compilation
npm run build

# Run ESLint checks
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check if Prettier would change files
npm run format:check
```

---

## Configuration Files

| File                    | Purpose                        |
| ----------------------- | ------------------------------ |
| `tsconfig.json`         | TypeScript compiler options    |
| `.eslintrc.json`        | ESLint rules and configuration |
| `.prettierrc.json`      | Prettier formatting options    |
| `.eslintignore`         | Files ESLint should skip       |
| `.vscode/settings.json` | VS Code integration (optional) |

---

## Common Issues

**"Property 'X' does not exist"** → See [How-to: Fix Type Errors](./02-how-to-guides.md#how-to-fix-type-error-property-does-not-exist)

**"Variable is declared but never used"** → See [How-to: Unused Variables](./02-how-to-guides.md#how-to-fix-type-error-value-is-declared-but-never-used)

**Editor not showing errors** → See [How-to: Configure ESLint for IDE](./02-how-to-guides.md#how-to-configure-eslint-to-work-with-your-ide)

---

## Philosophy

Code Quality tools exist for one reason: **to make development faster and safer**.

They catch bugs that humans miss, enforce consistency so teams stay aligned, and prevent crashes before they reach production.

Learn more in the [Explanation](./04-explanation.md).

---

## What's Next?

- [ ] Read the [Tutorial](./01-tutorial.md)
- [ ] Run `npm run build && npm run lint && npm run format:check`
- [ ] Fix any errors using [How-to Guides](./02-how-to-guides.md)
- [ ] Configure your editor for automatic formatting
- [ ] Share this documentation with your team

---

## Questions?

Refer to the appropriate section:

- **Learning:** [Tutorial](./01-tutorial.md)
- **Doing:** [How-to Guides](./02-how-to-guides.md)
- **Understanding:** [Reference](./03-reference.md) or [Explanation](./04-explanation.md)
