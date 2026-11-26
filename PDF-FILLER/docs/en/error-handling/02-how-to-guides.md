<div align="left">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/← Back-lightgray?style=flat" alt="Back to Error Handling"/>
  </a>
  &nbsp;
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/Home-lightgray?style=flat" alt="Home"/>
  </a>
</div>

# Error Handling — How-to Guides

**Breadcrumb:** Home › Docs › Error Handling › How-to Guides

**Goal:** Solve specific error handling problems with practical recipes.

**Audience:** Developers implementing specific features.

**← Previous:** [Tutorial](./01-tutorial.md) | **Next →:** [Reference](./03-reference.md)

---

## How to Throw a Basic Error in a Controller

**Problem:** You need to validate user input and reject the request if it's invalid.

**Solution:**

```typescript
import { asyncHandler } from "../utils/asyncHandler.utils";
import { BadRequestError } from "../errors";

export const validateCURP = asyncHandler(async (req, res) => {
  const { curp } = req.body;
  
  // Validate
  if (!curp) {
    throw new BadRequestError("CURP is required", "MISSING_CURP");
  }
  
  if (curp.length !== 18) {
    throw new BadRequestError("CURP must be 18 characters", "INVALID_CURP");
  }
  
  // Success
  res.json({ valid: true });
});
```

**Key points:**
- Always wrap controller in `asyncHandler`
- Throw the error directly (no try/catch needed)
- Use specific error codes (e.g., "INVALID_CURP" not just "ERROR")

---

## How to Handle File Upload Errors

**Problem:** Users upload files that are too large, wrong format, or invalid.

**Solution:**

Multer errors are already handled automatically. The `multerErrorHandler` middleware catches them and converts to BadRequestError.

```typescript
// In your route file:
import multer from "multer";
import { multerErrorHandler } from "../middlewares/errorHandling/multerErrorHandler.middlewares";

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only images allowed"));
    } else {
      cb(null, true);
    }
  },
});

router.post(
  "/upload",
  upload.single("file"),
  multerErrorHandler, // ← Catches multer errors
  validateImageFile,  // ← Your validation middleware
  (req, res) => {
    res.json({ success: true });
  }
);
```

**How it works:**
1. Multer error occurs (e.g., file too large)
2. `multerErrorHandler` catches it
3. Converts to `BadRequestError` with appropriate message
4. Error response sent to client

**Common multer errors handled:**
- `LIMIT_FILE_SIZE` → "File too large"
- `LIMIT_FILES` → "Too many files"
- `LIMIT_FILE_COUNT` → "File limit exceeded"
- Custom fileFilter errors → "Only images allowed"

---

## How to Validate Request Data

**Problem:** You have complex validation logic. Where should it go?

**Solution:**

Create validation middleware in `src/middlewares/validation/`:

```typescript
// src/middlewares/validation/validateNominas.middlewares.ts

import { BadRequestError } from "../../errors";

export const validateNominas = (req, res, next) => {
  const { nominas } = req.body;
  
  if (!Array.isArray(nominas)) {
    throw new BadRequestError("Nominas must be an array", "INVALID_NOMINAS");
  }
  
  if (nominas.length === 0) {
    throw new BadRequestError("At least one nomina required", "EMPTY_NOMINAS");
  }
  
  // Validate each nomina
  for (let i = 0; i < nominas.length; i++) {
    const nomina = nominas[i];
    
    if (!nomina.fechaPago) {
      throw new BadRequestError(
        `Nomina ${i} missing fechaPago`,
        "MISSING_FECHA_PAGO"
      );
    }
    
    if (nomina.monto <= 0) {
      throw new BadRequestError(
        `Nomina ${i} monto must be positive`,
        "INVALID_MONTO"
      );
    }
  }
  
  next();
};
```

**Usage in route:**

```typescript
router.post(
  "/fill",
  validateNominas, // ← Run validation
  fillContractController
);
```

**Tips:**
- Put validation logic in middleware
- Throw `BadRequestError` for invalid input
- Use descriptive error codes
- Include field name in error message

---

## How to Handle External API Failures

**Problem:** An external API (Gemini, database, etc.) fails. How do you handle it?

**Solution:**

```typescript
import { ExternalServiceError } from "../errors";

export const extractINEData = async (imageBuffer) => {
  try {
    const result = await genAI.models.generateContent({
      contents: [
        {
          parts: [
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/png" } },
            { text: "Extract INE data from this image..." },
          ],
        },
      ],
    });
    
    return parseINEResponse(result);
  } catch (error) {
    // External API failed
    throw new ExternalServiceError(
      "Failed to extract INE data",
      "INE_EXTRACTION_FAILED"
    );
  }
};
```

