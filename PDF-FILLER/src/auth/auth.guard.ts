import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { AuthTokenPayload } from "./auth.types";
import { config } from "../config";

type AuthenticatedRequest = Request & { user?: AuthTokenPayload };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic || context.switchToHttp().getRequest<Request>().method === "OPTIONS") {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      if (config.DEMO_MODE) {
        request.user = {
          sub: 1,
          email: "demo@test.com",
          role: "admin",
          codigoEmpleado: "ADM001",
        };
        return true;
      }
      throw new UnauthorizedException("Se requiere autenticación");
    }

    try {
      request.user = this.auth.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }
}
