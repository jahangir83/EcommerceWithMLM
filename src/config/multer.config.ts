import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { createMulterStorage } from '../common/utils/file-upload.util';

export const NIDUploadConfig: MulterOptions = {
  storage: createMulterStorage('./uploads/nid'),
};

export const ProfileUploadConfig: MulterOptions = {
  storage: createMulterStorage('./uploads/profile'),
};

export const ProductUploadConfig: MulterOptions = {
  storage: createMulterStorage('./uploads/products'),
};
