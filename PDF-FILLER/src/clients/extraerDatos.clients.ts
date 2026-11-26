//import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { withErrorHandling } from "../utils";
//Esta función recibe la ruta o URL de una imagen de una credencial INE mexicana, la analiza usando el modelo Gemini-3-Flash-Preview de Google GenAI, y devuelve un JSON con los datos extraídos siguiendo una estructura específica.
import { BadRequestError, InternalServerError } from "../errors";
import { logger } from "../logger/logger";
//This functions receives an image or path of a mexican INE dcredential and extract the data using the gemini-3-flash-preview model of Google GenAI and returns  a JSON with the extracted data following a specific structure.
const DEMO_INE_MOCK = {
  nombre1: "JUAN",
  nombre2: "CARLOS",
  apellidoPaterno: "PÉREZ",
  apellidoMaterno: "GÓMEZ",
  nombreCompleto: "JUAN CARLOS PÉREZ GÓMEZ",
  sexo: "M",
  fechaNac: "15/06/1988",
  curp: "PEGJ880615HMCRMN02",
  claveElector: "PEGJ88061525H100",
  domicilio: {
    calle: "AVENIDA INSURGENTES SUR",
    numeroCasa: "1234",
    numeroInterior: "4B",
    colonia: "DEL VALLE",
    codigoPostal: "03100",
    municipio: "BENITO JUÁREZ",
    estado: "CIUDAD DE MÉXICO",
  },
  seccion: "0452",
  vigencia: "2030",
  numEmision: "01",
};

async function extraerDatosINE(fuente: Buffer, apiKey?: string) {
  const isDemo = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
  if (apiKey === "DEMO_KEY") {
    return DEMO_INE_MOCK;
  }

  return withErrorHandling(
    async () => {
      try {
        const key = apiKey ?? process.env.GEMINI_API_KEY;
        if (!key || key === "DEMO_KEY") {
          if (isDemo) return DEMO_INE_MOCK;
          throw new BadRequestError("No se proporcionó API key para Gemini", "MISSING_GEMINI_KEY");
        }

        const genAI = new GoogleGenAI({ apiKey: key });
        const imagePart = {
          inlineData: {
            data: fuente.toString("base64"),
            mimeType: "image/jpeg",
          },
        };
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                {
                  text: `IMPORTANTE: Antes de extraer datos, VALIDA lo siguiente:

                      1. ¿El documento es UNA CREDENCIAL INE MEXICANA (Identificación Nacional Electoral)?
                        - Si NO es una INE → Responde EXACTAMENTE:INVALID_DOCUMENT
                        
                      2. ¿La imagen tiene calidad suficiente para leer los datos?
                        - Si NO se puede leer claramente → Responde EXACTAMENTE:INVALID_DOCUMENT
                        
                      3. ¿TODOS los datos principales están legibles? (nombre, CURP, fecha, etc)
                        - Si falta información crítica NO pueda leer → Responde EXACTAMENTE:INVALID_DOCUMENT

                      SI PASÓ TODAS LAS VALIDACIONES, devuelve ÚNICAMENTE un JSON válido con exactamente esta estructura:
            {
              "nombre1": "primer nombre de pila solamente",
                "nombre2": "segundo nombre de pila si existe, si no existe devuelve cadena vacía",
                "apellidoPaterno": "primer apellido",
                "apellidoMaterno": "segundo apellido",
                "sexo": "F o M",// F para femenino, M para masculino
                "fechaNac": "DD/MM/YYYY",
                "curp": "18 caracteres",
                "claveElector": "18 caracteres",
                "domicilio": {
                  "calle": "solo nombre de la calle sin número",
                  "numeroCasa": "solo el número exterior",
                  "numeroInterior": "número interior si existe, si no existe devuelve cadena vacía",
                  "colonia": "nombre de colonia o fraccionamiento sin la palabra FRACC o COL",
                  "codigoPostal": "5 dígitos",
                  "municipio": "nombre del municipio o delegación",
                  "estado": "nombre del estado"
                  },
                  "seccion": "número de sección electoral",
                "vigencia": "año inicio - año fin o solo año fin",
                "numEmision": "número de emisión si existe"
                }`,
                },
                imagePart,
              ],
            },
          ],
        });
        try {
          if (!response.text || response.text === "INVALID_DOCUMENT") {
            throw new BadRequestError(
              "Failed to from gemini response is empty or invalid",
              "INE_EXTRACTION_FAILED"
            );
          } else {
            try {
              const raw = response.text ? response.text.replace(/```json|```/g, "").trim() : "";
              const data = JSON.parse(raw);
              data.nombreCompleto = `${data.nombre1} ${data.nombre2} ${data.apellidoPaterno} ${data.apellidoMaterno}`;
              return data;
            } catch (_error) {
              logger.error(
                { err: _error, rawResponse: response.text },
                "Error parsing Gemini response for INE extraction"
              );
              throw new BadRequestError(
                "Failed to parse Gemini response or response is empty",
                "INE_EXTRACTION_FAILED"
              );
            }
          }
        } catch (error) {
          if (isDemo) {
            logger.warn({ err: error }, "Fallo en extracción INE en modo demo, usando mock");
            return DEMO_INE_MOCK;
          }
          if (error instanceof BadRequestError) {
            throw error; // ← Re-lanzar como está (400)
          }
          throw new InternalServerError("Failed to extract INE data", "INE_EXTRACTION_FAILED");
        }
      } catch (outerError) {
        if (isDemo) {
          return DEMO_INE_MOCK;
        }
        throw outerError;
      }
    },
    "GEMINI_EXTRACTION_FAILED",
    "Failed to extract INE data"
  );
}
export { extraerDatosINE };
