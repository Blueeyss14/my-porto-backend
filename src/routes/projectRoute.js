import express from 'express';
import upload from '../middleware/upload.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  patchProject,
  deleteProject
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);

router.post(
  '/',
  upload.fields([
    { name: 'image_url' },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createProject
);

router.patch(
  '/:id',
  upload.fields([
    { name: 'image_url' },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  patchProject
);

router.delete('/:id', deleteProject);

export default router;
