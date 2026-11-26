import { rellenarCamposPDF } from "./rellenarPdf.utils";
import { cargarTablas } from "./tablaCargar.utils";
import { validarCURP } from "./validarCurp.utils";
import { fechaMesConLetra } from "./fechaMesLetra.utils";
import { numeroALetrasPesos, numeroALetras } from "./numeroLetras.utils";
import { numQuincena } from "./numQuincena.utils";
import { formatearCadaTresCaracteres } from "./guionEntre3Digitos.utils";
import { formatearClabe } from "./formatearParaClabe.utils";
import { withErrorHandling } from "./errorHandling.utils";
import { calcularAniosResidencia } from "./calcularAnios";
import { anonimizarContratoParaDemo } from "./anonimizarDemo.utils";

export {
  rellenarCamposPDF,
  cargarTablas,
  validarCURP,
  fechaMesConLetra,
  numeroALetrasPesos,
  numeroALetras,
  numQuincena,
  formatearCadaTresCaracteres,
  formatearClabe,
  withErrorHandling,
  calcularAniosResidencia,
  anonimizarContratoParaDemo,
};
