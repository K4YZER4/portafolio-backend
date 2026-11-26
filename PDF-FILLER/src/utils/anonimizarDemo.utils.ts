import { ContratoData } from "../types";

/**
 * Anonimiza los datos de un contrato para proteger la privacidad de los visitantes
 * en entornos de demostración pública. Ningún dato personal real se almacena en la
 * base de datos ni se estampa en el PDF resultante.
 */
export function anonimizarContratoParaDemo(contrato: ContratoData): ContratoData {
  return {
    ...contrato,
    ine: {
      ...contrato.ine,
      nombre1: "DEMO",
      nombre2: "",
      apellidoPaterno: "USUARIO",
      apellidoMaterno: "PRUEBA",
      curp: "DEMO010101HDMNNN00",
      claveElector: "DEMO111111111111",
      domicilio: {
        calle: "AVENIDA DEMO",
        numeroCasa: "123",
        numeroInterior: undefined,
        colonia: "COL. DEMO",
        codigoPostal: "80000",
        municipio: "CULIACAN",
        estado: "SINALOA",
      },
    },
    nomina: {
      ...contrato.nomina,
      rfc: "XAXX010101000",
      noEmpleado: "EMP-DEMO-01",
      emailLaboral: "demo.laboral@ejemplo.com",
      telefonoEmpresarial: "1111111111",
      dependencia: contrato.nomina.dependencia || "EDUCACION PUBLICA",
      departamento: contrato.nomina.departamento || "ADMINISTRACION",
      puesto: contrato.nomina.puesto || "ANALISTA DEMO",
    },
    estadoCuenta: {
      ...contrato.estadoCuenta,
      rfc: "XAXX010101000",
      nombreTitular: "DEMO USUARIO PRUEBA",
      numeroCuenta: "0000000000",
      clabe: "012180000000000000",
      banco: contrato.estadoCuenta.banco || "BBVA MEXICO",
    },
    extra: {
      ...contrato.extra,
      telefonoCelular: "1111111111",
      telefonoCasa: "1111111111",
      mail: "demo@ejemplo.com",
      lugarFecha: "CULIACAN, SINALOA",
      entreCalles: "ENTRE CALLE DEMO 1 Y CALLE DEMO 2",
      referencia1: "REFERENCIA DEMO 1",
      referencia2: "REFERENCIA DEMO 2",
      referencia3: "REFERENCIA DEMO 3",
      telefonoReferencia1: "1111111111",
      telefonoReferencia2: "1111111111",
      telefonoReferencia3: "1111111111",
    },
  };
}
