import { Injectable } from "@nestjs/common";
import {
  HistorialFiltros,
  obtenerHistorial,
} from "../services/historialContrato.services";

@Injectable()
export class ContratosHistorialService {
  listar(filtros: HistorialFiltros) {
    return obtenerHistorial(filtros);
  }
}
