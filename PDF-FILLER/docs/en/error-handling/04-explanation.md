<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Back-lightgray?style=flat" alt="Back to Error Handling"/>
  </a>
  &nbsp;
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/Home-lightgray?style=flat" alt="Home"/>
  </a>
</div>

# Error Handling — Explanation

**Breadcrumb:** Home › Docs › Error Handling › Explanation

**Goal:** Understand WHY the error handling system is designed this way.

**Audience:** Developers who want to understand the philosophy and reasoning.

**← Previous:** [Reference](./03-reference.md) | **Next →:** None (Last doc)

---

## Why This Architecture?

### The Problem We Solved

**Before:** Error handling was scattered across the codebase.

```typescript
// Controller 1
try {
  await api.call();
} catch (error) {
  res.status(500).json({ error: error.message });
}

// Controller 2
try {
  validateInput();
} catch (error) {
  res.status(400).json({ message: "Invalid" });
}

// Controller 3
try {
  findUser();
} catch (error) {
  console.log(error);
  res.status(500).json({ error: "Server error" });
}
```

**Problems:**

- ❌ No consistent error format
- ❌ Different HTTP status codes for same error
- ❌ Errors not logged centrally
- ❌ Hard to debug (no request ID)
- ❌ Duplicated error handling logic
- ❌ Frontend can't reliably handle errors

### The Solution

A centralized, standardized error handling system:

```typescript
// All controllers use same pattern
export const controller = asyncHandler(async (req, res) => {
  if (!valid) {
    throw new BadRequestError("Invalid", "INVALID_INPUT");
  }
  res.json({ data });
});
```

**Benefits:**

- ✅ Consistent error format everywhere
- ✅ Proper HTTP status codes
- ✅ Central logging with request IDs
- ✅ Easy to debug
- ✅ No code duplication
- ✅ Frontend can handle errors reliably

---

## Design Principles

### 1. Errors Are Exceptions, Not Return Values

**Why?** Makes code cleaner and ensures errors are never ignored.

```typescript
// ❌ Bad: Error as return value
const result = validateInput(data);
if (result.error) {
  // Must remember to check for error
}

// ✅ Good: Error as exception
try {
  validateInput(data);
  // Error automatically propagates up
} catch (error) {
  // Must handle explicitly
}
```

### 2. Different Error Types for Different Situations

**Why?** Allows proper HTTP status codes and makes frontend handling easier.

```typescript
// 400: User made a mistake (try again with different input)
throw new BadRequestError("Email invalid", "INVALID_EMAIL");

// 401: User is not authenticated (log in)
throw new UnauthorizedError("Token required", "MISSING_TOKEN");

// 404: Resource doesn't exist (not user's fault)
throw new NotFoundError("User not found", "USER_NOT_FOUND");

// 502: External service failed (user should retry)
throw new ExternalServiceError("API failed", "API_ERROR");

// 500: Unexpected bug (report to developers)
throw new InternalServerError("Bug", "UNEXPECTED");
```

**Each tells the client:** "This is what happened and what to do about it."

### 3. Error Codes, Not Messages

**Why?** Messages are for humans; codes are for machines.

```typescript
// ❌ Bad: How would frontend know what error this is?
throw new BadRequestError(
  "The value you entered for email is not valid and must match RFC 5322 specification"
);

// ✅ Good: Code identifies error, message explains it
throw new BadRequestError("Email format is invalid", "INVALID_EMAIL");
```

**Benefits:**

- Frontend can respond to `INVALID_EMAIL` with specific UI
- Changing message doesn't break frontend
- Works across languages (same code, different message)

### 4. Central Logging with Request IDs

**Why?** Debugging is hard when you can't find logs.

```
User calls: "I got an error 2 hours ago"
↓
User reports error with requestId: "req-abc123"
↓
Developer searches logs for "req-abc123"
↓
Finds: exact request, error, timestamp, endpoint
↓
Fixed!
```

**Without request IDs:** Find error in millions of log lines? Good luck.

### 5. Validation Before Processing

**Why?** Catch mistakes early, save resources.

```typescript
// ❌ Bad: Extract data THEN validate
const data = await expensiveExtraction(buffer);
if (!data) {
  return error;
}

// ✅ Good: Validate THEN extract
await validateQuality(buffer);
const data = await expensiveExtraction(buffer);
```

### 6. External Service Errors Are Different from User Errors

**Why?** User can't fix an external service failure.

```typescript
// 400: User error (user can fix)
throw new BadRequestError("CURP invalid", "INVALID_CURP");

// 502: External error (user can't fix, should retry)
throw new ExternalServiceError("Gemini API failed", "GEMINI_ERROR");
```

---

## Why asyncHandler?

### The Problem

JavaScript async/await makes it easy to forget error handling:

```typescript
// This error never gets caught
export const controller = (req, res) => {
  asyncFunction(); // ← If this throws, app crashes
  res.json({ ok: true });
};
```

### The Solution

