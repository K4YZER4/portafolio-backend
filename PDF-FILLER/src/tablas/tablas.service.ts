import { Injectable, OnModuleInit } from "@nestjs/common";
import { FilaTabla } from "../types";
import { cargarTablas, consultarTabla } from "../utils/tablaCargar.utils";

@Injectable()
export class TablasService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await cargarTablas();
  }

  consultar(monto: number, quincenas: number): Promise<FilaTabla | null> {
    return consultarTabla(monto, quincenas);
  }
}
