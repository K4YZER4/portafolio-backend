import { GoogleGenAI } from "@google/genai";
import { withErrorHandling } from "../utils";
import { BadRequestError } from "../errors";
import { logger } from "../logger/logger";
import { IneData, NominaDatos, EstadoCuentaDatos } from "../types";

export interface FuentesUnificadas {
  ine?: Buffer;
  nomina1?: Buffer;
  nomina2?: Buffer;
  estadoCuenta?: Buffer;
}

export interface ResultadoEscaneoUnificado {
  ine: IneData | null;
  nomina: NominaDatos | null;
  estadoCuenta: EstadoCuentaDatos | null;
}

const DEMO_EXTRACTION_MOCK: ResultadoEscaneoUnificado = {
  ine: {
    nombre1: "JUAN",
    nombre2: "CARLOS",
    apellidoPaterno: "PÉREZ",
    apellidoMaterno: "GÓMEZ",
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
  },
  nomina: {
    noEmpleado: "EMP-9482",
    rfc: "PEGJ880615XYZ",
    puesto: "EJECUTIVO COMERCIAL",
    departamento: "VENTAS",
    dependencia: "CORPORATIVO FINANCIERO",
    percepcionNomina1: 12500,
    percepcionNomina2: 12500,
    ingresoMensual: 25000,
    telefonoEmpresarial: "5551234567",
    emailLaboral: "juan.perez@empresa.com.mx",
  },
  estadoCuenta: {
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
  },
};

function getDemoMock(fuentes: FuentesUnificadas): ResultadoEscaneoUnificado {
  return {
    ine: fuentes.ine ? DEMO_EXTRACTION_MOCK.ine : null,
    nomina: (fuentes.nomina1 || fuentes.nomina2) ? DEMO_EXTRACTION_MOCK.nomina : null,
    estadoCuenta: fuentes.estadoCuenta ? DEMO_EXTRACTION_MOCK.estadoCuenta : null,
  };
}