Wrap in asyncHandler to catch all errors:

```typescript
// All errors caught automatically
export const controller = asyncHandler(async (req, res) => {
  throw new BadRequestError("Error", "CODE"); // ← Caught!
  res.json({ ok: true });
});
```

### How It Works

```typescript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
  //     ↑ Turns thrown errors into Promise rejections
  //                                       ↑ Passes to error handler
};
```

---

## Why Global Error Handler?

### The Problem

Without global error handler, every controller must handle errors:

```typescript
// Controller 1
router.post("/endpoint1", (req, res) => {
  try {
    doSomething();
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Controller 2
router.post("/endpoint2", (req, res) => {
  try {
    doSomething();
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Controller 3... (repeat 100 times)
```

### The Solution

One global error handler catches all errors:

```typescript
// Controllers just throw
router.post(
  "/endpoint1",
  asyncHandler(async (req, res) => {
    throw new BadRequestError("Error", "CODE");
  })
);

// Global handler catches all
app.use((error, req, res, next) => {
  // Format, log, respond
});
```

---

## Why Request IDs?

### Without Request IDs

```
[18:30:00] ERROR: CURP invalid
[18:30:01] ERROR: CURP invalid
[18:30:02] ERROR: CURP invalid
[18:30:03] ERROR: CURP invalid
[18:30:04] ERROR: CURP invalid
...
User: "I got error at 18:30:02"
Developer: "Which one? All 100 endpoints had errors at 18:30:02"
```

### With Request IDs

```
[18:30:00] req-abc123 ERROR: CURP invalid endpoint: POST /api/validate
[18:30:01] req-def456 ERROR: CURP invalid endpoint: POST /api/validate
...
User: "I got error with requestId req-abc123"
Developer: "Found it! POST /api/validate at 18:30:00 with CURP validation"
```

---

## Why Consistent Error Format?

### Bad Responses From Different Endpoints

```
GET /api/user (404):
{ "message": "not found" }

POST /api/validate (400):
{ "error": { "field": "email", "reason": "invalid" } }

DELETE /api/contract (500):
{ "errors": ["something went wrong"] }

Frontend code:
if (response.status === 404) {
  if (response.data.message) {
    show(response.data.message);
  } else if (response.data.error) {
    show(response.data.error);
  } // ... handle 10 different formats
}
```

### Good Responses (Consistent Format)

```
GET /api/user (404):
{ "error": "User not found", "code": "USER_NOT_FOUND" }

POST /api/validate (400):
{ "error": "Email invalid", "code": "INVALID_EMAIL" }

DELETE /api/contract (500):
{ "error": "Unexpected error", "code": "UNEXPECTED" }

Frontend code:
if (!response.ok) {
  handleError(response.data.code, response.data.error);
}
```

**Benefits:**

- Same handling for all endpoints
- Frontend is simpler
- Easy to add new endpoints

---

## HTTP Status Codes Matter

### Why Different Codes?

Each status code tells client a different story:

| Code | Meaning               | Client Action                 |
| ---- | --------------------- | ----------------------------- |
| 400  | User error            | Retry with different data     |
| 401  | Not authenticated     | Log in and retry              |
| 404  | Resource missing      | Nothing to do (not available) |
| 429  | Rate limited          | Wait and retry                |
| 500  | Server bug            | Retry in a moment             |
| 502  | External service down | Retry in a moment             |

### Real-World Example

```typescript
// Gemini API fails
throw new ExternalServiceError("API failed", "GEMINI_ERROR"); // 502

// Frontend should:
// 1. Show "Service temporarily unavailable"
// 2. Offer to retry
// 3. NOT show error to user as their fault
```

---

## Error Codes Enable Better UX

### Without Codes

```typescript
// Frontend receives error
if (response.status === 400) {
  // Could be any validation error
  // Show generic message
  showError("Please check your input");
}
```

### With Codes

```typescript
// Frontend receives error with code
switch (response.data.code) {
  case "INVALID_EMAIL":
    focusEmailField();
    showError("Please enter a valid email");
    break;
  case "INVALID_CURP":
    focusCURPField();
    showError("CURP must be 18 characters");
    break;
  case "MISSING_AMOUNT":
    focusAmountField();
    showError("Amount is required");
    break;
}
```

**Result:** Better UX, users know exactly what's wrong.

---

## Validation Should Happen Early

### Bad: Extract Then Validate

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  const imageBuffer = req.file.buffer;

  // Expensive API call
  const extracted = await extractINEData(imageBuffer);

  // Then validate
  if (!extracted || extracted.length === 0) {
    throw new BadRequestError("Invalid", "INVALID_DOCUMENT");
  }

  res.json({ data: extracted });
});
```

**Problems:**

- Wasted expensive API call
- Could have validated in 10ms
- Poor UX (user waits for extraction)

### Good: Validate Then Extract

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  const imageBuffer = req.file.buffer;

  // Validate first (cheap, fast)
  await validateINEQuality(imageBuffer);

  // Only then extract (expensive)
  const extracted = await extractINEData(imageBuffer);

  res.json({ data: extracted });
});
```

