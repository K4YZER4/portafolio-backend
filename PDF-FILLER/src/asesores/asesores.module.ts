import { Module } from "@nestjs/common";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { AsesoresController } from "./asesores.controller";
import { AsesoresService } from "./asesores.service";

@Module({
  controllers: [AsesoresController],
  providers: [AsesoresService, TokenBucketGuard],
})
export class AsesoresModule {}
