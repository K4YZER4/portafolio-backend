import { Injectable } from "@nestjs/common";
import { listarAsesores } from "../services/asesores.services";

@Injectable()
export class AsesoresService {
  listar() {
    return listarAsesores();
  }
}