**Benefits:**

- Invalid documents rejected in milliseconds
- API calls only for valid documents
- Better UX
- Saves API quota

---

## Why INVALID_DOCUMENT Code?

### The Gemini Pattern

Gemini can't always tell you what's wrong with an image (it's a black box):

```
Is this image a valid INE?
Are all fields legible?
Is quality sufficient?
```

Instead of returning detailed errors (which are unreliable), Gemini returns:

```
"INVALID_DOCUMENT" → Something is wrong, can't be specific
"VALID" → All checks passed
```

**Why this is good:**

- Accurate (Gemini just says valid or not)
- Simple (no false positives)
- User knows document doesn't work (without false details)

---

## The Philosophy: Fail Fast

### Principle: Catch Problems Early

```typescript
// ❌ Bad: Let invalid data flow through system
export const fillContract = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  const contract = await db.contracts.create({
    curp: curp, // Could be invalid, no validation
  });

  await sendToGemini(contract);
  await sendToPDF(contract);
  // If CURP was invalid, we wasted 3 API calls
});

// ✅ Good: Validate immediately
export const fillContract = asyncHandler(async (req, res) => {
  const { curp } = req.body;

  if (!curp || curp.length !== 18) {
    throw new BadRequestError("CURP invalid", "INVALID_CURP");
  }

  const contract = await db.contracts.create({ curp });
  // ... rest of logic
});
```

**Benefit:** Invalid data caught immediately, not propagated through system.

---

## Error Handling vs Exceptions

### Exceptions Are For Exceptional Cases

```typescript
// ✅ Good: Expected validation failure (can happen)
if (!curp) {
  throw new BadRequestError("CURP required", "MISSING_CURP");
}

// ✅ Good: Expected resource not found (can happen)
const user = await db.users.findById(id);
if (!user) {
  throw new NotFoundError("User not found", "USER_NOT_FOUND");
}

// ✅ Good: Expected external service timeout (can happen)
try {
  await geminiAPI.call();
} catch (error) {
  throw new ExternalServiceError("API failed", "API_ERROR");
}

// ❌ Bad: Unexpected null reference (shouldn't happen)
const data = result.data;
// If result is null, this will crash unhandled
```

**Philosophy:** Throw exceptions for expected errors. Bugs should crash (so you fix them).

---

## Logging Strategy

### Why Structured Logging?

```
❌ Bad: Unstructured logs
ERROR: something went wrong

✅ Good: Structured logs
{
  "timestamp": "2026-05-11T18:30:00Z",
  "requestId": "req-abc123",
  "level": "ERROR",
  "endpoint": "POST /api/validate-curp",
  "error": "CURP must be 18 characters",
  "code": "INVALID_CURP",
  "statusCode": 400
}
```

**Benefits:**

- Easy to search (search by requestId)
- Easy to filter (filter by statusCode)
- Easy to aggregate (errors by code)
- Machine readable

### Request ID Lifecycle

```
1. Request arrives
   ↓ requestIdMiddleware generates: req-abc123

2. Stored in: req.id

3. Used in: logs, responses

4. On error: included in error response

5. User reports: "Got error with requestId req-abc123"

6. Developer: searches logs for "req-abc123"
```

---

## Performance Considerations

### Error Objects Are Cheap

```typescript
// Throwing error is VERY fast
throw new BadRequestError("Validation failed", "CODE");
// ~0.1ms

// Compared to API calls:
// HTTP call: ~100-1000ms
// Database call: ~5-50ms
// File read: ~10-100ms
```

**Lesson:** Don't avoid throwing errors for performance. They're cheap.

### But Prevent Errors Is Better

```typescript
// Bad: Throw lots of errors
for (let i = 0; i < 1000000; i++) {
  if (data[i] === null) throw new Error();
}

// Good: Check once
if (data.some((x) => x === null)) {
  throw new BadRequestError("Data invalid", "INVALID_DATA");
}
```

---

## Migration Path

### If You Inherit Old Code

```typescript
// Old: Scattered error handling
export const oldController = (req, res) => {
  try {
    doSomething();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Migrate to: New pattern
export const newController = asyncHandler(async (req, res) => {
  doSomething();
  res.json({ success: true });
});
```

**Steps:**

1. Wrap in `asyncHandler`
2. Remove try/catch
3. Throw custom errors
4. Let global handler take care of it

---

## Conclusion: Design Goals

Our error handling system was designed to:

1. **Be consistent** — Same format everywhere
2. **Be informative** — Codes + messages + request IDs
3. **Be actionable** — Status codes tell client what to do
4. **Be debuggable** — Request IDs trace requests through system
5. **Be safe** — Errors never crash app, always handled
6. **Be efficient** — Validation early, API calls late
7. **Be user-friendly** — Specific error messages, not generic ones

When in doubt, ask: "Does this follow these principles?"
