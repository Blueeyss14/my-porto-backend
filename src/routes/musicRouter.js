import express from 'express';
import { getAllMusic, createMusic, updateMusic, deleteMusic } from '../controllers/musicController.js';
import { uploadMusic } from '../middleware/audioMulter.js';

const router = express.Router();

router.get('/', getAllMusic);
router.post('/', uploadMusic.single('song_file'), createMusic);
router.put('/:id', uploadMusic.single('song_file'), updateMusic);
router.delete('/:id', deleteMusic);

export default router;
