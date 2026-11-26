interface DatosExtra {
  // Identificación
  rfc?: string;

  // Contacto
  telefonoCelular: string;
  telefonoCasa?: string;
  mail: string;

  // Económico
  dependientesEconomicos: number;
  ingresoMensual?: string;

  // Empleo
  fechaIngreso: string;
  mesesAntiguedad?: string;
  añosAntiguedad?: string;

  // Referencias
  referencia1?: string;
  referencia2?: string;
  referencia3?: string;
  telefonoReferencia1?: string;
  telefonoReferencia2?: string;
  telefonoReferencia3?: string;

  // Contrato
  lugarFecha?: string;
  fechaContrato: string;
  mesDescuento?: string;
  añoDescuento?: string;
  vendedor?: string;
  fechaArranque?: string;
  sucursal?: string;
  numVendedor?: string;
  urlFirmaSvg?: string;
  estadoCivil?: string;

  propiedad?: "PROPIA" | "RENTADA" | "FAMILIAR";
  entreCalles?: string;
}

export { DatosExtra };
