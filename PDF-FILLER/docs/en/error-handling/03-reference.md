<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Back-lightgray?style=flat" alt="Back to Error Handling"/>
  </a>
  &nbsp;
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/Home-lightgray?style=flat" alt="Home"/>
  </a>
</div>

# Error Handling — Reference

**Breadcrumb:** Home › Docs › Error Handling › Reference

**Goal:** Complete technical reference for all error types, codes, and usage patterns.

**Audience:** Developers needing to look up error details.

**← Previous:** [How-to Guides](./02-how-to-guides.md) | **Next →:** [Explanation](./04-explanation.md)

---

## Error Classes Overview

| Class | HTTP | Description | When to Use |
|-------|------|-------------|------------|
| `BadRequestError` | 400 | User input is invalid | Missing/wrong field, invalid format, validation failed |
| `UnauthorizedError` | 401 | User is not authenticated | Missing token, expired token, invalid credentials |
| `ForbiddenError` | 403 | User lacks permission | User can't access resource, insufficient privileges |
| `NotFoundError` | 404 | Resource doesn't exist | User/document/record not found |
| `RateLimitError` | 429 | Too many requests | Rate limit exceeded, quota exceeded |
| `InternalServerError` | 500 | Unexpected server error | Bug, null reference, unhandled exception |
| `ExternalServiceError` | 502 | External API failed | Gemini timeout, database error, API down |

---

## Error Class Signatures

### BadRequestError

```typescript
new BadRequestError(message: string, code: string)
```

**Parameters:**
- `message`: Human-readable error message (shown to user)
- `code`: Machine-readable error code (for client-side handling)

