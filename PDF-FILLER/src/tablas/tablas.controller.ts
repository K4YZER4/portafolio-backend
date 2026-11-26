import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { VALID_PERIODS, MONTO_DIVISOR } from "../config/constants";
import { BadRequestError, NotFoundError } from "../errors";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { TablasService } from "./tablas.service";

@Controller("tablas")
export class TablasController {
  constructor(private readonly tablas: TablasService) {}

  @Post("consultas")
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenBucketGuard)
  async consultar(
    @Body()
      body: {
        monto?: unknown;
        quincenas?: unknown;
        montoNeto?: unknown;
        plazoQuincenas?: unknown;
      },
  ) {
    const monto = Number(body.monto ?? body.montoNeto);
    const quincenas = Number(body.quincenas ?? body.plazoQuincenas);

    if (!Number.isFinite(monto) || monto < 3000 || monto % MONTO_DIVISOR !== 0) {
      throw new BadRequestError("monto debe ser positivo y divisible por 1000");
    }
    if (!Number.isFinite(quincenas) || !VALID_PERIODS.includes(quincenas)) {
      throw new BadRequestError(`Quincenas inválido. Valores permitidos: ${VALID_PERIODS.join(", ")}`);
    }

    const resultado = await this.tablas.consultar(monto, quincenas);
    if (!resultado) {
      throw new NotFoundError("No se encontró una fila que coincida con los parámetros dados");
    }
    return resultado;
  }
}
