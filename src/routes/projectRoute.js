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

router.post('/', upload.array('image_url', 10), createProject);
router.put('/:id', upload.array('image_url', 10), updateProject);
router.delete('/:id', deleteProject);

export default router;
