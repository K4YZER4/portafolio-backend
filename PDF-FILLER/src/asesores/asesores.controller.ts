import { Controller, Get, UseGuards } from "@nestjs/common";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { AsesoresService } from "./asesores.service";

@Controller("asesores")
export class AsesoresController {
  constructor(private readonly asesores: AsesoresService) {}

  @Get()
  @UseGuards(TokenBucketGuard)
  listar() {
    return this.asesores.listar();
  }
}
