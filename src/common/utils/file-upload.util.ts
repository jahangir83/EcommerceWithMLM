import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Ensure upload directory exists
 */
export function ensureUploadPath(path: string): string {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
  return path;
}

/**
 * Create a multer storage with auto-folder creation
 */
export function createMulterStorage(uploadPath: string) {
  return diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureUploadPath(uploadPath));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  });
}
