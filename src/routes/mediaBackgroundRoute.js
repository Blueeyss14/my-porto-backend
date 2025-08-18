import express from 'express';
import multer from 'multer';
import uploadBackground from '../middleware/uploadBackground.js';
import {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
} from '../controllers/mediaBackgroundController.js';

const router = express.Router();

router.use((req, _, next) => {
  console.log(`${req.method} ${req.path}`);
  // console.log('Headers:', req.headers);
  next();
});

router.get('/', getAllMedia);
router.get('/:id', getMediaById);

router.post('/', uploadBackground.single('file'), createMedia);

router.put('/:id', uploadBackground.single('file'), updateMedia);

router.delete('/:id', deleteMedia);

export default router;
