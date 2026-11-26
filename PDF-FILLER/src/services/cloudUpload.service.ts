import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import axios from "axios";
import { ExternalServiceError } from "../errors";
import { logger } from "../logger/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadStream(
  buffer: Buffer,
  options: {
    folder: string;
    public_id: string;
    resource_type: "image" | "raw" | "auto";
    format?: string;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...options,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new ExternalServiceError(
              `Error al subir a Cloudinary: ${error?.message ?? "Unknown error"}`
            )
          );
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.on("error", (err) => {
      reject(new ExternalServiceError(`Error en stream de Cloudinary: ${err.message}`));
    });

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export async function uploadFirmaImage(
  buffer: Buffer,
  folio: string
): Promise<string> {
  return uploadStream(buffer, {
    folder: "firmas",
    public_id: folio,
    resource_type: "image",
    format: "png",
  });
}

export async function uploadPDF(
  buffer: Buffer,
  folio: string
): Promise<string> {
  return uploadStream(buffer, {
    folder: "contratos",
    public_id: folio,
    resource_type: "raw",
    format: "pdf",
  });
}

export async function eliminarImagenCloud(url: string, folder: "firmas" | "contratos"): Promise<void> {
  const publicId = extractPublicId(url, folder);
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
  } catch {
    logger.warn({ publicId, folder }, "No se pudo eliminar de Cloudinary");
  }
}

function extractPublicId(url: string, folder: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const fileIndex = parts.indexOf(folder);
    if (fileIndex === -1 || fileIndex >= parts.length - 1) {
      return null;
    }
    const lastPart = parts[parts.length - 1];
    return lastPart.includes(".") ? lastPart.split(".")[0] : lastPart;
  } catch {
    return null;
  }
}

export async function getImageBuffer(url: string): Promise<Buffer> {
  const resp = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(resp.data);
}

export async function getPdfBuffer(
  folio: string,
  firmado = false,
  cloudUrl?: string
): Promise<Buffer> {
  const url = cloudUrl ?? cloudinary.url(
    firmado ? `contratos/${folio}-firmado` : `contratos/${folio}`,
    {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      secure: true,
      format: "pdf",
    }
  );
  const resp = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(resp.data);
}