**In controller:**

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const data = await extractINEData(imageBuffer);
    res.json({ data });
  } catch (error) {
    // Error is caught by asyncHandler and passed to global errorHandler
    throw error;
  }
});
```

**Key points:**
- Wrap external API calls in try/catch
- Throw `ExternalServiceError` if API fails
- Don't expose internal API errors to client
- Use specific error codes ("INE_EXTRACTION_FAILED")

---

## How to Validate Document Quality (INE Example)

**Problem:** Gemini returns "INVALID_DOCUMENT" when the image is not a valid INE or quality is poor.

**Solution:**

```typescript
import { BadRequestError } from "../errors";
import { genAI } from "./gemini";

export const validateINEQuality = async (imageBuffer) => {
  try {
    const response = await genAI.models.generateContent({
      contents: [
        {
          parts: [
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/png" } },
            {
              text: `Validate this Mexican INE (ID card) image:
1. Is this a Mexican INE? (If no, respond: INVALID_DOCUMENT)
2. Is the image quality sufficient? (If no, respond: INVALID_DOCUMENT)
3. Are all critical data fields legible? (If no, respond: INVALID_DOCUMENT)
If all checks pass, respond: VALID`,
            },
          ],
        },
      ],
    });
    
    const result = response.response.text();
    
    // Check if Gemini says document is invalid
    if (result.includes("INVALID_DOCUMENT")) {
      throw new BadRequestError(
        "Document is not a valid Mexican INE or quality is too low",
        "INVALID_DOCUMENT"
      );
    }
    
    return true;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error; // Re-throw validation errors
    }
    
    throw new ExternalServiceError(
      "Failed to validate INE",
      "INE_VALIDATION_FAILED"
    );
  }
};
```

**Usage in controller:**

```typescript
export const scanINE = asyncHandler(async (req, res) => {
  const imageBuffer = req.file.buffer;
  
  // First validate quality
  await validateINEQuality(imageBuffer);
  
  // Then extract data
  const data = await extractINEData(imageBuffer);
  
  res.json({ data });
});
```

**Why this pattern:**
- Validate BEFORE extraction (saves API calls)
- Reject poor quality early (better UX)
- Use "INVALID_DOCUMENT" code consistently

---

## How to Create a Custom Error Class

**Problem:** You need an error type that doesn't exist in the system.

**Solution:**

Create a new file in `src/errors/`:

```typescript
// src/errors/UnprocessableContentError.errors.ts

import { AppError } from "./AppError.errors";

export class UnprocessableContentError extends AppError {
  constructor(message: string, code: string) {
    super(message, 422, code); // 422 Unprocessable Content
  }
}
```

**Export it:**

```typescript
// src/errors/index.ts

export { AppError } from "./AppError.errors";
export { BadRequestError } from "./BadRequestError.errors";
// ... other exports
export { UnprocessableContentError } from "./UnprocessableContentError.errors";
```

**Use it:**

```typescript
import { UnprocessableContentError } from "../errors";

if (dataIsInconsistent) {
  throw new UnprocessableContentError(
    "Data is inconsistent",
    "INCONSISTENT_DATA"
  );
}
```

**Reference HTTP status codes:**
- 400: BadRequestError (user input error)
- 401: UnauthorizedError (missing/invalid token)
- 403: ForbiddenError (user lacks permission)
- 404: NotFoundError (resource not found)
- 422: UnprocessableContentError (valid format, but semantically wrong)
- 429: RateLimitError (too many requests)
- 500: InternalServerError (unexpected error)
- 502: ExternalServiceError (external API failed)
- 503: ServiceUnavailableError (service down)

---

## How to Capture and Log Error Details

**Problem:** An error occurs and you need to debug it. How do you find the details?

**Solution:**

Every error response includes a `requestId`. Use it to search logs:

```
GET /api/validate-curp
Body: { "curp": "INVALID" }

