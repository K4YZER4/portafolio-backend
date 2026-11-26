import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { Public } from "../auth/public.decorator";
import { FirmaService } from "./firma.service";

interface FirmarBody {
  firmaBase64?: unknown;
  aceptoTerminos?: unknown;
  codigoVerificacion?: unknown;
}

@Controller("enlaces-firma")
@Public()
export class FirmaController {
  constructor(private readonly firma: FirmaService) {}

  @Get(":token")
  obtener(@Param("token") token: string) {
    return this.firma.obtenerDatos(token);
  }

  @Get(":token/pdf")
  async obtenerPdf(@Param("token") token: string, @Res() response: Response): Promise<void> {
    const { folio, pdf } = await this.firma.obtenerPdf(token);
    response.removeHeader("X-Frame-Options");
    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${folio}.pdf`,
      "Content-Length": pdf.length.toString(),
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
    });
    response.send(pdf);
  }

  @Post(":token/firmas")
  @UseGuards(TokenBucketGuard)
  firmar(@Param("token") token: string, @Body() body: FirmarBody) {
    return this.firma.firmar(token, body.firmaBase64, body.aceptoTerminos, body.codigoVerificacion);
  }

  @Post(":token/reabrir")
  @UseGuards(TokenBucketGuard)
  reabrir(@Param("token") token: string) {
    return this.firma.reabrirPorToken(token);
  }
}
