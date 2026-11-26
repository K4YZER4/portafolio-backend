<div align="left">
  <a href="../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
  <a href="../es/development.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>

# Development Guide

**Navigation:** Home › Docs › Development

Guide for creating new controllers and handling errors properly.

---

## Creating a New Controller

### Step 1: Identify possible errors

Before writing code, ask yourself: **What could go wrong?**

```typescript
// Example: Extract data from INE card
// Could fail if:
// - No file uploaded (BadRequest)
// - File is wrong format (BadRequest)
// - Gemini API timeout (ExternalService)
// - Database save fails (InternalServer)
```

### Step 2: Choose error types

Map each problem to an error class:

| Problem                | Error Class            | HTTP |
| ---------------------- | ---------------------- | ---- |
| User input is wrong    | `BadRequestError`      | 400  |
| User not authenticated | `UnauthorizedError`    | 401  |
| Resource doesn't exist | `NotFoundError`        | 404  |
| External API fails     | `ExternalServiceError` | 502  |
| Code bug/unexpected    | `InternalServerError`  | 500  |

### Step 3: Write controller with asyncHandler

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError, NotFoundError, ExternalServiceError } from "../errors";

export const myNewController = asyncHandler(async (req, res) => {
  // No try/catch needed - asyncHandler catches everything

  // Validate input
  if (!req.body.requiredField) {
    throw new BadRequestError("Required field missing", "MISSING_FIELD");
  }

  // Check if resource exists
  const resource = await db.find(req.body.id);
  if (!resource) {
    throw new NotFoundError("Resource not found", "RESOURCE_NOT_FOUND");
  }

  // Call external API (can fail)
  try {
    const result = await externalAPI.call(data);
    res.json(result);
  } catch (error) {
    throw new ExternalServiceError("API failed", "API_ERROR");
  }
});
```

**Result:**

- ✅ No try/catch blocks
- ✅ Errors logged automatically
- ✅ Correct HTTP status codes
- ✅ Consistent response format

---

## Error Decision Tree

Use this to pick the right error:

```
Does this error happen because...

├─ User provided bad input?
│  └─ throw new BadRequestError(message, "CODE")
│
├─ User is not authenticated?
│  └─ throw new UnauthorizedError(message, "CODE")
│
├─ We're looking for something that doesn't exist?
│  └─ throw new NotFoundError(message, "CODE")
│
├─ An external API/service failed?
│  └─ throw new ExternalServiceError(message, "CODE")
│
└─ Something unexpected happened (bug)?
   └─ throw new InternalServerError(message, "CODE")
```

---

## Before & After Examples

### Example 1: Validating Input

**BEFORE (old way with try/catch):**

```typescript
export const validateCURP = async (req: Request, res: Response) => {
  try {
    const { curp } = req.body;

    if (!curp) {
      res.status(400).json({ error: "CURP required" });
      return;
    }

    if (curp.length !== 18) {
      res.status(400).json({ error: "CURP must be 18 chars" });
      return;
    }

    res.json({ valid: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
```

**AFTER (new way with asyncHandler):**

```typescript
export const validateCURP = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  if (!curp) {
    throw new BadRequestError("CURP required", "MISSING_CURP");
  }

  if (curp.length !== 18) {
    throw new BadRequestError("CURP must be 18 chars", "INVALID_CURP");
  }

  res.json({ valid: true });
});
```

**Difference:**

- 20 lines → 10 lines
- Manual status codes → Automatic
- No error logging → Auto-logged to file
- Inconsistent responses → Consistent JSON

---

### Example 2: Database Lookup

**BEFORE:**

```typescript
export const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await db.users.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
};
```

**AFTER:**

```typescript
export const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await db.users.findById(userId);

  if (!user) {
    throw new NotFoundError(`User ${userId} not found`, "USER_NOT_FOUND");
  }

  res.json(user);
});
```

---

### Example 3: External API Call

**BEFORE:**

```typescript
export const extractINE = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Image required" });
      return;
    }

    try {
      const result = await geminiAPI.extract(req.file.buffer);
      res.json(result);
    } catch (apiError) {
      res.status(502).json({ error: "Gemini API failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
```

**AFTER:**

```typescript
export const extractINE = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("Image required", "MISSING_IMAGE");
  }

  try {
    const result = await geminiAPI.extract(req.file.buffer);
    res.json(result);
  } catch (error) {
    throw new ExternalServiceError("Gemini API failed", "GEMINI_ERROR");
  }
});
```

---

## Testing Errors in Postman

### Setup

1. Open Postman
2. Create new request
3. Set method and URL
4. Add headers/body as needed
5. Send request

### Test each error type

**BadRequestError (400):**

```
POST http://localhost:3001/api/validate-curp
Body: { "curp": "ABC" }

