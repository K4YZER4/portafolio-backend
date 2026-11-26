<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Back-lightgray?style=flat" alt="Back to Error Handling"/>
  </a>
  &nbsp;
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/Home-lightgray?style=flat" alt="Home"/>
  </a>
</div>

# Error Handling — Tutorial

**Breadcrumb:** Home › Docs › Error Handling › Tutorial

**Goal:** Understand how errors flow through the application and how to handle them properly.

**Audience:** Developers new to the error handling system.

**Time to complete:** 25 minutes

**Next:** [How-to Guides](./02-how-to-guides.md) →

---

## What You'll Learn

By the end of this tutorial, you'll understand:

- How errors flow from controllers to the global error handler
- Why we have different error classes for different situations
- How to throw errors that the system understands
- How errors are logged automatically
- How request IDs track errors for debugging

---

## The Error Flow (Big Picture)

```
┌─────────────────────────────────────┐
│ User makes a request                │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Request arrives at controller       │
│ (wrapped in asyncHandler)           │
└──────────────┬──────────────────────┘
               ↓
        ┌──────┴──────┐
        ↓             ↓
    SUCCESS       ERROR OCCURS
        │             │
        │      ┌──────┴─────────────────┐
        │      ↓                        ↓
        │   Throw Error            Catch & Convert
        │      │                        │
        │      └────────┬───────────────┘
        │               ↓
        └──────→ Global errorHandler
                       ↓
        ┌──────────────────────────────┐
        │ Converts to JSON response    │
        │ Logs with requestId          │
        │ Sends HTTP status code       │
        └──────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │ Response sent to client      │
        └──────────────────────────────┘
```

---

## Step 1: Understand Error Classes

Your application has 6 error types. Each represents a different HTTP status:

### 1. **BadRequestError (400)**

User input is invalid.

**When to use:**

- Required field is missing
- Data format is wrong
- File type is not allowed
- Amount is negative

**Example:**

```typescript
if (!req.body.curp) {
  throw new BadRequestError("CURP is required", "MISSING_CURP");
}
```

### 2. **UnauthorizedError (401)**

User is not authenticated.

**When to use:**

- JWT token is missing
- Token is expired
- Credentials are wrong

**Example:**

```typescript
if (!req.headers.authorization) {
  throw new UnauthorizedError("Token required", "MISSING_TOKEN");
}
```

### 3. **NotFoundError (404)**

Resource doesn't exist.

**When to use:**

- User ID doesn't exist
- Document not found
- Record was deleted

**Example:**

```typescript
const user = await db.users.findById(id);
if (!user) {
  throw new NotFoundError("User not found", "USER_NOT_FOUND");
}
```

### 4. **ExternalServiceError (502)**

An external API failed.

**When to use:**

- Gemini API timeout
- Database connection failed
- Payment gateway is down

**Example:**

```typescript
try {
  const result = await genAI.models.generateContent(...);
} catch (error) {
  throw new ExternalServiceError("Gemini API failed", "GEMINI_ERROR");
}
```

### 5. **InternalServerError (500)**

Unexpected error (a bug).

**When to use:**

- Unexpected null reference
- Unhandled exception
- Logic error

**Example:**

```typescript
// This shouldn't happen, but if it does:
if (!data) {
  throw new InternalServerError("Unexpected state", "INVALID_STATE");
}
```

### 6. **RateLimitError (429)**

Too many requests.

**When to use:**

- User exceeded rate limit
- Bucket is full

**Example:**

```typescript
if (bucket.count > MAX_REQUESTS) {
  throw new RateLimitError("Too many requests", 60); // retry after 60 seconds
}
```

---

## Step 2: Import and Use Error Classes

All error classes are in `src/errors/`:

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ExternalServiceError,
  InternalServerError,
  RateLimitError,
} from "../errors";
```

---

## Step 3: Throw Errors in Controllers

**Example controller:**

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError } from "../errors";

export const validateCURP = asyncHandler(async (req, res) => {
  // Validate input
  const { curp } = req.body;

  if (!curp) {
    throw new BadRequestError("CURP is required", "MISSING_CURP");
  }

  if (curp.length !== 18) {
    throw new BadRequestError("CURP must be 18 characters", "INVALID_CURP");
  }

  // If validation passes, send response
  res.json({ valid: true });
});
```

**Key points:**

- ✅ Wrap controller in `asyncHandler`
- ✅ Just `throw` errors (no try/catch needed)
- ✅ asyncHandler catches them automatically

---

## Step 4: Understand asyncHandler Wrapper

The `asyncHandler` wrapper does three things:

1. **Catches thrown errors** — Any error you throw is caught
2. **Checks if it's an AppError** — If it's our custom error, passes it through
3. **Converts unknown errors** — If it's a native Error, wraps it as InternalServerError

**Example:**

