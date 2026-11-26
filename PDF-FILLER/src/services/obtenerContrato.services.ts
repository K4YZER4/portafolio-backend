import prisma from "../prisma/prisma";
import { NotFoundError } from "../errors";

const MESES_ES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

function formatearFecha(fecha: Date): string {
  return fecha.toISOString().split("T")[0];
}

function calcularAntiguedad(fechaInicio: Date): { meses: string; anos: string } {
  const hoy = new Date();
  let meses = (hoy.getFullYear() - fechaInicio.getFullYear()) * 12
    + (hoy.getMonth() - fechaInicio.getMonth());
  if (hoy.getDate() < fechaInicio.getDate()) {
    meses--;
  }
  return {
    meses: String(Math.max(0, meses % 12)),
    anos: String(Math.max(0, Math.floor(meses / 12))),
  };
}

export interface ContratoEditResponse {
  ine: {
    nombre1: string;
    nombre2: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    sexo: "F" | "M";
    fechaNac: string;
    curp: string;
    claveElector: string;
    domicilio: {
      calle: string;
      numeroCasa: string;
      numeroInterior: string;
      colonia: string;
      codigoPostal: string;
      municipio: string;
      estado: string;
    };
  };
  nomina: {
    noEmpleado: string;
    rfc: string;
    puesto: string;
    departamento: string;
    dependencia: string;
    ingresoMensual: number;
    telefonoEmpresarial: string;
    emailLaboral: string;
  };
  estadoCuenta: {
    nombreTitular: string;
    rfc: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
  };
  tabla: {
    montoNeto: number;
    montoPagare: number;
    descuentoQuincenal: number;
    plazoMeses: number;
    plazoQuincenas: number;
    tasaMensual: number;
    importeInteres: number;
    importeIvaInteres: number;
    cat: number;
  };
  extra: {
    telefonoCelular: string;
    telefonoCasa?: string;
    mail: string;
    dependientesEconomicos: number;
    fechaIngreso: string;
    mesesAntiguedad?: string;
    añosAntiguedad?: string;
    referencia1?: string;
    referencia2?: string;
    referencia3?: string;
    telefonoReferencia1?: string;
    telefonoReferencia2?: string;
    telefonoReferencia3?: string;
    lugarFecha?: string;
    fechaContrato: string;
    mesDescuento?: string;
    añoDescuento?: string;
    vendedor?: string;
    fechaArranque?: string;
    sucursal?: string;
    numVendedor?: string;
    asesorFolio?: string;
    estadoCivil?: string;
    propiedad?: string;
    entreCalles?: string;
  };
  capitalMonto: number;
  plazoQnas: number;
  folio: string;
}

