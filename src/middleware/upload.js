// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// const uploadPath = path.resolve('uploads');
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads'),
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + '_' + file.originalname;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ storage });

// export default upload;

import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export default upload;