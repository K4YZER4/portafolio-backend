import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { EscaneosModule } from "./escaneos/escaneos.module";
import { RequestIdMiddleware } from "./common/http/request-id.middleware";
import { TablasModule } from "./tablas/tablas.module";
import { ContratosModule } from "./contratos/contratos.module";
import { AsesoresModule } from "./asesores/asesores.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    EscaneosModule,
    TablasModule,
    ContratosModule,
    AsesoresModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes({ path: "*path", method: RequestMethod.ALL });
  }
}
