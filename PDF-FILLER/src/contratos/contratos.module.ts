import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { ContratosController } from "./contratos.controller";
import { PdfsController } from "./pdfs.controller";
import { FirmaController } from "./firma.controller";
import { ContratosService } from "./contratos.service";
import { FirmaService } from "./firma.service";
import { FolioService } from "./folio.service";
import { ContratosHistorialService } from "./historial.service";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PdfsController, ContratosController, FirmaController],
  providers: [
    ContratosService,
    FirmaService,
    ContratosHistorialService,
    FolioService,
    TokenBucketGuard,
  ],
})
export class ContratosModule {}