```typescript
// This error...
throw new BadRequestError("Invalid input", "INVALID_INPUT");

// ...is caught by asyncHandler and passed to global errorHandler
// Global errorHandler sends this to client:
{
  "error": "Invalid input",
  "code": "INVALID_INPUT",
  "requestCode": "req-a1b2c3d4",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Step 5: Understand Global Error Handler

The global error handler (`src/middlewares/errorHandler.middlewares.ts`) is Express middleware that:

1. **Receives the error** from asyncHandler
2. **Formats it** as JSON with statusCode, message, code, requestId
3. **Logs it** with timestamp and endpoint info
4. **Sends HTTP response** with correct status code

**It runs automatically** — you don't need to do anything special.

---

## Step 6: Understand Request ID Tracking

Every request gets a unique ID for tracing:

```
Request arrives → requestIdMiddleware generates ID
   ↓
ID added to req.id
   ↓
ID added to X-Request-Id header
   ↓
Error occurs, ID logged with error
   ↓
You can find error in logs by searching for that ID
```

**Example:**

```
Request ID: req-a1b2c3d4

In logs you see:
[2026-05-11 18:30:00] ERROR: requestId: "req-a1b2c3d4" ...
```

**Use case:** A user says "I got an error 30 minutes ago" — you search logs for their request ID and find exactly what happened.

---

## Step 7: See Errors in Action

### Example 1: Valid Request

```
POST /api/validate-curp
Body: { "curp": "ABCD123456EFGHIJ12" }

Response (200):
{
  "data": { "valid": true },
  "requestId": "req-abc123"
}
```

### Example 2: Invalid Request (BadRequestError)

```
POST /api/validate-curp
Body: { "curp": "ABC" }

Response (400):
{
  "error": "CURP must be 18 characters",
  "code": "INVALID_CURP",
  "requestId": "req-xyz789",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

### Example 3: External API Fails (ExternalServiceError)

```
POST /api/ine
[File upload]

[Gemini API times out]

Response (502):
{
  "error": "Gemini API failed",
  "code": "GEMINI_ERROR",
  "requestId": "req-def456",
  "statusCode": 502,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

---

## Step 8: Where Errors Get Caught

Errors can originate from different places:

### **1. Validation Middleware**

```typescript
// validateImageFile.middlewares.ts
if (!req.file) {
  throw new BadRequestError("Image required", "NO_IMAGE");
}
```

### **2. Multer Errors**

```typescript
// multerErrorHandler.middlewares.ts catches Multer errors
// and converts them to BadRequestError
```

### **3. Controllers**

```typescript
// Your controller code
if (!data) {
  throw new BadRequestError("Data invalid", "INVALID_DATA");
}
```

### **4. Services**

```typescript
// Service layer validation
if (curp.length !== 18) {
  throw new BadRequestError("CURP invalid", "INVALID_CURP");
}
```

**All paths lead to:** Global errorHandler → Logs & sends response

---

## Step 9: Common Error Scenarios

### Scenario 1: Missing Required Field

```typescript
// Controller
export const processPayment = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount) {
    throw new BadRequestError("Amount required", "MISSING_AMOUNT");
  }

  if (!currency) {
    throw new BadRequestError("Currency required", "MISSING_CURRENCY");
  }

  // Process payment...
});
```

### Scenario 2: Resource Not Found

```typescript
// Controller
export const getContract = asyncHandler(async (req, res) => {
  const contract = await db.contracts.findById(req.params.id);

  if (!contract) {
    throw new NotFoundError(`Contract ${req.params.id} not found`, "CONTRACT_NOT_FOUND");
  }

  res.json({ data: contract });
});
```

### Scenario 3: External API Fails

```typescript
// Service
export const extractINEData = asyncHandler(async (buffer) => {
  try {
    const response = await genAI.models.generateContent({...});
    return parseResponse(response);
  } catch (error) {
    throw new ExternalServiceError(
      "Failed to extract INE",
      "INE_EXTRACTION_FAILED"
    );
  }
});
```

---

## Summary

You now know:

- ✅ How errors flow from controllers to client
- ✅ Which error class to use in each situation
- ✅ How to throw errors in controllers
- ✅ How asyncHandler catches them
- ✅ How global errorHandler formats responses
- ✅ How request IDs track errors

**Key takeaway:** Throw the right error type, asyncHandler catches it, global errorHandler formats it. Done.

---

## Next Steps

- Read [How-to Guides](./02-how-to-guides.md) to solve specific problems
- Check [Reference](./03-reference.md) for all error types and codes
- Read [Explanation](./04-explanation.md) to understand the philosophy

---

## Quick Reference

| Error Class            | HTTP | When              | Example                                                          |
| ---------------------- | ---- | ----------------- | ---------------------------------------------------------------- |
| `BadRequestError`      | 400  | Invalid input     | `throw new BadRequestError("CURP invalid", "INVALID_CURP")`      |
| `UnauthorizedError`    | 401  | Missing auth      | `throw new UnauthorizedError("Token required", "MISSING_TOKEN")` |
| `NotFoundError`        | 404  | Resource missing  | `throw new NotFoundError("User not found", "USER_NOT_FOUND")`    |
| `ExternalServiceError` | 502  | API failed        | `throw new ExternalServiceError("API failed", "API_ERROR")`      |
| `InternalServerError`  | 500  | Bug/unexpected    | `throw new InternalServerError("Unexpected", "UNEXPECTED")`      |
| `RateLimitError`       | 429  | Too many requests | `throw new RateLimitError("Rate limit", 60)`                     |
