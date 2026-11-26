import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Headers,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { imageMulterOptions } from "../common/multer/multer.options";
import { EscaneosService } from "./escaneos.service";
import { config } from "../config";

@Controller()
export class EscaneosController {
  constructor(private readonly escaneos: EscaneosService) {}

  @Post("ine")
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenBucketGuard)
  @UseInterceptors(FileInterceptor("ine", imageMulterOptions))
  escanearINE(@UploadedFile() file?: Express.Multer.File, @Headers("x-gemini-api-key") apiKey?: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("No se recibió ninguna imagen");
    }
    return this.escaneos.escanearINE(file.buffer, this.validarApiKey(apiKey));
  }

  @Post("nominas")
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenBucketGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "nomina1", maxCount: 1 },
        { name: "nomina2", maxCount: 1 },
      ],
      imageMulterOptions,
    ),
  )
  escanearNominas(
    @UploadedFiles()
      files?: { nomina1?: Express.Multer.File[]; nomina2?: Express.Multer.File[] },
    @Headers("x-gemini-api-key") apiKey?: string,
  ) {
    const nomina1 = files?.nomina1?.[0];
    const nomina2 = files?.nomina2?.[0];
    if (!nomina1?.buffer?.length || !nomina2?.buffer?.length) {
      throw new BadRequestException("Se requieren nomina1 y nomina2");
    }
    return this.escaneos.escanearNomina(nomina1.buffer, nomina2.buffer, this.validarApiKey(apiKey));
  }

  @Post("estados-cuenta")
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenBucketGuard)
  @UseInterceptors(FileInterceptor("estadoCuenta", imageMulterOptions))
  escanearEstadoCuenta(@UploadedFile() file?: Express.Multer.File, @Headers("x-gemini-api-key") apiKey?: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("No se recibió ninguna imagen");
    }
    return this.escaneos.escanearEstadoCuenta(file.buffer, this.validarApiKey(apiKey));
  }

  @Post("escaneos/unificado")
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenBucketGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "ine", maxCount: 1 },
        { name: "nomina1", maxCount: 1 },
        { name: "nomina2", maxCount: 1 },
        { name: "estadoCuenta", maxCount: 1 },
      ],
      imageMulterOptions,
    ),
  )
  escanearUnificado(
    @UploadedFiles()
      files?: {
        ine?: Express.Multer.File[];
        nomina1?: Express.Multer.File[];
        nomina2?: Express.Multer.File[];
        estadoCuenta?: Express.Multer.File[];
      },
    @Headers("x-gemini-api-key") apiKey?: string,
  ) {
    const ine = files?.ine?.[0]?.buffer;
    const nomina1 = files?.nomina1?.[0]?.buffer;
    const nomina2 = files?.nomina2?.[0]?.buffer;
    const estadoCuenta = files?.estadoCuenta?.[0]?.buffer;

    if (!ine && !nomina1 && !estadoCuenta) {
      throw new BadRequestException("Se requiere al menos un documento para escanear");
    }

    return this.escaneos.escanearUnificado(
      { ine, nomina1, nomina2, estadoCuenta },
      this.validarApiKey(apiKey),
    );
  }

  private validarApiKey(apiKey?: string): string {
    if (apiKey?.trim() && apiKey.trim().length >= 20) {
      return apiKey.trim();
    }
    if (config.GEMINI_API_KEY?.trim() && config.GEMINI_API_KEY.trim().length >= 20) {
      return config.GEMINI_API_KEY.trim();
    }
    if (config.DEMO_MODE) {
      return "DEMO_KEY";
    }
    throw new BadRequestException("Se requiere una API key propia de Gemini para usar el escaneo");
  }
}
