// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// const folder = 'uploads/music';
// if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = file.fieldname + '-' + Date.now() + ext;
//     cb(null, name);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['.mp3', '.flac', '.wav', '.m4a'];
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowedTypes.includes(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only audio files are allowed'), false);
//   }
// };

// export const uploadMusic = multer({ storage, fileFilter });

import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/flac', 'audio/wav', 'audio/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

export const uploadMusic = multer({ storage, fileFilter, limits: { fileSize: 200 * 1024 * 1024 } });
