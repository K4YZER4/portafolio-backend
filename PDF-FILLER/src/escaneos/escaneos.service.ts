import { Injectable } from "@nestjs/common";
import { InternalServerError } from "../errors";
import { validarCURP } from "../utils/validarCurp.utils";
import { EstadoCuentaDatos, IneData, IneValida, NominaDatos, NominaResponse } from "../types";
import { EstadoCuentaResponse } from "../types/estadoCuenta.types";
import { GeminiService } from "../gemini/gemini.service";
import { FuentesUnificadas } from "../clients/extraerDatosUnificado.clients";

@Injectable()
export class EscaneosService {
  constructor(private readonly gemini: GeminiService) {}

  async escanearINE(fuente: Buffer, apiKey: string): Promise<IneValida> {
    const datos = await this.gemini.extraerDatosINE(fuente, apiKey) as IneData;
    if (!datos?.curp) {
      throw new InternalServerError("Error al escanear INE: no se pudo extraer la CURP");
    }
    return { ...datos, curpValidada: await validarCURP(datos.curp) };
  }

  async escanearNomina(fuente1: Buffer, fuente2: Buffer, apiKey: string): Promise<NominaResponse> {
    const datos = await this.gemini.extraerDatosNomina(fuente1, fuente2, apiKey) as Partial<NominaDatos>;
    return {
      datos: {
        noEmpleado: datos.noEmpleado ?? "",
        rfc: datos.rfc ?? "",
        puesto: datos.puesto ?? "",
        departamento: datos.departamento ?? "",
        dependencia: datos.dependencia ?? "",
        percepcionNomina1: datos.percepcionNomina1 ?? 0,
        percepcionNomina2: datos.percepcionNomina2 ?? 0,
        ingresoMensual: datos.ingresoMensual ?? 0,
        telefonoEmpresarial: datos.telefonoEmpresarial ?? "",
        emailLaboral: datos.emailLaboral ?? "",
      },
    };
  }

  async escanearEstadoCuenta(fuente: Buffer, apiKey: string): Promise<EstadoCuentaResponse> {
    const datos = await this.gemini.extraerDatosEstadoCuenta(fuente, apiKey) as EstadoCuentaDatos;
    return { datos };
  }

  async escanearUnificado(
    fuentes: FuentesUnificadas,
    apiKey: string,
  ): Promise<{
    ine: IneValida | null;
    nomina: NominaResponse["datos"] | null;
    estadoCuenta: EstadoCuentaDatos | null;
  }> {
    const res = await this.gemini.extraerDatosUnificado(fuentes, apiKey);

    let ineValida: IneValida | null = null;
    if (res.ine) {
      const curpValidada = res.ine.curp
        ? await validarCURP(res.ine.curp)
        : { valido: false, mensaje: "CURP ausente" };
      ineValida = { ...res.ine, curpValidada };
    }

    let nominaNormalizada: NominaResponse["datos"] | null = null;
    if (res.nomina) {
      nominaNormalizada = {
        noEmpleado: res.nomina.noEmpleado ?? "",
        rfc: res.nomina.rfc ?? "",
        puesto: res.nomina.puesto ?? "",
        departamento: res.nomina.departamento ?? "",
        dependencia: res.nomina.dependencia ?? "",
        percepcionNomina1: res.nomina.percepcionNomina1 ?? 0,
        percepcionNomina2: res.nomina.percepcionNomina2 ?? 0,
        ingresoMensual: res.nomina.ingresoMensual ?? 0,
        telefonoEmpresarial: res.nomina.telefonoEmpresarial ?? "",
        emailLaboral: res.nomina.emailLaboral ?? "",
      };
    }

    return {
      ine: ineValida,
      nomina: nominaNormalizada,
      estadoCuenta: res.estadoCuenta,
    };
  }
}
