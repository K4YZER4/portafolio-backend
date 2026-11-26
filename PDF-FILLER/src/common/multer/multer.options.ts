import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import multer from "multer";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../../config/constants";

export const imageMulterOptions: MulterOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_request, file, callback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Solo imágenes o pdfs son permitidos"), false);
  },
};
