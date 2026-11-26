import { Injectable, UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import prisma from "../prisma/prisma";
import { config } from "../config";
import { AuthTokenPayload, AuthUser } from "./auth.types";

interface LoginInput {
  email?: unknown;
  password?: unknown;
}

const DEMO_USERS: Record<string, AuthUser> = {
  admin: {
    id: 1,
    email: "admin@test.com",
    role: "admin",
    name: "ADMIN DEMO",
    codigoEmpleado: "ADM001",
    sucursal: "GUASAVE SINALOA",
    profile: null,
  },
  mesa: {
    id: 2,
    email: "mesa@test.com",
    role: "mesa",
    name: "MESA CONTROL",
    codigoEmpleado: "MESA01",
    sucursal: "GUASAVE SINALOA",
    profile: null,
  },
  juanp: {
    id: 3,
    email: "juan@test.com",
    role: "asesor",
    name: "JUAN PÉREZ",
    codigoEmpleado: "ASE002",
    sucursal: "GUASAVE SINALOA",
    profile: {
      folio: "00002",
      sucursal: "GUASAVE SINALOA",
      numVendedor: "ASE002",
      asesor: "JUAN PÉREZ",
    },
  },
};

@Injectable()
export class AuthService {
  async login(input: LoginInput): Promise<{ token: string; user: AuthUser }> {
    if (typeof input.email !== "string" || typeof input.password !== "string") {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const emailTrimmed = input.email.trim();
    const isDemoPassword = config.DEMO_MODE && input.password === "Demo1234!";

    let usuario: any = null;
    try {
      usuario = await prisma.usuario.findFirst({
        where: {
          OR: [
            { correo: emailTrimmed.toLowerCase() },
            { usuario: emailTrimmed },
          ],
        },
        include: {
          rol: true,
          sucursal: true,
        },
      });
    } catch (err) {
      if (!config.DEMO_MODE) {
        throw err;
      }
    }

    if (usuario) {
      const isPasswordValid =
        bcrypt.compareSync(input.password, usuario.hash_password) || isDemoPassword;

      if (!usuario.activo || !isPasswordValid) {
        throw new UnauthorizedException("Credenciales inválidas");
      }

      try {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { ultimo_acceso: new Date() },
        });
      } catch {
        // Ignorar si falla la actualización de último acceso
      }

      const role = this.mapRole(usuario.rol?.descripcion ?? "asesor");
      const sucursal = usuario.sucursal?.nombre ?? "";
      const user: AuthUser = {
        id: usuario.id,
        email: usuario.correo,
        role,
        name: `${usuario.nombre} ${usuario.apellido_paterno}`.trim(),
        codigoEmpleado: usuario.codigo_empleado,
        sucursal,
        profile:
          role === "asesor"
            ? {
                folio: usuario.codigo_empleado.replace(/^ASE/i, "").padStart(5, "0"),
                sucursal,
                numVendedor: usuario.codigo_empleado,
                asesor: `${usuario.nombre} ${usuario.apellido_paterno}`.trim(),
              }
            : null,
      };

      const payload: AuthTokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        codigoEmpleado: user.codigoEmpleado,
      };

      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
      });

      return { token, user };
    }

    if (config.DEMO_MODE && isDemoPassword) {
      const normalizedKey = emailTrimmed.toLowerCase();
      const demoKey =
        normalizedKey.includes("admin") ? "admin"
        : normalizedKey.includes("mesa") ? "mesa"
        : (normalizedKey.includes("juan") || normalizedKey.includes("asesor")) ? "juanp"
        : null;

      if (demoKey && DEMO_USERS[demoKey]) {
        const user = DEMO_USERS[demoKey];
        const payload: AuthTokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          codigoEmpleado: user.codigoEmpleado,
        };
        const token = jwt.sign(payload, config.JWT_SECRET, {
          expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
        });
        return { token, user };
      }
    }

    throw new UnauthorizedException("Credenciales inválidas");
  }

  verify(token: string): AuthTokenPayload {
    const payload = jwt.verify(token, config.JWT_SECRET);
    if (
      typeof payload === "string" ||
      typeof payload.sub !== "number" ||
      typeof payload.email !== "string" ||
      !["asesor", "mesa", "admin"].includes(String(payload.role)) ||
      typeof payload.codigoEmpleado !== "string"
    ) {
      throw new UnauthorizedException("Token inválido");
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role as AuthTokenPayload["role"],
      codigoEmpleado: payload.codigoEmpleado,
    };
  }

  private mapRole(description: string): "asesor" | "mesa" | "admin" {
    const normalized = description.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (normalized === "ADMIN") {
      return "admin";
    }
    if (normalized === "SUPERVISOR" || normalized === "MESA DE CONTROL") {
      return "mesa";
    }
    return "asesor";
  }
}
