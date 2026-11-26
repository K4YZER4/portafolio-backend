import { Injectable } from "@nestjs/common";
import {
  eliminarImagenCloud,
  getImageBuffer as fetchImageBuffer,
  getPdfBuffer,
  uploadFirmaImage,
  uploadPDF,
} from "../services/cloudUpload.service";

@Injectable()
export class StorageService {
  uploadContractPdf(buffer: Buffer, folio: string): Promise<string> {
    return uploadPDF(buffer, folio);
  }

  uploadSignatureImage(buffer: Buffer, folio: string): Promise<string> {
    return uploadFirmaImage(buffer, folio);
  }

  removeContractPdf(url: string): Promise<void> {
    return eliminarImagenCloud(url, "contratos");
  }

  getContractPdfBuffer(folio: string, firmado = false, cloudUrl?: string): Promise<Buffer> {
    return getPdfBuffer(folio, firmado, cloudUrl);
  }

  getImageBuffer(url: string): Promise<Buffer> {
    return fetchImageBuffer(url);
  }
}
