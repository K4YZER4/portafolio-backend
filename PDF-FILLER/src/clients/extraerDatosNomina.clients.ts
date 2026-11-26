import { GoogleGenAI } from "@google/genai";
import { withErrorHandling } from "../utils";
import { BadRequestError, InternalServerError } from "../errors";
import { logger } from "../logger/logger";
async function extraerDatosNomina(fuente1: Buffer, fuente2: Buffer, apiKey?: string) {
  const isDemo = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
  const DEMO_NOMINA_MOCK = {
    noEmpleado: "EMP-9482",
    rfc: "PEGJ880615XYZ",
    puesto: "EJECUTIVO COMERCIAL",
    departamento: "VENTAS",
    dependencia: "GOBIERNO DEL ESTADO DE SINALOA",
    percepcionNomina1: 12500,
    percepcionNomina2: 12500,
    ingresoMensual: 25000,
    telefonoEmpresarial: "5551234567",
    emailLaboral: "juan.perez@empresa.com.mx",
  };
  if (apiKey === "DEMO_KEY") {
    return DEMO_NOMINA_MOCK;
  }
  return withErrorHandling(
    async () => {
      const genAI = new GoogleGenAI({ apiKey: apiKey ?? process.env.GEMINI_API_KEY });

      const toBase64 = (buf: Buffer) => ({
        inlineData: {
          data: buf.toString("base64"),
          mimeType: "image/jpeg",
        },
      });

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                text: `IMPORTANTE: Antes de extraer datos, VALIDA lo siguiente:

                      1. ¿El documento es UNA NOMINA ?
                        - Si NO es una NOMINA → Responde EXACTAMENTE:INVALID_DOCUMENT
                        
                      2. ¿La imagen tiene calidad suficiente para leer los datos?
                        - Si NO se puede leer claramente → Responde EXACTAMENTE:INVALID_DOCUMENT
                        
                      3. ¿TODOS los datos principales están legibles? 
                        - Si falta información crítica NO pueda leer → Responde EXACTAMENTE:INVALID_DOCUMENT

                      SI PASÓ TODAS LAS VALIDACIONES, devuelve ÚNICAMENTE un JSON válido con exactamente esta estructura:
              {
                "noEmpleado": "número de empleado (tómalo de cualquiera de las dos, es el mismo)",
                "rfc": "RFC del empleado en mayúsculas (es el mismo en ambas)",
                "puesto": "categoría o puesto en mayúsculas (es el mismo en ambas)",
                "departamento": "nombre del grupo nominal en mayúsculas",
                "dependencia": "si el encabezado dice GOBIERNO DEL ESTADO DE SINALOA devuelve exactamente GOBIERNO DEL ESTADO DE SINALOA, si dice MAGISTERIO o SEP o educación devuelve exactamente MAGISTERIO DE SINALOA, si no reconoces ninguna devuelve cadena vacía",
                "percepcionNomina1": número con el total de PERCEPCIONES de la primera nómina (solo el número sin signos ni comas),
                "percepcionNomina2": número con el total de PERCEPCIONES de la segunda nómina (solo el número sin signos ni comas),
                "ingresoMensual": número resultado de sumar ambas PERCEPCIONES (nomina1 + nomina2) porque juntas representan el mes completo (solo el número)
                }`,
              },
              toBase64(fuente1),
              toBase64(fuente2),
            ],
          },
        ],
      });
      try {
        if (!response.text) {
          throw new BadRequestError(
            "Failed to from gemini response is empty or invalid",
            "NOMINA_EXTRACTION_FAILED"
          );
        } else {
          try {
            const raw = response.text ? response.text.replace(/```json|```/g, "").trim() : "";
            const data = JSON.parse(raw);
            return data;
          } catch (error) {
        if (isDemo) {
          logger.warn({ err: error }, "Fallo en extracción Nómina en modo demo, usando mock");
          return DEMO_NOMINA_MOCK;
        }
            logger.error(
              { err: error, rawResponse: response.text },
              "Error parsing Gemini response for INE extraction"
            );
            throw new BadRequestError(
              "Failed to parse Gemini response or response is empty",
              "NOMINA_EXTRACTION_FAILED"
            );
          }
        }
      } catch (error) {
        if (isDemo) {
          logger.warn({ err: error }, "Fallo en extracción Nómina en modo demo, usando mock");
          return DEMO_NOMINA_MOCK;
        }
        if (error instanceof BadRequestError || response.text === "INVALID_DOCUMENT") {
          throw error; // ← Re-lanzar como está (400)
        }
        throw new InternalServerError("Failed to extract NOMINA data", "NOMINA_EXTRACTION_FAILED");
      }
    },
    "GEMINI_EXTRACTION_FAILED",
    "Failed to extract NOMINA data"
  );
}

export { extraerDatosNomina };
