import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import {
  parseContratoBody,
  validarContratoData,
} from "../common/validation/contrato-data.validator";
import { ContratosHistorialService } from "./historial.service";
import { ContratosService } from "./contratos.service";
import { FirmaService } from "./firma.service";
import { Roles } from "../auth/roles.decorator";
import type { AuthTokenPayload } from "../auth/auth.types";
import type { Request } from "express";

interface HistorialQuery {
  asesorId?: string;
  desde?: string;
  hasta?: string;
  buscar?: string;
}

interface IncorporarFirmaBody {
  urlFirma?: unknown;
}

type AuthenticatedRequest = Request & { user: AuthTokenPayload };

@Controller("contratos")
export class ContratosController {
  constructor(
    private readonly contratos: ContratosService,
    private readonly historial: ContratosHistorialService,
    private readonly firma: FirmaService,
  ) {}

  @Get("historial")
  @UseGuards(TokenBucketGuard)
  listar(@Query() query: HistorialQuery, @Req() request: AuthenticatedRequest) {
    const asesorId = Number(query.asesorId);
    const userAsesorId = request.user.role === "asesor" ? request.user.sub : undefined;
    return this.historial.listar({
      asesorId: userAsesorId ?? (Number.isFinite(asesorId) && asesorId > 0 ? asesorId : undefined),
      desde: query.desde,
      hasta: query.hasta,
      buscar: query.buscar,
    });
  }

  @Get(":id/pdf")
  async descargarPdf(
    @Param("id") id: string,
    @Query("download") download: string | undefined,
    @Res() response: Response,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.contratos.verificarAcceso(id, request.user.sub, request.user.role);
    const esDescarga = download === "true";
    const { folio, pdf } = await this.contratos.descargar(id);

    response.removeHeader("X-Frame-Options");
    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `${esDescarga ? "attachment" : "inline"}; filename=${folio}.pdf`,
      "Content-Length": pdf.length.toString(),
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
    });
    response.send(pdf);
  }

  @Get(":folio")
  async obtener(@Param("folio") folio: string, @Req() request: AuthenticatedRequest) {
    await this.contratos.verificarAcceso(folio, request.user.sub, request.user.role);
    return this.contratos.obtener(folio);
  }

  @Put(":folio")
  @UseGuards(TokenBucketGuard)
  @UseInterceptors(NoFilesInterceptor())
  async actualizar(
    @Param("folio") folio: string,
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.contratos.verificarAcceso(folio, request.user.sub, request.user.role);
    const contrato = parseContratoBody(body);
    validarContratoData(contrato);
    const { pdf } = await this.contratos.actualizar(folio, contrato);

    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${folio}.pdf`,
      "X-Contract-Folio": folio,
    });
    response.send(pdf);
  }

  @Post(":id/enlaces-firma")
  @HttpCode(201)
  @UseGuards(TokenBucketGuard)
  async generarEnlace(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    await this.contratos.verificarAcceso(id, request.user.sub, request.user.role);
    return this.firma.generarEnlace(id);
  }

  @Post(":folio/aprobar")
  @UseGuards(TokenBucketGuard)
  @Roles("admin", "mesa")
  aprobar(@Param("folio") folio: string, @Req() request: AuthenticatedRequest) {
    return this.contratos.revisar(folio, request.user.sub, "aprobar");
  }

  @Post(":folio/rechazar")
  @UseGuards(TokenBucketGuard)
  @Roles("admin", "mesa")
  rechazar(
    @Param("folio") folio: string,
    @Body() body: { motivo?: unknown },
    @Req() request: AuthenticatedRequest,
  ) {
    return this.contratos.revisar(
      folio,
      request.user.sub,
      "rechazar",
      typeof body.motivo === "string" ? body.motivo : undefined,
    );
  }

  @Post(":folio/reabrir-firma")
  @UseGuards(TokenBucketGuard)
  async reabrirFirma(@Param("folio") folio: string, @Req() request: AuthenticatedRequest) {
    await this.contratos.verificarAcceso(folio, request.user.sub, request.user.role);
    return this.firma.reabrirPorFolio(folio);
  }

  @Post(":folio/incorporarFirma")
  @UseGuards(TokenBucketGuard)
  incorporarFirma(
    @Param("folio") folio: string,
    @Body() body: IncorporarFirmaBody,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.contratos.verificarAcceso(folio, request.user.sub, request.user.role)
      .then(() => this.firma.incorporarFirma(folio, body.urlFirma));
  }
}