**Response (HTTP 400):**
```json
{
  "error": "CURP must be 18 characters",
  "code": "INVALID_CURP",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Usage:**
```typescript
throw new BadRequestError("CURP must be 18 characters", "INVALID_CURP");
throw new BadRequestError("Amount must be positive", "INVALID_AMOUNT");
throw new BadRequestError("Email required", "MISSING_EMAIL");
```

---

### UnauthorizedError

```typescript
new UnauthorizedError(message: string, code: string)
```

**Parameters:**
- `message`: Human-readable error message
- `code`: Machine-readable error code

**Response (HTTP 401):**
```json
{
  "error": "Token required",
  "code": "MISSING_TOKEN",
  "requestId": "req-def456",
  "statusCode": 401,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Usage:**
```typescript
throw new UnauthorizedError("Token required", "MISSING_TOKEN");
throw new UnauthorizedError("Token expired", "TOKEN_EXPIRED");
throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
```

---

### NotFoundError

```typescript
new NotFoundError(message: string, code: string)
```

**Parameters:**
- `message`: Human-readable error message
- `code`: Machine-readable error code

**Response (HTTP 404):**
```json
{
  "error": "Contract not found",
  "code": "CONTRACT_NOT_FOUND",
  "requestId": "req-ghi789",
  "statusCode": 404,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Usage:**
```typescript
throw new NotFoundError("Contract not found", "CONTRACT_NOT_FOUND");
throw new NotFoundError("User not found", "USER_NOT_FOUND");
throw new NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
```

---

### ExternalServiceError

```typescript
new ExternalServiceError(message: string, code: string)
```

**Parameters:**
- `message`: Human-readable error message
- `code`: Machine-readable error code

**Response (HTTP 502):**
```json
{
  "error": "Failed to extract INE data",
  "code": "INE_EXTRACTION_FAILED",
  "requestId": "req-jkl012",
  "statusCode": 502,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Usage:**
```typescript
throw new ExternalServiceError("Gemini API failed", "GEMINI_ERROR");
throw new ExternalServiceError("Database connection failed", "DB_ERROR");
throw new ExternalServiceError("Payment gateway unavailable", "PAYMENT_ERROR");
```

---

### InternalServerError

```typescript
new InternalServerError(message: string, code: string)
```

**Parameters:**
- `message`: Human-readable error message
- `code`: Machine-readable error code

**Response (HTTP 500):**
```json
{
  "error": "Unexpected error",
  "code": "UNEXPECTED",
  "requestId": "req-mno345",
  "statusCode": 500,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Usage:**
```typescript
throw new InternalServerError("Unexpected null reference", "NULL_REFERENCE");
throw new InternalServerError("Invalid state", "INVALID_STATE");
throw new InternalServerError("Unhandled exception", "UNEXPECTED");
```

---

### RateLimitError

```typescript
new RateLimitError(message: string, retryAfterSeconds: number)
```

**Parameters:**
- `message`: Human-readable error message
- `retryAfterSeconds`: Seconds to wait before retrying

**Response (HTTP 429):**
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "requestId": "req-pqr678",
  "statusCode": 429,
  "retryAfter": 60,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Usage:**
```typescript
throw new RateLimitError("Too many requests", 60);
throw new RateLimitError("API quota exceeded", 3600);
throw new RateLimitError("Request limit for user exceeded", 300);
```

---

## Standard Error Codes

### Validation Errors (400)

| Code | Message | Scenario |
|------|---------|----------|
| `MISSING_CURP` | CURP is required | CURP field not provided |
| `INVALID_CURP` | CURP must be 18 characters | CURP length incorrect |
| `MISSING_EMAIL` | Email is required | Email field not provided |
| `INVALID_EMAIL` | Email format is invalid | Email doesn't match pattern |
| `MISSING_AMOUNT` | Amount is required | Amount field not provided |
| `INVALID_AMOUNT` | Amount must be positive | Amount is 0 or negative |
| `INVALID_NOMINAS` | Nominas must be an array | Nominas is not an array |
| `EMPTY_NOMINAS` | At least one nomina required | Nominas array is empty |
| `MISSING_FECHA_PAGO` | Fecha de pago is required | Date field missing |
| `INVALID_DATE` | Date format is invalid | Date doesn't match format |
| `MISSING_FILE` | File is required | No file uploaded |
| `FILE_TOO_LARGE` | File is too large | File exceeds size limit (5MB) |
| `INVALID_FILE_TYPE` | Invalid file type | File type not allowed |
| `NO_IMAGE` | Image is required | No image uploaded |
| `INVALID_DOCUMENT` | Document is not valid or quality is too low | INE not valid or poor quality |
| `INVALID_PDF` | PDF is not valid | PDF file corrupted/invalid |

### Authentication Errors (401)

| Code | Message | Scenario |
|------|---------|----------|
| `MISSING_TOKEN` | Token is required | Authorization header missing |
| `INVALID_TOKEN` | Token is invalid | Token signature invalid |
| `TOKEN_EXPIRED` | Token has expired | JWT expired |
| `INVALID_CREDENTIALS` | Invalid credentials | Wrong username/password |

### Not Found Errors (404)

| Code | Message | Scenario |
|------|---------|----------|
| `USER_NOT_FOUND` | User not found | User ID doesn't exist |
| `CONTRACT_NOT_FOUND` | Contract not found | Contract ID doesn't exist |
| `DOCUMENT_NOT_FOUND` | Document not found | Document ID doesn't exist |
| `TEMPLATE_NOT_FOUND` | Template not found | Template ID doesn't exist |

### External Service Errors (502)

| Code | Message | Scenario |
|------|---------|----------|
| `GEMINI_ERROR` | Gemini API failed | Gemini request failed |
| `INE_EXTRACTION_FAILED` | Failed to extract INE | Extraction service down |
| `DB_ERROR` | Database error | Database connection failed |
| `PAYMENT_ERROR` | Payment gateway unavailable | Payment service down |
| `API_TIMEOUT` | API request timeout | External API too slow |

### Rate Limit Errors (429)

| Code | Message | Scenario |
|------|---------|----------|
| `RATE_LIMIT_EXCEEDED` | Too many requests | User exceeded quota |
| `API_LIMIT_EXCEEDED` | API quota exceeded | Service quota exceeded |

### Internal Server Errors (500)

| Code | Message | Scenario |
|------|---------|----------|
| `UNEXPECTED` | Unexpected error | Unhandled exception |
| `NULL_REFERENCE` | Unexpected null reference | Null pointer |
| `INVALID_STATE` | Invalid state | Logic error |

---

## Error Response Structure

Every error response has this structure:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "requestId": "req-abc123def456",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**Fields:**
- `error`: Message for end users (translated if applicable)
- `code`: Machine-readable code for client-side handling
- `requestId`: Unique ID for this request (for debugging)
- `statusCode`: HTTP status code
- `timestamp`: ISO 8601 timestamp when error occurred

---

## HTTP Status Codes

| Code | Name | Use Case | Error Class |
|------|------|----------|-------------|
| 400 | Bad Request | Client input invalid | BadRequestError |
| 401 | Unauthorized | Not authenticated | UnauthorizedError |
| 403 | Forbidden | User lacks permission | ForbiddenError |
| 404 | Not Found | Resource doesn't exist | NotFoundError |
| 429 | Too Many Requests | Rate limit exceeded | RateLimitError |
| 500 | Internal Server Error | Unexpected error | InternalServerError |
| 502 | Bad Gateway | External service failed | ExternalServiceError |

---

## Multer Error Codes

Multer-specific errors are converted to BadRequestError:

| Multer Code | Converted To | Message | Scenario |
|-------------|-------------|---------|----------|
| `LIMIT_FILE_SIZE` | BadRequestError | File too large | File exceeds size limit |
| `LIMIT_FILES` | BadRequestError | Too many files | More files than allowed |
| `LIMIT_FIELD_SIZE` | BadRequestError | Field value too large | Field exceeds size |
| `LIMIT_UNEXPECTED_FILE` | BadRequestError | Unexpected file field | Wrong file field name |

---

## Error Flow Diagram

```
Request arrives
    ↓
Controller (wrapped in asyncHandler)
    ↓
    ├─ No error → Send success response
    │
    └─ Error thrown
        ↓
    asyncHandler catches error
        ↓
        ├─ Is it AppError? → Pass through
        │
        └─ Is it native Error? → Wrap in InternalServerError
            ↓
        Global errorHandler receives error
            ↓
            ├─ Format as JSON
            ├─ Add requestId
            ├─ Add timestamp
            ├─ Log error
            │
        Send HTTP response with status code
            ↓
        Response to client
```

---

## Error Logging Format

When an error is logged:

```
[2026-05-11 18:30:00] ERROR
  requestId: req-abc123
  endpoint: POST /api/validate-curp
  method: POST
  path: /api/validate-curp
  statusCode: 400
  error: CURP must be 18 characters
  code: INVALID_CURP
  timestamp: 2026-05-11T18:30:00Z
```

---

## Request ID Format

Request IDs are generated automatically:

```
req-{UUID}
```

**Example:** `req-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d`

**Usage:**
1. Returned in every error response
2. Returned in every success response
3. Logged in all server logs
4. Included in X-Request-Id header
5. Can be used to trace requests across services

---

## Best Practices

### ✅ Do This

```typescript
// Specific error codes
throw new BadRequestError("CURP must be 18 characters", "INVALID_CURP");

// Descriptive messages
throw new NotFoundError("Contract ABC123 not found", "CONTRACT_NOT_FOUND");

// External API errors
throw new ExternalServiceError("Gemini API failed", "GEMINI_ERROR");

// Wrap in asyncHandler
export const myController = asyncHandler(async (req, res) => {
  // code
});

// Use specific error types
if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");
```

### ❌ Don't Do This

```typescript
// Generic messages
throw new Error("Error");

// Generic codes
throw new BadRequestError("Invalid", "ERROR");

// Swallowing errors
try {
  await api.call();
} catch (e) {
  // Don't do anything
}

// Exposing internal errors
throw new InternalServerError(error.stack, "ERROR");

// Not wrapping in asyncHandler
export const myController = async (req, res) => {
  // Unhandled errors will crash the app
};
```

---

## Import Examples

```typescript
// Import single error
import { BadRequestError } from "../errors";

// Import multiple errors
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ExternalServiceError,
  InternalServerError,
  RateLimitError,
} from "../errors";

// Import from index
import {
  BadRequestError,
  asyncHandler,
} from "../errors";
```

---

## Troubleshooting

### Problem: Errors not being caught

**Solution:** Make sure controller is wrapped in `asyncHandler`:

```typescript
// ✅ Correct
export const myController = asyncHandler(async (req, res) => {
  throw new BadRequestError("Error", "CODE");
});

// ❌ Wrong - error won't be caught
export const myController = async (req, res) => {
  throw new BadRequestError("Error", "CODE");
};
```

### Problem: Errors not showing up in logs

**Solution:** Global errorHandler must be registered as middleware:

```typescript
// In app.ts
app.use(globalErrorHandler);
```

### Problem: requestId is undefined

**Solution:** Make sure requestIdMiddleware runs before other middlewares:

```typescript
// In app.ts - this must come FIRST
app.use(requestIdMiddleware);
app.use(authMiddleware);
// ... other middlewares
```

### Problem: Multer errors not being handled

**Solution:** Add multerErrorHandler middleware after multer:

```typescript
router.post(
  "/upload",
  upload.single("file"),
  multerErrorHandler, // ← Must be here
  validateImageFile,
  controller
);
```

---

## Quick Lookup Table

| I need to... | Use this | HTTP | Code Example |
|--------------|----------|------|--------------|
| Invalid user input | BadRequestError | 400 | `throw new BadRequestError("CURP invalid", "INVALID_CURP")` |
| Missing token | UnauthorizedError | 401 | `throw new UnauthorizedError("Token required", "MISSING_TOKEN")` |
| Resource missing | NotFoundError | 404 | `throw new NotFoundError("User not found", "USER_NOT_FOUND")` |
| Slow/failed API | ExternalServiceError | 502 | `throw new ExternalServiceError("API failed", "API_ERROR")` |
| Unexpected bug | InternalServerError | 500 | `throw new InternalServerError("Bug", "UNEXPECTED")` |
| Too many requests | RateLimitError | 429 | `throw new RateLimitError("Limit exceeded", 60)` |

