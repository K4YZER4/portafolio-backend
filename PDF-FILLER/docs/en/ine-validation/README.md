<div align="left">
  <a href="../../../README.md">
    <img src="https://img.shields.io/badge/← Home-lightgray?style=flat" alt="Back to Home"/>
  </a>
</div>

<div align="right">
  <a href="../../es/ine-validation/README.md">
    <img src="https://img.shields.io/badge/🇲🇽_Leer_en_Español-01696f?style=for-the-badge&logo=readme&logoColor=white" alt="Leer en Español"/>
  </a>
</div>

# INE Validation

Understand how INE (Mexican ID) validation works in RellenadorContratos.

---

**Navigation:** Home › Docs › INE Validation

---

## Overview

The INE validation system ensures that:

- ✅ Only valid Mexican INE documents are processed
- ✅ Image quality is sufficient for data extraction
- ✅ All critical data fields are legible
- ✅ Invalid documents are rejected early (before expensive API calls)
- ✅ Users receive clear feedback on why their document was rejected

---

## How It Works

### The Three-Step Validation

```
1. User uploads INE image
   ↓
2. Validate document quality BEFORE extraction
   - Is this a Mexican INE?
   - Is image quality sufficient?
   - Are critical fields legible?
   ↓
3. If valid → Extract data using Gemini
   ↓
4. If invalid → Return INVALID_DOCUMENT error
```

### Why This Order?

- **Validate first:** Expensive API calls only for valid documents
- **Save resources:** Reject bad images in milliseconds, not seconds
- **Better UX:** Users know immediately if their image won't work
- **Clear feedback:** "Document not valid" instead of extraction errors

---

## The Gemini Prompt

The system uses a specialized Gemini prompt that validates BEFORE extracting:

```
Validate this Mexican INE (ID card) image:
1. Is this a Mexican INE? (If no, respond: INVALID_DOCUMENT)
2. Is the image quality sufficient? (If no, respond: INVALID_DOCUMENT)
3. Are all critical data fields legible? (If no, respond: INVALID_DOCUMENT)
If all checks pass, respond: VALID
```

**Responses:**

- `INVALID_DOCUMENT` → Something is wrong with the document or image
- `VALID` → Document is valid, proceed with extraction

---

## Error Handling

### Invalid Document Response

```typescript
// Backend receives "INVALID_DOCUMENT" from Gemini
if (response.includes("INVALID_DOCUMENT")) {
  throw new BadRequestError(
    "Document is not a valid Mexican INE or quality is too low",
    "INVALID_DOCUMENT"
  );
}
```

### Client Response (400)

```json
{
  "error": "Document is not a valid Mexican INE or quality is too low",
  "code": "INVALID_DOCUMENT",
  "requestId": "req-abc123",
  "statusCode": 400,
  "timestamp": "2026-05-11T18:30:00Z"
}
```

### Frontend Handling

```typescript
switch (error.code) {
  case "INVALID_DOCUMENT":
    showError("Please upload a clear photo of your Mexican INE card");
    showTips([
      "Make sure the entire card is visible",
      "Ensure good lighting",
      "Avoid shadows and glare",
      "Keep the card straight",
    ]);
    break;
}
```

---

## Validation Checklist for Users

The system checks if your INE meets these requirements:

✅ **Is it a Mexican INE?**

- Must be official Mexican government ID
- Foreign documents won't work
- Expired INEs may not work

✅ **Is image quality good?**

- No blurriness
- Good lighting (not too dark or bright)
- No shadows or glare
- Entire card must be visible

✅ **Are critical fields legible?**

- Photo must be clear
- Name must be readable
- CURP must be readable
- Validity dates must be readable

---

## Implementation Details

### File Locations

**INE Validation Logic:**

- `src/clients/extraerDatos.clients.ts` — Main INE extraction with validation
- `src/clients/extraerDatosNomina.clients.ts` — Nomina extraction with validation
- `src/clients/extraerDatosEstadoCuenta.clients.ts` — Statement extraction with validation

**API Integration:**

- Google Generative AI (Gemini) handles the validation and extraction

### Code Pattern

```typescript
import { genAI } from "./gemini"; // Google Generative AI

export const extractINEData = async (imageBuffer: Buffer) => {
  const response = await genAI.models.generateContent({
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: "image/png",
            },
          },
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

  // Check validation result
  if (result.includes("INVALID_DOCUMENT")) {
    throw new BadRequestError("Document is not valid or quality is too low", "INVALID_DOCUMENT");
  }

  // If valid, proceed with extraction
  return parseINEResponse(result);
};
```

---

## Related Documents

- [Error Handling Documentation](../error-handling/README.md) — How INVALID_DOCUMENT errors are handled
- [API Reference](../api.md) — INE endpoints and error responses
- [Architecture](../architecture.md) — System design and data flow

---

## Common Issues & Solutions

### Issue: "Document is not valid"

**Possible causes:**

- Image is too blurry
- Card is partially cut off
- Lighting is poor (too dark or too bright)
- Card is at an angle

**Solution:**

- Take a new photo in good lighting
- Make sure entire card is visible
- Hold card straight and parallel to camera
- Avoid shadows and reflections

### Issue: "Quality is too low"

**Possible causes:**

- Photo is out of focus
- Resolution is too low
- Glare on card
- Photo taken from odd angle

**Solution:**

- Use high-resolution camera (smartphone camera is fine)
- Focus clearly on card before taking photo
- Remove reflections by adjusting lighting
- Take photo straight on, not at an angle

### Issue: "Critical fields not legible"

**Possible causes:**

- Photo quality is poor
- Card is worn/damaged
- Name or CURP is hard to read
- Date fields are unclear

**Solution:**

- Take clearer photo with better lighting
- If card is damaged/faded, may not work (card too old)
- Zoom in to make sure all text is clear

---

## Performance Notes

- **Validation + Extraction:** ~3-5 seconds per image
- **API calls:** 1 call to Gemini (validates + extracts)
- **Cost:** Minimal (uses Google Generative AI free tier)
- **Timeout:** 30 seconds per request

---

## Future Improvements

Potential enhancements to INE validation:

1. **Multi-language prompts** — Validate in Spanish/English automatically
2. **Advanced quality checks** — Detect document type before validation
3. **Batch processing** — Validate multiple documents simultaneously
4. **Caching** — Cache validation results for identical images
5. **Logging** — Track why documents fail validation

---

## Next Steps

- Learn [how errors are handled](../error-handling/README.md)
- See [API reference](../api.md) for INE endpoints
- Check [system architecture](../architecture.md)