export async function extraerDatosUnificado(
  fuentes: FuentesUnificadas,
  apiKey?: string,
): Promise<ResultadoEscaneoUnificado> {
  const isDemo = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
  if (apiKey === "DEMO_KEY") {
    return getDemoMock(fuentes);
  }

  return withErrorHandling(
    async () => {
      try {
        const key = apiKey ?? process.env.GEMINI_API_KEY;
        if (!key || key === "DEMO_KEY") {
          if (isDemo) return getDemoMock(fuentes);
          throw new BadRequestError("No se proporcionó API key para Gemini", "MISSING_GEMINI_KEY");
        }

        const genAI = new GoogleGenAI({ apiKey: key });
        const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

      let instrucciones = `IMPORTANTE: Eres un sistema experto de OCR y extracción de datos para expedientes de crédito mexicanos.
A continuación se adjuntan una o más imágenes de los siguientes documentos:
- Identificación oficial INE / IFE mexicana
- Recibos de nómina quincenales (nómina 1 y nómina 2)
- Estado de cuenta bancario

Debes analizar las imágenes proporcionadas y extraer los datos correspondientes en un ÚNICO objeto JSON estructurado.

ESTRUCTURA EXACTA REQUERIDA (devuelve solo las claves que correspondan a documentos proporcionados; si un documento no fue enviado o no es legible, devuelve null en su propiedad):
{
  "ine": {
    "nombre1": "primer nombre de pila solamente en mayúsculas",
    "nombre2": "segundo nombre de pila si existe, o cadena vacía",
    "apellidoPaterno": "primer apellido en mayúsculas",
    "apellidoMaterno": "segundo apellido en mayúsculas",
    "sexo": "F o M",
    "fechaNac": "DD/MM/YYYY",
    "curp": "CURP de 18 caracteres",
    "claveElector": "clave de elector de 18 caracteres",
    "domicilio": {
      "calle": "nombre de la calle",
      "numeroCasa": "número exterior",
      "numeroInterior": "número interior si existe o cadena vacía",
      "colonia": "colonia o fraccionamiento sin prefijos como COL o FRACC",
      "codigoPostal": "código postal de 5 dígitos",
      "municipio": "municipio o alcaldía",
      "estado": "estado"
    },
    "seccion": "número de sección electoral",
    "vigencia": "año fin de vigencia",
    "numEmision": "número de emisión si existe"
  },
  "nomina": {
    "noEmpleado": "número de empleado",
    "rfc": "RFC del empleado en mayúsculas",
    "puesto": "categoría o puesto en mayúsculas",
    "departamento": "departamento o grupo nominal en mayúsculas",
    "dependencia": "si dice GOBIERNO DEL ESTADO DE SINALOA devuelve exactamente GOBIERNO DEL ESTADO DE SINALOA, si dice MAGISTERIO o SEP o educación devuelve exactamente MAGISTERIO DE SINALOA, sino nombre de la empresa/dependencia",
    "percepcionNomina1": número total de percepciones de nómina 1,
    "percepcionNomina2": número total de percepciones de nómina 2,
    "ingresoMensual": suma de percepciones de nómina 1 + nómina 2 (solo número),
    "telefonoEmpresarial": "teléfono de la empresa si aparece, o cadena vacía",
    "emailLaboral": "correo laboral si aparece, o cadena vacía"
  },
  "estadoCuenta": {
    "nombreTitular": "nombre completo del titular en mayúsculas",
    "rfc": "RFC del titular en mayúsculas",
    "banco": "nombre del banco en mayúsculas (BBVA, BANORTE, SANTANDER, HSBC, BANAMEX, etc.)",
    "numeroCuenta": "número de cuenta sin espacios",
    "clabe": "CLABE interbancaria de 18 dígitos sin espacios",
    "periodoInicio": "DD/MM/YYYY",
    "periodoFin": "DD/MM/YYYY",
    "saldoAlCorte": número del saldo al corte (solo número),
    "saldoPromedio": número del saldo promedio (solo número),
    "totalDepositos": número del total de depósitos (solo número)
  }
}

REGLAS CRÍTICAS:
1. Devuelve ÚNICAMENTE el bloque JSON válido, sin explicaciones ni markdown adicional.
2. Si un documento no viene adjunto o no se puede leer, coloca null en su clave ("ine": null, "nomina": null o "estadoCuenta": null).
3. No inventes datos. Extrae con la máxima fidelidad posible.`;

      parts.push({ text: instrucciones });

      if (fuentes.ine) {
        parts.push({
          inlineData: {
            data: fuentes.ine.toString("base64"),
            mimeType: "image/jpeg",
          },
        });
      }

      if (fuentes.nomina1) {
        parts.push({
          inlineData: {
            data: fuentes.nomina1.toString("base64"),
            mimeType: "image/jpeg",
          },
        });
      }

      if (fuentes.nomina2) {
        parts.push({
          inlineData: {
            data: fuentes.nomina2.toString("base64"),
            mimeType: "image/jpeg",
          },
        });
      }

      if (fuentes.estadoCuenta) {
        parts.push({
          inlineData: {
            data: fuentes.estadoCuenta.toString("base64"),
            mimeType: "image/jpeg",
          },
        });
      }

      let response;
      try {
        response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ parts }],
        });
      } catch (apiError) {
        if (isDemo) {
          logger.warn({ err: apiError }, "Gemini falló en modo demo, usando mock de demostración");
          return getDemoMock(fuentes);
        }
        throw apiError;
      }

      if (!response.text || response.text.trim() === "INVALID_DOCUMENT") {
        if (isDemo) {
          return getDemoMock(fuentes);
        }
        throw new BadRequestError(
          "No se pudieron extraer datos de los documentos proporcionados",
          "UNIFIED_EXTRACTION_FAILED",
        );
      }

      try {
        const raw = response.text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(raw);
        return {
          ine: data.ine ?? null,
          nomina: data.nomina ?? null,
          estadoCuenta: data.estadoCuenta ?? null,
        };
      } catch (parseError) {
        if (isDemo) {
          return getDemoMock(fuentes);
        }
        logger.error(
          { err: parseError, rawResponse: response.text },
          "Error parseando respuesta unificada de Gemini",
        );
        throw new BadRequestError(
          "Error al procesar la respuesta de Gemini para el escaneo unificado",
          "UNIFIED_EXTRACTION_PARSE_FAILED",
        );
      }
    } catch (outerErr) {
      if (isDemo) {
        return getDemoMock(fuentes);
      }
      throw outerErr;
    }
  },
  "GEMINI_UNIFIED_EXTRACTION_FAILED",
  "Fallo en la extracción unificada de documentos",
);
}
