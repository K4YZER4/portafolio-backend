import prisma from "../prisma/prisma";
import { ContratoData } from "../types";
import { BadRequestError } from "../errors";
import { normalizarDescripcionCatalogo } from "../utils/catalogos.utils";

function parseDateOrThrow(dateStr: string | undefined, fieldName: string): Date {
  if (!dateStr) throw new BadRequestError(`${fieldName} es requerido`);
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new BadRequestError(`${fieldName} no es una fecha válida`);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function calcularAniosResidencia(fechaIngreso: string): number {
  if (!fechaIngreso) return 0;
  const inicio = new Date(fechaIngreso);
  const hoy = new Date();
  let años = hoy.getFullYear() - inicio.getFullYear();
  const mes = hoy.getMonth() - inicio.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < inicio.getDate())) {
    años--;
  }
  return Math.max(años, 0);
}

export async function actualizarContrato(
  contrato: ContratoData,
  options: { folio: string; pdfUrl: string },
): Promise<void> {
  const { ine, tabla, extra, estadoCuenta, nomina } = contrato;
  const { folio, pdfUrl } = options;

  if (!extra.telefonoCelular) throw new BadRequestError("extra.telefonoCelular es requerido");
  if (!extra.mail) throw new BadRequestError("extra.mail es requerido");
  if (!extra.fechaIngreso) throw new BadRequestError("extra.fechaIngreso es requerido");
  if (!extra.fechaContrato) throw new BadRequestError("extra.fechaContrato es requerido");

  await prisma.$transaction(async (tx) => {
    const estadoPorFirmar = await tx.estadoContrato.findFirstOrThrow({
      where: { descripcion: "POR FIRMAR" },
    });

    if (ine.sexo !== "F" && ine.sexo !== "M") {
      throw new BadRequestError(`Sexo inválido: "${ine.sexo}". Debe ser F o M`);
    }
    const genero = await tx.genero.findFirstOrThrow({
      where: { descripcion: ine.sexo === "F" ? "FEMENINO" : "MASCULINO" },
    });

    const estadoCivil = await tx.estadoCivil.findFirstOrThrow({
      where: { descripcion: normalizarDescripcionCatalogo(extra.estadoCivil) || "SOLTERO" },
    });

    const tipoVivienda = await tx.tipoVivienda.findFirstOrThrow({
      where: { descripcion: normalizarDescripcionCatalogo(extra.propiedad) || "PROPIA" },
    });

    const pais = await tx.pais.findFirstOrThrow({
      where: { codigo_iso3: "MEX" },
    });

    const entidadFederativa = await tx.entidadFederativa.findFirstOrThrow({
      where: { nombre: ine.domicilio.estado },
    });

    let municipio = await tx.municipio.findFirst({
      where: { nombre: ine.domicilio.municipio, id_entidad_federativa: entidadFederativa.id },
    });
    if (!municipio) {
      municipio = await tx.municipio.create({
        data: { nombre: ine.domicilio.municipio, id_entidad_federativa: entidadFederativa.id },
      });
    }

    let colonia = await tx.colonia.findFirst({
      where: {
        nombre: ine.domicilio.colonia,
        codigo_postal: ine.domicilio.codigoPostal,
        id_municipio: municipio.id,
      },
    });
    if (!colonia) {
      colonia = await tx.colonia.create({
        data: {
          nombre: ine.domicilio.colonia,
          codigo_postal: ine.domicilio.codigoPostal,
          id_municipio: municipio.id,
        },
      });
    }

    let dependencia = await tx.dependencia.findFirst({
      where: { descripcion: nomina.dependencia },
    });
    if (!dependencia) {
      dependencia = await tx.dependencia.create({
        data: { id_entidad_federativa: entidadFederativa.id, descripcion: nomina.dependencia },
      });
    }

    let banco = await tx.banco.findFirst({
      where: { nombre: estadoCuenta.banco },
    });
    if (!banco) {
      banco = await tx.banco.create({
        data: { nombre: estadoCuenta.banco },
      });
    }

    if (!extra.numVendedor) {
      throw new BadRequestError("extra.numVendedor es requerido");
    }
    const asesor = await tx.usuario.findFirst({
      where: { codigo_empleado: extra.numVendedor },
    });
    if (!asesor) {
      throw new BadRequestError(`Asesor con código "${extra.numVendedor}" no encontrado`);
    }

    let producto = await tx.productoCredito.findFirst({
      where: { plazo_quincenas: tabla.plazoQuincenas, activo: true },
    });
    if (!producto) {
      producto = await tx.productoCredito.create({
        data: {
          plazo_meses: tabla.plazoMeses,
          plazo_quincenas: tabla.plazoQuincenas,
          tasa_mensual: tabla.tasaMensual,
          tasa_anual: tabla.tasaMensual * 12,
          cat: tabla.cat,
          tipo_saldo: "ORDINARIO",
          iva_tasa: 3,
        },
      });
    }

    let tablaDescuento = await tx.tablaDescuento.findFirst({
      where: { id_producto: producto.id, monto_neto_prestar: tabla.montoNeto },
    });
    if (!tablaDescuento) {
      tablaDescuento = await tx.tablaDescuento.create({
        data: {
          id_producto: producto.id,
          monto_neto_prestar: tabla.montoNeto,
          monto_pagare: tabla.montoPagare,
          importe_descuento: tabla.descuentoQuincenal,
          importe_interes: tabla.importeInteres,
          importe_iva_interes: tabla.importeIvaInteres ?? (tabla.importeInteres * 3) / 100,
        },
      });
    }

    const aniosResidencia = calcularAniosResidencia(extra.fechaIngreso);

    // ── Upsert Cliente ──────────────────────────────
    const cliente = await tx.cliente.upsert({
      where: { curp: ine.curp },
      update: {
        nombre: ine.nombre1.toUpperCase(),
        segundo_nombre: ine.nombre2.toUpperCase(),
        apellido_paterno: ine.apellidoPaterno.toUpperCase(),
        apellido_materno: ine.apellidoMaterno.toUpperCase(),
        rfc: estadoCuenta.rfc ?? nomina.rfc ?? "",
        fecha_nacimiento: parseDateOrThrow(ine.fechaNac, "ine.fechaNac"),
        id_genero: genero.id,
        id_estado_civil: estadoCivil.id,
        id_estado_nacimiento: entidadFederativa.id,
        id_pais_nacionalidad: pais.id,
        telefono_celular: extra.telefonoCelular,
        telefono_fijo: extra.telefonoCasa ?? null,
        email_personal: extra.mail,
        id_tipo_vivienda: tipoVivienda.id,
        anios_residencia: aniosResidencia,
        dependientes_economicos: extra.dependientesEconomicos,
        clave_elector: ine.claveElector ?? null,
        url_firma_svg: null,
      },
      create: {
        nombre: ine.nombre1.toUpperCase(),
        segundo_nombre: ine.nombre2.toUpperCase(),
        apellido_paterno: ine.apellidoPaterno.toUpperCase(),
        apellido_materno: ine.apellidoMaterno.toUpperCase(),
        curp: ine.curp,
        rfc: estadoCuenta.rfc ?? nomina.rfc ?? "",
        fecha_nacimiento: parseDateOrThrow(ine.fechaNac, "ine.fechaNac"),
        id_genero: genero.id,
        id_estado_civil: estadoCivil.id,
        id_estado_nacimiento: entidadFederativa.id,
        id_pais_nacionalidad: pais.id,
        telefono_celular: extra.telefonoCelular,
        telefono_fijo: extra.telefonoCasa ?? null,
        email_personal: extra.mail,
        id_tipo_vivienda: tipoVivienda.id,
        anios_residencia: aniosResidencia,
        dependientes_economicos: extra.dependientesEconomicos,
        clave_elector: ine.claveElector ?? null,
      },
    });

    // ── Eliminar y recrear DireccionCliente ─────────
    await tx.direccionCliente.deleteMany({ where: { id_cliente: cliente.id } });
    await tx.direccionCliente.create({
      data: {
        id_cliente: cliente.id,
        calle: ine.domicilio.calle.toUpperCase(),
        entre_calles: (extra.entreCalles ?? "").toUpperCase(),
        numero_exterior: ine.domicilio.numeroCasa,
        numero_interior: ine.domicilio.numeroInterior?.toUpperCase() ?? null,
        id_colonia: colonia.id,
      },
    });

    // ── Eliminar y recrear EmpleoCliente ────────────
    await tx.empleoCliente.deleteMany({ where: { id_cliente: cliente.id } });
    await tx.empleoCliente.create({
      data: {
        id_cliente: cliente.id,
        id_dependencia_empleo: dependencia.id,
        nombre_empresa: nomina.dependencia.toUpperCase(),
        numero_empleado: nomina.noEmpleado,
        area: nomina.departamento?.toUpperCase() ?? "",
        puesto: nomina.puesto?.toUpperCase() ?? "",
        ingreso_mensual: nomina.ingresoMensual,
        telefono_empresarial:
          nomina.telefonoEmpresarial && nomina.telefonoEmpresarial.trim().length === 10
            ? nomina.telefonoEmpresarial.trim()
            : extra.telefonoCelular || "0000000000",
        email_laboral: nomina.emailLaboral,
        fecha_inicio: new Date(extra.fechaIngreso),
      },
    });

    // ── Eliminar y recrear InformacionBancaria ──────
    await tx.informacionBancariaCliente.deleteMany({ where: { id_cliente: cliente.id } });
    await tx.informacionBancariaCliente.create({
      data: {
        id_cliente: cliente.id,
        id_banco: banco.id,
        numero_cuenta: estadoCuenta.numeroCuenta,
        clabe: estadoCuenta.clabe,
        nombre_titular: estadoCuenta.nombreTitular?.toUpperCase() ?? "",
        transferencia_electronica: true,
      },
    });

    // ── Eliminar y recrear Referencias ─────────────
    await tx.referenciasPersonales.deleteMany({ where: { id_cliente: cliente.id } });
    const refs = [
      { nombre: extra.referencia1, tel: extra.telefonoReferencia1 },
      { nombre: extra.referencia2, tel: extra.telefonoReferencia2 },
      { nombre: extra.referencia3, tel: extra.telefonoReferencia3 },
    ];
    for (const ref of refs) {
      if (ref.nombre && ref.tel) {
        const parts = ref.nombre.trim().split(/\s+/);
        await tx.referenciasPersonales.create({
          data: {
            id_cliente: cliente.id,
            nombre: parts[0] ?? "",
            apellido_paterno: parts[1] ?? "",
            apellido_materno: parts.slice(2).join(" "),
            telefono: ref.tel,
          },
        });
      }
    }

    // ── Actualizar ContratoPrestamo ──────────────────
    const fechaFirma = parseDateOrThrow(extra.fechaContrato, "extra.fechaContrato");
    const fechaInicioPagos = parseDateOrThrow(extra.fechaArranque, "extra.fechaArranque");

    const ultimaFechaPago = new Date(fechaInicioPagos);
    if (tabla.plazoQuincenas > 0) {
      const diasSumar = (tabla.plazoQuincenas - 1) * 15;
      ultimaFechaPago.setUTCDate(ultimaFechaPago.getUTCDate() + diasSumar);
    }
    const fechaLimitePagoStr = ultimaFechaPago.toISOString().split("T")[0];

    await tx.contratoPrestamo.update({
      where: { folio },
      data: {
        id_cliente: cliente.id,
        id_producto: producto.id,
        id_estado_contrato: estadoPorFirmar.id,
        id_tabla_descuento: tablaDescuento.id,
        id_asesor: asesor.id,
        id_municipio_firma: municipio.id,
        fecha_firma: fechaFirma,
        perfil_transaccional: "ESTANDAR",
        importe_credito: tabla.montoNeto,
        importe_total_credito: tabla.montoPagare,
        tasa_mensual: tabla.tasaMensual,
        comision_disposicion: 0,
        importe_pago_quincenal: tabla.descuentoQuincenal,
        fecha_limite_pago: fechaLimitePagoStr,
        fecha_corte: fechaLimitePagoStr,
        frecuencia_pago: "QUINCENAL",
        fecha_inicio_pagos: fechaInicioPagos,
        estado_cuenta_domicilio: true,
        url_pdf_cloud: pdfUrl,
        url_firma_cloud: null,
        url_pdf_firmado_cloud: null,
      },
    });
  });
}
