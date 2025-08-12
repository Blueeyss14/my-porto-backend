import multer from 'multer';

const storage = multer.memoryStorage();

const uploadBackground = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_, __, cb) => cb(null, true),
});

export default uploadBackground;