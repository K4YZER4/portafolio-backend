import { escanearINE } from "./escanearINE.services";
import { escanearNominaServices } from "./escanearNomina.services";
import { extraerDatosEstadoCuentaServices } from "./escanearEstadoCuenta.services";
import { filtrarTablaServices } from "./montoQuincena.services";
import { generarContrato } from "./rellenarPdf.services";
import { guardarContrato } from "./guardarContrato.services";
import { actualizarContrato } from "./actualizarContrato.services";
import { obtenerContrato } from "./obtenerContrato.services";
import { uploadFirmaImage, uploadPDF, eliminarImagenCloud, getImageBuffer } from "./cloudUpload.service";
import { generarToken, validarToken, marcarUsado, renovarToken } from "./tokenFirma.service";

export {
  escanearINE,
  escanearNominaServices,
  extraerDatosEstadoCuentaServices,
  filtrarTablaServices,
  generarContrato,
  guardarContrato,
  actualizarContrato,
  obtenerContrato,
  uploadFirmaImage,
  uploadPDF,
  eliminarImagenCloud,
  getImageBuffer,
  generarToken,
  validarToken,
  marcarUsado,
  renovarToken,
};
