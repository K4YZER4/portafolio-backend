import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { Roles } from "../auth/roles.decorator";
import {
  parseContratoBody,
  validarContratoData,
} from "../common/validation/contrato-data.validator";
import { ContratosService } from "./contratos.service";

@Controller("pdfs")
export class PdfsController {
  constructor(private readonly contratos: ContratosService) {}

  @Post()
  @UseGuards(TokenBucketGuard)
  @Roles("asesor", "admin")
  @UseInterceptors(NoFilesInterceptor())
  async crear(@Body() body: Record<string, unknown>, @Res() response: Response): Promise<void> {
    const contrato = parseContratoBody(body);
    validarContratoData(contrato);
    const resultado = await this.contratos.crear(contrato);

    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${resultado.folio}.pdf`,
      "X-Contract-Folio": resultado.folio,
      "X-Contract-Token": resultado.tokenFirma || "",
    });
    response.send(resultado.pdf);
  }

  @Post("vista-previa")
  @UseGuards(TokenBucketGuard)
  @Roles("asesor", "admin")
  @UseInterceptors(NoFilesInterceptor())
  async vistaPrevia(@Body() body: Record<string, unknown>, @Res() response: Response): Promise<void> {
    const contrato = parseContratoBody(body);
    validarContratoData(contrato);
    const pdf = await this.contratos.previsualizar(contrato);

    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=vista-previa.pdf",
      "Content-Length": pdf.length.toString(),
    });
    response.send(pdf);
  }
}