Expected response:
{
  "error": "CURP must be 18 characters",
  "code": "INVALID_CURP",
  "statusCode": 400,
  "requestId": "req-...",
  "timestamp": "2026-05-04T..."
}
```

**NotFoundError (404):**

```
GET http://localhost:3001/api/user/999999

Expected response:
{
  "error": "User 999999 not found",
  "code": "USER_NOT_FOUND",
  "statusCode": 404,
  "requestId": "req-...",
  "timestamp": "2026-05-04T..."
}
```

**ExternalServiceError (502):**

```
POST http://localhost:3001/api/ine
(With Gemini API down)

Expected response:
{
  "error": "Gemini API failed",
  "code": "GEMINI_ERROR",
  "statusCode": 502,
  "requestId": "req-...",
  "timestamp": "2026-05-04T..."
}
```

### Check request ID in headers

After sending request:

1. Click "Headers" tab in response
2. Look for `X-Request-Id: req-abc123`
3. This should match `requestId` in response body

---

## Checklist Before Commit

Before you commit your controller changes:

- [ ] Controller uses `asyncHandler` wrapper
- [ ] No manual `try/catch` blocks (except for catching specific errors)
- [ ] All validation throws `BadRequestError`
- [ ] Database lookups throw `NotFoundError` if not found
- [ ] External API calls throw `ExternalServiceError` on failure
- [ ] Error codes are meaningful (not generic)
- [ ] Tested all error paths in Postman
- [ ] Response format is consistent with other endpoints
- [ ] No PII (CURP, passwords, etc.) in error messages
- [ ] Logs are being written to `logs/error-YYYY-MM-DD.log`

---

## Common Mistakes

### ❌ Mistake 1: Not wrapping with asyncHandler

```typescript
// WRONG - will crash on unhandled rejection
export const myController = async (req, res) => {
  const result = await someAsyncFunction();
  res.json(result);
};

// RIGHT - asyncHandler catches errors
export const myController = asyncHandler(async (req, res) => {
  const result = await someAsyncFunction();
  res.json(result);
});
```

### ❌ Mistake 2: Throwing generic Error

```typescript
// WRONG - loses error type information
throw new Error("Something failed");

// RIGHT - use specific error class
throw new BadRequestError("Invalid input", "INVALID_INPUT");
```

### ❌ Mistake 3: Using try/catch when you shouldn't

```typescript
// WRONG - unnecessary try/catch
export const myController = asyncHandler(async (req, res) => {
  try {
    if (!req.body.field) {
      throw new BadRequestError("Field required", "MISSING_FIELD");
    }
  } catch (error) {
    next(error);
  }
});

// RIGHT - just throw, asyncHandler catches it
export const myController = asyncHandler(async (req, res) => {
  if (!req.body.field) {
    throw new BadRequestError("Field required", "MISSING_FIELD");
  }
});
```

### ❌ Mistake 4: Logging PII

```typescript
// WRONG - logs sensitive data
logger.error({
  curp: "ABCD123456HDFMZR00",
  bankAccount: "0123456789",
  creditCard: "1234-5678",
});

// RIGHT - only log metadata
logger.error({
  code: "INVALID_CURP",
  message: "CURP validation failed",
  endpoint: "POST /api/validate",
});
```

---

## Quick Template

Copy this template for new controllers:

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError, NotFoundError, ExternalServiceError } from "../errors";

export const myNewController = asyncHandler(async (req, res) => {
  // 1. Validate input
  const { requiredField } = req.body;
  if (!requiredField) {
    throw new BadRequestError("Required field missing", "MISSING_FIELD");
  }

  // 2. Check resource exists
  const resource = await db.find(requiredField);
  if (!resource) {
    throw new NotFoundError("Resource not found", "NOT_FOUND");
  }

  // 3. Call external API if needed
  try {
    const result = await externalAPI.call(resource);
    res.json(result);
  } catch (error) {
    throw new ExternalServiceError("API failed", "API_ERROR");
  }
});
```

---

## Next Steps

1. Review [Error Handling Guide](./error-handling/) for complete reference
2. Update existing controllers to use asyncHandler
3. Test all error paths in Postman
4. Check logs in `logs/error-YYYY-MM-DD.log`
