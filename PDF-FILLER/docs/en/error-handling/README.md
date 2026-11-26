<div align="left">
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
  <a href="../../es/error-handling/README.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>

# Error Handling

Learn how to handle errors properly in RellenadorContratos.

---

**Navigation:** Home › Docs › Error Handling

---

## Overview

The error handling system ensures:

- ✅ Consistent error format across all endpoints
- ✅ Proper HTTP status codes
- ✅ Automatic logging with request IDs
- ✅ Easy debugging and error tracing
- ✅ Better frontend error handling

---

## Documentation Structure

This documentation follows the **Diátaxis Framework**:

### 📚 [Tutorial](./01-tutorial.md) — _Learning_

**Start here if you're new.** A step-by-step guide that teaches how errors flow through the system.

- Understand the error flow
- Learn error classes
- How asyncHandler works
- How global error handler works
- Request ID tracking

**Time:** 25 minutes

---

### 🔧 [How-to Guides](./02-how-to-guides.md) — _Recipes_

**Use these to solve specific problems.** Practical recipes for common scenarios.

- How to throw a basic error
- How to handle file upload errors
- How to validate request data
- How to handle external API failures
- How to validate document quality
- How to create custom error classes
- How to capture and log errors
- How to handle nested/dependent validation
- How to handle batch operations
- How to handle timeout errors
- How to use error codes for frontend handling

**Time:** Look up what you need (5-10 minutes per recipe)

---

### 📖 [Reference](./03-reference.md) — _Lookup_

**Use this to find specific details.** Complete technical reference for all error types and codes.

- Error class signatures
- All error classes and HTTP codes
- Standard error codes (400, 401, 404, 500, 502, 429)
- Error response structure
- HTTP status codes explained
- Multer error codes
- Error flow diagram
- Logging format
- Request ID format
- Best practices
- Quick reference table

**Time:** Lookup as needed

---

### 💡 [Explanation](./04-explanation.md) — _Understanding_

**Read this to understand why.** Deep dive into the philosophy and design decisions.

- Why this architecture?
- Design principles
- Why asyncHandler?
- Why global error handler?
- Why request IDs?
- Why consistent error format?
- Why different HTTP codes?
- Why error codes enable better UX?
- Why validation should happen early?
- The philosophy: fail fast
- Logging strategy
- Performance considerations
- Migration path

**Time:** 30 minutes

---

## Quick Start

### Throw an Error

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError } from "../errors";

export const validateCURP = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  if (!curp) {
    throw new BadRequestError("CURP is required", "MISSING_CURP");
  }

  res.json({ valid: true });
});
```

### Error Response

```json
{
  "error": "CURP is required",
  "code": "MISSING_CURP",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Error Classes

| Class                  | HTTP | Use When                  |
| ---------------------- | ---- | ------------------------- |
| `BadRequestError`      | 400  | User input is invalid     |
| `UnauthorizedError`    | 401  | User is not authenticated |
| `NotFoundError`        | 404  | Resource doesn't exist    |
| `ExternalServiceError` | 502  | External API failed       |
| `InternalServerError`  | 500  | Unexpected error (bug)    |
| `RateLimitError`       | 429  | Too many requests         |

---

## Common Error Codes

| Code                    | HTTP | Meaning                                  |
| ----------------------- | ---- | ---------------------------------------- |
| `INVALID_CURP`          | 400  | CURP format is invalid                   |
| `MISSING_CURP`          | 400  | CURP is required                         |
| `INVALID_DOCUMENT`      | 400  | Document is not valid or quality is poor |
| `FILE_TOO_LARGE`        | 400  | File exceeds size limit                  |
| `MISSING_TOKEN`         | 401  | Authorization token is missing           |
| `TOKEN_EXPIRED`         | 401  | Token has expired                        |
| `USER_NOT_FOUND`        | 404  | User doesn't exist                       |
| `CONTRACT_NOT_FOUND`    | 404  | Contract doesn't exist                   |
| `GEMINI_ERROR`          | 502  | Gemini API failed                        |
| `INE_EXTRACTION_FAILED` | 502  | INE extraction service failed            |

---

## Key Concepts

### Request ID

Every request gets a unique ID for debugging:

```
req-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
```

Use this to search logs when debugging.

### asyncHandler

Middleware that catches all errors thrown in controllers:

```typescript
export const controller = asyncHandler(async (req, res) => {
  // Any error thrown here is caught automatically
  throw new BadRequestError("Error", "CODE");
});
```

### Global Error Handler

Middleware that catches all errors and formats responses:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Error Handling Checklist

When implementing a feature, ensure:

- ✅ All controllers are wrapped in `asyncHandler`
- ✅ Invalid input throws `BadRequestError` with specific code
- ✅ Missing resources throw `NotFoundError`
- ✅ External API calls throw `ExternalServiceError` on failure
- ✅ Unexpected errors are caught and logged
- ✅ Error messages are user-friendly
- ✅ Error codes match documented standards

---

## Next Steps

- **New to error handling?** Start with the [Tutorial](./01-tutorial.md)
- **Solving a specific problem?** See [How-to Guides](./02-how-to-guides.md)
- **Looking up details?** Check the [Reference](./03-reference.md)
- **Want to understand why?** Read the [Explanation](./04-explanation.md)

---

## Resources

- [Source: Error Classes](../../src/errors/)
- [Source: Global Error Handler](../../src/middlewares/errorHandler.middlewares.ts)
- [Source: asyncHandler](../../src/utils/asyncHandler.utils.ts)
- [Architecture Documentation](../architecture.md)
