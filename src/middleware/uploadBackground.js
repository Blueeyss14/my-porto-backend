import multer from 'multer';

const storage = multer.memoryStorage();

const uploadBackground = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    console.log('File Filter - Checking file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size
    });

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo'
    ];

    console.log('Allowed types:', allowedMimeTypes);
    console.log('File mimetype:', file.mimetype);
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log('File type allowed:', file.mimetype);
      cb(null, true);
    } else {
      console.log('File type not allowed:', file.mimetype);
      cb(null, true);

    }
  },
});

export default uploadBackground;
