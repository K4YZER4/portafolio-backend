import { GoogleGenAI } from "@google/genai";
import { EstadoCuentaDatos } from "../types";
import { withErrorHandling } from "../utils";
import { BadRequestError, InternalServerError } from "../errors";
import { logger } from "../logger/logger";
async function extraerDatosEstadoCuenta(fuente: Buffer, apiKey?: string): Promise<EstadoCuentaDatos> {
  const isDemo = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
  const DEMO_ESTADO_CUENTA_MOCK: EstadoCuentaDatos = {
    nombreTitular: "JUAN CARLOS PÉREZ GÓMEZ",
    rfc: "PEGJ880615XYZ",
    banco: "BBVA MÉXICO",
    numeroCuenta: "0123456789",
    clabe: "012180001234567890",
    periodoInicio: "01/01/2026",
    periodoFin: "31/01/2026",
    saldoAlCorte: 15400,
    saldoPromedio: 14200,
    totalDepositos: 25000,
  };
  if (apiKey === "DEMO_KEY") {
    return DEMO_ESTADO_CUENTA_MOCK;
  }
  return withErrorHandling(
    async () => {
      const genAI = new GoogleGenAI({ apiKey: apiKey ?? process.env.GEMINI_API_KEY });

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                text: `IMPORTANTE: Antes de extraer datos, VALIDA lo siguiente:

                      1. ¿El documento es UN ESTADO DE CUENTA DE ALGUN BANCO?
                        - Si NO es una ESTADO DE CUENTA → Responde EXACTAMENTE:INVALID_DOCUMENT
                        
                      2. ¿La imagen tiene calidad suficiente para leer los datos?
                        - Si NO se puede leer claramente → Responde EXACTAMENTE:INVALID_DOCUMENT
                        
                      3. ¿TODOS los datos principales están legibles? 
                        - Si falta información crítica NO pueda leer → Responde EXACTAMENTE:INVALID_DOCUMENT

                      SI PASÓ TODAS LAS VALIDACIONES, devuelve ÚNICAMENTE un JSON válido con exactamente esta estructura:
              {
                "nombreTitular": "nombre completo del titular en mayúsculas",
                "rfc": "RFC del titular en mayúsculas",
                "banco": "nombre del banco en mayúsculas, ejemplo: BANORTE, BBVA, SANTANDER, HSBC",
                "numeroCuenta": "número de cuenta sin espacios",
                "clabe": "CLABE interbancaria de 18 dígitos sin espacios",
                "periodoInicio": "DD/MM/YYYY de inicio del periodo",
                "periodoFin": "DD/MM/YYYY de fin del periodo",
                "saldoAlCorte": numero del saldo al corte sin signos ni comas,
                "saldoPromedio": numero del saldo promedio del periodo sin signos ni comas,
                "totalDepositos": numero del total de depósitos del periodo sin signos ni comas
              }`,
              },
              {
                inlineData: {
                  data: fuente.toString("base64"),
                  mimeType: "image/jpeg",
                },
              },
            ],
          },
        ],
      });
      try {
        if (!response.text || response.text === "INVALID_DOCUMENT") {
          throw new BadRequestError(
            "Failed to from gemini response is empty or invalid",
            "ESTADO_CUENTA_EXTRACTION_FAILED"
          );
        } else {
          try {
            const raw = response.text ? response.text.replace(/```json|```/g, "").trim() : "";
            const data = JSON.parse(raw);
            return data;
          } catch (error) {
        if (isDemo) {
          logger.warn({ err: error }, "Fallo en extracción Estado de Cuenta en modo demo, usando mock");
          return DEMO_ESTADO_CUENTA_MOCK;
        }
            logger.error(
              { err: error, rawResponse: response.text },
              "Error parsing Gemini response for INE extraction"
            );
            throw new BadRequestError(
              "Failed to parse Gemini response or response is empty",
              "ESTADO_CUENTA_EXTRACTION_FAILED"
            );
          }
        }
      } catch (error) {
        if (isDemo) {
          logger.warn({ err: error }, "Fallo en extracción Estado de Cuenta en modo demo, usando mock");
          return DEMO_ESTADO_CUENTA_MOCK;
        }
        if (error instanceof BadRequestError) {
          throw error; // ← Re-lanzar como está (400)
        }
        throw new InternalServerError(
          "Failed to extract Estado de Cuenta data",
          "ESTADO_CUENTA_EXTRACTION_FAILED"
        );
      }
    },
    "GEMINI_EXTRACTION_FAILED",
    "Failed to extract Estado de Cuenta data"
  );
}

export { extraerDatosEstadoCuenta };
