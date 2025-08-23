import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.resolve('uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

export default upload;

// import multer from "multer";
// import fs from "fs";

// const uploadPath = "/tmp/uploads";
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadPath),
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "_" + file.originalname;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage });

// export default upload;
