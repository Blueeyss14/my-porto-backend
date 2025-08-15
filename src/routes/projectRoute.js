import express from 'express';
import upload from '../middleware/upload.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);

router.post(
  '/',
  upload.fields([
    { name: 'image_url', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createProject
);

router.put(
  '/:id',
  upload.fields([
    { name: 'image_url', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  updateProject
);

router.delete('/:id', deleteProject);

export default router;
