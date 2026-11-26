import { Module } from "@nestjs/common";
import { GeminiModule } from "../gemini/gemini.module";
import { TokenBucketGuard } from "../common/rate-limit/token-bucket.guard";
import { EscaneosController } from "./escaneos.controller";
import { EscaneosService } from "./escaneos.service";

@Module({
  imports: [GeminiModule],
  controllers: [EscaneosController],
  providers: [EscaneosService, TokenBucketGuard],
  exports: [EscaneosService],
})
export class EscaneosModule {}
