export interface AuthUser {
  id: number;
  email: string;
  role: "asesor" | "mesa" | "admin";
  name: string;
  codigoEmpleado: string;
  sucursal: string;
  profile: {
    folio: string;
    sucursal: string;
    numVendedor: string;
    asesor: string;
  } | null;
}

export interface AuthTokenPayload {
  sub: number;
  email: string;
  role: "asesor" | "mesa" | "admin";
  codigoEmpleado: string;
}
