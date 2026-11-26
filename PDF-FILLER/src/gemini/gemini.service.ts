import { Injectable } from "@nestjs/common";
import { extraerDatosEstadoCuenta as extraerEstadoCuentaLegacy } from "../clients/extraerDatosEstadoCuenta.clients";
import { extraerDatosINE as extraerIneLegacy } from "../clients/extraerDatos.clients";
import { extraerDatosNomina as extraerNominaLegacy } from "../clients/extraerDatosNomina.clients";
import {
  extraerDatosUnificado as extraerUnificadoLegacy,
  FuentesUnificadas,
  ResultadoEscaneoUnificado,
} from "../clients/extraerDatosUnificado.clients";

@Injectable()
export class GeminiService {
  extraerDatosINE(fuente: Buffer, apiKey?: string): Promise<unknown> {
    return extraerIneLegacy(fuente, apiKey);
  }

  extraerDatosNomina(fuente1: Buffer, fuente2: Buffer, apiKey?: string): Promise<unknown> {
    return extraerNominaLegacy(fuente1, fuente2, apiKey);
  }

  extraerDatosEstadoCuenta(fuente: Buffer, apiKey?: string): Promise<unknown> {
    return extraerEstadoCuentaLegacy(fuente, apiKey);
  }

  extraerDatosUnificado(fuentes: FuentesUnificadas, apiKey?: string): Promise<ResultadoEscaneoUnificado> {
    return extraerUnificadoLegacy(fuentes, apiKey);
  }
}