export async function obtenerContrato(folio: string): Promise<ContratoEditResponse> {
  const contrato = await prisma.contratoPrestamo.findUnique({
    where: { folio },
    include: {
      cliente: {
        include: {
          genero: true,
          estado_civil: true,
          tipo_vivienda: true,
          empleos: true,
          direcciones: {
            include: {
              colonia: {
                include: {
                  municipio: {
                    include: { entidad_federativa: true },
                  },
                },
              },
            },
          },
          informacion_bancaria: { include: { banco: true } },
          referencias_personales: true,
        },
      },
      producto: true,
      tabla_descuento: true,
      asesor: { include: { sucursal: true } },
      municipio_firma: { include: { entidad_federativa: true } },
    },
  });

  if (!contrato) {
    throw new NotFoundError(`Contrato con folio "${folio}" no encontrado`);
  }

  const c = contrato.cliente;
  const dir = c.direcciones[0];
  const emp = c.empleos[0];
  const bancInfo = c.informacion_bancaria[0];
  const refs = c.referencias_personales;

  const montoNeto = Number(contrato.importe_credito);
  const montoPagare = Number(contrato.importe_total_credito);
  const descQuincenal = Number(contrato.importe_pago_quincenal);
  const tasaMensual = Number(contrato.tasa_mensual);
  const plazoQnas = contrato.producto.plazo_quincenas;

  const muni = contrato.municipio_firma;
  const lugarFecha = muni
    ? `${muni.nombre.toUpperCase()}, ${muni.entidad_federativa.nombre.toUpperCase()}`
    : "";

  const fechaInicioPagos = contrato.fecha_inicio_pagos;
  const mesDescuento = MESES_ES[fechaInicioPagos.getMonth()];
  const anioDescuento = String(fechaInicioPagos.getFullYear());

  const antiguedad = emp?.fecha_inicio
    ? calcularAntiguedad(emp.fecha_inicio)
    : { meses: "", anos: "" };

  const asesorFolio = String(contrato.asesor.id).padStart(5, "0");

  return {
    ine: {
      nombre1: c.nombre,
      nombre2: c.segundo_nombre,
      apellidoPaterno: c.apellido_paterno,
      apellidoMaterno: c.apellido_materno,
      sexo: c.genero.descripcion === "FEMENINO" ? "F" : "M",
      fechaNac: formatearFecha(c.fecha_nacimiento),
      curp: c.curp,
      claveElector: c.clave_elector ?? "",
      domicilio: {
        calle: dir?.calle ?? "",
        numeroCasa: dir?.numero_exterior ?? "",
        numeroInterior: dir?.numero_interior ?? "",
        colonia: dir?.colonia.nombre ?? "",
        codigoPostal: dir?.colonia.codigo_postal ?? "",
        municipio: dir?.colonia.municipio.nombre ?? "",
        estado: dir?.colonia.municipio.entidad_federativa.nombre ?? "",
      },
    },
    nomina: {
      noEmpleado: emp?.numero_empleado ?? "",
      rfc: c.rfc ?? "",
      puesto: emp?.puesto ?? "",
      departamento: emp?.area ?? "",
      dependencia: emp?.nombre_empresa ?? "",
      ingresoMensual: emp ? Number(emp.ingreso_mensual) : 0,
      telefonoEmpresarial: emp?.telefono_empresarial ?? "",
      emailLaboral: emp?.email_laboral ?? "",
    },
    estadoCuenta: {
      nombreTitular: bancInfo?.nombre_titular ?? c.nombre,
      rfc: c.rfc ?? "",
      banco: bancInfo?.banco.nombre ?? "",
      numeroCuenta: bancInfo?.numero_cuenta ?? "",
      clabe: bancInfo?.clabe ?? "",
    },
    tabla: {
      montoNeto,
      montoPagare,
      descuentoQuincenal: descQuincenal,
      plazoMeses: contrato.producto.plazo_meses,
      plazoQuincenas: plazoQnas,
      tasaMensual,
      importeInteres: montoPagare - montoNeto,
      importeIvaInteres: Number(contrato.tabla_descuento?.importe_iva_interes ?? 0),
      cat: Number(contrato.producto.cat),
    },
    extra: {
      telefonoCelular: c.telefono_celular,
      telefonoCasa: c.telefono_fijo ?? undefined,
      mail: c.email_personal,
      dependientesEconomicos: c.dependientes_economicos,
      fechaIngreso: emp ? formatearFecha(emp.fecha_inicio) : "",
      mesesAntiguedad: antiguedad.meses || undefined,
      añosAntiguedad: antiguedad.anos || undefined,
      referencia1: refs[0]?.nombre
        ? `${refs[0].nombre} ${refs[0].apellido_paterno} ${refs[0].apellido_materno}`.trim()
        : undefined,
      telefonoReferencia1: refs[0]?.telefono ?? undefined,
      referencia2: refs[1]?.nombre
        ? `${refs[1].nombre} ${refs[1].apellido_paterno} ${refs[1].apellido_materno}`.trim()
        : undefined,
      telefonoReferencia2: refs[1]?.telefono ?? undefined,
      referencia3: refs[2]?.nombre
        ? `${refs[2].nombre} ${refs[2].apellido_paterno} ${refs[2].apellido_materno}`.trim()
        : undefined,
      telefonoReferencia3: refs[2]?.telefono ?? undefined,
      lugarFecha: lugarFecha || undefined,
      fechaContrato: contrato.fecha_firma
        ? formatearFecha(contrato.fecha_firma)
        : "",
      mesDescuento: mesDescuento,
      añoDescuento: anioDescuento,
      vendedor: contrato.asesor?.nombre ?? undefined,
      fechaArranque: formatearFecha(fechaInicioPagos),
      sucursal: contrato.asesor?.sucursal?.nombre ?? "SIN SUCURSAL",
      numVendedor: contrato.asesor?.codigo_empleado ?? undefined,
      asesorFolio: asesorFolio,
      estadoCivil: c.estado_civil.descripcion,
      propiedad: c.tipo_vivienda.descripcion ?? undefined,
      entreCalles: dir?.entre_calles ?? undefined,
    },
    capitalMonto: montoNeto,
    plazoQnas,
    folio: contrato.folio,
  };
}
