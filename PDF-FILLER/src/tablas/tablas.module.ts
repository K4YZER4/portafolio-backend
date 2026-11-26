import { Module } from "@nestjs/common";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { TablasController } from "./tablas.controller";
import { TablasService } from "./tablas.service";

@Module({
  controllers: [TablasController],
  providers: [TablasService, TokenBucketGuard],
  exports: [TablasService],
})
export class TablasModule {}
