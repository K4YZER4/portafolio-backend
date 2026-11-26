import prisma from "../prisma/prisma";

export interface AsesorListado {
  id: number;
  codigoEmpleado: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  folio: string;
  sucursal: string | null;
}

export async function listarAsesores(): Promise<AsesorListado[]> {
  const usuarios = await prisma.usuario.findMany({
    where: {
      activo: true,
      rol: { descripcion: "ASESOR" },
    },
    include: { sucursal: true },
    orderBy: { nombre: "asc" },
  });

  return usuarios.map((u) => ({
    id: u.id,
    codigoEmpleado: u.codigo_empleado,
    nombre: u.nombre,
    apellidoPaterno: u.apellido_paterno,
    apellidoMaterno: u.apellido_materno,
    folio: String(u.id).padStart(5, "0"),
    sucursal: u.sucursal?.nombre ?? null,
  }));
}