Response (400):
{
  "error": "CURP must be 18 characters",
  "code": "INVALID_CURP",
  "requestId": "req-a1b2c3d4e5f6",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

**In your logs, search for:** `req-a1b2c3d4e5f6`

You'll find:
```
[2026-05-11 18:30:00] requestId: "req-a1b2c3d4e5f6"
[2026-05-11 18:30:00] endpoint: "POST /api/validate-curp"
[2026-05-11 18:30:00] statusCode: 400
[2026-05-11 18:30:00] error: "CURP must be 18 characters"
[2026-05-11 18:30:00] code: "INVALID_CURP"
```

**Tracing flow:**
1. Request arrives
2. `requestIdMiddleware` generates unique ID
3. Request processed
4. Error occurs
5. `errorHandler` logs with request ID
6. Response sent with request ID
7. User reports issue with request ID
8. Developer searches logs for that request ID

---

## How to Handle Nested/Dependent Validation

**Problem:** Field B is only valid if Field A has a specific value.

**Solution:**

```typescript
export const validateComplexData = asyncHandler(async (req, res) => {
  const { tipoContrato, monto, cuotas } = req.body;
  
  // Basic validation
  if (!tipoContrato) {
    throw new BadRequestError("Type is required", "MISSING_TYPE");
  }
  
  // Dependent validation
  if (tipoContrato === "QUINCENA") {
    if (!cuotas) {
      throw new BadRequestError(
        "Cuotas required for QUINCENA type",
        "MISSING_CUOTAS"
      );
    }
    
    if (cuotas < 1 || cuotas > 24) {
      throw new BadRequestError(
        "Cuotas must be between 1 and 24",
        "INVALID_CUOTAS"
      );
    }
  }
  
  if (tipoContrato === "FIJO") {
    if (!monto) {
      throw new BadRequestError(
        "Monto required for FIJO type",
        "MISSING_MONTO"
      );
    }
    
    if (monto <= 0) {
      throw new BadRequestError(
        "Monto must be positive",
        "INVALID_MONTO"
      );
    }
  }
  
  // All validation passed
  res.json({ valid: true });
});
```

**Pattern:**
1. Validate required fields first
2. Then validate dependent fields
3. Throw specific error codes
4. Include field name in error message

---

## How to Handle Batch Operations with Partial Failures

**Problem:** Processing 10 contracts, but 3 fail. How to respond?

**Solution:**

```typescript
export const fillMultipleContracts = asyncHandler(async (req, res) => {
  const { contracts } = req.body;
  
  const results = [];
  
  for (const contract of contracts) {
    try {
      const filled = await fillContract(contract);
      results.push({
        success: true,
        contractId: contract.id,
        data: filled,
      });
    } catch (error) {
      results.push({
        success: false,
        contractId: contract.id,
        error: error.message,
        code: error.code,
      });
    }
  }
  
  // Check if all failed
  const allFailed = results.every((r) => !r.success);
  if (allFailed) {
    throw new BadRequestError(
      "All contracts failed processing",
      "ALL_FAILED"
    );
  }
  
  // Partial success is ok
  res.json({ results });
});
```

**Response:**
```json
{
  "results": [
    { "success": true, "contractId": "1", "data": {...} },
    { "success": false, "contractId": "2", "error": "Invalid CURP", "code": "INVALID_CURP" },
    { "success": true, "contractId": "3", "data": {...} }
  ]
}
```

---

## How to Handle Timeout Errors

**Problem:** External API is slow or timeout occurs.

**Solution:**

```typescript
import { ExternalServiceError } from "../errors";

export const callAPIWithTimeout = async (promise, timeoutMs = 30000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Request timeout")),
      timeoutMs
    )
  );
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    throw new ExternalServiceError(
      `API request failed: ${error.message}`,
      "API_TIMEOUT"
    );
  }
};

// Usage:
export const extractINEData = async (imageBuffer) => {
  const geminiPromise = genAI.models.generateContent({...});
  
  try {
    const result = await callAPIWithTimeout(geminiPromise, 30000);
    return parseINEResponse(result);
  } catch (error) {
    throw error; // Already ExternalServiceError
  }
};
```

---

## How to Use Error Codes for Client-Side Handling

**Problem:** Frontend needs to show specific UI based on error type.

**Solution:**

**Backend:** Include consistent error codes:
```typescript
throw new BadRequestError("File is too large", "FILE_TOO_LARGE");
throw new BadRequestError("Document not valid", "INVALID_DOCUMENT");
throw new UnauthorizedError("Token expired", "TOKEN_EXPIRED");
```

**Frontend:** Handle by code:
```typescript
try {
  const response = await fetch("/api/upload", { ... });
  const data = await response.json();
  
  if (!response.ok) {
    switch (data.code) {
      case "FILE_TOO_LARGE":
        showError("File must be smaller than 5MB");
        break;
      case "INVALID_DOCUMENT":
        showError("Please upload a valid Mexican INE");
        break;
      case "TOKEN_EXPIRED":
        redirectToLogin();
        break;
      default:
        showError(data.error);
    }
  }
} catch (error) {
  showError("Network error");
}
```

**Benefits:**
- Frontend responds precisely to error type
- Better user experience (specific messages)
- Easier debugging (error codes in logs)

---

## Quick Reference

| Task | Error Class | Example |
|------|-------------|---------|
| User input invalid | BadRequestError | `throw new BadRequestError("CURP invalid", "INVALID_CURP")` |
| Not authenticated | UnauthorizedError | `throw new UnauthorizedError("Token required", "MISSING_TOKEN")` |
| Resource missing | NotFoundError | `throw new NotFoundError("User not found", "USER_NOT_FOUND")` |
| External API fails | ExternalServiceError | `throw new ExternalServiceError("API failed", "API_ERROR")` |
| Unexpected error | InternalServerError | `throw new InternalServerError("Bug", "UNEXPECTED")` |
| Too many requests | RateLimitError | `throw new RateLimitError("Rate limit", 60)` |

