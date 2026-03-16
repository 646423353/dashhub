import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../public/uploads');

    if (file.fieldname === 'video') {
      uploadPath = path.join(uploadPath, 'videos');
    } else if (file.fieldname === 'logo' || file.fieldname === 'cover') {
      uploadPath = path.join(uploadPath, 'images');
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadPath, 'avatars');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|mov|avi/;
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
    allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedImageTypes.test(file.mimetype) ||
    allowedVideoTypes.test(file.mimetype);

  if (file.fieldname === 'video') {
    if (!allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
      !allowedVideoTypes.test(file.mimetype)) {
      return cb(new Error('Only video files are allowed (mp4, webm, mov, avi)'), false);
    }
  } else {
    if (!allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
      !allowedImageTypes.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024 // 20MB
  }
});

export const uploadMiddleware = upload;
export const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'cover', maxCount: 5 },  // 项目详情图，最多5张
  { name: 'video', maxCount: 3 },  // 计划视频，最多3个
  { name: 'avatar', maxCount: 1 }
]);
export const uploadSingle = upload.single;
export const uploadMultiple = upload.array;
